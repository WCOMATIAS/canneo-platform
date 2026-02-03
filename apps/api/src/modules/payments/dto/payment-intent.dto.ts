import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentKind, PaymentMethod } from '@prisma/client';
import { PAYMENT_CONSTANTS } from '../constants/payment.constants';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Tipo de pagamento',
    enum: PaymentKind,
    example: 'CONSULT',
  })
  @IsEnum(PaymentKind)
  @IsNotEmpty()
  kind: PaymentKind;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: 'PIX',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty({
    description: 'Valor em centavos (inteiro)',
    example: 15000,
    minimum: PAYMENT_CONSTANTS.MIN_PAYMENT_CENTS,
    maximum: PAYMENT_CONSTANTS.MAX_PAYMENT_CENTS,
  })
  @IsInt({ message: 'Valor deve ser inteiro (centavos)' })
  @Min(PAYMENT_CONSTANTS.MIN_PAYMENT_CENTS, {
    message: `Valor mínimo: ${PAYMENT_CONSTANTS.MIN_PAYMENT_CENTS} centavos`,
  })
  @Max(PAYMENT_CONSTANTS.MAX_PAYMENT_CENTS, {
    message: `Valor máximo: ${PAYMENT_CONSTANTS.MAX_PAYMENT_CENTS} centavos`,
  })
  amountCents: number;

  @ApiPropertyOptional({
    description: 'ID do agendamento (para consultas)',
  })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiPropertyOptional({
    description: 'ID do pedido (para farmácia)',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Metadados adicionais',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class PaymentIntentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  kind: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  amountCents: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;
}

export class ProcessApprovalDto {
  @ApiProperty({
    description: 'ID do médico que receberá o pagamento',
  })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiPropertyOptional({
    description: 'ID do pagamento no PSP (ex: Stripe payment_intent)',
  })
  @IsOptional()
  @IsString()
  pspPaymentId?: string;
}

export class ProcessRefundDto {
  @ApiProperty({
    description: 'Valor do estorno em centavos',
    example: 15000,
  })
  @IsInt({ message: 'Valor deve ser inteiro (centavos)' })
  @Min(1)
  amountCents: number;

  @ApiPropertyOptional({
    description: 'Motivo do estorno',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SplitCalculationResponseDto {
  @ApiProperty({ description: 'Valor bruto em centavos', example: 15000 })
  grossCents: number;

  @ApiProperty({ description: 'Taxa do gateway em centavos', example: 149 })
  gatewayFeeCents: number;

  @ApiProperty({ description: 'Taxa CANNEO em centavos', example: 1485 })
  canneoFeeCents: number;

  @ApiProperty({ description: 'Valor líquido do médico em centavos', example: 13366 })
  doctorNetCents: number;

  @ApiProperty({ description: 'Taxa do gateway em basis points', example: 99 })
  gatewayRateBps: number;

  @ApiProperty({ description: 'Taxa CANNEO em basis points', example: 1000 })
  canneoRateBps: number;
}
