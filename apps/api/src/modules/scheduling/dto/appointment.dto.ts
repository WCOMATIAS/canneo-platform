import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { AppointmentStatus, PaymentMethod } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID do médico' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'ID do slot escolhido' })
  @IsUUID()
  slotId: string;

  @ApiProperty({ description: 'Método de pagamento', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Observações do paciente' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class AppointmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiProperty()
  doctorId: string;

  @ApiProperty()
  doctorName: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  patientName: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  endsAt: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  paymentIntentId?: string;

  @ApiPropertyOptional()
  videoSessionUrl?: string;

  @ApiProperty()
  createdAt: Date;
}

export class AppointmentDetailResponseDto extends AppointmentResponseDto {
  @ApiPropertyOptional()
  startedAt?: Date;

  @ApiPropertyOptional()
  endedAt?: Date;

  @ApiPropertyOptional()
  amountCents?: number;

  @ApiPropertyOptional()
  paymentStatus?: string;
}

export class StartAppointmentDto {
  @ApiPropertyOptional({ description: 'Notas iniciais do médico' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  initialNotes?: string;
}

export class CompleteAppointmentDto {
  @ApiPropertyOptional({ description: 'Notas finais / evolução' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  finalNotes?: string;

  @ApiPropertyOptional({ description: 'Diagnóstico / CID' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  diagnosis?: string;
}

export class CancelAppointmentDto {
  @ApiProperty({ description: 'Motivo do cancelamento' })
  @IsString()
  @MaxLength(500)
  reason: string;
}

export class ListAppointmentsQueryDto {
  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;
}
