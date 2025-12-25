import { Entree } from "../model/achat-fournisseur";
import { LatestPrice } from "../model/entree";


export async function getEntreesByAchatFournisseurId(
  data:{
    entrepriseId: string,
  achatFournisseurId: string
  },
  prisma
): Promise<Entree[]|null> {
    try {
        const {entrepriseId,achatFournisseurId} = data

        if(!entrepriseId || !achatFournisseurId)return null

        const entrees = await prisma.entree.findMany({
            where:{
                achatFournisseurId:achatFournisseurId,
                entrepriseId:entrepriseId
            }
        })
        return entrees?.map(entree=>(
            {
                ...entree,
                createdAt:entree.createdAt.toISOString(),
                updatedAt:entree.updatedAt.toISOString(),
                puht:Number(entree.puht),
                tva:Number(entree.tva),
                prixUnitaireTTC:Number(entree.prixUnitaireTTC),
                prixTotalTTC:Number(entree.prixTotalTTC)
            }))
    } catch (error) {
        console.error("service/entree getEntreesByAchatFournisseurId: ",error);
        return null
    }
}

export async function getLatestProductPrices(
    data:{
        entrepriseId: string
    },
    prisma
): Promise<LatestPrice[]|null>  {
   try {
    const {entrepriseId} = data

    if(!entrepriseId) return null

    const entrees = await prisma.entree.findMany({
        where:{
            entrepriseId
        },
        select:{
            codeBarre:true,
            designation:true,
            prixUnitaireTTC:true,
            createdAt:true
        }
    })
    return entrees && entrees.map(entree=>({
        ...entree,
        prixUnitaireTTC:Number(entree.prixUnitaireTTC),
        createdAt:entree.createdAt.toISOString()

    }))
   } catch (error) {
    console.error("service/entree getLatestProductPrices: ",error);
    return null
   } 
}