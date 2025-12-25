import { PrismaClient } from '@prisma/client';
import type {
  Entreprise,
  UpdateEntrepriseDto,
  UpdateEpicerieModuleDto,
  UpdateTypeDto,
} from '../model/entreprise';

export async function getEntreprise(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<Entreprise> {
  try {
    const { entrepriseId } = data;

    const entreprise = await prisma.entreprise.findUnique({
      where: { id: entrepriseId },
    });

    if (!entreprise) {
      throw new Error('Entreprise not found');
    }

    return {
      id: entreprise.id,
      nom: entreprise.nom ?? '',
      email: entreprise.email ?? '',
      telephone: entreprise.telephone ?? '',
      denomination: entreprise.denomination ?? undefined,
      matriculeFiscale: entreprise.matriculeFiscale ?? undefined,
      secteurActivite: entreprise.secteurActivite ?? '',
      region: entreprise.region ?? '',
      ville: entreprise.ville ?? '',
      pays: entreprise.pays ?? '',
      hasRestaurantModule: entreprise.hasRestaurantModule,
      hasEpicerieModule: entreprise.hasEpicerieModule,
      type: entreprise.type,
      createdAt: entreprise.createdAt.toISOString(),
      updatedAt: entreprise.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('service/entreprise getEntreprise: ', error);
    throw error;
  }
}

export async function updateEntreprise(
  data: { dto: UpdateEntrepriseDto; entrepriseId: string },
  prisma: PrismaClient
): Promise<Entreprise> {
  try {
    const { dto, entrepriseId } = data;

    const entreprise = await prisma.entreprise.update({
      where: { id: entrepriseId },
      data: {
        nom: dto.nom,
        email: dto.email,
        telephone: dto.telephone,
        denomination: dto.denomination,
        matriculeFiscale: dto.matriculeFiscale,
        secteurActivite: dto.secteurActivite,
        region: dto.region,
        ville: dto.ville,
        pays: dto.pays,
      },
    });

    return {
      id: entreprise.id,
      nom: entreprise.nom ?? '',
      email: entreprise.email ?? '',
      telephone: entreprise.telephone ?? '',
      denomination: entreprise.denomination ?? undefined,
      matriculeFiscale: entreprise.matriculeFiscale ?? undefined,
      secteurActivite: entreprise.secteurActivite ?? '',
      region: entreprise.region ?? '',
      ville: entreprise.ville ?? '',
      pays: entreprise.pays ?? '',
      hasRestaurantModule: entreprise.hasRestaurantModule,
      hasEpicerieModule: entreprise.hasEpicerieModule,
      type: entreprise.type,
      createdAt: entreprise.createdAt.toISOString(),
      updatedAt: entreprise.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('service/entreprise updateEntreprise: ', error);
    throw error;
  }
}

export async function updateEpicerieModule(
  data: { dto: UpdateEpicerieModuleDto; entrepriseId: string },
  prisma: PrismaClient
): Promise<Entreprise> {
  try {
    const { dto, entrepriseId } = data;

    const entreprise = await prisma.entreprise.update({
      where: { id: entrepriseId },
      data: {
        hasEpicerieModule: dto.hasEpicerieModule,
      },
    });

    return {
      id: entreprise.id,
      nom: entreprise.nom ?? '',
      email: entreprise.email ?? '',
      telephone: entreprise.telephone ?? '',
      denomination: entreprise.denomination ?? undefined,
      matriculeFiscale: entreprise.matriculeFiscale ?? undefined,
      secteurActivite: entreprise.secteurActivite ?? '',
      region: entreprise.region ?? '',
      ville: entreprise.ville ?? '',
      pays: entreprise.pays ?? '',
      hasRestaurantModule: entreprise.hasRestaurantModule,
      hasEpicerieModule: entreprise.hasEpicerieModule,
      type: entreprise.type,
      createdAt: entreprise.createdAt.toISOString(),
      updatedAt: entreprise.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('service/entreprise updateEpicerieModule: ', error);
    throw error;
  }
}

export async function updateEntrepriseType(
  data: { dto: UpdateTypeDto; entrepriseId: string },
  prisma: PrismaClient
): Promise<Entreprise | null> {
  try {
    const { dto, entrepriseId } = data;

    const entreprise = await prisma.entreprise.update({
      where: { id: entrepriseId },
      data: {
        type: dto.type,
      },
    });

    return {
      id: entreprise.id,
      nom: entreprise.nom ?? '',
      email: entreprise.email ?? '',
      telephone: entreprise.telephone ?? '',
      denomination: entreprise.denomination ?? undefined,
      matriculeFiscale: entreprise.matriculeFiscale ?? undefined,
      secteurActivite: entreprise.secteurActivite ?? '',
      region: entreprise.region ?? '',
      ville: entreprise.ville ?? '',
      pays: entreprise.pays ?? '',
      hasRestaurantModule: entreprise.hasRestaurantModule,
      hasEpicerieModule: entreprise.hasEpicerieModule,
      type: entreprise.type,
      createdAt: entreprise.createdAt.toISOString(),
      updatedAt: entreprise.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('service/entreprise updateEntrepriseType: ', error);
    throw error;
  }
}