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
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  UpdateInventoryDto,
  InventoryItemResponseDto,
  InventoryListResponseDto,
  BulkInventoryUpdateDto,
} from '../dto/inventory.dto';

interface CurrentUser {
  userId: string;
  role: UserRole;
  pharmacyId?: string;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ========================
  // Products (Admin only)
  // ========================

  /**
   * Create a new product (global catalog)
   */
  async createProduct(
    dto: CreateProductDto,
    currentUser: CurrentUser,
  ): Promise<ProductResponseDto> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can create products');
    }

    // Check if SKU already exists
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (existing) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        active: true,
      },
    });

    this.logger.log(`Product ${product.id} created: ${product.name}`);

    return this.mapProductToResponse(product);
  }

  /**
   * Update a product
   */
  async updateProduct(
    productId: string,
    dto: UpdateProductDto,
    currentUser: CurrentUser,
  ): Promise<ProductResponseDto> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can update products');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name,
        description: dto.description,
        active: dto.active,
      },
    });

    this.logger.log(`Product ${productId} updated`);

    return this.mapProductToResponse(updated);
  }

  /**
   * List all products
   */
  async listProducts(
    page = 1,
    limit = 50,
    activeOnly = true,
  ): Promise<{ products: ProductResponseDto[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;

    const where = activeOnly ? { active: true } : {};

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => this.mapProductToResponse(p)),
      total,
      hasMore: skip + products.length < total,
    };
  }

  // ========================
  // Inventory (Pharmacy)
  // ========================

  /**
   * Get pharmacy inventory
   */
  async getPharmacyInventory(
    pharmacyId: string,
    currentUser: CurrentUser,
    page = 1,
    limit = 50,
    inStockOnly = false,
  ): Promise<InventoryListResponseDto> {
    // Verify pharmacy access
    await this.verifyPharmacyAccess(pharmacyId, currentUser);

    const skip = (page - 1) * limit;

    const where: any = { pharmacyId };
    if (inStockOnly) {
      where.inStock = true;
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        include: {
          product: true,
        },
        orderBy: { product: { name: 'asc' } },
        skip,
        take: limit,
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapInventoryToResponse(item)),
      total,
      page,
      limit,
      hasMore: skip + items.length < total,
    };
  }

  /**
   * Update inventory for a specific product
   */
  async updateInventoryItem(
    pharmacyId: string,
    productId: string,
    dto: UpdateInventoryDto,
    currentUser: CurrentUser,
  ): Promise<InventoryItemResponseDto> {
    await this.verifyPharmacyAccess(pharmacyId, currentUser, true);

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Upsert inventory item
    const item = await this.prisma.inventoryItem.upsert({
      where: {
        pharmacyId_productId: {
          pharmacyId,
          productId,
        },
      },
      update: {
        priceCents: dto.priceCents,
        inStock: dto.inStock ?? true,
        stockQty: dto.stockQty,
      },
      create: {
        pharmacyId,
        productId,
        priceCents: dto.priceCents,
        inStock: dto.inStock ?? true,
        stockQty: dto.stockQty,
      },
      include: {
        product: true,
      },
    });

    this.logger.log(`Inventory updated for pharmacy ${pharmacyId}, product ${productId}`);

    return this.mapInventoryToResponse(item);
  }

  /**
   * Bulk update inventory
   */
  async bulkUpdateInventory(
    pharmacyId: string,
    items: BulkInventoryUpdateDto[],
    currentUser: CurrentUser,
  ): Promise<InventoryItemResponseDto[]> {
    await this.verifyPharmacyAccess(pharmacyId, currentUser, true);

    // Verify all products exist
    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Products not found: ${missingIds.join(', ')}`);
    }

    // Upsert all items in a transaction
    const results = await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.inventoryItem.upsert({
          where: {
            pharmacyId_productId: {
              pharmacyId,
              productId: item.productId,
            },
          },
          update: {
            priceCents: item.priceCents,
            inStock: item.inStock ?? true,
            stockQty: item.stockQty,
          },
          create: {
            pharmacyId,
            productId: item.productId,
            priceCents: item.priceCents,
            inStock: item.inStock ?? true,
            stockQty: item.stockQty,
          },
          include: {
            product: true,
          },
        }),
      ),
    );

    this.logger.log(`Bulk inventory update for pharmacy ${pharmacyId}: ${items.length} items`);

    return results.map((item) => this.mapInventoryToResponse(item));
  }

  /**
   * Remove item from inventory
   */
  async removeInventoryItem(
    pharmacyId: string,
    productId: string,
    currentUser: CurrentUser,
  ): Promise<void> {
    await this.verifyPharmacyAccess(pharmacyId, currentUser, true);

    const item = await this.prisma.inventoryItem.findUnique({
      where: {
        pharmacyId_productId: {
          pharmacyId,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    await this.prisma.inventoryItem.delete({
      where: {
        pharmacyId_productId: {
          pharmacyId,
          productId,
        },
      },
    });

    this.logger.log(`Inventory item removed: pharmacy ${pharmacyId}, product ${productId}`);
  }

  /**
   * Verify pharmacy access
   */
  private async verifyPharmacyAccess(
    pharmacyId: string,
    currentUser: CurrentUser,
    requireWrite = false,
  ): Promise<void> {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    // Admins can access any pharmacy
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    // Pharmacy users can only access their own pharmacy
    if (currentUser.role === UserRole.PHARMACY) {
      if (currentUser.pharmacyId !== pharmacyId) {
        throw new ForbiddenException('You can only access your own pharmacy inventory');
      }
      return;
    }

    // Patients and doctors can read inventory (for searching)
    if (!requireWrite && (currentUser.role === UserRole.PATIENT || currentUser.role === UserRole.DOCTOR)) {
      return;
    }

    throw new ForbiddenException('Access denied');
  }

  /**
   * Map product to response DTO
   */
  private mapProductToResponse(product: any): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Map inventory item to response DTO
   */
  private mapInventoryToResponse(item: any): InventoryItemResponseDto {
    return {
      id: item.id,
      pharmacyId: item.pharmacyId,
      productId: item.productId,
      product: this.mapProductToResponse(item.product),
      priceCents: item.priceCents,
      inStock: item.inStock,
      stockQty: item.stockQty,
      updatedAt: item.updatedAt,
    };
  }
}
