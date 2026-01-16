import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsString,
  Matches,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string; // "08:00"

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string; // "18:00"

  @IsInt()
  @Min(15)
  @Max(120)
  slotDuration: number; // minutes (15, 30, 45, 60, etc.)

  @IsOptional()
  @IsDateString()
  validFrom?: string; // optional: specific date range

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
