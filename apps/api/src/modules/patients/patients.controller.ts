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
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('patients')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  // ============================================================================
  // CREATE PATIENT
  // ============================================================================

  @Post()
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async create(@Req() req: any, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(req.organizationId, dto);
  }

  // ============================================================================
  // LIST PATIENTS (with pagination and search)
  // ============================================================================

  @Get()
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER')
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('pipelineStatus') pipelineStatus?: string,
  ) {
    return this.patientsService.findAll(
      req.organizationId,
      req.organizationType,
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        search,
        pipelineStatus,
      },
    );
  }

  // ============================================================================
  // GET PIPELINE SUMMARY (for Kanban view)
  // ============================================================================

  @Get('pipeline-summary')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async getPipelineSummary(@Req() req: any) {
    return this.patientsService.getPipelineSummary(req.organizationId);
  }

  // ============================================================================
  // GET PATIENT BY ID
  // ============================================================================

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER')
  async findById(@Req() req: any, @Param('id') id: string) {
    return this.patientsService.findById(
      id,
      req.organizationId,
      req.organizationType,
    );
  }

  // ============================================================================
  // FIND BY CPF
  // ============================================================================

  @Get('cpf/:cpf')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async findByCpf(@Req() req: any, @Param('cpf') cpf: string) {
    return this.patientsService.findByCpf(cpf, req.organizationId);
  }

  // ============================================================================
  // UPDATE PATIENT
  // ============================================================================

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, req.organizationId, dto);
  }

  // ============================================================================
  // UPDATE PIPELINE STATUS (drag-and-drop on Kanban)
  // ============================================================================

  @Patch(':id/pipeline-status')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async updatePipelineStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.patientsService.updatePipelineStatus(
      id,
      req.organizationId,
      status,
    );
  }
}
