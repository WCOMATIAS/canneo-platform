import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard, SuperAdminGuard } from '../../common/guards';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  /**
   * Dashboard stats
   */
  @Get('dashboard')
  async getDashboardStats() {
    return this.superAdminService.getDashboardStats();
  }

  /**
   * Lista todos os medicos
   */
  @Get('doctors')
  async listDoctors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'inactive' | 'all',
  ) {
    return this.superAdminService.listDoctors({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
    });
  }

  /**
   * Detalhes de um medico
   */
  @Get('doctors/:id')
  async getDoctorById(@Param('id') id: string) {
    return this.superAdminService.getDoctorById(id);
  }

  /**
   * Pacientes de um medico
   */
  @Get('doctors/:id/patients')
  async getDoctorPatients(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.superAdminService.getDoctorPatients(id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
    });
  }

  /**
   * Consultas de um medico
   */
  @Get('doctors/:id/consultations')
  async getDoctorConsultations(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.superAdminService.getDoctorConsultations(id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
      startDate,
      endDate,
    });
  }

  /**
   * Laudos ANVISA de um medico
   */
  @Get('doctors/:id/reports')
  async getDoctorReports(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.superAdminService.getDoctorReports(id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
    });
  }

  /**
   * Prescricoes de um medico
   */
  @Get('doctors/:id/prescriptions')
  async getDoctorPrescriptions(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.superAdminService.getDoctorPrescriptions(id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
    });
  }

  /**
   * Lista todas as organizacoes
   */
  @Get('organizations')
  async listOrganizations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.superAdminService.listOrganizations({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      type,
    });
  }

  /**
   * Lista todos os pacientes da plataforma
   */
  @Get('patients')
  async listAllPatients(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('pipelineStatus') pipelineStatus?: string,
  ) {
    return this.superAdminService.listAllPatients({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      pipelineStatus,
    });
  }

  /**
   * Detalhes de um paciente
   */
  @Get('patients/:id')
  async getPatientById(@Param('id') id: string) {
    return this.superAdminService.getPatientById(id);
  }

  /**
   * Lista audit logs
   */
  @Get('audit-logs')
  async listAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.superAdminService.listAuditLogs({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      action,
      entity,
      userId,
      startDate,
      endDate,
    });
  }
}
