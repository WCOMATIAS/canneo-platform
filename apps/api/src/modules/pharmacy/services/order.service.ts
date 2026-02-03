import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, PharmacyFulfillmentType } from '@prisma/client';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderResponseDto,
  OrderListResponseDto,
  OrderFilterDto,
} from '../dto/order.dto';
import {
  ORDER_STATUS,
  OrderStatusType,
  VALID_ORDER_TRANSITIONS,
  FULFILLMENT_TYPE,
} from '../constants/pharmacy.constants';

interface CurrentUser {
  userId: string;
  role: UserRole;
  patientId?: string;
  pharmacyId?: string;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new order
   */
  async create(dto: CreateOrderDto, currentUser: CurrentUser): Promise<OrderResponseDto> {
    // Only patients can create orders
    if (currentUser.role !== UserRole.PATIENT) {
      throw new ForbiddenException('Only patients can create orders');
    }

    if (!currentUser.patientId) {
      throw new ForbiddenException('Patient profile not found');
    }

    // Verify pharmacy exists and supports the fulfillment type
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id: dto.pharmacyId },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    if (dto.fulfillmentType === FULFILLMENT_TYPE.DELIVERY && !pharmacy.supportsDelivery) {
      throw new BadRequestException('This pharmacy does not support delivery');
    }

    if (dto.fulfillmentType === FULFILLMENT_TYPE.PICKUP && !pharmacy.supportsPickup) {
      throw new BadRequestException('This pharmacy does not support pickup');
    }

    // Validate shipping address for delivery
    if (dto.fulfillmentType === FULFILLMENT_TYPE.DELIVERY) {
      if (!dto.shippingStreet || !dto.shippingCity || !dto.shippingState || !dto.shippingCep) {
        throw new BadRequestException('Shipping address is required for delivery orders');
      }
    }

    // Verify all products are available in inventory and calculate totals
    const productIds = dto.items.map((i) => i.productId);
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: {
        pharmacyId: dto.pharmacyId,
        productId: { in: productIds },
        inStock: true,
      },
      include: {
        product: true,
      },
    });

    // Check all products are available
    const inventoryMap = new Map(inventoryItems.map((i) => [i.productId, i]));
    const unavailableProducts: string[] = [];

    for (const item of dto.items) {
      const inv = inventoryMap.get(item.productId);
      if (!inv) {
        unavailableProducts.push(item.productId);
      } else if (inv.stockQty !== null && inv.stockQty < item.quantity) {
        unavailableProducts.push(`${item.productId} (insufficient stock)`);
      }
    }

    if (unavailableProducts.length > 0) {
      throw new BadRequestException(
        `Products unavailable: ${unavailableProducts.join(', ')}`,
      );
    }

    // Calculate totals
    let subtotalCents = 0;
    const orderItems = dto.items.map((item) => {
      const inv = inventoryMap.get(item.productId)!;
      const lineTotalCents = inv.priceCents * item.quantity;
      subtotalCents += lineTotalCents;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceCents: inv.priceCents,
        lineTotalCents,
      };
    });

    // Estimate shipping cost for delivery
    let shippingCents = 0;
    if (dto.fulfillmentType === FULFILLMENT_TYPE.DELIVERY) {
      // Simple shipping estimate - in production, use actual carrier API
      shippingCents = 1500; // R$15.00 flat rate for now
    }

    const totalCents = subtotalCents + shippingCents;

    // Create shipping address if needed
    let shippingAddressId: string | undefined;
    if (dto.fulfillmentType === FULFILLMENT_TYPE.DELIVERY) {
      const address = await this.prisma.address.create({
        data: {
          street: dto.shippingStreet,
          number: dto.shippingNumber,
          complement: dto.shippingComplement,
          district: dto.shippingDistrict,
          city: dto.shippingCity,
          state: dto.shippingState,
          cep: dto.shippingCep,
        },
      });
      shippingAddressId = address.id;
    }

    // Create order in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          patientId: currentUser.patientId!,
          pharmacyId: dto.pharmacyId,
          status: ORDER_STATUS.CREATED,
          fulfillmentType: dto.fulfillmentType as PharmacyFulfillmentType,
          subtotalCents,
          shippingCents,
          totalCents,
          shippingAddressId,
          items: {
            create: orderItems,
          },
        },
        include: {
          patient: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          pharmacy: true,
          shippingAddress: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Reserve stock (decrement stockQty if tracked)
      for (const item of dto.items) {
        const inv = inventoryMap.get(item.productId)!;
        if (inv.stockQty !== null) {
          await tx.inventoryItem.update({
            where: {
              pharmacyId_productId: {
                pharmacyId: dto.pharmacyId,
                productId: item.productId,
              },
            },
            data: {
              stockQty: { decrement: item.quantity },
              inStock: inv.stockQty - item.quantity > 0,
            },
          });
        }
      }

      return newOrder;
    });

    this.logger.log(`Order ${order.id} created for patient ${currentUser.patientId}`);

    return this.mapToResponse(order);
  }

  /**
   * Get order by ID
   */
  async getById(orderId: string, currentUser: CurrentUser): Promise<OrderResponseDto> {
    const order = await this.findAndVerifyAccess(orderId, currentUser);
    return this.mapToResponse(order);
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    currentUser: CurrentUser,
  ): Promise<OrderResponseDto> {
    const order = await this.findAndVerifyAccess(orderId, currentUser, true);

    // Validate status transition
    const currentStatus = order.status as OrderStatusType;
    const newStatus = dto.status;

    if (!VALID_ORDER_TRANSITIONS[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${VALID_ORDER_TRANSITIONS[currentStatus].join(', ') || 'none'}`,
      );
    }

    // Additional validation for specific transitions
    if (newStatus === ORDER_STATUS.SHIPPED && order.fulfillmentType === FULFILLMENT_TYPE.PICKUP) {
      throw new BadRequestException('Cannot ship a pickup order. Use READY_FOR_PICKUP instead.');
    }

    if (newStatus === ORDER_STATUS.READY_FOR_PICKUP && order.fulfillmentType === FULFILLMENT_TYPE.DELIVERY) {
      throw new BadRequestException('Cannot mark delivery order as ready for pickup. Use SHIPPED instead.');
    }

    // Update order status
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        patient: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        pharmacy: true,
        shippingAddress: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    this.logger.log(`Order ${orderId} status updated: ${currentStatus} → ${newStatus}`);

    return this.mapToResponse(updated);
  }

  /**
   * Cancel an order
   */
  async cancel(
    orderId: string,
    currentUser: CurrentUser,
    reason?: string,
  ): Promise<OrderResponseDto> {
    const order = await this.findAndVerifyAccess(orderId, currentUser, true);

    const currentStatus = order.status as OrderStatusType;
    if (!VALID_ORDER_TRANSITIONS[currentStatus].includes(ORDER_STATUS.CANCELLED)) {
      throw new BadRequestException(
        `Cannot cancel order with status ${currentStatus}`,
      );
    }

    // Restore stock if order had reserved it
    if ([ORDER_STATUS.CREATED, ORDER_STATUS.PAYMENT_PENDING, ORDER_STATUS.PAID].includes(currentStatus as any)) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          // Check if stock is tracked
          const inv = await tx.inventoryItem.findUnique({
            where: {
              pharmacyId_productId: {
                pharmacyId: order.pharmacyId,
                productId: item.productId,
              },
            },
          });

          if (inv && inv.stockQty !== null) {
            await tx.inventoryItem.update({
              where: {
                pharmacyId_productId: {
                  pharmacyId: order.pharmacyId,
                  productId: item.productId,
                },
              },
              data: {
                stockQty: { increment: item.quantity },
                inStock: true,
              },
            });
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: ORDER_STATUS.CANCELLED },
        });
      });
    } else {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: ORDER_STATUS.CANCELLED },
      });
    }

    this.logger.log(`Order ${orderId} cancelled. Reason: ${reason || 'not specified'}`);

    return this.getById(orderId, currentUser);
  }

  /**
   * List orders with filters
   */
  async list(
    currentUser: CurrentUser,
    filter: OrderFilterDto,
    page = 1,
    limit = 20,
  ): Promise<OrderListResponseDto> {
    const skip = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    if (currentUser.role === UserRole.PATIENT) {
      where.patientId = currentUser.patientId;
    } else if (currentUser.role === UserRole.PHARMACY) {
      where.pharmacyId = currentUser.pharmacyId;
    }
    // Admin can see all orders

    // Apply filters
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.pharmacyId && currentUser.role !== UserRole.PHARMACY) {
      where.pharmacyId = filter.pharmacyId;
    }
    if (filter.patientId && currentUser.role !== UserRole.PATIENT) {
      where.patientId = filter.patientId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          patient: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          pharmacy: true,
          shippingAddress: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => this.mapToResponse(o)),
      total,
      page,
      limit,
      hasMore: skip + orders.length < total,
    };
  }

  /**
   * Get orders for a specific patient
   */
  async getByPatient(
    patientId: string,
    currentUser: CurrentUser,
    page = 1,
    limit = 20,
  ): Promise<OrderListResponseDto> {
    // Verify access
    if (currentUser.role === UserRole.PATIENT && currentUser.patientId !== patientId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.PATIENT) {
      throw new ForbiddenException('Access denied');
    }

    return this.list(
      { ...currentUser, patientId },
      { patientId },
      page,
      limit,
    );
  }

  /**
   * Get orders for a specific pharmacy
   */
  async getByPharmacy(
    pharmacyId: string,
    currentUser: CurrentUser,
    status?: OrderStatusType,
    page = 1,
    limit = 20,
  ): Promise<OrderListResponseDto> {
    // Verify access
    if (currentUser.role === UserRole.PHARMACY && currentUser.pharmacyId !== pharmacyId) {
      throw new ForbiddenException('You can only view your own pharmacy orders');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.PHARMACY) {
      throw new ForbiddenException('Access denied');
    }

    return this.list(
      { ...currentUser, pharmacyId },
      { pharmacyId, status },
      page,
      limit,
    );
  }

  /**
   * Find order and verify access
   */
  private async findAndVerifyAccess(
    orderId: string,
    currentUser: CurrentUser,
    requireWrite = false,
  ): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        patient: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        pharmacy: true,
        shippingAddress: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Admin can access any order
    if (currentUser.role === UserRole.ADMIN) {
      return order;
    }

    // Patient can access their own orders (read and cancel)
    if (currentUser.role === UserRole.PATIENT) {
      if (order.patientId !== currentUser.patientId) {
        throw new ForbiddenException('You can only access your own orders');
      }
      // Patients can only cancel, not update status
      if (requireWrite) {
        throw new ForbiddenException('Patients cannot update order status');
      }
      return order;
    }

    // Pharmacy can access their orders
    if (currentUser.role === UserRole.PHARMACY) {
      if (order.pharmacyId !== currentUser.pharmacyId) {
        throw new ForbiddenException('You can only access your own pharmacy orders');
      }
      return order;
    }

    throw new ForbiddenException('Access denied');
  }

  /**
   * Map order to response DTO
   */
  private mapToResponse(order: any): OrderResponseDto {
    return {
      id: order.id,
      status: order.status,
      patientId: order.patientId,
      patientName: order.patient.user.fullName,
      pharmacyId: order.pharmacyId,
      pharmacyName: order.pharmacy.name,
      fulfillmentType: order.fulfillmentType,
      subtotalCents: order.subtotalCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      currency: order.currency,
      shippingAddress: order.shippingAddress
        ? {
            street: order.shippingAddress.street,
            number: order.shippingAddress.number,
            complement: order.shippingAddress.complement,
            district: order.shippingAddress.district,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            cep: order.shippingAddress.cep,
          }
        : null,
      paymentIntentId: order.paymentIntentId,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.lineTotalCents,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
