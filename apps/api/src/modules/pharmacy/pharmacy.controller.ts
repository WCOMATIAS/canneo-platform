import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { PharmacyService } from './services/pharmacy.service';
import { ProximitySearchService } from './services/proximity-search.service';
import { InventoryService } from './services/inventory.service';
import { OrderService } from './services/order.service';
import {
  CreatePharmacyDto,
  UpdatePharmacyDto,
  PharmacyResponseDto,
  PharmacySearchDto,
  PharmacySearchResultDto,
} from './dto/pharmacy.dto';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  UpdateInventoryDto,
  InventoryItemResponseDto,
  InventoryListResponseDto,
  BulkInventoryUpdateDto,
} from './dto/inventory.dto';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderResponseDto,
  OrderListResponseDto,
  OrderFilterDto,
} from './dto/order.dto';
import { OrderStatusType } from './constants/pharmacy.constants';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  patientId?: string;
  pharmacyId?: string;
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmacyController {
  constructor(
    private readonly pharmacyService: PharmacyService,
    private readonly proximitySearchService: ProximitySearchService,
    private readonly inventoryService: InventoryService,
    private readonly orderService: OrderService,
  ) {}

  // ========================
  // Pharmacy Management
  // ========================

  /**
   * POST /pharmacies
   * Create a new pharmacy (Admin only)
   */
  @Post('pharmacies')
  @Roles(UserRole.ADMIN)
  async createPharmacy(
    @Body() dto: CreatePharmacyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PharmacyResponseDto> {
    return this.pharmacyService.create(dto, {
      userId: user.sub,
      role: user.role,
    });
  }

  /**
   * GET /pharmacies
   * List all pharmacies
   */
  @Get('pharmacies')
  @Roles(UserRole.ADMIN, UserRole.PATIENT, UserRole.DOCTOR)
  async listPharmacies(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{ pharmacies: PharmacyResponseDto[]; total: number; hasMore: boolean }> {
    return this.pharmacyService.list(page, Math.min(limit, 100));
  }

  /**
   * GET /pharmacies/:id
   * Get pharmacy by ID
   */
  @Get('pharmacies/:id')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY, UserRole.PATIENT, UserRole.DOCTOR)
  async getPharmacy(
    @Param('id', ParseUUIDPipe) pharmacyId: string,
  ): Promise<PharmacyResponseDto> {
    return this.pharmacyService.getById(pharmacyId);
  }

  /**
   * PUT /pharmacies/:id
   * Update a pharmacy
   */
  @Put('pharmacies/:id')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  async updatePharmacy(
    @Param('id', ParseUUIDPipe) pharmacyId: string,
    @Body() dto: UpdatePharmacyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PharmacyResponseDto> {
    return this.pharmacyService.update(pharmacyId, dto, {
      userId: user.sub,
      role: user.role,
      pharmacyId: user.pharmacyId,
    });
  }

  /**
   * POST /pharmacies/search
   * Search pharmacies by proximity with scoring
   */
  @Post('pharmacies/search')
  @Roles(UserRole.ADMIN, UserRole.PATIENT, UserRole.DOCTOR)
  async searchPharmacies(
    @Body() dto: PharmacySearchDto,
  ): Promise<PharmacySearchResultDto[]> {
    return this.proximitySearchService.search(dto);
  }

  // ========================
  // Products (Global Catalog)
  // ========================

  /**
   * POST /products
   * Create a new product (Admin only)
   */
  @Post('products')
  @Roles(UserRole.ADMIN)
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductResponseDto> {
    return this.inventoryService.createProduct(dto, {
      userId: user.sub,
      role: user.role,
    });
  }

  /**
   * GET /products
   * List all products
   */
  @Get('products')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY, UserRole.PATIENT, UserRole.DOCTOR)
  async listProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('activeOnly', new DefaultValuePipe(true), ParseBoolPipe) activeOnly: boolean,
  ): Promise<{ products: ProductResponseDto[]; total: number; hasMore: boolean }> {
    return this.inventoryService.listProducts(page, Math.min(limit, 100), activeOnly);
  }

  /**
   * PUT /products/:id
   * Update a product (Admin only)
   */
  @Put('products/:id')
  @Roles(UserRole.ADMIN)
  async updateProduct(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductResponseDto> {
    return this.inventoryService.updateProduct(productId, dto, {
      userId: user.sub,
      role: user.role,
    });
  }

  // ========================
  // Inventory
  // ========================

  /**
   * GET /pharmacies/:id/inventory
   * Get pharmacy inventory
   */
  @Get('pharmacies/:id/inventory')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY, UserRole.PATIENT, UserRole.DOCTOR)
  async getPharmacyInventory(
    @Param('id', ParseUUIDPipe) pharmacyId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('inStockOnly', new DefaultValuePipe(false), ParseBoolPipe) inStockOnly: boolean,
    @CurrentUser() user: JwtPayload,
  ): Promise<InventoryListResponseDto> {
    return this.inventoryService.getPharmacyInventory(
      pharmacyId,
      {
        userId: user.sub,
        role: user.role,
        pharmacyId: user.pharmacyId,
      },
      page,
      Math.min(limit, 100),
      inStockOnly,
    );
  }

  /**
   * PUT /pharmacies/:id/inventory/:productId
   * Update inventory for a specific product
   */
  @Put('pharmacies/:id/inventory/:productId')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  async updateInventoryItem(
    @Param('id', ParseUUIDPipe) pharmacyId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateInventoryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<InventoryItemResponseDto> {
    return this.inventoryService.updateInventoryItem(pharmacyId, productId, dto, {
      userId: user.sub,
      role: user.role,
      pharmacyId: user.pharmacyId,
    });
  }

  /**
   * POST /pharmacies/:id/inventory/bulk
   * Bulk update inventory
   */
  @Post('pharmacies/:id/inventory/bulk')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  async bulkUpdateInventory(
    @Param('id', ParseUUIDPipe) pharmacyId: string,
    @Body() items: BulkInventoryUpdateDto[],
    @CurrentUser() user: JwtPayload,
  ): Promise<InventoryItemResponseDto[]> {
    return this.inventoryService.bulkUpdateInventory(pharmacyId, items, {
      userId: user.sub,
      role: user.role,
      pharmacyId: user.pharmacyId,
    });
  }

  /**
   * DELETE /pharmacies/:id/inventory/:productId
   * Remove item from inventory
   */
  @Delete('pharmacies/:id/inventory/:productId')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  async removeInventoryItem(
    @Param('id', ParseUUIDPipe) pharmacyId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean }> {
    await this.inventoryService.removeInventoryItem(pharmacyId, productId, {
      userId: user.sub,
      role: user.role,
      pharmacyId: user.pharmacyId,
    });
    return { success: true };
  }

  // ========================
  // Orders
  // ========================

  /**
   * POST /orders
   * Create a new order (Patient only)
   */
  @Post('orders')
  @Roles(UserRole.PATIENT)
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(dto, {
      userId: user.sub,
      role: user.role,
      patientId: user.patientId,
    });
  }

  /**
   * GET /orders
   * List orders (filtered by role)
   */
  @Get('orders')
  @Roles(UserRole.ADMIN, UserRole.PATIENT, UserRole.PHARMACY)
  async listOrders(
    @Query('status') status: OrderStatusType | undefined,
    @Query('pharmacyId') pharmacyId: string | undefined,
    @Query('patientId') patientId: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderListResponseDto> {
    return this.orderService.list(
      {
        userId: user.sub,
        role: user.role,
        patientId: user.patientId,
        pharmacyId: user.pharmacyId,
      },
      { status, pharmacyId, patientId },
      page,
      Math.min(limit, 100),
    );
  }

  /**
   * GET /orders/:id
   * Get order by ID
   */
  @Get('orders/:id')
  @Roles(UserRole.ADMIN, UserRole.PATIENT, UserRole.PHARMACY)
  async getOrder(
    @Param('id', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderResponseDto> {
    return this.orderService.getById(orderId, {
      userId: user.sub,
      role: user.role,
      patientId: user.patientId,
      pharmacyId: user.pharmacyId,
    });
  }

  /**
   * PUT /orders/:id/status
   * Update order status (Pharmacy/Admin only)
   */
  @Put('orders/:id/status')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderResponseDto> {
    return this.orderService.updateStatus(orderId, dto, {
      userId: user.sub,
      role: user.role,
      pharmacyId: user.pharmacyId,
    });
  }

  /**
   * POST /orders/:id/cancel
   * Cancel an order
   */
  @Post('orders/:id/cancel')
  @Roles(UserRole.ADMIN, UserRole.PATIENT, UserRole.PHARMACY)
  async cancelOrder(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body('reason') reason: string | undefined,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderResponseDto> {
    return this.orderService.cancel(
      orderId,
      {
        userId: user.sub,
        role: user.role,
        patientId: user.patientId,
        pharmacyId: user.pharmacyId,
      },
      reason,
    );
  }

  /**
   * GET /pharmacies/:id/orders
   * Get orders for a specific pharmacy
   */
  @Get('pharmacies/:id/orders')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  async getPharmacyOrders(
    @Param('id', ParseUUIDPipe) pharmacyId: string,
    @Query('status') status: OrderStatusType | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderListResponseDto> {
    return this.orderService.getByPharmacy(
      pharmacyId,
      {
        userId: user.sub,
        role: user.role,
        pharmacyId: user.pharmacyId,
      },
      status,
      page,
      Math.min(limit, 100),
    );
  }

  /**
   * GET /patients/:id/orders
   * Get orders for a specific patient
   */
  @Get('patients/:id/orders')
  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  async getPatientOrders(
    @Param('id', ParseUUIDPipe) patientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderListResponseDto> {
    return this.orderService.getByPatient(
      patientId,
      {
        userId: user.sub,
        role: user.role,
        patientId: user.patientId,
      },
      page,
      Math.min(limit, 100),
    );
  }
}
