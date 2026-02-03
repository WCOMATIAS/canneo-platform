import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { ShipmentStatus, Prisma } from '@prisma/client';
import { MelhorEnvioService } from './melhor-envio.service';
import { AuditService, AuditContext } from '../../audit';
import { AUDIT_ACTIONS } from '../../audit/constants/audit.constants';
import {
  GetShippingQuotesDto,
  ShippingQuoteResponseDto,
  CreateShipmentDto,
  ShipmentResponseDto,
  TrackingResponseDto,
  LabelResponseDto,
} from '../dto';
import {
  SHIPPING_PROVIDER,
  isValidShipmentTransition,
} from '../constants/shipping.constants';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly melhorEnvioService: MelhorEnvioService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Get shipping quotes for an order
   */
  async getQuotes(dto: GetShippingQuotesDto): Promise<ShippingQuoteResponseDto[]> {
    // Get pharmacy
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id: dto.pharmacyId },
      include: { address: true },
    });

    if (!pharmacy) {
      throw new NotFoundException('Farmácia não encontrada');
    }

    // Calculate package dimensions
    const packageDims = this.melhorEnvioService.calculatePackageDimensions(
      dto.items.map((item) => ({
        quantity: item.quantity,
        weightKg: item.weightKg,
        heightCm: item.heightCm,
        widthCm: item.widthCm,
        lengthCm: item.lengthCm,
      }))
    );

    // Get quotes from Melhor Envio
    const quotes = await this.melhorEnvioService.getQuotes(dto.pharmacyId, {
      from: { postal_code: pharmacy.shippingOriginCep },
      to: { postal_code: dto.destinationCep.replace(/\D/g, '') },
      products: [
        {
          id: 'package',
          width: packageDims.width,
          height: packageDims.height,
          length: packageDims.length,
          weight: packageDims.weight,
          insurance_value: (dto.insuranceValueCents || 0) / 100,
          quantity: 1,
        },
      ],
    });

    // Save quotes to database and return
    const savedQuotes = await Promise.all(
      quotes.map(async (quote) => {
        const saved = await this.prisma.shippingQuote.create({
          data: {
            pharmacyId: dto.pharmacyId,
            originCep: pharmacy.shippingOriginCep,
            destinationCep: dto.destinationCep,
            provider: SHIPPING_PROVIDER,
            serviceName: quote.name,
            serviceCode: String(quote.id),
            priceCents: Math.round(parseFloat(quote.price) * 100),
            deliveryDays: quote.delivery_time,
            rawPayload: quote as unknown as Prisma.InputJsonValue,
          },
        });

        return {
          id: saved.id,
          provider: SHIPPING_PROVIDER,
          serviceName: quote.name,
          serviceCode: String(quote.id),
          priceCents: saved.priceCents,
          deliveryDays: quote.delivery_time,
          deliveryRange: quote.delivery_range,
        };
      })
    );

    return savedQuotes;
  }

  /**
   * Create a shipment for an order
   */
  async createShipment(
    dto: CreateShipmentDto,
    auditContext: AuditContext
  ): Promise<ShipmentResponseDto> {
    // Get order with related data
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        pharmacy: {
          include: { address: true },
        },
        shippingAddress: true,
        patient: {
          include: {
            user: true,
            address: true,
          },
        },
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (order.status !== 'PAID' && order.status !== 'PROCESSING') {
      throw new BadRequestException(
        'Pedido não está pronto para envio'
      );
    }

    // Check if shipment already exists
    const existingShipment = await this.prisma.shipment.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingShipment) {
      throw new BadRequestException('Envio já foi criado para este pedido');
    }

    // Get shipping address
    const shippingAddress = order.shippingAddress || order.patient?.address;

    if (!shippingAddress) {
      throw new BadRequestException('Endereço de entrega não encontrado');
    }

    // Create shipment record
    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: order.id,
        status: 'QUOTE_CREATED',
        provider: SHIPPING_PROVIDER,
        serviceCode: dto.serviceCode,
      },
    });

    // Audit log
    await this.auditService.log(
      AUDIT_ACTIONS.ORDER_SHIP,
      'SHIPMENT',
      shipment.id,
      auditContext,
      { orderId: order.id, serviceCode: dto.serviceCode }
    );

    return this.toResponseDto(shipment);
  }

  /**
   * Generate shipping label
   */
  async generateLabel(
    shipmentId: string,
    auditContext: AuditContext
  ): Promise<LabelResponseDto> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        order: {
          include: {
            pharmacy: {
              include: { address: true },
            },
            shippingAddress: true,
            patient: {
              include: {
                user: true,
                address: true,
              },
            },
            items: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Envio não encontrado');
    }

    if (shipment.status !== 'QUOTE_CREATED') {
      throw new BadRequestException('Etiqueta já foi gerada');
    }

    const order = shipment.order;
    const pharmacy = order.pharmacy;
    const shippingAddress = order.shippingAddress || order.patient?.address;

    if (!shippingAddress || !pharmacy.address) {
      throw new BadRequestException('Endereços incompletos');
    }

    // Calculate package dimensions
    const packageDims = this.melhorEnvioService.calculatePackageDimensions(
      order.items.map((item) => ({
        quantity: item.quantity,
        weightKg: 0.5, // Default weight
      }))
    );

    // Add to cart
    const cartResult = await this.melhorEnvioService.addToCart(pharmacy.id, [
      {
        service: parseInt(shipment.serviceCode || '1'),
        from: {
          name: pharmacy.name,
          phone: pharmacy.phone || '',
          email: pharmacy.email || '',
          document: '', // CNPJ would be decrypted here
          address: pharmacy.address.street || '',
          number: pharmacy.address.number || 'S/N',
          complement: pharmacy.address.complement || undefined,
          district: pharmacy.address.district || '',
          city: pharmacy.address.city || '',
          state_abbr: pharmacy.address.state || '',
          country_id: 'BR',
          postal_code: pharmacy.shippingOriginCep,
        },
        to: {
          name: order.patient?.user?.fullName || '',
          phone: order.patient?.user?.phone || '',
          email: order.patient?.user?.email || '',
          document: '', // CPF would be decrypted here
          address: shippingAddress.street || '',
          number: shippingAddress.number || 'S/N',
          complement: shippingAddress.complement || undefined,
          district: shippingAddress.district || '',
          city: shippingAddress.city || '',
          state_abbr: shippingAddress.state || '',
          country_id: 'BR',
          postal_code: shippingAddress.cep || '',
        },
        products: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          unitary_value: item.unitPriceCents / 100,
        })),
        volumes: [
          {
            height: packageDims.height,
            width: packageDims.width,
            length: packageDims.length,
            weight: packageDims.weight,
          },
        ],
        options: {
          insurance_value: order.totalCents / 100,
        },
      },
    ]);

    // Checkout
    await this.melhorEnvioService.checkout(pharmacy.id, cartResult.items);

    // Generate label
    const labelResult = await this.melhorEnvioService.generateLabel(
      pharmacy.id,
      cartResult.items
    );

    // Print label to get URL
    const printResult = await this.melhorEnvioService.printLabel(
      pharmacy.id,
      cartResult.items
    );

    // Get tracking info
    const trackingInfo = await this.melhorEnvioService.track(
      pharmacy.id,
      cartResult.items[0]
    );

    // Update shipment
    const updated = await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: 'LABEL_CREATED',
        melhorEnvioCartId: cartResult.cartId,
        melhorEnvioShipmentId: cartResult.items[0],
        labelUrl: printResult.url,
        trackingCode: trackingInfo.tracking,
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'SHIPPED' },
    });

    return {
      shipmentId: updated.id,
      labelUrl: updated.labelUrl || '',
      trackingCode: updated.trackingCode || '',
    };
  }

  /**
   * Get shipment by ID
   */
  async findById(shipmentId: string): Promise<ShipmentResponseDto> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Envio não encontrado');
    }

    return this.toResponseDto(shipment);
  }

  /**
   * Get shipment by order ID
   */
  async findByOrderId(orderId: string): Promise<ShipmentResponseDto | null> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { orderId },
    });

    return shipment ? this.toResponseDto(shipment) : null;
  }

  /**
   * Track shipment
   */
  async track(shipmentId: string): Promise<TrackingResponseDto> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        order: {
          include: { pharmacy: true },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Envio não encontrado');
    }

    if (!shipment.melhorEnvioShipmentId) {
      throw new BadRequestException('Envio não possui código de rastreamento');
    }

    const trackingResult = await this.melhorEnvioService.track(
      shipment.order.pharmacyId,
      shipment.melhorEnvioShipmentId
    );

    return {
      trackingCode: shipment.trackingCode || '',
      status: trackingResult.status,
      events: trackingResult.events.map((event) => ({
        date: new Date(event.date),
        status: event.status,
        description: event.description,
        location: event.location,
      })),
    };
  }

  /**
   * Update shipment status (from webhook)
   */
  async updateStatus(
    shipmentId: string,
    newStatus: ShipmentStatus,
    auditContext: AuditContext,
    options?: {
      trackingCode?: string;
      deliveredAt?: Date;
    }
  ): Promise<ShipmentResponseDto> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Envio não encontrado');
    }

    // Validate state transition
    if (!isValidShipmentTransition(shipment.status, newStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: ${shipment.status} -> ${newStatus}`
      );
    }

    const updateData: Prisma.ShipmentUpdateInput = {
      status: newStatus,
    };

    if (options?.trackingCode) {
      updateData.trackingCode = options.trackingCode;
    }

    if (newStatus === 'IN_TRANSIT' && !shipment.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (newStatus === 'DELIVERED') {
      updateData.deliveredAt = options?.deliveredAt || new Date();

      // Update order status
      await this.prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: 'DELIVERED' },
      });
    }

    const updated = await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: updateData,
    });

    // Audit log
    await this.auditService.log(
      AUDIT_ACTIONS.ORDER_SHIP,
      'SHIPMENT',
      shipmentId,
      auditContext,
      { newStatus }
    );

    return this.toResponseDto(updated);
  }

  private toResponseDto(
    shipment: Prisma.ShipmentGetPayload<{}>
  ): ShipmentResponseDto {
    return {
      id: shipment.id,
      orderId: shipment.orderId,
      status: shipment.status,
      provider: shipment.provider,
      serviceName: shipment.serviceName || undefined,
      serviceCode: shipment.serviceCode || undefined,
      trackingCode: shipment.trackingCode || undefined,
      trackingUrl: shipment.trackingCode
        ? `https://www.melhorrastreio.com.br/rastreio/${shipment.trackingCode}`
        : undefined,
      labelUrl: shipment.labelUrl || undefined,
      shippedAt: shipment.shippedAt || undefined,
      deliveredAt: shipment.deliveredAt || undefined,
      createdAt: shipment.createdAt,
    };
  }
}
