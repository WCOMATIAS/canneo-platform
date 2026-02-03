import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@canneo.com.br',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha@123',
    minLength: 8,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password: string;

  @ApiPropertyOptional({
    description: 'Código MFA (TOTP) se habilitado',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  mfaCode?: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Dados do usuário autenticado',
  })
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    tenantId?: string;
  };

  @ApiProperty({
    description: 'Indica se MFA é obrigatório para continuar',
    example: false,
  })
  requiresMfa: boolean;

  @ApiProperty({
    description: 'Indica se o usuário tem MFA configurado',
    example: true,
  })
  mfaEnabled: boolean;

  @ApiProperty({
    description: 'Indica se o usuário precisa configurar MFA antes de continuar',
    example: false,
    required: false,
  })
  mfaSetupRequired?: boolean;
}
