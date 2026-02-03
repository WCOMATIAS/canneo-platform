import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateInventoryDto {
  @IsNumber()
  @Min(0)
  priceCents: number;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockQty?: number;
}

export class InventoryItemResponseDto {
  id: string;
  pharmacyId: string;
  productId: string;
  product: ProductResponseDto;
  priceCents: number;
  inStock: boolean;
  stockQty: number | null;
  updatedAt: Date;
}

export class InventoryListResponseDto {
  items: InventoryItemResponseDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class BulkInventoryUpdateDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0)
  priceCents: number;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockQty?: number;
}
