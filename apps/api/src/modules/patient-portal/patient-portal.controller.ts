import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientPortalService } from './patient-portal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('patient-portal')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('PATIENT')
export class PatientPortalController {
  constructor(private readonly patientPortalService: PatientPortalService) {}

  // ============================================================================
  // GET DASHBOARD SUMMARY
  // ============================================================================

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.patientPortalService.getDashboardSummary(
      req.user.id,
      req.organizationId,
    );
  }

  // ============================================================================
  // GET PROFILE
  // ============================================================================

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.patientPortalService.getProfile(
      req.user.id,
      req.organizationId,
    );
  }

  // ============================================================================
  // GET CONSULTATIONS
  // ============================================================================

  @Get('consultations')
  async getConsultations(@Req() req: any) {
    return this.patientPortalService.getConsultations(
      req.user.id,
      req.organizationId,
    );
  }

  // ============================================================================
  // GET PRESCRIPTIONS
  // ============================================================================

  @Get('prescriptions')
  async getPrescriptions(@Req() req: any) {
    return this.patientPortalService.getPrescriptions(
      req.user.id,
      req.organizationId,
    );
  }

  // ============================================================================
  // GET DOCUMENTS
  // ============================================================================

  @Get('documents')
  async getDocuments(@Req() req: any) {
    return this.patientPortalService.getDocuments(
      req.user.id,
      req.organizationId,
    );
  }

  // ============================================================================
  // UPLOAD DOCUMENT
  // ============================================================================

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') documentType: string,
  ) {
    return this.patientPortalService.uploadDocument(
      req.user.id,
      req.organizationId,
      file,
      documentType,
    );
  }

  // ============================================================================
  // DELETE DOCUMENT
  // ============================================================================

  @Delete('documents/:id')
  async deleteDocument(@Req() req: any, @Param('id') documentId: string) {
    return this.patientPortalService.deleteDocument(
      req.user.id,
      req.organizationId,
      documentId,
    );
  }

  // ============================================================================
  // GET ANVISA REPORTS
  // ============================================================================

  @Get('anvisa-reports')
  async getAnvisaReports(@Req() req: any) {
    return this.patientPortalService.getAnvisaReports(
      req.user.id,
      req.organizationId,
    );
  }
}
