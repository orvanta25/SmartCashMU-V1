import { PrismaClient } from '@prisma/client';
import { 
  IProductVariantsGenerate,
  IProductVariantCreate,
  IProductVariantUpdate,
  IProductVariantStockUpdate
} from '../model/product-variant';
import { validateProductVariant } from '../validators/variant.validator';

export class ProductVariantService {
  constructor(private prisma: PrismaClient) {}

  // Génère automatiquement un SKU unique pour chaque variante
  private generateSKU(productName: string, variantValues: string[], index: number) {
    const base = productName
      .replace(/\s+/g, '')
      .substring(0, 3)
      .toUpperCase();
    const vals = variantValues.map(v => v.replace(/\s+/g, '').substring(0, 2).toUpperCase()).join('-');
    return `${base}-${vals}-${index.toString().padStart(3, '0')}`;
  }

  // Générer toutes les variantes pour un produit
  async generateVariantsForProduct(data: IProductVariantsGenerate) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Marquer le produit comme ayant des variantes
      await tx.produit.update({
        where: { id: data.productId },
        data: { hasVariants: true }
      });

      // 2. Désactiver les variantes existantes
      await tx.productVariant.updateMany({
        where: { productId: data.productId },
        data: { isActive: false }
      });

      // 3. Créer toutes les nouvelles variantes
      const variants = [];
      let index = 1;

      for (const combination of data.variantCombinations) {
        if (!combination.variantValueIds || combination.variantValueIds.length === 0) continue;

        const variantValues = await tx.variantValue.findMany({
          where: { id: { in: combination.variantValueIds } }
        });

        if (variantValues.length !== combination.variantValueIds.length) {
          throw new Error('Une ou plusieurs valeurs de variante n\'existent pas');
        }

        const variantName = variantValues.map(v => v.value).join(' - ');
        const sku = combination.sku || this.generateSKU(data.productName, variantValues.map(v => v.value), index);

        // Création de la variante
        const variant = await tx.productVariant.create({
          data: {
            productId: data.productId,
            sku,
            name: variantName,
            priceAdjustment: combination.priceAdjustment || 0,
            costAdjustment: combination.costAdjustment || 0,
            isActive: true,
            values: {
              connect: combination.variantValueIds.map(id => ({ id }))
            },
            stocks: {
              create: data.magasinIds.map(magasinId => ({
                magasinId,
                quantity: combination.initialStock || 0
              }))
            }
          },
          include: {
            values: { include: { variantFamily: true } },
            stocks: true
          }
        });

        variants.push(variant);
        index++;
      }

      return variants;
    });
  }

  // Récupérer les variantes d'un produit
  async getProductVariants(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId, isActive: true },
      include: {
        values: { include: { variantFamily: true } },
        stocks: true
      },
      orderBy: { id: 'asc' }
    });
  }

  async createVariant(data: IProductVariantCreate) {
    validateProductVariant(data);

    const product = await this.prisma.produit.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error('Produit non trouvé');

    if (data.sku) {
      const existing = await this.prisma.productVariant.findUnique({ where: { sku: data.sku } });
      if (existing) throw new Error('Une variante avec ce SKU existe déjà');
    }

    return this.prisma.productVariant.create({
      data: {
        productId: data.productId,
        sku: data.sku,
        name: data.name,
        priceAdjustment: data.priceAdjustment || 0,
        costAdjustment: data.costAdjustment || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        values: { connect: data.variantValueIds.map(id => ({ id })) },
        stocks: data.magasinIds
          ? { create: data.magasinIds.map(magasinId => ({ magasinId, quantity: data.initialStock || 0 })) }
          : undefined
      },
      include: {
        values: { include: { variantFamily: true } },
        stocks: true
      }
    });
  }

  async updateVariant(id: number, data: IProductVariantUpdate) {
    if (data.sku) {
      const existing = await this.prisma.productVariant.findFirst({
        where: { id: { not: id }, sku: data.sku }
      });
      if (existing) throw new Error('Une variante avec ce SKU existe déjà');
    }

    return this.prisma.productVariant.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        priceAdjustment: data.priceAdjustment,
        costAdjustment: data.costAdjustment,
        isActive: data.isActive,
        ...(data.variantValueIds && {
          values: { set: data.variantValueIds.map(id => ({ id })) }
        })
      },
      include: { values: { include: { variantFamily: true } }, stocks: true }
    });
  }

  async deleteVariant(id: number) {
    return this.prisma.productVariant.delete({ where: { id } });
  }

  async updateStock(variantId: number, magasinId: string, data: IProductVariantStockUpdate) {
    return this.prisma.productVariantStock.upsert({
      where: { productVariantId_magasinId: { productVariantId: variantId, magasinId } },
      update: { quantity: data.quantity, minStock: data.minStock, maxStock: data.maxStock },
      create: { productVariantId: variantId, magasinId, quantity: data.quantity, minStock: data.minStock || 0, maxStock: data.maxStock }
    });
  }

  async getStocksForMagasin(magasinId: string) {
    return this.prisma.productVariantStock.findMany({
      where: { magasinId },
      include: { productVariant: { include: { product: true, values: true } } }
    });
  }
}
