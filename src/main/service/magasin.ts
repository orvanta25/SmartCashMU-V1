import { CreateMagasinDto,CreateMagasinResponse } from "../model/magasin"
import { PrismaClient,UserRole } from "@prisma/client"
import { createUser } from "./user"


//this funcion is not complete 
export async function createMagasin(
  data: { dto: CreateMagasinDto },
  prisma: PrismaClient
): Promise<CreateMagasinResponse | null> {
  try {
    const { dto } = data
    const {
      nom,
      prenom,
      telephone,
      secteurActivite,
      region,
      denomination,
      ville,
      pays,
      password,
      confirmPassword,
    } = dto

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match")
    }

    

    //  Create user linked to magasin
    const user = await createUser(
      {
        nom,
        prenom,
        telephone,
        password: password, // password = pin
        role: UserRole.MAGASINIER
      },
      prisma
    )

    if (!user) {
      throw new Error("User creation failed")
    }

    //  Create magasin
     await prisma.magasin.create({
      data: {
        nom: denomination,
        secteurActivite,
        region,
        ville,
        pays,
        responsable: {
        connect: { id: user.id },
        },
    }
    })
    return null
      
  } catch (error) {
    console.error("service/magasin createMagasin:", error)
    return null
  }
}