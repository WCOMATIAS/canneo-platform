import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import {
  CreatePharmacyDto,
  UpdatePharmacyDto,
  PharmacyResponseDto,
} from '../dto/pharmacy.dto';
import { DEFAULT_SLA_MINUTES } from '../constants/pharmacy.constants';

interface CurrentUser {
  userId: string;
  role: UserRole;
  pharmacyId?: string;
}

@Injectable()
export class PharmacyService {
  private readonly logger = new Logger(PharmacyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new pharmacy
   */
  async create(dto: CreatePharmacyDto, currentUser: CurrentUser): Promise<PharmacyResponseDto> {
    // Only admins can create pharmacies
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can create pharmacies');
    }

    // Check if CNPJ already exists
    const existingPharmacy = await this.prisma.pharmacy.findFirst({
      where: { cnpjEnc: dto.cnpj },
    });

    if (existingPharmacy) {
      throw new ConflictException('A pharmacy with this CNPJ already exists');
    }

    // Create address if provided
    let addressId: string | undefined;
    if (dto.street || dto.city || dto.state) {
      const address = await this.prisma.address.create({
        data: {
          street: dto.street,
          number: dto.number,
          complement: dto.complement,
          district: dto.district,
          city: dto.city,
          state: dto.state,
          cep: dto.shippingOriginCep,
          lat: dto.lat,
          lng: dto.lng,
        },
      });
      addressId = address.id;
    }

    // Create pharmacy
    const pharmacy = await this.prisma.pharmacy.create({
      data: {
        name: dto.name,
        cnpjEnc: dto.cnpj, // In production, encrypt this
        email: dto.email,
        phone: dto.phone,
        shippingOriginCep: dto.shippingOriginCep,
        addressId,
        lat: dto.lat,
        lng: dto.lng,
        slaMinutes: dto.slaMinutes ?? DEFAULT_SLA_MINUTES,
        supportsPickup: dto.supportsPickup ?? true,
        supportsDelivery: dto.supportsDelivery ?? true,
        rating: 5.0,
      },
      include: {
        address: true,
      },
    });

    // Create wallet for the pharmacy
    await this.prisma.wallet.create({
      data: {
        ownerType: 'PHARMACY',
        ownerId: pharmacy.id,
        pharmacyId: pharmacy.id,
        balances: {
          create: {
            balanceTotal: 0,
            balancePending: 0,
            balanceAvailable: 0,
            balanceOnHold: 0,
            balanceWithdrawn: 0,
          },
        },
      },
    });

    this.logger.log(`Pharmacy ${pharmacy.id} created: ${pharmacy.name}`);

    return this.mapToResponse(pharmacy);
  }

  /**
   * Update a pharmacy
   */
  async update(
    pharmacyId: string,
    dto: UpdatePharmacyDto,
    currentUser: CurrentUser,
  ): Promise<PharmacyResponseDto> {
    const pharmacy = await this.findAndVerifyAccess(pharmacyId, currentUser);

    // Update address if needed
    if (dto.street || dto.city || dto.state || dto.lat !== undefined || dto.lng !== undefined) {
      if (pharmacy.addressId) {
        await this.prisma.address.update({
          where: { id: pharmacy.addressId },
          data: {
            street: dto.street,
            number: dto.number,
            complement: dto.complement,
            district: dto.district,
            city: dto.city,
            state: dto.state,
            cep: dto.shippingOriginCep,
            lat: dto.lat,
            lng: dto.lng,
          },
        });
      } else {
        const address = await this.prisma.address.create({
          data: {
            street: dto.street,
            number: dto.number,
            complement: dto.complement,
            district: dto.district,
            city: dto.city,
            state: dto.state,
            cep: dto.shippingOriginCep ?? pharmacy.shippingOriginCep,
            lat: dto.lat,
            lng: dto.lng,
          },
        });
        await this.prisma.pharmacy.update({
          where: { id: pharmacyId },
          data: { addressId: address.id },
        });
      }
    }

    // Update pharmacy
    const updated = await this.prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        shippingOriginCep: dto.shippingOriginCep,
        lat: dto.lat,
        lng: dto.lng,
        slaMinutes: dto.slaMinutes,
        supportsPickup: dto.supportsPickup,
        supportsDelivery: dto.supportsDelivery,
      },
      include: {
        address: true,
      },
    });

    this.logger.log(`Pharmacy ${pharmacyId} updated`);

    return this.mapToResponse(updated);
  }

  /**
   * Get a pharmacy by ID
   */
  async getById(pharmacyId: string): Promise<PharmacyResponseDto> {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      include: {
        address: true,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    return this.mapToResponse(pharmacy);
  }

  /**
   * List all pharmacies with pagination
   */
  async list(
    page = 1,
    limit = 20,
  ): Promise<{ pharmacies: PharmacyResponseDto[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;

    const [pharmacies, total] = await Promise.all([
      this.prisma.pharmacy.findMany({
        include: {
          address: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.pharmacy.count(),
    ]);

    return {
      pharmacies: pharmacies.map((p) => this.mapToResponse(p)),
      total,
      hasMore: skip + pharmacies.length < total,
    };
  }

  /**
   * Find and verify access to a pharmacy
   */
  private async findAndVerifyAccess(
    pharmacyId: string,
    currentUser: CurrentUser,
  ): Promise<any> {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      include: {
        address: true,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    // Admins can access any pharmacy
    if (currentUser.role === UserRole.ADMIN) {
      return pharmacy;
    }

    // Pharmacy users can only access their own pharmacy
    if (currentUser.role === UserRole.PHARMACY) {
      if (currentUser.pharmacyId !== pharmacyId) {
        throw new ForbiddenException('You can only access your own pharmacy');
      }
      return pharmacy;
    }

    throw new ForbiddenException('Access denied');
  }

  /**
   * Map pharmacy entity to response DTO
   */
  private mapToResponse(pharmacy: any): PharmacyResponseDto {
    return {
      id: pharmacy.id,
      name: pharmacy.name,
      cnpj: pharmacy.cnpjEnc, // In production, decrypt this
      email: pharmacy.email,
      phone: pharmacy.phone,
      shippingOriginCep: pharmacy.shippingOriginCep,
      address: pharmacy.address
        ? {
            street: pharmacy.address.street,
            number: pharmacy.address.number,
            complement: pharmacy.address.complement,
            district: pharmacy.address.district,
            city: pharmacy.address.city,
            state: pharmacy.address.state,
            cep: pharmacy.address.cep,
          }
        : null,
      lat: pharmacy.lat,
      lng: pharmacy.lng,
      slaMinutes: pharmacy.slaMinutes,
      supportsPickup: pharmacy.supportsPickup,
      supportsDelivery: pharmacy.supportsDelivery,
      rating: pharmacy.rating,
      createdAt: pharmacy.createdAt,
      updatedAt: pharmacy.updatedAt,
    };
  }
}
