
import { PrismaClient } from '@prisma/client';
import type {
  Facture,
  FactureResponse,
  CreateFactureDto,
  SearchFactureDto,
  VenteFactureResponse,
  NextNumResponse,
  FactureType,
} from '../model/facture';
export async function createFacture(
    data:{
        dto: CreateFactureDto, 
        entrepriseId: string
    },
    prisma
): Promise<FactureResponse|null> {

    try {
      const {entrepriseId,dto} = data
    
    if(!entrepriseId || !dto)return null
  // 1. Fetch product details for each vente
  const ventesData = await Promise.all(
    dto.ventes.map(async (vente) => {
      const produit = await prisma.produit.findUnique({
        where: { codeBarre: vente.codeBarre },
      });

      if (!produit) {
        throw new Error(`Produit with codeBarre ${vente.codeBarre} not found`);
      }

      const totalHT = produit.puht * vente.quantite;
      const remise = produit.remise ?? 0;
      const tva = produit.tva ?? 0;
      const totalTTC = totalHT + (totalHT * tva) / 100 - remise;

      return {
        codeBarre: vente.codeBarre,
        designation: produit.designation,
        puht: produit.puht,
        tva,
        remise,
        quantite: vente.quantite,
        totalHT,
        totalTTC,
        entrepriseId,
      };
    })
  );

  // 2. Create facture with ventesFactures
  const createdFacture = await prisma.facture.create({
    data: {
      type: dto.type,
      num: dto.num,
      dateEmission: new Date(dto.dateEmission),
      dateEcheance: new Date(dto.dateEcheance),
      denominationClient: dto.denominationClient,
      matriculeFiscaleClient: dto.matriculeFiscaleClient,
      adresseClient: dto.adresseClient,
      clientTelephone: dto.clientTelephone,
      totalHT: dto.totalHT,
      totalTVA: dto.totalTVA,
      timbreFiscal: dto.timbreFiscal,
      remise: dto.remise ?? 0,
      totalNet: dto.totalNet,
      denomination: dto.denomination,
      matriculeFiscale: dto.matriculeFiscale,
      banque: dto.banque,
      rib: dto.rib,
      logo: dto.logo,
      entreprise:{connect:{ id: entrepriseId }},

      ventesFactures: {
        create: ventesData,
      },
    },
    include: {
      ventesFactures: true,
    },
  });

  return {
    facture:createdFacture && {
      ...createdFacture,
      dateEmission:createdFacture.dateEmission.toISOString(),
      dateEcheance:createdFacture.dateEcheance.toISOString(),
      totalHT:Number(createdFacture.totalHT),
      totalTVA:Number(createdFacture.totalTVA),
      timbreFiscal:Number(createdFacture.timbreFiscal),
      remise:Number(createdFacture.remise),
      totalNet:Number(createdFacture.totalNet),
      ventesFactures:createdFacture?.ventesFactures ?
        createdFacture.ventesFactures.map(ventesFacture=>(
          {
            ...ventesFacture,
            puht:Number(ventesFacture.puht),
            tva:Number(ventesFacture.tva),
            remise:Number(ventesFacture.remise),
            totalHT:Number(ventesFacture.totalHT),
            totalTTC:Number(ventesFacture.totalTTC)
          }
        ))
       : []
    },message:createdFacture ?"facture created":"impossible de creer facture"
  }
    } catch (error) {
      console.error("service/facture createFacture: ",error);
      return null
    }
}


export async function getFactures(
  data: { entrepriseId: string; params?: SearchFactureDto },
  prisma: PrismaClient
): Promise<Facture[]> {
  try {
    const { entrepriseId, params } = data;

    const factures =  await prisma.facture.findMany({
      where: {
        entrepriseId,
        denominationClient: params?.denominationClient ? { contains: params.denominationClient } : undefined,
        type: params?.type,
        num: params?.num ? { contains: params.num } : undefined,
        dateEmission: {
          gte: params?.dateDebut ? new Date(params.dateDebut) : undefined,
          lte: params?.dateFin ? new Date(params.dateFin) : undefined,
        },
        dateEcheance: {
          gte: params?.dateEcheanceDebut ? new Date(params.dateEcheanceDebut) : undefined,
          lte: params?.dateEcheanceFin ? new Date(params.dateEcheanceFin) : undefined,
        },
      },
      include: { ventesFactures: true },
    });

    return factures && factures.map(facture=>(
      {
      ...facture,
      dateEmission:facture.dateEmission.toISOString(),
      dateEcheance:facture.dateEcheance.toISOString(),
      totalHT:Number(facture.totalHT),
      totalTVA:Number(facture.totalTVA),
      timbreFiscal:Number(facture.timbreFiscal),
      remise:Number(facture.remise),
      totalNet:Number(facture.totalNet),
      ventesFactures:facture?.ventesFactures ?
        facture.ventesFactures.map(ventesFacture=>(
          {
            ...ventesFacture,
            puht:Number(ventesFacture.puht),
            tva:Number(ventesFacture.tva),
            remise:Number(ventesFacture.remise),
            totalHT:Number(ventesFacture.totalHT),
            totalTTC:Number(ventesFacture.totalTTC)
          }
        ))
       : []
    }
    )) 
  } catch (error) {
    console.error('service/facture getFactures: ', error);
    throw error;
  }
}

export async function getFacturesByType(
  data: { entrepriseId: string; type: FactureType },
  prisma: PrismaClient
): Promise<Facture[]> {
  try {
    const { entrepriseId, type } = data;

    const factures = await prisma.facture.findMany({
      where: { entrepriseId, type },
      include: { ventesFactures: true },
    });

    return factures && factures.map(facture=>(
      {
      ...facture,
      dateEmission:facture.dateEmission.toISOString(),
      dateEcheance:facture.dateEcheance.toISOString(),
      totalHT:Number(facture.totalHT),
      totalTVA:Number(facture.totalTVA),
      timbreFiscal:Number(facture.timbreFiscal),
      remise:Number(facture.remise),
      totalNet:Number(facture.totalNet),
      ventesFactures:facture?.ventesFactures ?
        facture.ventesFactures.map(ventesFacture=>(
          {
            ...ventesFacture,
            puht:Number(ventesFacture.puht),
            tva:Number(ventesFacture.tva),
            remise:Number(ventesFacture.remise),
            totalHT:Number(ventesFacture.totalHT),
            totalTTC:Number(ventesFacture.totalTTC)
          }
        ))
       : []
    }
    )) 
  } catch (error) {
    console.error('service/facture getFacturesByType: ', error);
    throw error;
  }
}

export async function getFactureById(
  data: { entrepriseId: string; id: string },
  prisma: PrismaClient
): Promise<FactureResponse> {
  try {
    const { entrepriseId, id } = data;

    const facture = await prisma.facture.findFirst({
      where: { id, entrepriseId },
      include: { ventesFactures: true },
    });

    if (!facture) {
      throw new Error('Facture not found');
    }

    const fixedFacture = {
      ...facture,
      dateEmission:facture.dateEmission.toISOString(),
      dateEcheance:facture.dateEcheance.toISOString(),
      totalHT:Number(facture.totalHT),
      totalTVA:Number(facture.totalTVA),
      timbreFiscal:Number(facture.timbreFiscal),
      remise:Number(facture.remise),
      totalNet:Number(facture.totalNet),
      ventesFactures:facture?.ventesFactures ?
        facture.ventesFactures.map(ventesFacture=>(
          {
            ...ventesFacture,
            puht:Number(ventesFacture.puht),
            tva:Number(ventesFacture.tva),
            remise:Number(ventesFacture.remise),
            totalHT:Number(ventesFacture.totalHT),
            totalTTC:Number(ventesFacture.totalTTC)
          }
        ))
       : []
    }

    return {
      message: 'Facture retrieved successfully',
      facture:fixedFacture

    };
  } catch (error) {
    console.error('service/facture getFactureById: ', error);
    throw error;
  }
}

export async function getVentesByFactureId(
  data: { entrepriseId: string; factureId: string },
  prisma: PrismaClient
): Promise<VenteFactureResponse[]> {
  try {
    const { entrepriseId, factureId } = data;

    const ventes = await prisma.ventesFacture.findMany({
      where: { entrepriseId, factureId },
      select: {
        codeBarre: true,
        designation: true,
        puht: true,
        tva: true,
        quantite: true,
        totalHT: true,
        totalTTC: true,
      },
    });

    return ventes.map((vente) => ({
      codeBarre: vente.codeBarre,
      designation: vente.designation,
      puht: Number(vente.puht),
      tva: Number(vente.tva),
      puttc: Number(vente.puht) * (1 + Number(vente.tva) / 100),
      quantite: Number(vente.quantite),
      totalHT: Number(vente.totalHT),
    }));
  } catch (error) {
    console.error('service/facture getVentesByFactureId: ', error);
    throw error;
  }
}

// export async function updateFacture(
//   data: { entrepriseId: string; id: string; dto: UpdateFactureDto },
//   prisma: PrismaClient
// ): Promise<FactureResponse> {
//   try {
//     const { entrepriseId, id, dto } = data;

//     const facture = await prisma.facture.update({
//       where: { id },
//       data: {
//         type: dto.type,
//         num: dto.num,
//         dateEmission: dto.dateEmission ? new Date(dto.dateEmission) : undefined,
//         dateEcheance: dto.dateEcheance ? new Date(dto.dateEcheance) : undefined,
//         denominationClient: dto.denominationClient,
//         matriculeFiscaleClient: dto.matriculeFiscaleClient,
//         adresseClient: dto.adresseClient,
//         clientTelephone: dto.clientTelephone,
//         totalHT: dto.totalHT,
//         totalTVA: dto.totalTVA,
//         timbreFiscal: dto.timbreFiscal,
//         remise: dto.remise,
//         totalNet: dto.totalNet,
//         denomination: dto.denomination,
//         matriculeFiscale: dto.matriculeFiscale,
//         banque: dto.banque,
//         rib: dto.rib,
//         logo: dto.logo,
//         ventesFactures: dto.ventes
//           ? {
//               deleteMany: { factureId: id },
//               create: dto.ventes.map((vente) => ({
//                 codeBarre: vente.codeBarre,
//                 designation: vente.codeBarre, // Assuming designation can be derived or provided
//                 puht: vente.puht ?? 0,
//                 tva: vente.tva ?? 0,
//                 remise: vente.remise ?? 0,
//                 quantite: vente.quantite,
//                 totalHT: vente.puht * vente.quantite,
//                 totalTTC: vente.puht * vente.quantite * (1 + (vente.tva ?? 0) / 100),
//                 entreprise: { connect: { id: entrepriseId } },
//               })),
//             }
//           : undefined,
//       },
//       include: { ventesFactures: true },
//     });
    
//     const fixedFacture = {
//       ...facture,
//       dateEmission:facture.dateEmission.toISOString(),
//       dateEcheance:facture.dateEcheance.toISOString(),
//       totalHT:Number(facture.totalHT),
//       totalTVA:Number(facture.totalTVA),
//       timbreFiscal:Number(facture.timbreFiscal),
//       remise:Number(facture.remise),
//       totalNet:Number(facture.totalNet),
//       ventesFactures:facture?.ventesFactures ?
//         facture.ventesFactures.map(ventesFacture=>(
//           {
//             ...ventesFacture,
//             puht:Number(ventesFacture.puht),
//             tva:Number(ventesFacture.tva),
//             remise:Number(ventesFacture.remise),
//             totalHT:Number(ventesFacture.totalHT),
//             totalTTC:Number(ventesFacture.totalTTC)
//           }
//         ))
//        : []
//     }
//     return {
//       message: 'Facture updated successfully',
//       facture:fixedFacture,
//     };
//   } catch (error) {
//     console.error('service/facture updateFacture: ', error);
//     throw error;
//   }
// }

export async function deleteFacture(
  data: { entrepriseId: string; id: string },
  prisma: PrismaClient
): Promise<{ message: string }> {
  try {
    const { entrepriseId, id } = data;

    await prisma.facture.delete({
      where: { id, entrepriseId },
    });

    return { message: 'Facture deleted successfully' };
  } catch (error) {
    console.error('service/facture deleteFacture: ', error);
    throw error;
  }
}

export async function getNextFactureNum(
  data: { type: FactureType },
  prisma: PrismaClient
): Promise<NextNumResponse> {
  try {
    const { type } = data;

    const lastFacture = await prisma.facture.findFirst({
      where: { type },
      orderBy: { num: 'desc' },
      select: { num: true },
    });

    let nextNum = `${type}-001`;
    if (lastFacture) {
      const lastNum = parseInt(lastFacture.num.split('-')[1] || '0', 10);
      nextNum = `${type}-${(lastNum + 1).toString().padStart(3, '0')}`;
    }

    return { num: nextNum };
  } catch (error) {
    console.error('service/facture getNextFactureNum: ', error);
    throw error;
  }
}

// export async function createFacture(
//   data: { entrepriseId: string; dto: CreateFactureDto },
//   prisma: PrismaClient
// ): Promise<FactureResponse> {
//   try {
//     const { entrepriseId, dto } = data;

//     if (!entrepriseId || !dto) {
//       throw new Error('Missing required parameters: entrepriseId or dto');
//     }

//     const {
//       type,
//       num,
//       dateEmission,
//       dateEcheance,
//       denominationClient,
//       matriculeFiscaleClient,
//       adresseClient,
//       clientTelephone,
//       totalHT,
//       totalTVA,
//       timbreFiscal,
//       remise,
//       totalNet,
//       denomination,
//       matriculeFiscale,
//       banque,
//       rib,
//       logo,
//       ventes,
//     } = dto;

//     const facture = await prisma.facture.create({
//       data: {
//         type,
//         num,
//         dateEmission: new Date(dateEmission),
//         dateEcheance: new Date(dateEcheance),
//         denominationClient,
//         matriculeFiscaleClient,
//         adresseClient,
//         clientTelephone,
//         totalHT,
//         totalTVA,
//         timbreFiscal,
//         remise,
//         totalNet,
//         denomination,
//         matriculeFiscale,
//         banque,
//         rib,
//         logo,
//         entreprise: { connect: { id: entrepriseId } },
//         ventesFactures: {
//           create: ventes.map((vente) => ({
//             codeBarre: vente.codeBarre,
//             designation: vente.codeBarre, // Assuming designation can be derived or provided
//             puht: vente.puht ?? 0,
//             tva: vente.tva ?? 0,
//             remise: vente.remise ?? 0,
//             quantite: vente.quantite,
//             totalHT: vente.puht * vente.quantite,
//             totalTTC: vente.puht * vente.quantite * (1 + (vente.tva ?? 0) / 100),
//             entreprise: { connect: { id: entrepriseId } },
//           })),
//         },
//       },
//       include: { ventesFactures: true },
//     });

//     return {
//       message: 'Facture created successfully',
//       facture,
//     };
//   } catch (error) {
//     console.error('service/facture createFacture: ', error);
//     throw error;
//   }
// }