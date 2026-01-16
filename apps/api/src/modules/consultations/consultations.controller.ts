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
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto, UpdateConsultationDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ConsultationStatus } from '@prisma/client';

@Controller('consultations')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  // ============================================================================
  // CREATE CONSULTATION (Book appointment)
  // ============================================================================

  @Post()
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async create(@Req() req: any, @Body() dto: CreateConsultationDto) {
    return this.consultationsService.create(req.organizationId, dto);
  }

  // ============================================================================
  // LIST CONSULTATIONS
  // ============================================================================

  @Get()
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER')
  async findAll(
    @Req() req: any,
    @Query('status') status?: ConsultationStatus,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.consultationsService.findAll(req.organizationId, {
      status,
      doctorId,
      patientId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  // ============================================================================
  // GET TODAY'S CONSULTATIONS
  // ============================================================================

  @Get('today')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async getToday(@Req() req: any, @Query('doctorId') doctorId?: string) {
    return this.consultationsService.getTodayConsultations(
      req.organizationId,
      doctorId || req.user.doctorProfile?.id,
    );
  }

  // ============================================================================
  // GET UPCOMING CONSULTATIONS
  // ============================================================================

  @Get('upcoming')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async getUpcoming(
    @Req() req: any,
    @Query('doctorId') doctorId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.consultationsService.getUpcoming(
      req.organizationId,
      doctorId || req.user.doctorProfile?.id,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // ============================================================================
  // GET CONSULTATION BY ID
  // ============================================================================

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER')
  async findById(@Req() req: any, @Param('id') id: string) {
    return this.consultationsService.findById(id, req.organizationId);
  }

  // ============================================================================
  // UPDATE CONSULTATION
  // ============================================================================

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateConsultationDto,
  ) {
    return this.consultationsService.update(id, req.organizationId, dto);
  }

  // ============================================================================
  // CONFIRM CONSULTATION
  // ============================================================================

  @Patch(':id/confirm')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async confirm(@Req() req: any, @Param('id') id: string) {
    return this.consultationsService.confirm(id, req.organizationId);
  }

  // ============================================================================
  // CANCEL CONSULTATION
  // ============================================================================

  @Patch(':id/cancel')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async cancel(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.consultationsService.cancel(id, req.organizationId, reason);
  }

  // ============================================================================
  // START CONSULTATION
  // ============================================================================

  @Patch(':id/start')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async start(@Req() req: any, @Param('id') id: string) {
    return this.consultationsService.start(
      id,
      req.organizationId,
      req.user.doctorProfile?.id,
    );
  }

  // ============================================================================
  // END CONSULTATION
  // ============================================================================

  @Patch(':id/end')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async end(@Req() req: any, @Param('id') id: string) {
    return this.consultationsService.end(
      id,
      req.organizationId,
      req.user.doctorProfile?.id,
    );
  }

  // ============================================================================
  // MARK NO SHOW
  // ============================================================================

  @Patch(':id/no-show')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async markNoShow(@Req() req: any, @Param('id') id: string) {
    return this.consultationsService.markNoShow(id, req.organizationId);
  }
}
