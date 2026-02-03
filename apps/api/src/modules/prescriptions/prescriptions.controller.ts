import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PrescriptionService } from './services/prescription.service';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  PrescriptionResponseDto,
  SignedPrescriptionResponseDto,
  SncrRegistrationResponseDto,
} from './dto/prescription.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  doctorId?: string;
  patientId?: string;
}

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  /**
   * POST /prescriptions
   * Create a new prescription draft
   * Only after appointment is COMPLETED
   */
  @Post()
  @Roles(UserRole.DOCTOR)
  async create(
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionService.create(dto, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  /**
   * GET /prescriptions/:id
   * Get a prescription by ID
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getById(
    @Param('id', ParseUUIDPipe) prescriptionId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionService.getById(prescriptionId, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  /**
   * PUT /prescriptions/:id
   * Update a prescription draft
   */
  @Put(':id')
  @Roles(UserRole.DOCTOR)
  async update(
    @Param('id', ParseUUIDPipe) prescriptionId: string,
    @Body() dto: UpdatePrescriptionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionService.update(prescriptionId, dto, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  /**
   * POST /prescriptions/:id/sign
   * Sign a prescription (generates PDF with digital signature)
   * Transition: DRAFT → SIGNED
   */
  @Post(':id/sign')
  @Roles(UserRole.DOCTOR)
  async sign(
    @Param('id', ParseUUIDPipe) prescriptionId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<SignedPrescriptionResponseDto> {
    return this.prescriptionService.sign(prescriptionId, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  /**
   * POST /prescriptions/:id/sncr
   * Register a signed prescription with SNCR
   * Transition: SIGNED → SNCR_REGISTERED
   */
  @Post(':id/sncr')
  @Roles(UserRole.DOCTOR)
  async registerWithSncr(
    @Param('id', ParseUUIDPipe) prescriptionId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<SncrRegistrationResponseDto> {
    return this.prescriptionService.registerWithSncr(prescriptionId, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  /**
   * GET /prescriptions/appointment/:appointmentId
   * Get all prescriptions for an appointment
   */
  @Get('appointment/:appointmentId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getByAppointment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<PrescriptionResponseDto[]> {
    return this.prescriptionService.getByAppointment(appointmentId, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  /**
   * GET /prescriptions/patient/:patientId
   * Get all prescriptions for a patient
   */
  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ prescriptions: PrescriptionResponseDto[]; total: number; hasMore: boolean }> {
    return this.prescriptionService.getByPatient(
      patientId,
      {
        userId: user.sub,
        role: user.role,
        doctorId: user.doctorId,
        patientId: user.patientId,
      },
      page,
      Math.min(limit, 100),
    );
  }
}
