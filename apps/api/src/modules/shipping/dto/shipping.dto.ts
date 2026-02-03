import {
  IsString,
  IsInt,
  IsPositive,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentStatus } from '@prisma/client';

export class ShippingItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  widthCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  lengthCm?: number;
}

export class GetShippingQuotesDto {
  @IsString()
  pharmacyId: string;

  @IsString()
  destinationCep: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingItemDto)
  items: ShippingItemDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  insuranceValueCents?: number;
}

export class ShippingQuoteResponseDto {
  id: string;
  provider: string;
  serviceName: string;
  serviceCode: string;
  priceCents: number;
  deliveryDays: number;
  deliveryRange?: {
    min: number;
    max: number;
  };
}

export class CreateShipmentDto {
  @IsString()
  orderId: string;

  @IsString()
  serviceCode: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  insuranceValueCents?: number;
}

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @IsOptional()
  @IsString()
  trackingCode?: string;
}

export class ShipmentResponseDto {
  id: string;
  orderId: string;
  status: ShipmentStatus;
  provider: string;
  serviceName?: string;
  serviceCode?: string;
  trackingCode?: string;
  trackingUrl?: string;
  labelUrl?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

export class TrackingEventDto {
  date: Date;
  status: string;
  description: string;
  location?: string;
}

export class TrackingResponseDto {
  trackingCode: string;
  status: string;
  events: TrackingEventDto[];
  estimatedDelivery?: Date;
}

export class GenerateLabelDto {
  @IsString()
  shipmentId: string;
}

export class LabelResponseDto {
  shipmentId: string;
  labelUrl: string;
  trackingCode: string;
}

// Melhor Envio specific DTOs

export class MelhorEnvioQuoteRequestDto {
  from: {
    postal_code: string;
  };
  to: {
    postal_code: string;
  };
  products: Array<{
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number;
    quantity: number;
  }>;
}

export class MelhorEnvioQuoteResponseDto {
  id: number;
  name: string;
  price: string;
  custom_price: string;
  discount: string;
  currency: string;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  company: {
    id: number;
    name: string;
  };
  error?: string;
}

export class MelhorEnvioCartItemDto {
  service: number;
  agency?: number;
  from: {
    name: string;
    phone: string;
    email: string;
    document: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    state_abbr: string;
    country_id: string;
    postal_code: string;
  };
  to: {
    name: string;
    phone: string;
    email: string;
    document: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    state_abbr: string;
    country_id: string;
    postal_code: string;
  };
  products: Array<{
    name: string;
    quantity: number;
    unitary_value: number;
  }>;
  volumes: Array<{
    height: number;
    width: number;
    length: number;
    weight: number;
  }>;
  options?: {
    insurance_value?: number;
    receipt?: boolean;
    own_hand?: boolean;
    reverse?: boolean;
    non_commercial?: boolean;
  };
}
