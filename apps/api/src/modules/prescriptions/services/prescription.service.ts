import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, AppointmentStatus } from '@prisma/client';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  PrescriptionResponseDto,
  SignedPrescriptionResponseDto,
  SncrRegistrationResponseDto,
} from '../dto/prescription.dto';
import {
  PRESCRIPTION_STATUS,
  PrescriptionStatus,
  VALID_TRANSITIONS,
  COMPLETED_APPOINTMENT_STATUSES,
  PRESCRIPTION_DOCUMENT_TYPE,
} from '../constants/prescription.constants';
import { SignatureService } from './signature.service';
import { SncrAdapterService } from './sncr-adapter.service';

interface CurrentUser {
  userId: string;
  role: UserRole;
  doctorId?: string;
  patientId?: string;
}

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly signatureService: SignatureService,
    private readonly sncrAdapterService: SncrAdapterService,
  ) {}

  /**
   * Create a new prescription draft
   * Only allowed after appointment is COMPLETED
   */
  async create(
    dto: CreatePrescriptionDto,
    currentUser: CurrentUser,
  ): Promise<PrescriptionResponseDto> {
    // Only doctors can create prescriptions
    if (currentUser.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Only doctors can create prescriptions');
    }

    if (!currentUser.doctorId) {
      throw new ForbiddenException('Doctor profile not found');
    }

    // Verify appointment exists and belongs to the doctor
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: {
        patient: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.doctorId !== currentUser.doctorId) {
      throw new ForbiddenException('You can only create prescriptions for your own appointments');
    }

    // Verify appointment is COMPLETED
    if (!COMPLETED_APPOINTMENT_STATUSES.includes(appointment.status as any)) {
      throw new BadRequestException(
        `Prescriptions can only be created after the appointment is completed. Current status: ${appointment.status}`,
      );
    }

    // Create prescription
    const prescription = await this.prisma.prescription.create({
      data: {
        appointmentId: dto.appointmentId,
        doctorId: currentUser.doctorId,
        patientId: appointment.patientId,
        status: PRESCRIPTION_STATUS.DRAFT,
        productName: dto.productName,
        thcPercent: dto.thcPercent,
        cbdPercent: dto.cbdPercent,
        dosage: dto.dosage,
        durationDays: dto.durationDays,
        quantityText: dto.quantityText,
        sncrRequired: dto.sncrRequired ?? false,
      },
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        patient: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
    });

    this.logger.log(
      `Prescription ${prescription.id} created for appointment ${dto.appointmentId}`,
    );

    return this.mapToResponse(prescription);
  }

  /**
   * Update a prescription draft
   */
  async update(
    prescriptionId: string,
    dto: UpdatePrescriptionDto,
    currentUser: CurrentUser,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.findAndVerifyAccess(prescriptionId, currentUser);

    // Can only update DRAFT prescriptions
    if (prescription.status !== PRESCRIPTION_STATUS.DRAFT) {
      throw new BadRequestException('Only draft prescriptions can be updated');
    }

    const updated = await this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        productName: dto.productName,
        thcPercent: dto.thcPercent,
        cbdPercent: dto.cbdPercent,
        dosage: dto.dosage,
        durationDays: dto.durationDays,
        quantityText: dto.quantityText,
        sncrRequired: dto.sncrRequired,
      },
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        patient: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
    });

    this.logger.log(`Prescription ${prescriptionId} updated`);

    return this.mapToResponse(updated);
  }

  /**
   * Sign a prescription (generates PDF with digital signature)
   */
  async sign(
    prescriptionId: string,
    currentUser: CurrentUser,
  ): Promise<SignedPrescriptionResponseDto> {
    const prescription = await this.findAndVerifyAccess(prescriptionId, currentUser, true);

    // Can only sign DRAFT prescriptions
    if (prescription.status !== PRESCRIPTION_STATUS.DRAFT) {
      throw new BadRequestException(
        `Cannot sign prescription with status ${prescription.status}. Only DRAFT prescriptions can be signed.`,
      );
    }

    // Get appointment for date
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: prescription.appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Related appointment not found');
    }

    // Generate and sign PDF
    const signatureResult = await this.signatureService.generateAndSignPdf({
      id: prescription.id,
      productName: prescription.productName,
      thcPercent: prescription.thcPercent,
      cbdPercent: prescription.cbdPercent,
      dosage: prescription.dosage,
      durationDays: prescription.durationDays,
      quantityText: prescription.quantityText,
      patientName: prescription.patient.user.fullName,
      patientCpf: prescription.patient.cpfEnc ? '[ENCRYPTED]' : undefined,
      doctorName: prescription.doctor.user.fullName,
      doctorCrm: prescription.doctor.crmNumber,
      doctorCrmUF: prescription.doctor.crmUF,
      appointmentDate: appointment.createdAt,
    });

    // Update prescription status and create document record in a transaction
    const [updatedPrescription] = await this.prisma.$transaction([
      // Update prescription status
      this.prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          status: PRESCRIPTION_STATUS.SIGNED,
        },
        include: {
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          patient: {
            include: {
              user: { select: { fullName: true } },
            },
          },
        },
      }),
      // Create document record
      this.prisma.document.create({
        data: {
          prescriptionId,
          type: PRESCRIPTION_DOCUMENT_TYPE,
          fileUrl: signatureResult.fileUrl,
          hashPre: signatureResult.hashPre,
          hashPost: signatureResult.hashPost,
          signedByUserId: currentUser.userId,
          signedAt: signatureResult.signedAt,
        },
      }),
    ]);

    this.logger.log(`Prescription ${prescriptionId} signed successfully`);

    return {
      ...this.mapToResponse(updatedPrescription),
      hashPre: signatureResult.hashPre,
      hashPost: signatureResult.hashPost,
      signedAt: signatureResult.signedAt,
    };
  }

  /**
   * Register a signed prescription with SNCR
   */
  async registerWithSncr(
    prescriptionId: string,
    currentUser: CurrentUser,
  ): Promise<SncrRegistrationResponseDto> {
    const prescription = await this.findAndVerifyAccess(prescriptionId, currentUser, true);

    // Can only register SIGNED prescriptions
    if (prescription.status !== PRESCRIPTION_STATUS.SIGNED) {
      throw new BadRequestException(
        `Cannot register prescription with status ${prescription.status}. Only SIGNED prescriptions can be registered with SNCR.`,
      );
    }

    // Must require SNCR
    if (!prescription.sncrRequired) {
      throw new BadRequestException('This prescription does not require SNCR registration');
    }

    // Check if already registered
    if (prescription.sncrNumber) {
      throw new ConflictException(
        `Prescription already registered with SNCR: ${prescription.sncrNumber}`,
      );
    }

    // Get the signed document
    const document = await this.prisma.document.findFirst({
      where: {
        prescriptionId,
        type: PRESCRIPTION_DOCUMENT_TYPE,
      },
    });

    if (!document || !document.hashPost) {
      throw new BadRequestException('Signed document not found for prescription');
    }

    // Register with SNCR
    const registrationResult = await this.sncrAdapterService.register({
      prescriptionId: prescription.id,
      patientName: prescription.patient.user.fullName,
      doctorName: prescription.doctor.user.fullName,
      doctorCrm: prescription.doctor.crmNumber,
      doctorCrmUF: prescription.doctor.crmUF,
      productName: prescription.productName,
      thcPercent: prescription.thcPercent ?? undefined,
      cbdPercent: prescription.cbdPercent ?? undefined,
      dosage: prescription.dosage,
      durationDays: prescription.durationDays ?? undefined,
      quantityText: prescription.quantityText ?? undefined,
      prescriptionDate: prescription.createdAt,
      pdfHash: document.hashPost,
    });

    if (!registrationResult.success) {
      throw new BadRequestException(
        `SNCR registration failed: ${registrationResult.message}`,
      );
    }

    // Update prescription with SNCR info
    await this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: PRESCRIPTION_STATUS.SNCR_REGISTERED,
        sncrNumber: registrationResult.sncrNumber,
        sncrStatus: registrationResult.status,
      },
    });

    this.logger.log(
      `Prescription ${prescriptionId} registered with SNCR: ${registrationResult.sncrNumber}`,
    );

    return {
      prescriptionId,
      sncrNumber: registrationResult.sncrNumber!,
      sncrStatus: registrationResult.status,
      registeredAt: registrationResult.registeredAt!,
    };
  }

  /**
   * Get a prescription by ID
   */
  async getById(
    prescriptionId: string,
    currentUser: CurrentUser,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.findAndVerifyAccess(prescriptionId, currentUser);
    return this.mapToResponse(prescription);
  }

  /**
   * Get all prescriptions for an appointment
   */
  async getByAppointment(
    appointmentId: string,
    currentUser: CurrentUser,
  ): Promise<PrescriptionResponseDto[]> {
    // Verify appointment access
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Verify access
    if (currentUser.role === UserRole.DOCTOR) {
      if (currentUser.doctorId !== appointment.doctorId) {
        throw new ForbiddenException('Access denied');
      }
    } else if (currentUser.role === UserRole.PATIENT) {
      if (currentUser.patientId !== appointment.patientId) {
        throw new ForbiddenException('Access denied');
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where: { appointmentId },
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        patient: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        documents: {
          where: { type: PRESCRIPTION_DOCUMENT_TYPE },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prescriptions.map((p) => this.mapToResponse(p));
  }

  /**
   * Get all prescriptions for a patient
   */
  async getByPatient(
    patientId: string,
    currentUser: CurrentUser,
    page = 1,
    limit = 20,
  ): Promise<{ prescriptions: PrescriptionResponseDto[]; total: number; hasMore: boolean }> {
    // Verify access
    if (currentUser.role === UserRole.PATIENT) {
      if (currentUser.patientId !== patientId) {
        throw new ForbiddenException('You can only view your own prescriptions');
      }
    } else if (currentUser.role === UserRole.DOCTOR) {
      // Doctor can view prescriptions of patients they have treated
      const hasAppointment = await this.prisma.appointment.findFirst({
        where: {
          doctorId: currentUser.doctorId,
          patientId,
        },
      });
      if (!hasAppointment) {
        throw new ForbiddenException('Access denied');
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const skip = (page - 1) * limit;
    const [prescriptions, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where: { patientId },
        include: {
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          patient: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          documents: {
            where: { type: PRESCRIPTION_DOCUMENT_TYPE },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.prescription.count({
        where: { patientId },
      }),
    ]);

    return {
      prescriptions: prescriptions.map((p) => this.mapToResponse(p)),
      total,
      hasMore: skip + prescriptions.length < total,
    };
  }

  /**
   * Find prescription and verify access
   */
  private async findAndVerifyAccess(
    prescriptionId: string,
    currentUser: CurrentUser,
    requireDoctor = false,
  ): Promise<any> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        patient: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        documents: {
          where: { type: PRESCRIPTION_DOCUMENT_TYPE },
          take: 1,
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Verify access based on role
    if (requireDoctor) {
      if (currentUser.role !== UserRole.DOCTOR && currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only doctors can perform this action');
      }
      if (currentUser.role === UserRole.DOCTOR && currentUser.doctorId !== prescription.doctorId) {
        throw new ForbiddenException('You can only manage your own prescriptions');
      }
    } else {
      if (currentUser.role === UserRole.DOCTOR) {
        if (currentUser.doctorId !== prescription.doctorId) {
          throw new ForbiddenException('Access denied');
        }
      } else if (currentUser.role === UserRole.PATIENT) {
        if (currentUser.patientId !== prescription.patientId) {
          throw new ForbiddenException('You can only view your own prescriptions');
        }
      } else if (currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Access denied');
      }
    }

    return prescription;
  }

  /**
   * Map prescription entity to response DTO
   */
  private mapToResponse(prescription: any): PrescriptionResponseDto {
    const document = prescription.documents?.[0];
    return {
      id: prescription.id,
      appointmentId: prescription.appointmentId,
      doctorId: prescription.doctorId,
      doctorName: prescription.doctor.user.fullName,
      doctorCrm: `${prescription.doctor.crmNumber}/${prescription.doctor.crmUF}`,
      patientId: prescription.patientId,
      patientName: prescription.patient.user.fullName,
      status: prescription.status,
      productName: prescription.productName,
      thcPercent: prescription.thcPercent,
      cbdPercent: prescription.cbdPercent,
      dosage: prescription.dosage,
      durationDays: prescription.durationDays,
      quantityText: prescription.quantityText,
      sncrRequired: prescription.sncrRequired,
      sncrNumber: prescription.sncrNumber,
      sncrStatus: prescription.sncrStatus,
      documentUrl: document?.fileUrl || null,
      createdAt: prescription.createdAt,
      updatedAt: prescription.updatedAt,
    };
  }
}
