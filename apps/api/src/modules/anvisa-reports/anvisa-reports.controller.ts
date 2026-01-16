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
import { AnvisaReportsService } from './anvisa-reports.service';
import { CreateAnvisaReportDto, UpdateAnvisaReportDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('anvisa-reports')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class AnvisaReportsController {
  constructor(private readonly anvisaReportsService: AnvisaReportsService) {}

  // ============================================================================
  // CREATE ANVISA REPORT
  // ============================================================================

  @Post()
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async create(@Req() req: any, @Body() dto: CreateAnvisaReportDto) {
    return this.anvisaReportsService.create(req.user.doctorProfile?.id, dto);
  }

  // ============================================================================
  // GET AUTO-FILL DATA
  // ============================================================================

  @Get('auto-fill')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async getAutoFillData(
    @Req() req: any,
    @Query('medicalRecordId') medicalRecordId: string,
    @Query('prescriptionId') prescriptionId?: string,
  ) {
    return this.anvisaReportsService.getAutoFillData(
      medicalRecordId,
      prescriptionId,
      req.user.doctorProfile?.id,
    );
  }

  // ============================================================================
  // GET BY PATIENT
  // ============================================================================

  @Get()
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER')
  async findByPatient(
    @Req() req: any,
    @Query('patientId') patientId: string,
  ) {
    return this.anvisaReportsService.findByPatient(
      patientId,
      req.organizationId,
    );
  }

  // ============================================================================
  // GET BY ID
  // ============================================================================

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER')
  async findById(@Req() req: any, @Param('id') id: string) {
    return this.anvisaReportsService.findById(id, req.organizationId);
  }

  // ============================================================================
  // GET CHECKLIST
  // ============================================================================

  @Get(':id/checklist')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async getChecklist(@Req() req: any, @Param('id') id: string) {
    return this.anvisaReportsService.getChecklist(id, req.organizationId);
  }

  // ============================================================================
  // UPDATE ANVISA REPORT
  // ============================================================================

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAnvisaReportDto,
  ) {
    return this.anvisaReportsService.update(
      id,
      req.user.doctorProfile?.id,
      dto,
    );
  }

  // ============================================================================
  // SIGN ANVISA REPORT
  // ============================================================================

  @Post(':id/sign')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async sign(@Req() req: any, @Param('id') id: string) {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
    return this.anvisaReportsService.sign(
      id,
      req.user.doctorProfile?.id,
      ipAddress,
    );
  }

  // ============================================================================
  // MARK AS SUBMITTED
  // ============================================================================

  @Post(':id/submit')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async markAsSubmitted(
    @Req() req: any,
    @Param('id') id: string,
    @Body('protocolNumber') protocolNumber?: string,
  ) {
    return this.anvisaReportsService.markAsSubmitted(
      id,
      req.user.doctorProfile?.id,
      protocolNumber,
    );
  }

  // ============================================================================
  // UPDATE STATUS (APPROVED/REJECTED)
  // ============================================================================

  @Patch(':id/status')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @Body('anvisaResponse') anvisaResponse?: any,
  ) {
    return this.anvisaReportsService.updateStatus(
      id,
      req.organizationId,
      status,
      anvisaResponse,
    );
  }
}
