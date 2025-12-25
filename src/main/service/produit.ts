import { Prisma } from "@prisma/client"
import { PaginatedResponse, Product, ProductForList, ProductFormData, ProductForPos, ProductType, UpdateProductFormData } from "../model/produit"
import { deleteStockMouvement, updateStockMouvement } from "./stock-mouvement";
import { StockMouvementType } from "../model/stock-mouvement";


export async function createProduct(
    data:{
        entrepriseId: string,
         formData: ProductFormData
    },
    prisma
):Promise<Product|null> {
    try {

        const { entrepriseId, formData } = data;

        if (!entrepriseId) return null;

        const {
        designation,
        categorieId,
        puht,
        codeBarre,
        tva,
        remise,
        dateDebutRemise,
        dateFinRemise,
        active,
        type,
        // stockInitial = 0,
        stockSecurite,
        image,
        featuredOnPos,
        bulkSales,
        } = formData;

        const CondionnedCodeBarre = type === ProductType.POS ? "POS-"+designation : codeBarre

        const produit = await prisma.produit.create({
        data: {
            codeBarre:CondionnedCodeBarre,
            designation,
            type,
            categorie: {
            connect: { id: categorieId },
            },
            entreprise: {
            connect: { id: entrepriseId },
            },
            puht: new Prisma.Decimal(puht),
            tva: new Prisma.Decimal(tva),
            remise: new Prisma.Decimal(remise),
            stockInitial:0,
            stockSecurite: stockSecurite ?? undefined, // optional
            imagePath: image || "",
            active,
            dateDebutRemise: dateDebutRemise ? new Date(dateDebutRemise) : undefined,
            dateFinRemise: dateFinRemise ? new Date(dateFinRemise) : undefined,
            featuredOnPos,

            // ✅ create Lots from bulkSales
            Lot: {
            create: bulkSales.map((sale) => ({
                quantite: sale.quantity,
                price: new Prisma.Decimal(sale.price),
            })),
            },
        },
        include: {
            Lot: true, // return produit with its lots
        },
        });
        
        const createdStock = await updateStockMouvement({entrepriseId,dto:{
          designation,codeBarre:CondionnedCodeBarre,stockInitial:type === ProductType.POS ? 100000000 : 0,stockSecurite:stockSecurite||0,
          acc:0,achats:0,ventes:0,inventories:0,operation:StockMouvementType.CREATE,productType:type
        }},prisma)

        return {
            ...produit,
            puht: Number(produit.puht),
            tva: Number(produit.tva),
            remise: Number(produit.remise),
            dateDebutRemise: produit.dateDebutRemise
                ? produit.dateDebutRemise.toISOString()
                : null,
            dateFinRemise: produit.dateFinRemise
                ? produit.dateFinRemise.toISOString()
                : null,

            ventesParLot: (produit.Lot || []).map((lot) => ({
    id: lot.id,
    prix: Number(lot.price),
    qte: Number(lot.quantite),
    price: Number(lot.price)
})),

            quantite: createdStock.stockInitial,
            Lot:[],
        };


        
    } catch (error) {
        console.error("service/createProduct",error)
        return null
    }
}

export async function getAllForPos(
  data: {
    entrepriseId: string;
    page: number;
    limit: number;
    search: string;
  },
  prisma
): Promise<PaginatedResponse<ProductForPos> | null> {
  try {
    const { entrepriseId, page, limit, search } = data;
    const skip = (page - 1) * limit;

    // --- Calculer la date du dernier mois
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // --- Compter le total pour la pagination
    const total = await prisma.produit.count({
      where: {
        entrepriseId,
        createdAt: { gte: oneMonthAgo },
        designation: { contains: search },
      },
    });

    // --- Récupérer les produits du dernier mois avec pagination
    const produits = await prisma.produit.findMany({
      where: {
        entrepriseId,
        createdAt: { gte: oneMonthAgo },
        designation: { contains: search },
      },
      skip,
      take: limit,
      select: {
        id: true,
        codeBarre: true,
        designation: true,
        puht: true,
        tva: true,
        type: true,
        remise: true,
        imagePath: true,
        featuredOnPos: true,
        active: true,
        Lot: true,
        categorie: { select: { id: true, nom: true } },
      },
    });

    // --- Récupérer les stocks uniquement pour les produits sélectionnés
    const codeBarres = produits.map((p) => p.codeBarre);
    const stocks = await prisma.mouvementStock.groupBy({
      by: ["codeBarre"],
      _sum: { stockFinalTheoric: true },
      where: {
        codeBarre: { in: codeBarres },
        createdAt: { gte: oneMonthAgo },
      },
    });

    const arrangedStocks: Record<string, number> = Object.fromEntries(
      stocks.map((s) => [s.codeBarre, Number(s._sum.stockFinalTheoric) || 0])
    );

    // --- Mapper les produits pour le frontend
    const produitsForIPC: ProductForPos[] = produits.map((p) => ({
      ...p,
      puht: Number(p.puht),
      tva: Number(p.tva),
      remise: Number(p.remise),
      quantite: arrangedStocks[p.codeBarre] || 0,
      ventesParLot:
        p.Lot?.map((lot) => ({
          ...lot,
          prix: Number(lot.price),
          qte: lot.quantite,
          price: Number(lot.price),
        })) || [],
      Lot: [],
      dateDebutRemise: p.dateDebutRemise
        ? p.dateDebutRemise.toISOString()
        : null,
      dateFinRemise: p.dateFinRemise
        ? p.dateFinRemise.toISOString()
        : null,
    }));

    return {
      data: produitsForIPC,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("service/getAllForPos", error);
    return null;
  }
}

export async function getAllForList(
  data: {
    entrepriseId: string;
    page: number;
    limit: number;
    search: string;
  },
  prisma
): Promise<PaginatedResponse<ProductForList> | null> {
  try {
    const { entrepriseId, page, limit, search } = data;

    if (!entrepriseId) return null;

    const skip = (page - 1) * limit;

    // --- where filter (search on designation or codeBarre)
    const where: Prisma.ProduitWhereInput = {
      entrepriseId,
      designation:{
        contains:search

      }
    };

    // --- total count for pagination
    const total = await prisma.produit.count({ where });

    // --- fetch data with pagination
    const produits = await prisma.produit.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include:{
        Lot:true
      }
    });

    const stocks = await prisma.mouvementStock.findMany()

    const arrangedStocks = stocks.reduce((map,s)=>{
              map[s.codeBarre] = s.stockFinalTheoric
              return map

            }, {} as Record<string,number>)
    
    // --- map to ProductForList
    const formatted: ProductForList[] = produits.map((p) => {
      // sum quantities of lots (if that's your "quantite")

      return {
        id: p.id,
        designation: p.designation,
        puht: Number(p.puht),
        tva: Number(p.tva),
        remise: Number(p.remise),
        dateDebutRemise: p.dateDebutRemise
          ? p.dateDebutRemise.toISOString()
          : null,
        dateFinRemise: p.dateFinRemise
          ? p.dateFinRemise.toISOString()
          : null,
        active: p.active,
          quantite: arrangedStocks[p.codeBarre],
        imagePath: p.imagePath ?? undefined,
        hasOperations: false, // or any logic you need
        ventesParLot:p.Lot && p.Lot.map(l=>({
                    ...l,
                    prix:Number(l.price),
                    qte:l.quantite,
                    price:Number(l.price)
                  })),
                  Lot:[],
      };
    });

    return {
      data: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("service/produits getAllForList", error);
    return null

  }
}

export async function getProducts(
  data:{
    entrepriseId: string
  },
  prisma
) :Promise<Product[]|null>{
  try {
    const {entrepriseId} = data

    if(!entrepriseId)return null

    const produits = await prisma.produit.findMany({
      where:{
        entrepriseId:entrepriseId
      },
      include:{
        Lot:true
      }
    })

    const stocks = await prisma.mouvementStock.findMany()

    const arrangedStocks = stocks.reduce((map,s)=>{
              map[s.codeBarre] = s.stockFinalTheoric
              return map

            }, {} as Record<string,number>)

    return produits && produits.map(produit=>({
      ...produit,
            puht: Number(produit.puht),
            tva: Number(produit.tva),
            remise: Number(produit.remise),
            dateDebutRemise: produit.dateDebutRemise
                ? produit.dateDebutRemise.toISOString()
                : null,
            dateFinRemise: produit.dateFinRemise
                ? produit.dateFinRemise.toISOString()
                : null,

            ventesParLot: (produit.Lot || []).map((lot) => ({
    id: lot.id,
    prix: Number(lot.price),
    qte: Number(lot.quantite),
    price: Number(lot.price)
})),

            quantite: arrangedStocks[produit.codeBarre],
            Lot:[],
          
    }))

  } catch (error) {
    console.error("service/produit getProducts: ",error);
    return null
  }
}

export async function getProductById(
  data:{
    entrepriseId: string, 
    productId: string
  },prisma
): Promise<Product|null>  {
  try {
    const {productId} = data

    const produit = await prisma.produit.findUnique({
      where:{
        id:productId
      },include: {
            Lot: true, 
            categorie:true
        },
    })
    const stock= await prisma.mouvementStock.findFirst({
      where:{
        codeBarre:produit.codeBarre
      }
    })
    return {
      ...produit,
            puht: Number(produit.puht),
            tva: Number(produit.tva),
            remise: Number(produit.remise),
            dateDebutRemise: produit.dateDebutRemise
                ? produit.dateDebutRemise.toISOString()
                : null,
            dateFinRemise: produit.dateFinRemise
                ? produit.dateFinRemise.toISOString()
                : null,

            ventesParLot: produit.Lot && produit.Lot.map((lot) => ({
                ...lot,
                prix: Number(lot.price),
                qte:Number(lot.quantite),
                price:Number(lot.price)
                })),
            quantite: stock.stockFinalTheoric,
            Lot:[],
          
    }
  } catch (error) {
    console.error("service/produit getProductById",error);
    return null
  }
}

export async function activateProduct(
  data:{
    productId:string,
    entrepriseId:string
  },prisma
):Promise<{success:Boolean}> {
  try {
    const {productId} = data

    if(!productId)return {success:false}

    const activatedProduct = await prisma.produit.update({
      where:{
        id:productId
      },
      data:{
        active:true
      }
    })
    if(activatedProduct)return {success:true}
    return {success:false}
  } catch (error) {
    console.error("service/produit activateProduct: ",error);
    return {success:false}
  }
}

export async function deactivateProduct(
  data:{
    productId:string,
    entrepriseId:string
  },prisma
):Promise<{success:Boolean}> {
  try {
    const {productId} = data

    if(!productId)return {success:false}

    const activatedProduct = await prisma.produit.update({
      where:{
        id:productId
      },
      data:{
        active:false
      }
    })
    if(activatedProduct)return {success:true}

    return {success:false}

  } catch (error) {
    console.error("service/produit deactivateProduct: ",error);
    return {success:false}
  }
}

export async function updateProduct(
  data: {
    entrepriseId: string;
    productId: string;
    formData: UpdateProductFormData;
  },
  prisma
): Promise<Product | null> {
  try {
    const { entrepriseId, productId, formData } = data;

    if (!entrepriseId || !productId || !formData) return null;

    const {
      designation,
      categorieId,
      puht,
      codeBarre,
      tva,
      remise,
      dateDebutRemise,
      dateFinRemise,
      active,
      stockInitial,
      stockSecurite,
      image,
      type,
      bulkSales,
      showInPos,
    } = formData;

    // --- Update product base fields
    const produit = await prisma.produit.update({
      where: {
        id: productId,
        entrepriseId: entrepriseId,
      },
      data: {
        designation,
        codeBarre,
        puht: new Prisma.Decimal(puht),
        tva: new Prisma.Decimal(tva),
        remise: new Prisma.Decimal(remise),
        active,
        stockInitial,
        stockSecurite: stockSecurite ?? undefined,
        imagePath: image || "",
        dateDebutRemise: dateDebutRemise ? new Date(dateDebutRemise) : null,
        dateFinRemise: dateFinRemise ? new Date(dateFinRemise) : null,
        featuredOnPos: showInPos ?? false,
        categorie: { connect: { id: categorieId } },

        // Replace old Lots with new ones from bulkSales
        Lot: {
          deleteMany: {}, // delete all existing
          create: bulkSales.map((sale) => ({
            quantite: sale.quantity,
            price: new Prisma.Decimal(sale.price),
          })),
        },
      },
      include: {
        categorie: { select: { id: true, nom: true } },
        Lot: true,
      },
    });
    const updatedStock = await updateStockMouvement({entrepriseId,dto:{
          designation,codeBarre,stockInitial,stockSecurite:stockSecurite||0,
          acc:0,achats:0,ventes:0,inventories:0,operation:StockMouvementType.UPDATE,productType:type
        }},prisma)

    // --- Map to Product interface
    const result= {
      id: produit.id,
      designation: produit.designation,
      categorieId: produit.categorieId,
      type:produit.type,
      categorie: produit.categorie
        ? { id: produit.categorie.id, nom: produit.categorie.nom }
        : undefined,
      puht: Number(produit.puht),
      codeBarre: produit.codeBarre,
      tva: Number(produit.tva),
      remise: Number(produit.remise),
      dateDebutRemise: produit.dateDebutRemise
        ? produit.dateDebutRemise.toISOString()
        : null,
      dateFinRemise: produit.dateFinRemise
        ? produit.dateFinRemise.toISOString()
        : null,
      active: produit.active,
      stockInitial: produit.stockInitial,
      stockSecurite: produit.stockSecurite ?? undefined,
      imagePath: produit.imagePath ?? "",
      showInPos: produit.featuredOnPos,
      quantite: updatedStock.stockFinalTheoric,
      ventesParLot: produit.Lot && produit.Lot.map((lot) => ({
        
        prix: Number(lot.price),
        qte:lot.quantite,
        price:Number(lot.price)
      
      })),
      Lot:[],
    };

    return result;
  } catch (error) {
    console.error("service/produit updateProduct: ", error);
    return null;
  }
}

export async function deleteProduct(
  data:{
    productId:string,
    entrepriseId:string
  },prisma
):Promise<{success:Boolean}> {
  try {
    const {entrepriseId,productId} = data

    if(!productId)return {success:false}

    const deletedBulk = await prisma.lot.deleteMany({
      where: { produitId: productId },
    });

    if(!deletedBulk)return {success:false}

    const deletedProduct = await prisma.produit.delete({
      where:{
        id:productId
      }
    })
    if(deletedProduct){
      await deleteStockMouvement({
        entrepriseId,codeBarre:deletedProduct.codeBarre
      },prisma)

      return {success:true}
    }

    return {success:false}

  } catch (error) {
    console.error("service/produit deleteProduct: ",error);
    return {success:false}
  }
}

export async function getProductByBarcode(
data:{
    entrepriseId: string, 
    codeBarre: string
},prisma
): Promise<Product|null> {
  try {
    const {codeBarre} = data

    const produit = await prisma.produit.findUnique({
      where:{
        codeBarre:codeBarre
      },include: {
            Lot: true, 
            categorie:true
        },
    })
    console.log(produit)
    const stock= await prisma.mouvementStock.findFirst({
      where:{
        codeBarre:produit.codeBarre
      }
    })
    return {
      ...produit,
            puht: Number(produit.puht),
            tva: Number(produit.tva),
            remise: Number(produit.remise),
            dateDebutRemise: produit.dateDebutRemise
                ? produit.dateDebutRemise.toISOString()
                : null,
            dateFinRemise: produit.dateFinRemise
                ? produit.dateFinRemise.toISOString()
                : null,
            quantite: stock.stockFinalTheoric||0,
            ventesParLot: (produit.Lot || []).map((lot) => ({
    id: lot.id,
    prix: Number(lot.price),
    qte: Number(lot.quantite),
    price: Number(lot.price)
})),
          Lot:[],
    }
  } catch (error) {
    console.error("service/produit getProductByBarcode: ",error);
    return null
  }
}

export async function deleteProductPhoto(
  data:{
    productId:string,
    entrepriseId:string
  },prisma
):Promise<{success:Boolean}> {
  try {
    const {productId} = data

    if(!productId)return {success:false}


    const deletedImageProduct = await prisma.produit.update({
      where:{
        id:productId
      },
      data:{
        imagePath:""
      }
    })
    if(deletedImageProduct)return {success:true}

    return {success:false}

  } catch (error) {
    console.error("service/produit deleteProductPhoto: ",error);
    return {success:false}
  }
}
export async function getProductsByCategory(
  data:{
    entrepriseId: string,
  categorieId: string,
  page: number ,
  limit: number ,
  search: string 
  },
  prisma
): Promise<PaginatedResponse<ProductForPos>|null> {
 try {
        const { entrepriseId, page, limit, search,categorieId } = data
        const skip = (page - 1) * limit

        // Count total produits
        const total = await prisma.produit.count()

        // Fetch paginated produits
        const produits = await prisma.produit.findMany({ 
            where: {
                entrepriseId,
                designation: {
                    contains: search
                },
                categorieId:{
                  contains:categorieId
                }
            },
            skip,
            take: limit,
            select: {
                id: true,
                codeBarre: true,
                designation: true,
                puht: true,
                tva: true,
                remise: true,
                imagePath: true,
                quantite:true,
                featuredOnPos:true,
                type:true,
                categorie: {
                select: {
                    id: true,
                    nom: true,
                },
                },
                Lot:true,
                active:true
            }
            })
            const stocks = await prisma.mouvementStock.findMany()

            const arrangedStocks = stocks.reduce((map,s)=>{
                      map[s.codeBarre] = s.stockFinalTheoric
                      return map

                    }, {} as Record<string,number>)

            const produitsForIPC = produits.map(p => ({
                ...p,
                puht: Number(p.puht),
                tva: Number(p.tva),
                remise: Number(p.remise),
                quantite: arrangedStocks[p.codeBarre]||0,
                  ventesParLot:p.Lot && p.Lot.map(l=>({
                    ...l,
                    prix:Number(l.price),
                    qte:l.quantite,
                    price:Number(l.price)
                  })),
                  Lot:[],
                dateDebutRemise: p.dateDebutRemise ? p.dateDebutRemise.toISOString() : null,
                dateFinRemise: p.dateFinRemise ? p.dateFinRemise.toISOString() : null,
                }))

            return {
                data: produitsForIPC,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }

    } catch (error) {
        console.error("service/produit getProductsByCategory: ",error);
        return null
    }
}

export async function getActive(
  data:{
    entrepriseId: string,
  page: number ,
  limit: number ,
  search: string 
  },
  prisma
): Promise<PaginatedResponse<ProductForList>|null> {
  try {
    const { entrepriseId, page, limit, search } = data;

    if (!entrepriseId) return null;

    const skip = (page - 1) * limit;

    // --- where filter (search on designation or codeBarre)
    const where: Prisma.ProduitWhereInput = {
      entrepriseId,
      designation:{
        contains:search
      },
      active:true
    };

    // --- total count for pagination
    const total = await prisma.produit.count({ where });

    // --- fetch data with pagination
    const produits = await prisma.produit.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include:{
        Lot:true
      }
    });

    // --- map to ProductForList
    const formatted: ProductForList[] = produits.map((p) => {
      // sum quantities of lots (if that's your "quantite")

      return {
        id: p.id,
        designation: p.designation,
        puht: Number(p.puht),
        tva: Number(p.tva),
        remise: Number(p.remise),
        dateDebutRemise: p.dateDebutRemise
          ? p.dateDebutRemise.toISOString()
          : null,
        dateFinRemise: p.dateFinRemise
          ? p.dateFinRemise.toISOString()
          : null,
        active: p.active,
        quantite: p.Lot ?
            p.Lot.reduce((sum,lot)=> sum + lot.quantite,0)
            :
            p.quantite,
        imagePath: p.imagePath ?? undefined,
        hasOperations: false, // or any logic you need
        ventesParLot:p.Lot && p.Lot.map(l=>({
                    ...l,
                    prix:Number(l.price),
                    qte:l.quantite,
                    price:Number(l.price)
                  })),
        Lot:[],
      };
    });

    return {
      data: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("service/produits getActive", error);
    return null

  }
}

export async function getInactive(
  data:{
    entrepriseId: string,
  page: number ,
  limit: number ,
  search: string 
  },
  prisma
): Promise<PaginatedResponse<ProductForList>|null> {
  try {
    const { entrepriseId, page, limit, search } = data;

    if (!entrepriseId) return null;

    const skip = (page - 1) * limit;

    // --- where filter (search on designation or codeBarre)
    const where: Prisma.ProduitWhereInput = {
      entrepriseId,
      designation:{
        contains:search
      },
      active:false
    };

    // --- total count for pagination
    const total = await prisma.produit.count({ where });

    // --- fetch data with pagination
    const produits = await prisma.produit.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include:{
        Lot:true
      }
    });

    // --- map to ProductForList
    const formatted: ProductForList[] = produits.map((p) => {
      // sum quantities of lots (if that's your "quantite")

      return {
        id: p.id,
        designation: p.designation,
        puht: Number(p.puht),
        tva: Number(p.tva),
        remise: Number(p.remise),
        dateDebutRemise: p.dateDebutRemise
          ? p.dateDebutRemise.toISOString()
          : null,
        dateFinRemise: p.dateFinRemise
          ? p.dateFinRemise.toISOString()
          : null,
        active: p.active,
        quantite: p.Lot ?
            p.Lot.reduce((sum,lot)=> sum + lot.quantite,0)
            :
            p.quantite,
        imagePath: p.imagePath ?? undefined,
        ventesParLot:p.Lot && p.Lot.map(l=>({
                    ...l,
                    prix:Number(l.price),
                    qte:l.quantite,
                    price:Number(l.price)
                  })),
        hasOperations: false, // or any logic you need
        Lot:[],
      };
    });

    return {
      data: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("service/produits getActive", error);
    return null

  }
}
