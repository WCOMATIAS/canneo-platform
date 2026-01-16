import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Senha é obrigatória' })
  password: string;
}

export class VerifyMfaDto {
  @IsString()
  @MinLength(6, { message: 'Código deve ter 6 dígitos' })
  code: string;

  @IsString()
  tempToken: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  newPassword: string;
}
