import {
  IsNotEmpty,
  IsString,
  IsIn,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { STEP_UP_ACTIONS, StepUpAction } from '../../../common/constants/auth.constants';

export class StepUpRequestDto {
  @ApiProperty({
    description: 'Ação que requer step-up authentication',
    enum: STEP_UP_ACTIONS,
    example: 'withdrawal',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ação é obrigatória' })
  @IsIn([...STEP_UP_ACTIONS], { message: 'Ação inválida' })
  action: StepUpAction;

  @ApiProperty({
    description: 'Código MFA (TOTP) para confirmar identidade',
    example: '123456',
  })
  @IsString({ message: 'Código deve ser uma string' })
  @IsNotEmpty({ message: 'Código MFA é obrigatório' })
  @MinLength(6, { message: 'Código deve ter 6 dígitos' })
  @MaxLength(6, { message: 'Código deve ter 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'Código deve conter apenas 6 dígitos numéricos' })
  mfaCode: string;
}

export class StepUpResponseDto {
  @ApiProperty({
    description: 'Indica se o step-up foi bem sucedido',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Ação autorizada',
    example: 'withdrawal',
  })
  action: string;

  @ApiProperty({
    description: 'Timestamp de expiração do token step-up (Unix timestamp)',
    example: 1704067200,
  })
  expiresAt: number;
}
