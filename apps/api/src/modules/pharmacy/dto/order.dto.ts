import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsUUID,
  Min,
  ValidateNested,
  ArrayMinSize,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FULFILLMENT_TYPE, FulfillmentType, ORDER_STATUS, OrderStatusType } from '../constants/pharmacy.constants';

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  pharmacyId: string;

  @IsEnum(FULFILLMENT_TYPE)
  fulfillmentType: FulfillmentType;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsOptional()
  @MaxLength(200)
  shippingStreet?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  shippingNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingComplement?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingDistrict?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingCity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  shippingState?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{8}$/, { message: 'CEP must be 8 digits' })
  shippingCep?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(ORDER_STATUS)
  status: OrderStatusType;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}

export class OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export class OrderResponseDto {
  id: string;
  status: string;
  patientId: string;
  patientName: string;
  pharmacyId: string;
  pharmacyName: string;
  fulfillmentType: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  shippingAddress: {
    street: string | null;
    number: string | null;
    complement: string | null;
    district: string | null;
    city: string | null;
    state: string | null;
    cep: string | null;
  } | null;
  paymentIntentId: string | null;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrderListResponseDto {
  orders: OrderResponseDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class OrderFilterDto {
  @IsEnum(ORDER_STATUS)
  @IsOptional()
  status?: OrderStatusType;

  @IsUUID()
  @IsOptional()
  pharmacyId?: string;

  @IsUUID()
  @IsOptional()
  patientId?: string;
}
