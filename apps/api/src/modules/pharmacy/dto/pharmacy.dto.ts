import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEmail,
  Min,
  Max,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';

export class CreatePharmacyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{14}$/, { message: 'CNPJ must be 14 digits' })
  cnpj: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'CEP must be 8 digits' })
  shippingOriginCep: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  street?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  number?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  complement?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  state?: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsNumber()
  @IsOptional()
  @Min(30)
  @Max(10080) // max 1 week in minutes
  slaMinutes?: number;

  @IsBoolean()
  @IsOptional()
  supportsPickup?: boolean;

  @IsBoolean()
  @IsOptional()
  supportsDelivery?: boolean;
}

export class UpdatePharmacyDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{8}$/, { message: 'CEP must be 8 digits' })
  shippingOriginCep?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  street?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  number?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  complement?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  state?: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsNumber()
  @IsOptional()
  @Min(30)
  @Max(10080)
  slaMinutes?: number;

  @IsBoolean()
  @IsOptional()
  supportsPickup?: boolean;

  @IsBoolean()
  @IsOptional()
  supportsDelivery?: boolean;
}

export class PharmacyResponseDto {
  id: string;
  name: string;
  cnpj: string;
  email: string | null;
  phone: string | null;
  shippingOriginCep: string;
  address: {
    street: string | null;
    number: string | null;
    complement: string | null;
    district: string | null;
    city: string | null;
    state: string | null;
    cep: string | null;
  } | null;
  lat: number | null;
  lng: number | null;
  slaMinutes: number;
  supportsPickup: boolean;
  supportsDelivery: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PharmacySearchDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  radiusKm?: number;

  @IsUUID('4', { each: true })
  @IsOptional()
  productIds?: string[];

  @IsBoolean()
  @IsOptional()
  requiresDelivery?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresPickup?: boolean;
}

export class PharmacySearchResultDto extends PharmacyResponseDto {
  distanceKm: number;
  estimatedShippingCents: number | null;
  score: number;
  hasAllProducts: boolean;
  availableProducts: number;
  totalProducts: number;
}
