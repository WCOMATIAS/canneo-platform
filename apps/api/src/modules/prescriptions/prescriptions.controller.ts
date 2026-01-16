import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  // ============================================================================
  // CREATE PRESCRIPTION
  // ============================================================================

  @Post()
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async create(@Req() req: any, @Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(req.user.doctorProfile?.id, dto);
  }

  // ============================================================================
  // GET BY PATIENT
  // ============================================================================

  @Get()
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER')
  async findByPatient(
    @Req() req: any,
    @Query('patientId') patientId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.prescriptionsService.findByPatient(
      patientId,
      req.organizationId,
      {
        status,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      },
    );
  }

  // ============================================================================
  // GET BY ID
  // ============================================================================

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER')
  async findById(@Req() req: any, @Param('id') id: string) {
    return this.prescriptionsService.findById(id, req.organizationId);
  }

  // ============================================================================
  // UPDATE PRESCRIPTION
  // ============================================================================

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(
      id,
      req.user.doctorProfile?.id,
      dto,
    );
  }

  // ============================================================================
  // SIGN PRESCRIPTION
  // ============================================================================

  @Post(':id/sign')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async sign(@Req() req: any, @Param('id') id: string) {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
    return this.prescriptionsService.sign(
      id,
      req.user.doctorProfile?.id,
      ipAddress,
    );
  }

  // ============================================================================
  // REVOKE PRESCRIPTION
  // ============================================================================

  @Post(':id/revoke')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async revoke(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.prescriptionsService.revoke(
      id,
      req.user.doctorProfile?.id,
      reason,
    );
  }
}

// ============================================================================
// PRODUCTS CONTROLLER (separate)
// ============================================================================

@Controller('products/cannabis')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  async getProducts(
    @Query('search') search?: string,
    @Query('activeCompound') activeCompound?: string,
  ) {
    return this.prescriptionsService.getProducts(search, activeCompound);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.prescriptionsService.getProductById(id);
  }
}
