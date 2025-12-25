import { InventoryForm, InventoryItem, SearchFilters, UpdateInventory } from "../model/inventaire";
import { StockMouvementType } from "../model/stock-mouvement";
import { updateStockMouvement } from "./stock-mouvement";

export async function getAllInventory(
    data:{
        entrepriseId:string, 
        dto:SearchFilters
    },
    prisma
):Promise<InventoryItem[]|null> {
   try {
    const {entrepriseId,dto} = data

    if(!entrepriseId || !dto)return null

    const { searchQuery, dateDebut, dateFin } = dto;

const searchDto: any[] = [
  { entrepriseId: entrepriseId }
];

if (searchQuery) {
  searchDto.push(
    { codeBarre:    { contains: searchQuery } }, // string
    { designation:  { contains: searchQuery } }, // string
    { responsable:  { contains: searchQuery } }  // string
  );

  // If quantite is Int, try parsing the searchQuery to number
  const parsed = Number(searchQuery);
  if (!isNaN(parsed)) {
    searchDto.push({ quantite: parsed });
  }
}

if (dateDebut && dateFin) {
  searchDto.push({
    createdAt: {
      gte: new Date(dateDebut),
      lte: new Date(dateFin),
    },
  });
}

const inventaires = await prisma.inventaire.findMany({
  where: {
    OR: searchDto,
  },
});

    const convertedInventaires = inventaires.length >0 ?

        inventaires.map(inventaire=>({
            ...inventaire,
            createdAt:inventaire.createdAt.toISOString(),
            updatedAt:inventaire.updatedAt.toISOString()
        }))
    :null
        return convertedInventaires
   } catch (error) {
    console.error("service/inventaire getAllInventory: ",error);
    return null
   } 
}

export async function createInventory(
    data:{
        entrepriseId:string,
        dto:InventoryForm
    },
    prisma
):Promise<InventoryItem | null>{
    try {
        const {entrepriseId,dto} = data

        if(!entrepriseId || !dto)return null

        const {
            responsable,
            codeBarre,
            designation,
            quantity
        } = dto


        const createdInventaire = await prisma.inventaire.create({
            data:{
                responsable:responsable,
                codeBarre:codeBarre,
                designation:designation,
                quantite:quantity,
                entreprise:{
                    connect:{id:entrepriseId}
                }
            }
        })
        if(createdInventaire){
             await updateStockMouvement({entrepriseId,dto:{
                                        designation:designation || "",codeBarre:codeBarre || "",stockInitial:0,stockSecurite:0,
                                        acc:0,achats:0,ventes:0,inventories:quantity,operation:StockMouvementType.INVENTAIRE
                                      }},prisma)
        }
        return createdInventaire
    } catch (error) {
        console.error("service/inventaire getInventory: ",error);
        return null
    }
}

export async function updateInventorById(
    data:{
        entrepriseId:string, 
        id:string,
        dto:UpdateInventory
    },
    prisma
):Promise<InventoryItem|null>{
    try {
        const {entrepriseId, id, dto} = data

        if(!entrepriseId || !id ||!dto)return null

        const {responsable,quantite} = dto

        const updatedTnventory = await prisma.inventaire.update({
            where:{
                id:id
            },
            data:{
                responsable:responsable,
                quantite:quantite
            }
        })
        if(updatedTnventory){
            await updateStockMouvement({entrepriseId,dto:{
                                        designation:updatedTnventory.designation || "",codeBarre:updatedTnventory.codeBarre || "",stockInitial:0,stockSecurite:0,
                                        acc:0,achats:0,ventes:0,inventories:quantite,operation:StockMouvementType.INVENTAIRE
                                      }},prisma)
        }
        return updatedTnventory

    } catch (error) {
        console.error("service/inventaire updateInventoryById: ",error);
        return null
    }
}