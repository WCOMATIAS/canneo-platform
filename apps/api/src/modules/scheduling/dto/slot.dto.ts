import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListSlotsQueryDto {
  @ApiPropertyOptional({ description: 'Data inicial (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Incluir slots já reservados', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeBooked?: boolean = false;
}

export class SlotResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  doctorId: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty()
  isBooked: boolean;

  @ApiProperty()
  isAvailable: boolean;
}

export class CreateSlotDto {
  @ApiProperty({ description: 'Início do slot (ISO 8601)' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: 'Fim do slot (ISO 8601)' })
  @IsDateString()
  endsAt: string;
}

export class CreateSlotsDto {
  @ApiProperty({ type: [CreateSlotDto], description: 'Lista de slots a criar' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSlotDto)
  slots: CreateSlotDto[];
}

export class SlotReservationDto {
  @ApiProperty()
  slotId: string;

  @ApiProperty()
  reservedUntil: Date;

  @ApiProperty()
  appointmentId: string;
}
