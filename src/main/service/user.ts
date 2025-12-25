import { UserProfile,CreateUserData,CreateUserResponse, UpdateProfileDto } from "../model/user";
import { PrismaClient } from "@prisma/client";

export async function getUser(_,prisma,ses):Promise<UserProfile|null> {
   try {
    const id = ses.getUserAgent()
     const currentUser = await prisma.user.findFirst(
              {
                where:{
                  id:id
                },
                include:{
                  entreprise:{select:{
                    id: true,
                    nom: true,
                    email: true,
                    telephone: true,
                    denomination: true,
                    matriculeFiscale: true,
                    secteurActivite: true,
                    region: true,
                    ville: true,
                    pays: true,
                    hasRestaurantModule: true,
                    hasEpicerieModule: true,
                    type: true,
                    createdAt: true,
                    updatedAt: true,
                  }}
                }
              }  
            )
    return currentUser
   } catch (error) {
    console.error("service/user getUser",error);
    return null
   }
}
export async function createUser(
  data: CreateUserData,
  prisma: PrismaClient
): Promise<CreateUserResponse | null> {
  try {
    const {
      nom,
      prenom,
      telephone,
      password,
      role


    } = data
    const user = await prisma.user.create({
      data: {
        nom,
        prenom,
        telephone,
        pin: password, 
        role:role,
        isActive: true
      }
    ,
      select:{
        id:true,
        nom:true,
        prenom:true,
        telephone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return {
      ...user,
      email:"",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error("service/user createUser:", error)
    return null
  }
}
export async function updateUserProfile(
  data:{dto: UpdateProfileDto},
  prisma
): Promise<{
  user: UserProfile;
  entreprise: UserProfile['entreprise'];
  logoutRequired: boolean;
}|null> {
  try {
    const {dto} = data

    if(!dto) return null

    const {
      prenom,
      nom,
      email,
      telephone,
      denomination,
      matriculeFiscale,
      secteurActivite,
      region,
      ville,
      pays,
      codePin,
    } =dto
   
    const user = await prisma.user.update({
      where:{
        id:dto.id
      },
      data:{
        prenom,
        nom,
        email,
        telephone,
        pin:codePin,
      },
      include:{
                  entreprise:{select:{
                    id: true,
                    nom: true,
                    email: true,
                    telephone: true,
                    denomination: true,
                    matriculeFiscale: true,
                    secteurActivite: true,
                    region: true,
                    ville: true,
                    pays: true,
                    hasRestaurantModule: true,
                    hasEpicerieModule: true,
                    type: true,
                    createdAt: true,
                    updatedAt: true,
                  }}
                }

    })
     const entreprise = await prisma.entreprise.update({
      where:{
        id:user.entreprise.id
      },
      data:{
        pays,
        ville,
        denomination,
        region,
        matriculeFiscale,
        secteurActivite
      }
    })

    return {
      user:user,
      entreprise:entreprise,
      logoutRequired:false
    }
  } catch (error) {
    console.error("service/user updateUserProfile: ",error);
    return null
  }
}