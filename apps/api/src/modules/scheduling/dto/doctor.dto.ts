import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListDoctorsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por especialidade' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: 'Filtrar por UF do CRM' })
  @IsOptional()
  @IsString()
  crmUF?: string;

  @ApiPropertyOptional({ description: 'Busca por nome' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class DoctorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  crmNumber: string;

  @ApiProperty()
  crmUF: string;

  @ApiPropertyOptional()
  specialty?: string;

  @ApiProperty()
  verifiedStatus: string;

  @ApiPropertyOptional()
  avatarUrl?: string;
}

export class DoctorDetailResponseDto extends DoctorResponseDto {
  @ApiPropertyOptional()
  bio?: string;

  @ApiProperty()
  consultationPriceCents: number;

  @ApiProperty()
  availableSlotsCount: number;
}
