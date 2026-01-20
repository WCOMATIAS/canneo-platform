import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Dashboard do medico logado
   */
  @Get()
  async getDashboard(@CurrentUser() user: any) {
    // user contem userId, organizationId, role do token JWT
    // Buscar o doctorProfile pelo userId
    return this.dashboardService.getDoctorDashboard(
      user.doctorId || user.userId,
      user.organizationId,
    );
  }

  /**
   * Resumo semanal
   */
  @Get('weekly-summary')
  async getWeeklySummary(@CurrentUser() user: any) {
    return this.dashboardService.getWeeklySummary(
      user.doctorId || user.userId,
    );
  }
}
