// src/main/service/retourService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction pour valider l'utilisateur avec gestion spécifique
async function validateUserForOperation(tx: any, userId: string, entrepriseId: string) {
    console.log("🔍 [VALIDATION] Vérification utilisateur:", { userId, entrepriseId });
    
    if (!userId) {
        throw new Error("User ID est requis pour effectuer un retour");
    }
    
    // Chercher l'utilisateur
    const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
            entreprise: true,
            magasin: true
        }
    });
    
    if (!user) {
        console.error("❌ [VALIDATION] Utilisateur non trouvé avec ID:", userId);
        throw new Error(`Utilisateur introuvable. Veuillez vous reconnecter.`);
    }
    
    console.log("✅ [VALIDATION] Utilisateur trouvé:", {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        isBootstrap: user.isBootstrap,
        isDefaultAdmin: user.isDefaultAdmin,
        entrepriseId: user.entrepriseId,
        isActive: user.isActive
    });
    
    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
        throw new Error("Votre compte est désactivé. Contactez l'administrateur.");
    }
    
    // Gestion spécifique de l'admin bootstrap
    if (user.isBootstrap || user.isDefaultAdmin) {
        console.log("⚠️ [VALIDATION] Utilisateur est un admin spécial:", {
            isBootstrap: user.isBootstrap,
            isDefaultAdmin: user.isDefaultAdmin,
            pin: user.pin
        });
    }
    
    // Vérifier la cohérence de l'entreprise
    if (user.entrepriseId !== entrepriseId) {
        console.warn("⚠️ [VALIDATION] L'entrepriseId fourni ne correspond pas", {
            userEntrepriseId: user.entrepriseId,
            providedEntrepriseId: entrepriseId
        });
        
        // Pour la cohérence, utiliser l'entrepriseId de l'utilisateur
        return { 
            user, 
            effectiveEntrepriseId: user.entrepriseId || entrepriseId 
        };
    }
    
    return { user, effectiveEntrepriseId: entrepriseId };
}

export const retourService = {
  createRetourForCommande: async (
    commandeId: string,
    retourLignes: Array<{ venteId: string; quantite: number }>,
    userId: string,
    entrepriseId: string
  ) => {
    console.log("🔵 [RETOUR SERVICE] ===== DÉBUT createRetourForCommande =====");
    console.log("📋 Paramètres:", { 
      commandeId, 
      retourLignes: JSON.stringify(retourLignes, null, 2),
      userId, 
      entrepriseId 
    });
    
    return prisma.$transaction(async (tx) => {
      // 1. VALIDER ET OBTENIR L'UTILISATEUR
      const { user, effectiveEntrepriseId } = await validateUserForOperation(tx, userId, entrepriseId);
      
      if (!effectiveEntrepriseId) {
        throw new Error("Impossible de déterminer l'entreprise pour le retour");
      }
      
      console.log("👤 [RETOUR] Utilisateur validé pour le retour:", {
        nomComplet: `${user.prenom} ${user.nom}`,
        userId: user.id,
        entrepriseId: effectiveEntrepriseId
      });

      // 2. VÉRIFIER LA COMMANDE
      const commande = await tx.commande.findUnique({
        where: { id: commandeId },
        include: {
          ventes: true,
          user: {
            include: {
              entreprise: true,
              magasin: true
            }
          },
        },
      });

      if (!commande) throw new Error("Commande introuvable");
      if (commande.annule) throw new Error("Commande déjà annulée");

      console.log("📦 [RETOUR] Commande trouvée:", {
        commandeId: commande.id,
        client: `${commande.user.prenom} ${commande.user.nom}`,
        entrepriseCommande: commande.user.entrepriseId,
        nombreVentes: commande.ventes.length
      });

      // 3. VÉRIFIER LES PERMISSIONS (même entreprise)
      if (commande.user.entrepriseId !== effectiveEntrepriseId) {
        throw new Error("Vous n'avez pas les permissions pour effectuer un retour sur cette commande. Entreprise différente.");
      }

      // 4. PRÉPARER LES DONNÉES POUR LES PRODUITS
      const venteIds = retourLignes.map(l => l.venteId);
      const codeBarres = commande.ventes
        .filter(v => venteIds.includes(v.id))
        .map(v => v.codeBarre)
        .filter(Boolean);

      const produits = await tx.produit.findMany({
        where: { codeBarre: { in: codeBarres } },
        include: {
          magasinProduits: {
            where: { magasinId: commande.user.magasinId || undefined }
          }
        }
      });

      console.log("📊 [RETOUR] Produits récupérés:", produits.length);

      // 5. TRAITER CHAQUE LIGNE DE RETOUR
      let totalRetour = 0;
      const lignesAvecMontants = [];

      for (const ligne of retourLignes) {
        const vente = commande.ventes.find(v => v.id === ligne.venteId);
        if (!vente) throw new Error(`Vente ${ligne.venteId} introuvable dans la commande`);

        console.log("🔍 [RETOUR LIGNE] Détails vente:", {
          venteId: vente.id,
          designation: vente.designation,
          quantiteVendue: vente.quantite,
          retourQuantite: vente.retourQuantite,
          quantiteDisponible: vente.quantite - vente.retourQuantite,
          quantiteDemandee: ligne.quantite
        });

        const quantiteDisponible = vente.quantite - vente.retourQuantite;
        if (ligne.quantite > quantiteDisponible) {
          throw new Error(`Quantité trop élevée pour ${vente.designation}. Maximum disponible: ${quantiteDisponible}`);
        }

        const montantParUnite = Number(vente.totalTTC) / Number(vente.quantite);
        const montantLigne = montantParUnite * ligne.quantite;
        totalRetour += montantLigne;

        lignesAvecMontants.push({
          venteId: ligne.venteId,
          quantite: ligne.quantite,
          montant: montantLigne,
        });

        // Mettre à jour la vente (incrémenter le retour)
        console.log(`🔄 [RETOUR] Mise à jour vente ${vente.id}: +${ligne.quantite} unités`);
        await tx.vente.update({
          where: { id: ligne.venteId },
          data: {
            retourQuantite: { increment: ligne.quantite },
          },
        });

        // Mettre à jour le stock si produit de type MAGASIN
        const produit = produits.find(p => p.codeBarre === vente.codeBarre);
        if (produit && produit.type === "MAGASIN" && produit.magasinProduits.length > 0) {
          const magasinProduit = produit.magasinProduits[0];
          console.log(`🔄 [RETOUR] Mise à jour stock produit ${produit.id}: +${ligne.quantite} unités`);
          await tx.magasinProduit.update({
            where: { id: magasinProduit.id },
            data: {
              quantite: { increment: ligne.quantite },
            },
          });
        }
      }

      console.log("💰 [RETOUR] Total du retour calculé:", totalRetour);

      // 6. CRÉER L'ENREGISTREMENT DE RETOUR AVEC L'UTILISATEUR
      const retour = await tx.retour.create({
        data: {
          commandeId,
          totalRetour,
          entrepriseId: effectiveEntrepriseId,
          userId: user.id, // ← ASSOCIATION CRITIQUE : lier le retour à l'utilisateur
          lignes: {
            create: lignesAvecMontants.map(ligne => ({
              venteId: ligne.venteId,
              quantite: ligne.quantite,
              montant: ligne.montant,
              entrepriseId: effectiveEntrepriseId,
            })),
          },
        },
        include: {
          lignes: {
            include: {
              vente: true,
            },
          },
          commande: true,
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              role: true,
              isBootstrap: true,
              isDefaultAdmin: true
            }
          }
        },
      });

      console.log("✅ [RETOUR] Retour créé avec succès:", {
        retourId: retour.id,
        utilisateur: `${retour.user?.prenom} ${retour.user?.nom}`,
        userId: retour.userId,
        totalRetour: retour.totalRetour,
        nombreLignes: retour.lignes.length
      });

      // 7. VÉRIFIER SI LA COMMANDE EST COMPLÈTEMENT RETOURNÉE
      const toutesVentes = commande.ventes;
      const totalRetourne = toutesVentes.reduce((sum, v) => sum + v.retourQuantite, 0);
      const totalQuantite = toutesVentes.reduce((sum, v) => sum + v.quantite, 0);

      if (totalRetourne === totalQuantite) {
        console.log("⚠️ [RETOUR] Commande complètement retournée, marquage comme annulée");
        await tx.commande.update({
          where: { id: commandeId },
          data: { annule: true },
        });
      }
      
      console.log("🟢 [RETOUR SERVICE] ===== FIN createRetourForCommande =====");
      return retour;
    });
  },

  getRetoursByCommande: async (commandeId: string) => {
    return prisma.retour.findMany({
      where: { commandeId },
      include: {
        lignes: {
          include: {
            vente: true,
          },
        },
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  },

  getRetoursByEntreprise: async (entrepriseId: string) => {
    return prisma.retour.findMany({
      where: { entrepriseId },
      include: {
        commande: {
          include: {
            user: true,
          },
        },
        lignes: {
          include: {
            vente: true,
          },
        },
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  },

  cancelRetour: async (retourId: string, userId: string) => {
    console.log("🔴 [RETOUR] Annulation du retour:", { retourId, userId });
    
    return prisma.$transaction(async (tx) => {
      // Valider l'utilisateur qui demande l'annulation
      const currentUser = await tx.user.findUnique({
        where: { id: userId }
      });
      
      if (!currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      
      const retour = await tx.retour.findUnique({
        where: { id: retourId },
        include: {
          user: true,
          lignes: {
            include: {
              vente: {
                include: {
                  commande: true,
                },
              },
            },
          },
        },
      });

      if (!retour) throw new Error("Retour introuvable");
      
      // Vérifier les permissions : créateur du retour OU admin
      const isCreator = retour.userId === userId;
      const isAdmin = currentUser.role === 'ADMIN';
      
      if (!isCreator && !isAdmin) {
        throw new Error("Vous n'êtes pas autorisé à annuler ce retour");
      }

      console.log("🔧 [RETOUR] Annulation autorisée:", {
        isCreator,
        isAdmin,
        createurOriginal: `${retour.user?.prenom} ${retour.user?.nom}`
      });

      // Annuler chaque ligne du retour
      for (const ligne of retour.lignes) {
        console.log(`🔄 [RETOUR] Annulation - vente ${ligne.venteId}: -${ligne.quantite} unités`);
        await tx.vente.update({
          where: { id: ligne.venteId },
          data: {
            retourQuantite: { decrement: ligne.quantite },
          },
        });

        // Restaurer le stock
        const produit = await tx.produit.findFirst({
          where: { codeBarre: ligne.vente.codeBarre },
          include: { magasinProduits: true },
        });

        if (produit && produit.type === "MAGASIN") {
          const magasinProduit = await tx.magasinProduit.findFirst({
            where: {
              produitId: produit.id,
              magasinId: ligne.vente.commande.user.magasinId || undefined,
            },
          });

          if (magasinProduit) {
            console.log(`🔄 [RETOUR] Annulation - stock produit ${produit.id}: -${ligne.quantite} unités`);
            await tx.magasinProduit.update({
              where: { id: magasinProduit.id },
              data: {
                quantite: { decrement: ligne.quantite },
              },
            });
          }
        }
      }

      // Recalculer le statut de la commande
      const toutesVentes = await tx.vente.findMany({
        where: { commandeId: retour.commandeId },
      });

      const totalRetourne = toutesVentes.reduce((sum, v) => sum + v.retourQuantite, 0);
      const totalQuantite = toutesVentes.reduce((sum, v) => sum + v.quantite, 0);

      await tx.commande.update({
        where: { id: retour.commandeId },
        data: { annule: totalRetourne === totalQuantite },
      });

      // Supprimer l'enregistrement de retour
      const deletedRetour = await tx.retour.delete({
        where: { id: retourId },
      });

      console.log("✅ [RETOUR] Retour annulé avec succès");
      return deletedRetour;
    });
  },
};