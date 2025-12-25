import { PrismaClient } from '@prisma/client';
import type {
  MyFacture,
  CreateMyFactureResponse,
  UpdateMyFactureResponse,
  DeleteMyFactureResponse,
  CreateMyFactureDto,
  UpdateMyFactureDto,
} from '../model/my-facture';

export async function createMyFacture(
  data: { entrepriseId: string; dto: CreateMyFactureDto },
  prisma: PrismaClient
): Promise<CreateMyFactureResponse|null> {
  try {
    const { entrepriseId, dto } = data;

    if (!entrepriseId || !dto) return null

    const {
      denomination,
      matriculeFiscale,
      banque,
      rib,
      logo,
      adresses,
      emails,
      telephones,
      mobiles,
    } = dto

    const myFacture = await prisma.myFacture.create({
      data: {
        denomination: denomination,
        matriculeFiscale: matriculeFiscale,
        banque: banque,
        rib: rib,
        logo: logo,
        entreprise: { connect: { id: entrepriseId } },
        adresses: {
          create: (adresses || []).map((adresse) => ({
            adresse,
            entreprise: { connect: { id: entrepriseId } },
          })),
        },
        emails: {
          create: (emails || []).map((email) => ({
            email,
            entreprise: { connect: { id: entrepriseId } },
          })),
        },
        telephones: {
          create: (telephones || []).map((numTel) => ({
            numTel,
            entreprise: { connect: { id: entrepriseId } },
          })),
        },
        mobiles: {
          create: (mobiles || []).map((numMobile) => ({
            numMobile,
            entreprise: { connect: { id: entrepriseId } },
          })),
        },
      },
      include: {
        adresses: true,
        emails: true,
        telephones: true,
        mobiles: true,
      },
    });

    return {
      message: 'MyFacture created successfully',
      myFacture:{...myFacture,
        logo:myFacture.logo as unknown as File,
        createdAt:myFacture.createdAt.toISOString(),
        updatedAt:myFacture.updatedAt.toISOString(),
        adresses:myFacture.adresses && myFacture.adresses.map(adresse=>({
            ...adresse,
            createdAt:adresse.createdAt.toISOString(),
            updatedAt:adresse.updatedAt.toISOString(),
        })),
        telephones:myFacture.telephones && myFacture.telephones.map(telephone=>({
            ...telephone,
            createdAt:telephone.createdAt.toISOString(),
            updatedAt:telephone.updatedAt.toISOString(),
        })) ,
        emails:myFacture.emails && myFacture.emails.map(email=>({
            ...email,
            createdAt:email.createdAt.toISOString(),
            updatedAt:email.updatedAt.toISOString(),
        })),
        mobiles:myFacture.mobiles && myFacture.mobiles.map(mobile=>({
            ...mobile,
            createdAt:mobile.createdAt.toISOString(),
            updatedAt:mobile.updatedAt.toISOString(),
        }))
      },
    };
  } catch (error) {
    console.error('service/myFacture createMyFacture: ', error);
    throw error;
  }
}

export async function getMyFacture(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<MyFacture|null> {
  try {
    const { entrepriseId } = data;

    if(!entrepriseId)return null
    const myFacture = await prisma.myFacture.findFirst({
      where: { entrepriseId },
      include: {
        adresses: true,
        emails: true,
        telephones: true,
        mobiles: true,
      },
    });

    if (!myFacture) {
      throw new Error('MyFacture not found');
    }

    return {...myFacture,
        createdAt:myFacture.createdAt.toISOString(),
        updatedAt:myFacture.updatedAt.toISOString(),
        logo:myFacture.logo as unknown as File,
        adresses:myFacture.adresses && myFacture.adresses.map(adresse=>({
            ...adresse,
            createdAt:adresse.createdAt.toISOString(),
            updatedAt:adresse.updatedAt.toISOString(),
        })),
        telephones:myFacture.telephones && myFacture.telephones.map(telephone=>({
            ...telephone,
            createdAt:telephone.createdAt.toISOString(),
            updatedAt:telephone.updatedAt.toISOString(),
        })) ,
        emails:myFacture.emails && myFacture.emails.map(email=>({
            ...email,
            createdAt:email.createdAt.toISOString(),
            updatedAt:email.updatedAt.toISOString(),
        })),
        mobiles:myFacture.mobiles && myFacture.mobiles.map(mobile=>({
            ...mobile,
            createdAt:mobile.createdAt.toISOString(),
            updatedAt:mobile.updatedAt.toISOString(),
        }))}
      
  } catch (error) {
    console.error('service/myFacture getMyFacture: ', error);
    throw error;
  }
}

export async function updateMyFacture(
  data: { entrepriseId: string; id: string; dto: UpdateMyFactureDto },
  prisma: PrismaClient
): Promise<UpdateMyFactureResponse|null> {
  try {
    const { entrepriseId, id, dto } = data;

    if(!dto || !entrepriseId || !id)return null
    const  {
      denomination,
      matriculeFiscale,
      banque,
      rib,
      logo,
      adresses,
      emails,
      telephones,
      mobiles
    } = dto

    const unique = (arr: string[]) => [...new Set(arr)];

const myFacture = await prisma.myFacture.update({
  where: { id },
  data: {
    denomination,
    matriculeFiscale,
    banque,
    rib,
    logo: logo ? (logo as any).path : null,
    adresses: adresses
      ? {
          deleteMany: {},
          create: unique(adresses).map((adresse) => ({
            adresse,
            entreprise: { connect: { id: entrepriseId } },
          })),
        }
      : undefined,
    emails: emails
      ? {
          deleteMany: {},
          create: unique(emails).map((email) => ({
            email,
            entreprise: { connect: { id: entrepriseId } },
          })),
        }
      : undefined,
    telephones: telephones
      ? {
          deleteMany: {},
          create: unique(telephones).map((numTel) => ({
            numTel,
            entreprise: { connect: { id: entrepriseId } },
          })),
        }
      : undefined,
    mobiles: mobiles
      ? {
          deleteMany: {},
          create: unique(mobiles).map((numMobile) => ({
            numMobile,
            entreprise: { connect: { id: entrepriseId } },
          })),
        }
      : undefined,
  },
  include: {
    adresses: true,
    emails: true,
    telephones: true,
    mobiles: true,
  },
});


    return {
      message: 'MyFacture updated successfully',
      myFacture:{...myFacture,
        logo:myFacture.logo as unknown as File,
        createdAt:myFacture.createdAt.toISOString(),
        updatedAt:myFacture.updatedAt.toISOString(),
        adresses:myFacture.adresses && myFacture.adresses.map(adresse=>({
            ...adresse,
            createdAt:adresse.createdAt.toISOString(),
            updatedAt:adresse.updatedAt.toISOString(),
        })),
        telephones:myFacture.telephones && myFacture.telephones.map(telephone=>({
            ...telephone,
            createdAt:telephone.createdAt.toISOString(),
            updatedAt:telephone.updatedAt.toISOString(),
        })) ,
        emails:myFacture.emails && myFacture.emails.map(email=>({
            ...email,
            createdAt:email.createdAt.toISOString(),
            updatedAt:email.updatedAt.toISOString(),
        })),
        mobiles:myFacture.mobiles && myFacture.mobiles.map(mobile=>({
            ...mobile,
            createdAt:mobile.createdAt.toISOString(),
            updatedAt:mobile.updatedAt.toISOString(),
        }))
      },
    };
  } catch (error) {
    console.error('service/myFacture updateMyFacture: ', error);
    throw error;
  }
}

export async function deleteMyFacture(
  data: { entrepriseId: string; id: string },
  prisma: PrismaClient
): Promise<DeleteMyFactureResponse> {
  try {
    const { entrepriseId, id } = data;

    await prisma.myFacture.delete({
      where: { id, entrepriseId },
    });

    return { message: 'MyFacture deleted successfully' };
  } catch (error) {
    console.error('service/myFacture deleteMyFacture: ', error);
    throw error;
  }
}

// export async function deleteMyFactureLogo(
//   data: { entrepriseId: string; id: string },
//   prisma: PrismaClient
// ): Promise<DeleteMyFactureLogoResponse> {
//   try {
//     const { entrepriseId, id } = data;

//     const myFacture = await prisma.myFacture.update({
//       where: { id, entrepriseId },
//       data: { logo: null },
//       include: {
//         adresses: true,
//         emails: true,
//         telephones: true,
//         mobiles: true,
//       },
//     });

//     return {
//       message: 'MyFacture logo deleted successfully',
//       myFacture,
//     };
//   } catch (error) {
//     console.error('service/myFacture deleteMyFactureLogo: ', error);
//     throw error;
//   }
// }

// export async function addAddress(
//   data: { entrepriseId: string; myFactureId: string; adresse: string },
//   prisma: PrismaClient
// ): Promise<AddAddressResponse> {
//   try {
//     const { entrepriseId, myFactureId, adresse } = data;

//     const address = await prisma.myFactureAdresse.create({
//       data: {
//         adresse,
//         myFacture: { connect: { id: myFactureId } },
//         entreprise: { connect: { id: entrepriseId } },
//       },
//     });

//     return {
//       message: 'Address added successfully',
//       address,
//     };
//   } catch (error) {
//     console.error('service/myFacture addAddress: ', error);
//     throw error;
//   }
// }

// export async function removeAddress(
//   data: { entrepriseId: string; myFactureId: string; addressId: string },
//   prisma: PrismaClient
// ): Promise<RemoveAddressResponse> {
//   try {
//     const { entrepriseId, myFactureId, addressId } = data;

//     await prisma.myFactureAdresse.delete({
//       where: { id: addressId, myFactureId, entrepriseId },
//     });

//     return { message: 'Address removed successfully' };
//   } catch (error) {
//     console.error('service/myFacture removeAddress: ', error);
//     throw error;
//   }
// }