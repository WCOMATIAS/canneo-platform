// CANNEO - Pharmacy validation schemas (Zod)
import { z } from 'zod';
import { addressSchema } from './common.schema';

// ==================== PHARMACY ENUMS ====================

export const orderStatusSchema = z.enum([
  'CREATED',
  'PAYMENT_PENDING',
  'PAID',
  'PROCESSING',
  'READY_FOR_PICKUP',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

export const shipmentStatusSchema = z.enum([
  'QUOTE_CREATED',
  'LABEL_CREATED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FAILED',
  'RETURNED',
]);

export const fulfillmentTypeSchema = z.enum(['DELIVERY', 'PICKUP']);

// ==================== PHARMACY SCHEMAS ====================

export const cnpjSchema = z
  .string()
  .regex(/^\d{14}$/, 'CNPJ inválido')
  .refine(
    (cnpj) => {
      // CNPJ validation algorithm
      if (/^(\d)\1{13}$/.test(cnpj)) return false;
      const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += parseInt(cnpj[i]) * weights1[i];
      let rest = sum % 11;
      if (parseInt(cnpj[12]) !== (rest < 2 ? 0 : 11 - rest)) return false;
      sum = 0;
      for (let i = 0; i < 13; i++) sum += parseInt(cnpj[i]) * weights2[i];
      rest = sum % 11;
      return parseInt(cnpj[13]) === (rest < 2 ? 0 : 11 - rest);
    },
    { message: 'CNPJ inválido' }
  );

export const cepSchema = z.string().regex(/^\d{8}$/, 'CEP inválido (apenas números, 8 dígitos)');

export const createPharmacySchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(255),
  cnpj: cnpjSchema.optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  shippingOriginCep: cepSchema,
  address: addressSchema.optional(),
  supportsPickup: z.boolean().default(true),
  supportsDelivery: z.boolean().default(true),
});

export const updatePharmacySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido')
    .optional()
    .nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  shippingOriginCep: cepSchema.optional(),
  address: addressSchema.optional(),
  slaMinutes: z.number().int().min(30).max(10080).optional(), // max 7 days
  supportsPickup: z.boolean().optional(),
  supportsDelivery: z.boolean().optional(),
});

// ==================== PHARMACY SEARCH SCHEMAS ====================

export const pharmacySearchSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  productIds: z.array(z.string().cuid()).optional(),
  maxDistanceKm: z.number().min(1).max(500).default(50),
});

// ==================== PRODUCT SCHEMAS ====================

export const createProductSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(255),
  description: z.string().max(2000).optional(),
  sku: z
    .string()
    .min(2, 'SKU é obrigatório')
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, 'SKU deve conter apenas letras, números, _ e -'),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  active: z.boolean().optional(),
});

// ==================== INVENTORY SCHEMAS ====================

export const createInventoryItemSchema = z.object({
  productId: z.string().cuid('ID do produto inválido'),
  priceCents: z.number().int().positive('Preço deve ser positivo'),
  stockQty: z.number().int().min(0).optional(),
});

export const updateInventoryItemSchema = z.object({
  priceCents: z.number().int().positive('Preço deve ser positivo').optional(),
  inStock: z.boolean().optional(),
  stockQty: z.number().int().min(0).optional().nullable(),
});

// ==================== ORDER SCHEMAS ====================

export const createOrderItemSchema = z.object({
  productId: z.string().cuid('ID do produto inválido'),
  quantity: z.number().int().positive('Quantidade deve ser positiva').max(100),
});

export const createOrderSchema = z.object({
  pharmacyId: z.string().cuid('ID da farmácia inválido'),
  fulfillmentType: fulfillmentTypeSchema,
  items: z.array(createOrderItemSchema).min(1, 'Adicione pelo menos um item').max(50),
  shippingAddress: addressSchema.optional(),
  shippingQuoteId: z.string().cuid().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  notes: z.string().max(500).optional(),
});

// ==================== SHIPPING SCHEMAS ====================

export const getShippingQuotesSchema = z.object({
  pharmacyId: z.string().cuid('ID da farmácia inválido'),
  destinationCep: cepSchema,
  items: z.array(
    z.object({
      productId: z.string().cuid('ID do produto inválido'),
      quantity: z.number().int().positive(),
    })
  ),
});

export const createShipmentSchema = z.object({
  orderId: z.string().cuid('ID do pedido inválido'),
  serviceCode: z.string().min(1, 'Código do serviço é obrigatório'),
});

export const updateShipmentStatusSchema = z.object({
  status: shipmentStatusSchema,
  trackingCode: z.string().max(50).optional(),
});

// Type exports
export type CreatePharmacy = z.infer<typeof createPharmacySchema>;
export type UpdatePharmacy = z.infer<typeof updatePharmacySchema>;
export type PharmacySearch = z.infer<typeof pharmacySearchSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type CreateInventoryItem = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItem = z.infer<typeof updateInventoryItemSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;
export type GetShippingQuotes = z.infer<typeof getShippingQuotesSchema>;
export type CreateShipment = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentStatus = z.infer<typeof updateShipmentStatusSchema>;
