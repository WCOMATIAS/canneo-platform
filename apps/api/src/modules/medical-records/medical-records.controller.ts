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
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('medical-records')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  // ============================================================================
  // CREATE MEDICAL RECORD
  // ============================================================================

  @Post()
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async create(@Req() req: any, @Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(req.user.doctorProfile?.id, dto);
  }

  // ============================================================================
  // GET TEMPLATE STRUCTURE
  // ============================================================================

  @Get('templates/:templateType')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  getTemplateStructure(@Param('templateType') templateType: string) {
    return this.medicalRecordsService.getTemplateStructure(templateType);
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
    return this.medicalRecordsService.findByPatient(
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
    return this.medicalRecordsService.findById(id, req.organizationId);
  }

  // ============================================================================
  // UPDATE MEDICAL RECORD
  // ============================================================================

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(
      id,
      req.user.doctorProfile?.id,
      dto,
    );
  }

  // ============================================================================
  // SIGN MEDICAL RECORD
  // ============================================================================

  @Post(':id/sign')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async sign(@Req() req: any, @Param('id') id: string) {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
    return this.medicalRecordsService.sign(
      id,
      req.user.doctorProfile?.id,
      ipAddress,
    );
  }
}
