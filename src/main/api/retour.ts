// src/main/api/retour.ts - VERSION MODIFIÉE
import { ipcMain } from "electron";
import { PrismaClient } from '@prisma/client';
import { retourService } from "../service/retourService";
import { autoUpdateStockOnRetour } from "../service/stock-mouvement"; // AJOUTEZ CET IMPORT
const prisma = new PrismaClient()
// Map pour suivre les retours en cours PAR COMMANDE (avec ID de requête)
const retoursEnCours = new Map<string, { timestamp: number; requestId: string }>();

export function RetourApi(prisma) {
  /**
   * 🟦 CREATE retour - Version SIMPLIFIÉE et FIABLE
   */
  ipcMain.on("/retour/create", async (event, data) => {
    const { commandeId, retourLignes, requestId } = data;
    
    // Créer une clé unique pour cette commande
    const commandeKey = `commande-${commandeId}`;
    
    console.log("🔵 [BACKEND] Début création retour");
    console.log("🔑 Commande ID:", commandeId);
    console.log("📋 Nombre de lignes:", retourLignes?.length || 0);
    console.log("🆔 Request ID:", requestId);

    // Vérifier si un retour est déjà en cours pour CETTE COMMANDE
    const retourExist = retoursEnCours.get(commandeKey);
    if (retourExist) {
      const maintenant = Date.now();
      const tempsEcoule = maintenant - retourExist.timestamp;
      
      // Si c'est récent (moins de 2 secondes), rejeter GENTIMENT
      if (tempsEcoule < 2000) {
        console.log(`⚠️ Requête trop rapide pour ${commandeId} (${tempsEcoule}ms)`);
        
        // IMPORTANT: Si c'est la MÊME requête (même requestId), on la traite quand même
        if (retourExist.requestId === requestId) {
          console.log(`🔄 Même requête (${requestId}), on continue...`);
        } else {
          event.sender.send("/retour/create", {
            success: true, // On répond SUCCESS même si on ignore, pour éviter les erreurs
            message: "Le retour est en cours de traitement",
            code: "RETOUR_EN_COURS_BUT_CONTINUE",
            commandeId,
            requestId
          });
          return;
        }
      } else {
        // Nettoyer l'ancien retour expiré
        retoursEnCours.delete(commandeKey);
        console.log(`🧹 Ancien retour nettoyé pour ${commandeId}`);
      }
    }

    try {
      // Marquer le retour comme en cours
      retoursEnCours.set(commandeKey, {
        timestamp: Date.now(),
        requestId: requestId || `req-${Date.now()}`
      });

      // Récupération de la session active
      const session = getActiveSession();
      let userId = session?.userId || null;
      let entrepriseId = session?.entrepriseId || null;

      // Si pas de session → fallback via commande
      if (!userId || !entrepriseId) {
        const commande = await prisma.commande.findUnique({
          where: { id: commandeId },
          include: { user: true },
        });

        if (!commande) throw new Error("Commande introuvable");

        userId = commande.userId;
        entrepriseId = commande.user?.entrepriseId;
      }

      if (!userId || !entrepriseId) {
        throw new Error("Impossible d'identifier l'utilisateur");
      }

      // Appeler le service de retour
      const retour = await retourService.createRetourForCommande(
        commandeId,
        retourLignes,
        userId,
        entrepriseId
      );

      console.log(`✅ Retour créé: ${retour.id}`);
      
      // 🔥 NOUVEAU : METTRE À JOUR LES MOUVEMENTS DE STOCK POUR CHAQUE LIGNE DE RETOUR
      if (retour && retour.id) {
        console.log("🔄 Mise à jour automatique des mouvements de stock...");
        
        try {
          // Récupérer les lignes de retour avec les détails des ventes
          const lignesAvecDetails = await prisma.retourLigne.findMany({
            where: { retourId: retour.id },
            include: {
              vente: {
                select: {
                  codeBarre: true,
                  designation: true
                }
              }
            }
          });
          
          // Pour chaque ligne de retour, mettre à jour le mouvement de stock
          for (const ligne of lignesAvecDetails) {
            if (ligne.vente && ligne.vente.codeBarre) {
              await autoUpdateStockOnRetour({
                entrepriseId: entrepriseId,
                codeBarre: ligne.vente.codeBarre,
                quantiteRetour: ligne.quantite,
                dateRetour: retour.createdAt || new Date()
              }, prisma);
              
              console.log(`✅ Stock mis à jour pour ${ligne.vente.codeBarre}: ${ligne.quantite} unités`);
            } else {
              console.log(`⚠️ Impossible de mettre à jour le stock: ligne sans codeBarre`);
            }
          }
          
          console.log(`✅ ${lignesAvecDetails.length} mouvements de stock mis à jour`);
        } catch (stockError) {
          // Ne pas bloquer la création du retour en cas d'erreur de stock
          console.error("❌ Erreur lors de la mise à jour du stock:", stockError);
        }
      }
      
      // Nettoyer immédiatement après succès
      retoursEnCours.delete(commandeKey);

      // Envoyer la réponse
      event.sender.send("/retour/create", { 
        success: true, 
        retour,
        requestId,
        commandeId,
        message: "Retour effectué avec succès"
      });

    } catch (error) {
      console.error("❌ Erreur création retour:", error);
      
      // Nettoyer en cas d'erreur
      retoursEnCours.delete(commandeKey);
      
      event.sender.send("/retour/create", {
        success: false,
        error: error.message,
        code: "RETOUR_ERROR",
        requestId,
        commandeId
      });
    }
  });

  /**
   * 🟩 GET retours d'une commande
   */
  ipcMain.on("/retour/getByCommande", async (event, data) => {
    try {
      const { commandeId } = data;

      const retours = await retourService.getRetoursByCommande(commandeId);

      event.sender.send("/retour/getByCommande", {
        success: true,
        retours,
      });

    } catch (error) {
      console.error("❌ Erreur /retour/getByCommande:", error);
      event.sender.send("/retour/getByCommande", {
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * 🟥 CANCEL retour
   */
  ipcMain.on("/retour/cancel", async (event, data) => {
    try {
      const { retourId } = data;

      const retour = await retourService.cancelRetour(retourId);

      event.sender.send("/retour/cancel", {
        success: true,
        retour,
      });

    } catch (error) {
      console.error("❌ Erreur /retour/cancel:", error);
      event.sender.send("/retour/cancel", {
        success: false,
        error: error.message,
      });
    }
  });
}

// Ajoutez cette fonction dans RetourApi
ipcMain.on("/retour/by-date-range", async (event, data) => {
    try {
        const { entrepriseId, dateDebut, dateFin } = data;
        
        const retours = await prisma.retour.findMany({
            where: {
                entrepriseId: entrepriseId,
                createdAt: {
                    gte: new Date(dateDebut),
                    lte: new Date(dateFin)
                }
            },
            include: {
                lignes: {
                    include: {
                        vente: {
                            select: {
                                codeBarre: true,
                                designation: true,
                                totalTTC: true,
                                quantite: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Formater les données
        const formattedRetours = retours.map(retour => ({
            id: retour.id,
            commandeId: retour.commandeId,
            totalRetour: Number(retour.totalRetour),
            createdAt: retour.createdAt.toISOString(),
            lignes: retour.lignes.map(ligne => ({
                id: ligne.id,
                quantite: ligne.quantite,
                montant: Number(ligne.montant),
                vente: {
                    codeBarre: ligne.vente.codeBarre,
                    designation: ligne.vente.designation,
                    totalTTC: Number(ligne.vente.totalTTC),
                    quantite: ligne.vente.quantite
                }
            }))
        }));

        event.sender.send("/retour/by-date-range", formattedRetours);
    } catch (error) {
        console.error("❌ Erreur /retour/by-date-range:", error);
        event.sender.send("/retour/by-date-range", []);
    }
});

/**
 * 🔐 Récupération session active
 */
function getActiveSession() {
  try {
    if (global.session) {
      return global.session;
    }
    console.log("⚠️ Aucune session active");
    return null;
  } catch (err) {
    console.error("❌ getActiveSession error:", err);
    return null;
  }
}