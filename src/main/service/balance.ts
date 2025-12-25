import { PrismaClient } from '@prisma/client';
import type {
  BalanceConfig,
  CreateBalanceConfigDto,
  UpdateBalanceConfigDto,
  CreateBalanceConfigResponse,
  UpdateBalanceConfigResponse,
  DeleteBalanceConfigResponse,
} from '../model/balance';

export async function createBalanceConfig(
  data: { entrepriseId: string; dto: CreateBalanceConfigDto },
  prisma: PrismaClient
): Promise<CreateBalanceConfigResponse> {
  try {
    const { entrepriseId, dto } = data;

    if (!entrepriseId || !dto) {
      throw new Error('Missing required parameters: entrepriseId or dto');
    }

    const { barcodeLength, balanceCode, productCodeStart, productCodeLength, priceStart, priceLength, sellerStart, sellerLength } = dto;

    const balanceConfig = await prisma.balanceConfig.create({
      data: {
        barcodeLength,
        balanceCode,
        productCodeStart,
        productCodeLength,
        priceStart,
        priceLength,
        sellerStart: sellerStart ?? null,
        sellerLength: sellerLength ?? null,
        entreprise: { connect: { id: entrepriseId } },
      },
    });

    return {
      message: 'Balance config created successfully',
      balanceConfig:{...balanceConfig,
        createdAt:balanceConfig.createdAt.toISOString(),
        updatedAt:balanceConfig.updatedAt.toISOString()
      }
    };
  } catch (error) {
    console.error('service/balance createBalanceConfig: ', error);
    throw error;
  }
}

export async function getAllBalanceConfigs(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<BalanceConfig[]> {
  try {
    const { entrepriseId } = data;

    const balanceConfigs =  await prisma.balanceConfig.findMany({
      where: { entrepriseId },
    });
    return balanceConfigs && balanceConfigs.map(balanceConfig=>({
        ...balanceConfig,
        createdAt:balanceConfig.createdAt.toISOString(),
        updatedAt:balanceConfig.updatedAt.toISOString()
      }))
  } catch (error) {
    console.error('service/balance getAllBalanceConfigs: ', error);
    throw error;
  }
}

export async function getBalanceConfigByCode(
  data: { entrepriseId: string; balanceCode:string },
  prisma: PrismaClient
): Promise<BalanceConfig[]> {
  try {
    const { entrepriseId, balanceCode } = data;

    const balanceConfigs = await prisma.balanceConfig.findMany({
      where: { 
        balanceCode:{
        contains:balanceCode
      }, 
      entrepriseId },
    });

    if (!balanceConfigs) {
      throw new Error('Balance configs not found');
    }

    return balanceConfigs.map(balanceConfig=>({...balanceConfig,
        createdAt:balanceConfig.createdAt.toISOString(),
        updatedAt:balanceConfig.updatedAt.toISOString()
      }))
  } catch (error) {
    console.error('service/balance getBalanceConfigByCode: ', error);
    throw error;
  }
}

export async function getBalanceConfigById(
  data: { entrepriseId: string; id: number },
  prisma: PrismaClient
): Promise<BalanceConfig> {
  try {
    const { entrepriseId, id } = data;

    const balanceConfig = await prisma.balanceConfig.findFirst({
      where: { id, entrepriseId },
    });

    if (!balanceConfig) {
      throw new Error('Balance config not found');
    }

    return {...balanceConfig,
        createdAt:balanceConfig.createdAt.toISOString(),
        updatedAt:balanceConfig.updatedAt.toISOString()
      };
  } catch (error) {
    console.error('service/balance getBalanceConfigById: ', error);
    throw error;
  }
}

export async function updateBalanceConfig(
  data: { entrepriseId: string; id: number; dto: UpdateBalanceConfigDto },
  prisma: PrismaClient
): Promise<UpdateBalanceConfigResponse> {
  try {
    const { entrepriseId, id, dto } = data;

    const balanceConfig = await prisma.balanceConfig.update({
      where: { id, entrepriseId },
      data: {
        barcodeLength: dto.barcodeLength,
        balanceCode: dto.balanceCode,
        productCodeStart: dto.productCodeStart,
        productCodeLength: dto.productCodeLength,
        priceStart: dto.priceStart,
        priceLength: dto.priceLength,
        sellerStart: dto.sellerStart ?? undefined,
        sellerLength: dto.sellerLength ?? undefined,
      },
    });

    return {
      message: 'Balance config updated successfully',
      balanceConfig:{...balanceConfig,
        createdAt:balanceConfig.createdAt.toISOString(),
        updatedAt:balanceConfig.updatedAt.toISOString()
      },
    };
  } catch (error) {
    console.error('service/balance updateBalanceConfig: ', error);
    throw error;
  }
}

export async function deleteBalanceConfig(
  data: { entrepriseId: string; id: number },
  prisma: PrismaClient
): Promise<DeleteBalanceConfigResponse> {
  try {
    const { entrepriseId, id } = data;

    await prisma.balanceConfig.delete({
      where: { id, entrepriseId },
    });

    return { message: 'Balance config deleted successfully' };
  } catch (error) {
    console.error('service/balance deleteBalanceConfig: ', error);
    throw error;
  }
}