//main/service/acc.ts

import { Acc, CreateAccDto,
      GetAccByProductResponse, SearchAccDto, 
      UpdateAccDto, UpdateAccResponse } from "../model/acc";
import { StockMouvementType } from "../model/stock-mouvement";
import { updateStockMouvement } from "./stock-mouvement";



export async function getAccByProductId(
  data:{
    entrepriseId: string,
  codeBarre: string,
  searchParams: SearchAccDto
  },
  prisma
): Promise<GetAccByProductResponse|null> {
    try {
        const {entrepriseId,
            codeBarre,
            searchParams
        } = data

        if(!codeBarre)return null
        const date :any= {} 
        if(searchParams && searchParams.startDate && searchParams.endDate){
            date.updatedAt = {
                gte: new Date(searchParams.startDate),
                lte: new Date(searchParams.endDate)
            }
        }
        
        const acc = await prisma.acc.findFirst({
            where:{
                OR:[
                    {entrepriseId:entrepriseId},
                    {codeBarre:codeBarre},
                    date
                ]
            },
            select:{
                quantite:true
            }
        })
        return acc && {totalQuantite:acc.quantite}
    } catch (error) {
        console.error("service/acc getAccProductId: ",error);
        return null
    }
}

export async function createAcc(
  data:{
    entrepriseId: string,
    dto: CreateAccDto
  },prisma
): Promise<Acc|null> {
    try {
        const {entrepriseId,dto} = data

        const {
        codeBarre,
        quantite,
        responsable,
        remarque,
        designation
        } = dto

        if(!dto)return null

        const createdAcc = await prisma.acc.create({
            data:{
                codeBarre,
                quantite,
                responsable,
                remarque,
                entreprise:{
                    connect:{
                        id:entrepriseId
                    }
                },
                designation:designation
            },
            include:{
                entreprise:true
            }
        })

        if(createdAcc){
            await updateStockMouvement({entrepriseId,dto:{
                      designation,codeBarre,stockInitial:0,stockSecurite:0,inventories:0,
                      acc:quantite,achats:0,ventes:0,operation:StockMouvementType.ACC
                    }},prisma)
        }
        return createdAcc
        
    } catch (error) {
        console.error("service/acc createAcc: ",error);
        return null
    }

}

export async function findAllAcc(
  data:{
    entrepriseId: string,
    searchParams: SearchAccDto
  },
  prisma
): Promise<Acc[]|null> {
    try {
        const {entrepriseId,searchParams} = data

        if(!entrepriseId)return null

        const {
            codeBare,
            responsable,
            endDate,
            startDate,
        } = searchParams

        
        const orConditions: any[] = [
            { entrepriseId: entrepriseId },
            ];

            if (codeBare) {
            orConditions.push({ codeBare });
            }

            if (responsable) {
            orConditions.push({
                responsable: {
                contains: responsable
                },
            });
            }

            if (startDate && endDate) {
            orConditions.push({
                createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
                },
            });
            }

            const accs = await prisma.acc.findMany({
            where: {
                OR: orConditions,
            },
            });

        return accs
    } catch (error) {
        console.error("service/acc findAllAcc: ",error);
        return null
    }
}

export async function findAccById(
  data:{
    entrepriseId: string,
    id: string
  },prisma
): Promise<Acc|null> {
    try {
        const {id} = data

        if(!id)return null

        const acc = await prisma.acc.findUnique({
            where:{
                id:id
            }
        })

        return acc
    } catch (error) {
        console.error("service/acc findAccById: ",error);
        return null
    }
}

export async function updateAccById(
  data:{
    entrepriseId: string,
    id: string,
    dto: UpdateAccDto
  },prisma
): Promise<UpdateAccResponse|null> {
    try {
        const {entrepriseId, id, dto} = data

        if(!dto || !id)return null

        const {quantite,
            responsable,
            remarque} = dto

        const updatedAcc = await prisma.acc.update({
            where:{
                id:id
            },
            data:{
                quantite:quantite,
                responsable:responsable,
                remarque:remarque
            }
        })
        if(updatedAcc){
             await updateStockMouvement({entrepriseId,dto:{
                      designation:updatedAcc.designation,codeBarre:updatedAcc.codeBarre,stockInitial:0,stockSecurite:0,
                      acc:quantite ? quantite : updatedAcc.quantite,achats:0,ventes:0,inventories:0,operation:StockMouvementType.ACC
                    }},prisma)
        }
        return {
            message:"Acc: "+String(id)+" updated successfully",
            acc:updatedAcc
        }
    } catch (error) {
        console.error("service/acc updateAccById: ",error);
        return null
    }
}

export async function getTotalAccMontantByDateRange(
  data: {
    entrepriseId: string;
    startDate: string;
    endDate: string;
  },
  prisma
): Promise<number> {
  try {
    console.log("🔍 Service: Getting total ACC montant for date range:", data);
    
    const { entrepriseId, startDate, endDate } = data;

    if (!entrepriseId) {
      console.warn("⚠️ No entrepriseId provided");
      return 0;
    }

    const whereClause: any = {
      entrepriseId: entrepriseId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    };

    console.log("📊 WHERE clause for ACC:", JSON.stringify(whereClause, null, 2));

    // 1. Récupérer tous les ACC
    const accidents = await prisma.acc.findMany({
      where: whereClause,
      select: {
        codeBarre: true,
        quantite: true,
        designation: true,
        createdAt: true,
      },
    });

    console.log("📋 Accidents trouvés:", accidents.length);

    if (accidents.length === 0) {
      console.log("ℹ️ Aucun accident trouvé pour cette période");
      return 0;
    }

    // 2. CORRECTION: Utiliser prisma.produit (modèle Produit dans votre schéma)
    const codeBarres = [...new Set(accidents.map(acc => acc.codeBarre))]; // Enlever les doublons
    console.log("📦 Code-barres uniques à rechercher:", codeBarres);

    // CORRECTION: prisma.produit (pas Product)
    const produits = await prisma.produit.findMany({
      where: {
        entrepriseId: entrepriseId,
        codeBarre: { in: codeBarres }
      },
      select: {
        id: true,
        codeBarre: true,
        designation: true,
        puht: true, // Attention: Decimal dans le schéma
      },
    });

    console.log("🛒 Produits trouvés:", produits.length);
    console.log("🛒 Détails produits:", JSON.stringify(produits, null, 2));

    // 3. Calculer le montant
    let totalMontant = 0;
    
    // Créer une map pour accéder rapidement aux produits
    const produitMap = new Map();
    produits.forEach(produit => {
      // Convertir Decimal en nombre
      const puht = produit.puht ? Number(produit.puht) : 0;
      produitMap.set(produit.codeBarre, { ...produit, puht });
    });

    console.log("💰 Calcul des montants:");
    accidents.forEach(acc => {
      const produit = produitMap.get(acc.codeBarre);
      if (produit && produit.puht) {
        const montant = acc.quantite * produit.puht;
        console.log(`  - ${acc.codeBarre} (${produit.designation}): ${acc.quantite} × ${produit.puht} = ${montant}`);
        totalMontant += montant;
      } else {
        console.log(`  ⚠️ Produit non trouvé pour codeBarre: ${acc.codeBarre}`);
      }
    });

    console.log("✅ Total ACC montant:", totalMontant);
    return totalMontant;
    
  } catch (error) {
    console.error("❌ service/acc getTotalAccMontantByDateRange error: ", error);
    console.error("Stack trace:", error.stack);
    return 0;
  }
}