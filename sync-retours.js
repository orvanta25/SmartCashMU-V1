// sync-retours-final.js
const { PrismaClient } = require('@prisma/client');

async function synchroniserRetours() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔄 Connexion à la base de données...');
        
        // Récupérer toutes les entreprises
        const entreprises = await prisma.entreprise.findMany({
            select: { id: true, nom: true }
        });
        
        console.log(`📊 ${entreprises.length} entreprises trouvées`);
        
        let totalRetoursTraites = 0;
        
        for (const entreprise of entreprises) {
            console.log(`\n🔧 Synchronisation pour: ${entreprise.nom}`);
            
            const result = await traiterRetoursEntreprise(entreprise.id, prisma);
            totalRetoursTraites += result.retoursTraites;
            
            console.log(`   ✅ ${result.retoursTraites} retours traités`);
            console.log(`   📊 ${result.mouvementsMisAJour} mouvements mis à jour`);
        }
        
        console.log(`\n🎉 Synchronisation terminée avec succès !`);
        console.log(`📈 Total: ${totalRetoursTraites} retours traités`);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
        console.log('🔒 Connexion à la base de données fermée');
    }
}

async function traiterRetoursEntreprise(entrepriseId, prisma) {
    console.log("   🔄 Recherche des retours...");
    
    // 1. Récupérer toutes les lignes de retour avec les ventes associées
    const retourLignes = await prisma.retourLigne.findMany({
        where: {
            entrepriseId: entrepriseId,
            createdAt: {
                gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 derniers jours
            }
        },
        include: {
            vente: {
                select: {
                    id: true,
                    codeBarre: true,
                    designation: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
    
    console.log(`   📊 ${retourLignes.length} lignes de retour trouvées`);
    
    if (retourLignes.length === 0) {
        return { retoursTraites: 0, mouvementsMisAJour: 0 };
    }
    
    let retoursTraites = 0;
    let mouvementsMisAJour = 0;
    
    // 2. Grouper les retours par codeBarre et par jour
    const retoursParJourEtProduit = {};
    
    for (const ligne of retourLignes) {
        if (!ligne.vente || !ligne.vente.codeBarre) {
            console.log(`   ⚠️ Ligne ${ligne.id} sans vente ou codeBarre`);
            continue;
        }
        
        const dateLigne = new Date(ligne.createdAt);
        const dateKey = dateLigne.toISOString().split('T')[0]; // YYYY-MM-DD
        const codeBarre = ligne.vente.codeBarre;
        
        const cle = `${codeBarre}_${dateKey}`;
        
        if (!retoursParJourEtProduit[cle]) {
            retoursParJourEtProduit[cle] = {
                codeBarre: codeBarre,
                designation: ligne.vente.designation || 'Inconnu',
                date: new Date(dateKey),
                quantiteTotale: 0,
                lignes: []
            };
        }
        
        retoursParJourEtProduit[cle].quantiteTotale += ligne.quantite;
        retoursParJourEtProduit[cle].lignes.push(ligne);
        
        retoursTraites++;
    }
    
    console.log(`   📊 ${Object.keys(retoursParJourEtProduit).length} groupes créés`);
    
    // 3. Pour chaque groupe, mettre à jour le mouvement de stock
    for (const [cle, groupe] of Object.entries(retoursParJourEtProduit)) {
        try {
            // Formater la date comme dans MouvementStock (00:01:00)
            const dateMouvement = new Date(groupe.date);
            dateMouvement.setHours(0, 1, 0, 0);
            
            // Chercher le mouvement de stock existant
            let mouvement = await prisma.mouvementStock.findFirst({
                where: {
                    codeBarre: groupe.codeBarre,
                    entrepriseId: entrepriseId,
                    date: dateMouvement
                }
            });
            
            // Si aucun mouvement n'existe pour cette date, en créer un
            if (!mouvement) {
                console.log(`   ⚠️ Mouvement non trouvé pour ${groupe.codeBarre} le ${groupe.date.toISOString().split('T')[0]}`);
                console.log(`   🔄 Création d'un nouveau mouvement...`);
                
                // Récupérer le produit
                const produit = await prisma.produit.findFirst({
                    where: {
                        codeBarre: groupe.codeBarre,
                        entrepriseId: entrepriseId
                    }
                });
                
                if (!produit) {
                    console.log(`   ❌ Produit ${groupe.codeBarre} non trouvé, impossible de créer le mouvement`);
                    continue;
                }
                
                // Chercher le dernier mouvement avant cette date
                const dernierMouvement = await prisma.mouvementStock.findFirst({
                    where: {
                        codeBarre: groupe.codeBarre,
                        entrepriseId: entrepriseId,
                        date: { lt: dateMouvement }
                    },
                    orderBy: { date: 'desc' }
                });
                
                // Créer le nouveau mouvement
                mouvement = await prisma.mouvementStock.create({
                    data: {
                        date: dateMouvement,
                        codeBarre: groupe.codeBarre,
                        designation: produit.designation || groupe.designation,
                        stockInitial: dernierMouvement?.stockFinalReal || produit.stockInitial || 0,
                        stockSecurite: produit.stockSecurite || 0,
                        achats: 0,
                        ventes: 0,
                        acc: 0,
                        retour: groupe.quantiteTotale,
                        stockFinalTheoric: (dernierMouvement?.stockFinalReal || produit.stockInitial || 0) + groupe.quantiteTotale,
                        stockFinalReal: null,
                        ecart: 0,
                        entrepriseId: entrepriseId
                    }
                });
                
                mouvementsMisAJour++;
                console.log(`   ✅ Nouveau mouvement créé pour ${groupe.codeBarre} avec ${groupe.quantiteTotale} retours`);
            } else {
                // Mettre à jour le mouvement existant
                const nouveauRetour = (mouvement.retour || 0) + groupe.quantiteTotale;
                
                // Recalculer le stock théorique
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
                        stockFinalTheoric: nouveauStockTheorique,
                        ecart: mouvement.stockFinalReal !== null ? mouvement.stockFinalReal - nouveauStockTheorique : 0
                    }
                });
                
                mouvementsMisAJour++;
                console.log(`   ✅ ${groupe.codeBarre} le ${groupe.date.toISOString().split('T')[0]}: +${groupe.quantiteTotale} retours (total: ${nouveauRetour})`);
            }
            
        } catch (error) {
            console.log(`   ❌ Erreur pour ${groupe.codeBarre} le ${groupe.date.toISOString().split('T')[0]}: ${error.message}`);
        }
    }
    
    return { retoursTraites, mouvementsMisAJour };
}

// Exécutez la synchronisation
synchroniserRetours();