import * as zod from "zod";
const z = zod;

// Validators for variant families
export const variantFamilySchema = z.object({
  name: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  description: z.string()
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .optional()
    .nullable(),
  code: z.string()
    .min(1, 'Le code est requis')
    .max(50, 'Le code ne doit pas dépasser 50 caractères')
    .regex(/^[A-Z_]+$/, 'Le code doit contenir uniquement des majuscules et underscores'),
  isRequired: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0)
});

// Validators for variant values
export const variantValueSchema = z.object({
  value: z.string()
    .min(1, 'La valeur est requise')
    .max(100, 'La valeur ne doit pas dépasser 100 caractères'),
  code: z.string()
    .min(1, 'Le code est requis')
    .max(50, 'Le code ne doit pas dépasser 50 caractères')
    .regex(/^[A-Z0-9_]+$/, 'Le code doit contenir uniquement des majuscules, chiffres et underscores'),
  variantFamilyId: z.number().int().positive('La famille de variante est requise'),
  sortOrder: z.number().int().min(0).default(0)
});

// Validators for product variants
export const productVariantSchema = z.object({
  productId: z.string().uuid('ID produit invalide'),
  sku: z.string()
    .max(50, 'Le SKU ne doit pas dépasser 50 caractères')
    .optional()
    .nullable(),
  name: z.string()
    .max(200, 'Le nom ne doit pas dépasser 200 caractères')
    .optional()
    .nullable(),
  priceAdjustment: z.number().default(0),
  costAdjustment: z.number().default(0),
  isActive: z.boolean().default(true),
  variantValueIds: z.array(z.number().int().positive())
    .min(1, 'Au moins une valeur de variante est requise')
});

// Validators for variant combinations
export const variantCombinationSchema = z.object({
  variantValueIds: z.array(z.number().int().positive())
    .min(1, 'Au moins une valeur de variante est requise'),
  sku: z.string().max(50).optional().nullable(),
  priceAdjustment: z.number().default(0),
  costAdjustment: z.number().default(0)
});

export const productVariantsGenerateSchema = z.object({
  productId: z.string().uuid('ID produit invalide'),
  variantCombinations: z.array(variantCombinationSchema)
    .min(1, 'Au moins une combinaison est requise'),
  basePrice: z.number().positive('Le prix de base doit être positif'),
  baseCost: z.number().nonnegative('Le coût de base ne peut pas être négatif')
});

// Validation functions
export function validateVariantFamily(data: any) {
  return variantFamilySchema.parse(data);
}

export function validateVariantValue(data: any) {
  return variantValueSchema.parse(data);
}

export function validateProductVariant(data: any) {
  return productVariantSchema.parse(data);
}

export function validateProductVariantsGenerate(data: any) {
  return productVariantsGenerateSchema.parse(data);
}