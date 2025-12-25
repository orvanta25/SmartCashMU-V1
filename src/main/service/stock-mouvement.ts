import { ProductType } from "../model/produit";
import { MovementStockSearchFilters, StockMouvementType, StockMovement, UpdateStockMouvementDto } from "../model/stock-mouvement";

// Fonction helper pour recalculer l'écart
function recalculerEcart(stockFinalReal: number | null, stockFinalTheoric: number): number {
    if (stockFinalReal !== null) {
        return stockFinalReal - stockFinalTheoric;
    }
    return 0;
}
const POS_INFINITE_STOCK = 999999;
export async function getInventoryByParams(
    data:{
        entrepriseId:string,
        dto:MovementStockSearchFilters
    }, prisma
): Promise<StockMovement[] | null> {
    try {
        const { entrepriseId, dto } = data;

        if (!entrepriseId || !dto) return null;

        const {
            codeBarre,
            designation,
            dateDebut,
            dateFin,
        } = dto;

        const where: any = {
            entrepriseId
        };

        if (codeBarre) {
            where.codeBarre = { contains: codeBarre };
        }

        if (designation) {
            where.designation = { contains: designation };
        }

        if (dateDebut && dateFin) {
            where.date = {
                gte: new Date(dateDebut),
                lte: new Date(dateFin),
            };
        }

        const stocks = await prisma.mouvementStock.findMany({
            where,
            orderBy: { date: "desc" }
        });

        // IMPORTANT : Recalculer l'écart avec les retours
        const stocksAvecCalculs = stocks.map(stock => {
            // Formule correcte : stockInitial + achats - ventes - acc - retour
            const stockFinalTheoricAvecRetour = 
                stock.stockInitial + 
                stock.achats - 
                stock.ventes - 
                stock.acc -
                stock.retour;
            
            const ecart = recalculerEcart(stock.stockFinalReal, stockFinalTheoricAvecRetour);
            
            return {
                ...stock,
                stockFinalTheoric: stockFinalTheoricAvecRetour,
                ecart: ecart
            };
        });

        return stocksAvecCalculs;

    } catch (error) {
        console.error("service/mouvementStock getInventoryByParams: ", error);
        return null;
    }
}

export async function updateStockMouvement(
    data:{
        entrepriseId:string,
        dto:UpdateStockMouvementDto
    },prisma) {
    try {
        const {entrepriseId,dto} = data

        if(!entrepriseId || !dto)return null

        const {       
            codeBarre,
            designation,
            operation,
            stockInitial,
            stockSecurite,
            acc,
            achats,
            ventes,
            inventories,
            retour, // ← AJOUTER CETTE LIGNE
            productType
        } = dto

        await createMouvementStock({
            entrepriseId,
            dto:{
                codeBarre,designation
            }
        },prisma)

        switch(operation){
            case StockMouvementType.ACHAT:
                const achatStock = await mouvementStockAchatOperation({
                            entrepriseId,
                            dto:{
                                codeBarre,achats
                            }
                        },prisma)
                return achatStock
                
            case StockMouvementType.VENTE:
                const venteStock = await mouvementStockVenteOperation({
                            entrepriseId,
                            dto:{
                                codeBarre,ventes,productType
                            }
                        },prisma)
                return venteStock

            case StockMouvementType.ACC:
                const accStock = await mouvementStockAccOperation({
                            entrepriseId,
                            dto:{
                                codeBarre,acc,productType
                            }
                        },prisma)
                return accStock

            case StockMouvementType.RETOUR:
                const retourStock = await mouvementStockRetourOperation({
                    entrepriseId,
                    dto: {
                        codeBarre,
                        quantiteRetour: retour,   // ← valeur envoyée par ton POS
                        productType
                    }
                }, prisma);
                return retourStock;

            case StockMouvementType.UPDATE:
                const updatedStock = await mouvementStockUpdateOperation({
                            entrepriseId,
                            dto:{
                                codeBarre,designation,stockInitial,stockSecurite,productType
                            }
                        },prisma)
                return updatedStock

            case StockMouvementType.CREATE:
                const stock = await mouvementStockCreateOperation({
                    entrepriseId,
                    dto: { 
                        designation,
                         codeBarre ,
                         stockInitial,
                         stockSecurite,
                         productType
                    }
                    },prisma
                )
                return stock
                
            case StockMouvementType.INVENTAIRE:
                const inventorieStock =await mouvementStockInventoryOperation(
                    {entrepriseId,
                    dto:{
                        codeBarre,inventories
                    }
                },prisma
                )
                return inventorieStock
        }

    } catch (error) {
        console.error("service/mouvementStock updateStockMouvement: ",error);
        
    }
}

export async function synchroniserRetoursDansMouvementStock(
    data: {
        entrepriseId: string,
        dateDebut?: string,
        dateFin?: string
    },
    prisma
) {
    try {
        const { entrepriseId, dateDebut, dateFin } = data;
        
        const where: any = { entrepriseId };
        
        if (dateDebut && dateFin) {
            where.date = {
                gte: new Date(dateDebut),
                lte: new Date(dateFin)
            };
        }

        // Récupérer tous les mouvements de stock
        const mouvements = await prisma.mouvementStock.findMany({
            where,
            select: ['id', 'codeBarre', 'date']
        });

        for (const mouvement of mouvements) {
            // Calculer la somme des retours pour ce mouvement
            const totalRetours = await prisma.retour.aggregate({
                where: {
                    codeBarre: mouvement.codeBarre,
                    entrepriseId,
                    date: mouvement.date
                },
                _sum: {
                    quantite: true
                }
            });

            const retourQuantite = totalRetours._sum.quantite || 0;

            // Mettre à jour le mouvement de stock
            await prisma.mouvementStock.update({
                where: { id: mouvement.id },
                data: { retour: retourQuantite }
            });
        }

        return { success: true, message: "Retours synchronisés" };
    } catch (error) {
        console.error("Erreur synchronisation retours: ", error);
        return { success: false, error: error.message };
    }
}

async function createMouvementStock(
    data: {
        entrepriseId: string,
        dto: {
            codeBarre: string,
            designation: string
        }
    },
    prisma
) {
    try {
        const { entrepriseId, dto } = data;

        if (!entrepriseId || !dto) return null;

        const { codeBarre, designation } = dto;

        const product = await prisma.produit.findFirst({
            where: {
                OR: [
                    { codeBarre: codeBarre },
                    { designation: { contains: designation } }
                ]
            }
        });

        if (!product) throw new Error("Produit Introuvable avec la designation : " + designation);

        const now = new Date();
        now.setHours(0, 1, 0, 0);

        // Check if stock movement exists for the current date
        const existingStock = await prisma.mouvementStock.findFirst({
            where: {
                date: now,
                codeBarre,
                entrepriseId
            }
        });

        // If stock exists for the date, return null
        if (existingStock) return null;

        // Fetch the previous stock movement (most recent before current date)
        const previousStock = await prisma.mouvementStock.findFirst({
            where: {
                codeBarre,
                entrepriseId,
                date: {
                    lt: now
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Check if product is POS type
        const isPOS = product.type === ProductType.POS;

        const stockInitialValue = isPOS
        ? POS_INFINITE_STOCK
        : previousStock?.stockFinalReal ?? product.stockInitial ?? 0;

        const stockFinalValue = isPOS
        ? POS_INFINITE_STOCK
        : previousStock?.stockFinalReal ?? product.stockInitial ?? 0;

        const stockSecuriteValue = isPOS
        ? POS_INFINITE_STOCK
        : previousStock?.stockSecurite ?? product.stockSecurite ?? 0;

        // Create new stock movement with values based on previous stock or defaults
        const createdStock = await prisma.mouvementStock.create({
        data: {
            date: now,
            codeBarre,
            designation,

            stockInitial: stockInitialValue,
            stockSecurite: stockSecuriteValue,

            achats: 0,
            ventes: 0,
            acc: 0,
            retour: 0,
            ecart: 0,

            stockFinalReal: stockFinalValue,
            stockFinalTheoric: stockFinalValue,

            entreprise: {
            connect: { id: entrepriseId }
            }
        }
        });


        return createdStock;

    } catch (error) {
        console.error("Error createMouvementStock: ", error);
        return null;
    }
}

async function mouvementStockCreateOperation(
    data:{
        entrepriseId:string,
        dto:{
            codeBarre:string,
            designation:string,
            stockInitial:number,
            stockSecurite:number,
            productType:ProductType
        }
    },prisma) {
    try {
        const {entrepriseId,dto} = data

        if(!entrepriseId || !dto)return null

        const {       
            codeBarre,
            designation,
            stockInitial,
            stockSecurite,
            productType
        }    = dto
        const now = new Date()
        now.setHours(0,1,0,0)
        const stock  =await prisma.mouvementStock.findFirst({
            where:{
                codeBarre:codeBarre,
                date:now,
                entrepriseId // ← AJOUTER CETTE LIGNE
            }
        })
        
        if(stock)return stock
            // Detect POS logic
        const isPOS = productType === ProductType.POS;

        const stockInitialValue = isPOS ? POS_INFINITE_STOCK : (stockInitial ?? 0);
        const stockSecuriteValue = isPOS ? POS_INFINITE_STOCK : (stockSecurite ?? 0);
        const stockFinalValue = isPOS ? POS_INFINITE_STOCK : (stockInitial ?? 0);

        const createdStock = await prisma.mouvementStock.create({
            data: {
                date: now,
                codeBarre,
                designation,

                stockInitial: stockInitialValue,
                stockSecurite: stockSecuriteValue,
                achats: 0,
                ventes: 0,
                acc: 0,
                retour: 0,

                stockFinalTheoric: stockFinalValue,
                stockFinalReal: stockFinalValue,

                ecart: 0,

                entreprise: {
                    connect: { id: entrepriseId }
                }
            }
        });

        return createdStock
    } catch (error) {
        console.error("Error mouvementStockCreateOperation: ",error);
        
    }
}

async function mouvementStockUpdateOperation(
    data:{
        entrepriseId:string,
        dto:{
            codeBarre:string,
            designation:string,
            stockInitial:number,
            stockSecurite:number
            productType:ProductType
        }
    },prisma) {
    try {
        const {entrepriseId,dto} = data

        if(!entrepriseId || !dto)return null

        const {       
            codeBarre,
            designation,
            stockInitial,
            stockSecurite,
            productType
        } = dto;

        const now = new Date();
        now.setHours(0, 1, 0, 0);

        // CORRECTION : Chercher le stock pour la date actuelle
        const stock = await prisma.mouvementStock.findFirst({
            where: { 
                codeBarre,
                date: now,
                entrepriseId
            }
        });

        if (!stock) {
            throw new Error("Stock not found for barcode " + codeBarre);
        }

        // Choose special values if POS
        const isPOS = productType === ProductType.POS;

        // CORRECTION : Calcul correct incluant retour
        const baseInitial = stockInitial ?? 0;
        const calculatedStockFinal = baseInitial + stock.achats - stock.ventes - stock.acc - stock.retour;

        // Ecart recalculation
        const ecart = recalculerEcart(
            stock.stockFinalReal,
            calculatedStockFinal
        );

        // Create update payload
        const updateData = {
            designation,
            stockInitial: isPOS ? POS_INFINITE_STOCK : baseInitial,
            stockSecurite: stockSecurite ?? 0,
            stockFinalTheoric: isPOS ? POS_INFINITE_STOCK : calculatedStockFinal,
            stockFinalReal: isPOS ? POS_INFINITE_STOCK : stock.stockFinalReal,
            ecart: isPOS ? 0 : ecart,
        };

        // UPDATE record
        const updatedStock = await prisma.mouvementStock.update({
            where: { 
                id: stock.id,
                date: now,
                entrepriseId
            },
            data: updateData
        });

        return updatedStock
    } catch (error) {
        console.error("Error mouvementStockUpdateOperation: ",error);
        
    }
}

async function mouvementStockAccOperation(
    data:{
        entrepriseId:string,
        dto:{
            codeBarre:string,
            acc:number,
            productType:ProductType
        }
    },prisma) {
    try {
        const {entrepriseId,dto} = data

        if(!entrepriseId || !dto)return null

        const {       
            codeBarre,
            acc,
            productType
        }    = dto
        
        const isPOS = productType === ProductType.POS;
        
        const now = new Date();
        now.setHours(0, 1, 0, 0);

        const stock = await prisma.mouvementStock.findFirst({
            where:{
                codeBarre:codeBarre,
                date:now,
                entrepriseId
            },
        })

        // CORRECTION : Calcul correct incluant retour
        const calculatedStockFinal = stock.stockInitial + stock.achats - stock.ventes - acc - stock.retour;
        
        // RECALCUL AUTOMATIQUE DE L'ÉCART
        const ecart = recalculerEcart(stock.stockFinalReal, calculatedStockFinal)

        const createdStock = await prisma.mouvementStock.update({
            where:{
                id:stock.id,
                date:now,
                entrepriseId
            },
            data:{       
                acc: stock.acc + acc, // ← CORRECTION : Additionner avec l'ancienne valeur
                stockFinalTheoric: isPOS ? POS_INFINITE_STOCK : (calculatedStockFinal || 0),
                ecart: isPOS ? 0 : ecart
            }
        })

        return createdStock
    } catch (error) {
        console.error("Error mouvementStockAccOperation: ",error);
        
    }
}

async function mouvementStockAchatOperation(
    data:{
        entrepriseId:string,
        dto:{
            codeBarre:string,
            achats:number
        }
    },prisma) {
    try {
        const {entrepriseId,dto} = data

        if(!entrepriseId || !dto)return null

        const {       
            codeBarre,
            achats
        } = dto

        const now = new Date();
        now.setHours(0, 1, 0, 0);

        const stock = await prisma.mouvementStock.findFirst({
            where:{
                codeBarre:codeBarre,
                date:now,
                entrepriseId
            },
        })

        // CORRECTION : Calcul correct incluant retour
        const calculatedStockFinal = stock.stockInitial + stock.achats + achats - stock.ventes - stock.acc - stock.retour;
        
        // RECALCUL AUTOMATIQUE DE L'ÉCART
        const ecart = recalculerEcart(stock.stockFinalReal, calculatedStockFinal)

        const createdStock = await prisma.mouvementStock.update({
            where:{
                id:stock.id,
                date:now,
                entrepriseId
            },
            data:{       
                achats: stock.achats + achats, // ← Additionner avec l'ancienne valeur              
                stockFinalTheoric: calculatedStockFinal || 0,
                ecart: ecart
            }
        })

        return createdStock
    } catch (error) {
        console.error("Error mouvementStockAchatOperation: ",error);
        
    }
}

async function mouvementStockVenteOperation(
    data:{
        entrepriseId:string,
        dto:{
            codeBarre:string,
            ventes:number,
            productType:ProductType
        }
    },prisma) {
    try {
        const {entrepriseId,dto} = data

        if(!entrepriseId || !dto)return null

        const {       
            codeBarre,
            ventes,
            productType
        } = dto

        const isPOS = productType === ProductType.POS;

        const now = new Date();
        now.setHours(0, 1, 0, 0);

        const stock = await prisma.mouvementStock.findFirst({
            where:{
                codeBarre:codeBarre,
                date:now,
                entrepriseId
            },
        })

        // CORRECTION : Calcul correct incluant retour
        const calculatedStockFinal = stock.stockInitial + stock.achats - (stock.ventes + ventes) - stock.acc - stock.retour;
        
        // RECALCUL AUTOMATIQUE DE L'ÉCART
        const ecart = recalculerEcart(stock.stockFinalReal, calculatedStockFinal)

        const createdStock = await prisma.mouvementStock.update({
            where:{
               id:stock.id,
               date:now,
               entrepriseId
            },
            data:{       
                ventes: stock.ventes + ventes,               
                stockFinalTheoric: isPOS ? POS_INFINITE_STOCK : (calculatedStockFinal || 0),
                ecart: isPOS ? 0 : ecart 
            }
        })

        return createdStock
    } catch (error) {
        console.error("Error mouvementStockVenteOperation: ",error);
        
    }
}

async function mouvementStockRetourOperation(
    data: {
        entrepriseId: string,
        dto: {
            codeBarre: string,
            quantiteRetour: number,
            productType: ProductType
        }
    },
    prisma
) {
    try {
        const { entrepriseId, dto } = data;
        const { codeBarre, quantiteRetour, productType } = dto;

        if (!entrepriseId || !dto) return null;

        const now = new Date();
        now.setHours(0, 1, 0, 0);

        const isPOS = productType === ProductType.POS;

        const stock = await prisma.mouvementStock.findFirst({
            where: {
                codeBarre,
                entrepriseId,
                date: now
            }
        });

        if (!stock) throw new Error("MouvementStock du jour introuvable");

        // CORRECTION : Ne pas modifier les ventes, juste ajouter au retour
        const nouveauRetour = (stock.retour || 0) + quantiteRetour;

        // CORRECTION : Calcul correct - les retours augmentent le stock
        const newStockFinalTheoric =
            stock.stockInitial +
            stock.achats -
            stock.ventes -
            stock.acc +
            nouveauRetour; // ← Retour ajouté au stock

        const ecart = recalculerEcart(stock.stockFinalReal, newStockFinalTheoric);

        const updated = await prisma.mouvementStock.update({
            where: { 
                id: stock.id,
                date: now,
                entrepriseId
            },
            data: {
                retour: nouveauRetour, // ← ENREGISTRER LE RETOUR
                stockFinalTheoric: isPOS ? POS_INFINITE_STOCK : newStockFinalTheoric,
                ecart: isPOS ? 0 : ecart
            }
        });

        return updated;

    } catch (error) {
        console.error("Error mouvementStockRetourOperation: ", error);
        return null;
    }
}

async function mouvementStockInventoryOperation(
    data:{
        entrepriseId:string,
        dto:{
            codeBarre:string,
            inventories:number
        }
    }, prisma) {
    try {
        const {entrepriseId, dto} = data

        if(!dto || !entrepriseId) return null

        const {       
            codeBarre,
            inventories
        } = dto

        const now = new Date();
        now.setHours(0, 1, 0, 0);

        const stock = await prisma.mouvementStock.findFirst({
            where:{
                codeBarre:codeBarre,
                date:now,
                entrepriseId
            },
        })

        // CORRECTION : Calcul de l'écart = inventaire (stock réel) - stock théorique
        const ecart = inventories - stock.stockFinalTheoric
        
        const createdStock = await prisma.mouvementStock.update({
            where:{
               id:stock.id,
               date:now,
               entrepriseId
            },
            data:{                    
                stockFinalReal:inventories || 0,
                ecart:ecart || 0
            }
        })
        return createdStock
    } catch (error) {
        console.error("service/mouvementStock mouvementStockInventoryOperation: ",error);
        
    }
}
// ... votre code existant jusqu'à ...

export async function deleteStockMouvement(
    data:{
        entrepriseId:string,
        codeBarre:string
},prisma) {
    try {
        const {entrepriseId,codeBarre} = data

        if(!entrepriseId || !codeBarre) return null

        const deletedStock = await prisma.mouvementStock.deleteMany({
            where:{
                codeBarre,
                entrepriseId
            }
        })
        if(!deletedStock)return {success:false}
        return {success:true}
    } catch (error) {
        console.error("service/mouvementStock deleteStockMouvement: ",error);
        return {success:false}   
    }
}

// SUPPRIMEZ CETTE LIGNE : export { autoUpdateStockOnRetour };

// Fonction pour mettre à jour automatiquement les mouvements de stock lors d'un retour
export async function autoUpdateStockOnRetour(
    data: {
        entrepriseId: string,
        codeBarre: string,
        quantiteRetour: number,
        dateRetour: Date
    },
    prisma
) {
    try {
        const { entrepriseId, codeBarre, quantiteRetour, dateRetour } = data;
        
        console.log(`🔄 Mise à jour automatique du stock pour retour: ${codeBarre}, ${quantiteRetour} unités`);
        
        const now = new Date(dateRetour);
        now.setHours(0, 1, 0, 0); // Format MouvementStock (00:01:00)
        
        // Vérifier si le produit est POS
        const produit = await prisma.produit.findFirst({
            where: { codeBarre, entrepriseId }
        });
        
        const isPOS = produit?.type === ProductType.POS;
        
        // Chercher le mouvement de stock existant pour cette date
        let mouvement = await prisma.mouvementStock.findFirst({
            where: {
                codeBarre,
                entrepriseId,
                date: now
            }
        });
        
        // Si aucun mouvement n'existe, en créer un
        if (!mouvement) {
            console.log(`📝 Création d'un nouveau mouvement pour ${codeBarre} le ${now.toISOString().split('T')[0]}`);
            
            // Récupérer le dernier mouvement avant cette date
            const dernierMouvement = await prisma.mouvementStock.findFirst({
                where: {
                    codeBarre,
                    entrepriseId,
                    date: { lt: now }
                },
                orderBy: { date: 'desc' }
            });
            
            mouvement = await prisma.mouvementStock.create({
                data: {
                    date: now,
                    codeBarre,
                    designation: produit?.designation || 'Inconnu',
                    stockInitial: dernierMouvement?.stockFinalReal || produit?.stockInitial || 0,
                    stockSecurite: produit?.stockSecurite || 0,
                    achats: 0,
                    ventes: 0,
                    acc: 0,
                    retour: quantiteRetour,
                    stockFinalTheoric: isPOS ? POS_INFINITE_STOCK : 
                        ((dernierMouvement?.stockFinalReal || produit?.stockInitial || 0) + quantiteRetour),
                    stockFinalReal: null,
                    ecart: 0,
                    entrepriseId
                }
            });
        } else {
            // Mettre à jour le mouvement existant
            const nouveauRetour = (mouvement.retour || 0) + quantiteRetour;
            const nouveauStockTheorique = 
                mouvement.stockInitial + 
                mouvement.achats - 
                mouvement.ventes - 
                mouvement.acc + 
                nouveauRetour;
            
            await prisma.mouvementStock.update({
                where: { id: mouvement.id },
                data: {
                    retour: nouveauRetour,
                    stockFinalTheoric: isPOS ? POS_INFINITE_STOCK : nouveauStockTheorique,
                    ecart: mouvement.stockFinalReal !== null ? 
                        mouvement.stockFinalReal - nouveauStockTheorique : 0
                }
            });
        }
        
        console.log(`✅ Stock mis à jour automatiquement pour ${codeBarre}`);
        return { success: true };
        
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour automatique du stock:", error);
        return { success: false, error: error.message };
    }
}

