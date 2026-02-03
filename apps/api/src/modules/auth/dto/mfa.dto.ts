import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MfaSetupResponseDto {
  @ApiProperty({
    description: 'Secret TOTP em base32 para configuração no app authenticator',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret: string;

  @ApiProperty({
    description: 'URL do QR Code para escanear com o app authenticator',
    example: 'otpauth://totp/CANNEO:usuario@email.com?secret=JBSWY3DPEHPK3PXP&issuer=CANNEO',
  })
  qrCodeUrl: string;
}

export class MfaVerifyDto {
  @ApiProperty({
    description: 'Código TOTP de 6 dígitos do app authenticator',
    example: '123456',
  })
  @IsString({ message: 'Código deve ser uma string' })
  @IsNotEmpty({ message: 'Código MFA é obrigatório' })
  @MinLength(6, { message: 'Código deve ter 6 dígitos' })
  @MaxLength(6, { message: 'Código deve ter 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'Código deve conter apenas 6 dígitos numéricos' })
  code: string;
}

export class MfaVerifyResponseDto {
  @ApiProperty({
    description: 'Indica se a verificação MFA foi bem sucedida',
    example: true,
  })
  verified: boolean;

  @ApiProperty({
    description: 'Mensagem de retorno',
    example: 'MFA verificado com sucesso',
  })
  message: string;
}
