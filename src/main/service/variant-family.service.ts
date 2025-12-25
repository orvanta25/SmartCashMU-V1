// src/service/variant-family.service.ts
import { PrismaClient } from '@prisma/client';
import { 
  IVariantFamilyCreate, 
  IVariantFamilyUpdate 
} from '../model/variant-family';

export class VariantFamilyService {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.variantFamily.findMany({
      include: { values: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
  }

  async findById(id: number) {
    return this.prisma.variantFamily.findUnique({
      where: { id },
      include: { values: true }
    });
  }

 async create(data: IVariantFamilyCreate & { valueIds?: number[] }) {
  return this.prisma.variantFamily.create({
    data: {
      name: data.name,
      description: data.description,
      code: data.code,
      isRequired: data.isRequired || false,
      sortOrder: data.sortOrder || 0,
      values: data.valueIds
        ? {
            connect: data.valueIds.map(id => ({ id }))
          }
        : undefined
    },
    include: { values: true }
  });
}


async update(id: number, data: IVariantFamilyUpdate & { valueIds?: number[] }) {
  const { valueIds, ...familyData } = data;

  return this.prisma.variantFamily.update({
    where: { id },
    data: {
      ...familyData,
      values: valueIds
        ? {
            set: valueIds.map(id => ({ id }))
          }
        : undefined
    },
    include: { values: true }
  });
}



 async delete(id: number) {
  return this.prisma.variantFamily.delete({
    where: { id }
  });
}

}