// src/service/variant-value.service.ts
import { PrismaClient } from '@prisma/client';
import { 
  IVariantValueCreate, 
  IVariantValueUpdate 
} from '../model/variant-value';

export class VariantValueService {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.variantValue.findMany({
      orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }]
    });
  }

  async findAllByFamily(variantFamilyId: number) {
    return this.prisma.variantValue.findMany({
      where: { 
        variantFamily: { id: variantFamilyId } 
      },
      orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }]
    });
  }

  async findById(id: number) {
    return this.prisma.variantValue.findUnique({
      where: { id }
    });
  }

  async create(data: IVariantValueCreate) {
  // Validation simplifiée
  if (!data.value || typeof data.value !== 'string') {
    throw new Error('Le nom de la valeur est requis');
  }

  // Vérifier les doublons (seulement si famille spécifiée)
  if (data.variantFamilyId) {
    const existing = await this.prisma.variantValue.findFirst({
      where: { 
        value: data.value,
        variantFamilyId: data.variantFamilyId
      }
    });

    if (existing) {
      throw new Error('Une valeur avec ce nom existe déjà dans cette famille');
    }
  }

  // Préparer les données pour la création
  const createData: any = {
    value: data.value,
    sortOrder: data.sortOrder || 0
  };

  // Si variantFamilyId est fourni, utiliser connect, sinon null
  if (data.variantFamilyId) {
    createData.variantFamily = {
      connect: { id: data.variantFamilyId }
    };
  } else {
    createData.variantFamily = undefined; // Permet de créer sans famille
  }

  return this.prisma.variantValue.create({
    data: createData
  });
}
  async update(id: number, data: IVariantValueUpdate) {
    // Vérifier que la valeur existe
    const current = await this.prisma.variantValue.findUnique({
      where: { id }
    });

    if (!current) {
      throw new Error('Valeur non trouvée');
    }

    // Vérifier les doublons
    if (data.value && data.value !== current.value) {
      const existing = await this.prisma.variantValue.findFirst({
        where: {
          id: { not: id },
          value: data.value
        }
      });

      if (existing) {
        throw new Error('Une valeur avec ce nom existe déjà');
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = { ...data };
    
    // Gérer la relation variantFamily si fournie
    if (data.variantFamilyId !== undefined) {
      if (data.variantFamilyId) {
        updateData.variantFamily = {
          connect: { id: data.variantFamilyId }
        };
      } else {
        updateData.variantFamily = {
          disconnect: true
        };
      }
      delete updateData.variantFamilyId; // Supprimer le champ qui n'est pas reconnu par Prisma
    }

    return this.prisma.variantValue.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: number) {
    // Vérifier si la valeur est utilisée dans des variantes de produit
    const productVariants = await this.prisma.productVariant.findMany({
      where: {
        values: {
          some: { id }
        }
      }
    });

    if (productVariants.length > 0) {
      throw new Error(
        'Cette valeur est utilisée par des variantes de produit. ' +
        'Supprimez d\'abord les variantes ou retirez cette valeur.'
      );
    }

    return this.prisma.variantValue.delete({
      where: { id }
    });
  }
}