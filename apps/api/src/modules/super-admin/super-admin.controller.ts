import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard, SuperAdminGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  /**
   * Lista todas as assinaturas
   */
  @Get('subscriptions')
  async listSubscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('planId') planId?: string,
  ) {
    return this.superAdminService.listSubscriptions({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
      planId,
    });
  }

  /**
   * Detalhes de uma assinatura
   */
  @Get('subscriptions/:id')
  async getSubscriptionById(@Param('id') id: string) {
    return this.superAdminService.getSubscriptionById(id);
  }

  /**
   * Atualiza status de uma assinatura
   */
  @Patch('subscriptions/:id/status')
  async updateSubscriptionStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.superAdminService.updateSubscriptionStatus(id, body.status, body.reason);
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  /**
   * Lista notificacoes do Super Admin
   */
  @Get('notifications')
  async listNotifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.superAdminService.listNotifications({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      unreadOnly: unreadOnly === 'true',
    });
  }

  /**
   * Marca notificacao como lida
   */
  @Patch('notifications/:id/read')
  async markNotificationAsRead(@Param('id') id: string) {
    return this.superAdminService.markNotificationAsRead(id);
  }

  /**
   * Marca todas notificacoes como lidas
   */
  @Patch('notifications/read-all')
  async markAllNotificationsAsRead() {
    return this.superAdminService.markAllNotificationsAsRead();
  }

  /**
   * Cria notificacao (broadcast ou para usuario especifico)
   */
  @Post('notifications')
  async createNotification(
    @Body() body: {
      type: string;
      title: string;
      message: string;
      userId?: string;
      organizationId?: string;
      data?: any;
    },
  ) {
    return this.superAdminService.createNotification(body);
  }

  /**
   * Deleta notificacao
   */
  @Delete('notifications/:id')
  async deleteNotification(@Param('id') id: string) {
    return this.superAdminService.deleteNotification(id);
  }

  // ============================================================================
  // MONITORING
  // ============================================================================

  /**
   * Metricas do sistema
   */
  @Get('monitoring')
  async getSystemMetrics() {
    return this.superAdminService.getSystemMetrics();
  }

  /**
   * Health check detalhado
   */
  @Get('monitoring/health')
  async getHealthCheck() {
    return this.superAdminService.getHealthCheck();
  }

  /**
   * Erros recentes
   */
  @Get('monitoring/errors')
  async getRecentErrors(
    @Query('limit') limit?: string,
  ) {
    return this.superAdminService.getRecentErrors(
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // ============================================================================
  // REPORTS / ANALYTICS
  // ============================================================================

  /**
   * Relatorios analiticos
   */
  @Get('reports')
  async getReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.superAdminService.getReports({
      startDate,
      endDate,
      groupBy: groupBy || 'daily',
    });
  }

  /**
   * Relatorio de receita por plano
   */
  @Get('reports/revenue-by-plan')
  async getRevenueByPlan() {
    return this.superAdminService.getRevenueByPlan();
  }

  /**
   * Top organizacoes
   */
  @Get('reports/top-organizations')
  async getTopOrganizations(
    @Query('limit') limit?: string,
  ) {
    return this.superAdminService.getTopOrganizations(
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  /**
   * Busca configuracoes do sistema
   */
  @Get('settings')
  async getSettings() {
    return this.superAdminService.getSettings();
  }

  /**
   * Atualiza configuracoes do sistema
   */
  @Patch('settings')
  async updateSettings(
    @Body() body: Record<string, any>,
    @CurrentUser() user: any,
  ) {
    return this.superAdminService.updateSettings(body, user?.id);
  }

  /**
   * Lista planos disponiveis
   */
  @Get('plans')
  async listPlans() {
    return this.superAdminService.listPlans();
  }

  /**
   * Cria novo plano
   */
  @Post('plans')
  async createPlan(
    @Body() body: {
      name: string;
      displayName: string;
      description?: string;
      priceMonthly: number;
      priceYearly: number;
      maxDoctors: number;
      maxPatients: number;
      maxConsultations: number;
      features?: any;
    },
  ) {
    return this.superAdminService.createPlan(body);
  }

  /**
   * Atualiza plano
   */
  @Patch('plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() body: Partial<{
      displayName: string;
      description: string;
      priceMonthly: number;
      priceYearly: number;
      maxDoctors: number;
      maxPatients: number;
      maxConsultations: number;
      features: any;
      isActive: boolean;
    }>,
  ) {
    return this.superAdminService.updatePlan(id, body);
  }

  /**
   * Deleta plano (soft delete)
   */
  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.superAdminService.deletePlan(id);
  }

  // ============================================================================
  // CRUD DOCTORS
  // ============================================================================

  /**
   * Cria novo medico
   */
  @Post('doctors')
  async createDoctor(
    @Body() body: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      crm: string;
      ufCrm: string;
      specialty?: string;
      organizationId: string;
      role?: string;
    },
  ) {
    return this.superAdminService.createDoctor(body);
  }

  /**
   * Atualiza medico
   */
  @Patch('doctors/:id')
  async updateDoctor(
    @Param('id') id: string,
    @Body() body: Partial<{
      name: string;
      phone: string;
      specialty: string;
      bio: string;
      isActive: boolean;
    }>,
  ) {
    return this.superAdminService.updateDoctor(id, body);
  }

  /**
   * Atualiza status do medico
   */
  @Patch('doctors/:id/status')
  async updateDoctorStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.superAdminService.updateDoctorStatus(id, body.isActive);
  }

  // ============================================================================
  // CRUD ORGANIZATIONS
  // ============================================================================

  /**
   * Detalhes de uma organizacao
   */
  @Get('organizations/:id')
  async getOrganizationById(@Param('id') id: string) {
    return this.superAdminService.getOrganizationById(id);
  }

  /**
   * Cria nova organizacao
   */
  @Post('organizations')
  async createOrganization(
    @Body() body: {
      name: string;
      slug: string;
      type?: string;
      cnpj?: string;
      email?: string;
      phone?: string;
      planId: string;
    },
  ) {
    return this.superAdminService.createOrganization(body);
  }

  /**
   * Atualiza organizacao
   */
  @Patch('organizations/:id')
  async updateOrganization(
    @Param('id') id: string,
    @Body() body: Partial<{
      name: string;
      logo: string;
      email: string;
      phone: string;
      address: any;
      settings: any;
    }>,
  ) {
    return this.superAdminService.updateOrganization(id, body);
  }

  /**
   * Deleta organizacao (soft delete)
   */
  @Delete('organizations/:id')
  async deleteOrganization(@Param('id') id: string) {
    return this.superAdminService.deleteOrganization(id);
  }
}
