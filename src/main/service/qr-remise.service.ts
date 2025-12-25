import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const prisma = new PrismaClient();

export interface CreateRemiseQRConfigDto {
  pourcentage: number;
  joursValidite: number;
  message?: string;
}

export class QRRemiseService {
  
  // 1. Créer ou mettre à jour la configuration (Admin)
  static async createOrUpdateConfig(entrepriseId: string, data: CreateRemiseQRConfigDto) {
    try {
      const existingActive = await prisma.remiseQRConfig.findFirst({
        where: { 
          entrepriseId, 
          isActive: true 
        }
      });

      let config;
      
      if (existingActive) {
        config = await prisma.remiseQRConfig.update({
          where: { id: existingActive.id },
          data: {
            pourcentage: data.pourcentage,
            joursValidite: data.joursValidite,
            message: data.message || existingActive.message,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.remiseQRConfig.updateMany({
          where: { entrepriseId, isActive: true },
          data: { isActive: false }
        });

        config = await prisma.remiseQRConfig.create({
          data: {
            entrepriseId,
            pourcentage: data.pourcentage,
            joursValidite: data.joursValidite,
            message: data.message || "Revenez prochainement pour bénéficier d'une remise!",
            isActive: true
          }
        });
      }

      return { 
        success: true, 
        message: 'Configuration enregistrée avec succès', 
        config 
      };
    } catch (error: any) {
      console.error('Erreur createOrUpdateConfig:', error);
      throw new Error(`Échec de l'enregistrement: ${error.message}`);
    }
  }

  // 2. Récupérer la configuration active
  static async getActiveConfig(entrepriseId: string) {
    try {
      const config = await prisma.remiseQRConfig.findFirst({
        where: { 
          entrepriseId, 
          isActive: true 
        }
      });
      
      return config;
    } catch (error: any) {
      console.error('Erreur getActiveConfig:', error);
      throw error;
    }
  }

  // 3. Générer un ticket QR après une vente
  static async generateTicketAfterVente(venteId: string) {
    try {
      const vente = await prisma.vente.findUnique({
        where: { id: venteId },
        include: { entreprise: true }
      });

      if (!vente) {
        throw new Error('Vente non trouvée');
      }

      const config = await this.getActiveConfig(vente.entrepriseId);
      
      if (!config) {
        return null;
      }

      const existingTicket = await prisma.ticketRemiseQR.findFirst({
        where: { 
          venteId, 
          isUsed: false,
          dateExpiration: { gt: new Date() }
        }
      });

      if (existingTicket) {
        return existingTicket;
      }

      const code = `QR-${uuidv4().substring(0, 8).toUpperCase()}`;
      const dateExpiration = moment().add(config.joursValidite, 'days').toDate();

      const ticket = await prisma.ticketRemiseQR.create({
        data: {
          code,
          configId: config.id,
          venteId,
          pourcentage: config.pourcentage,
          dateExpiration,
          isUsed: false
        },
        include: {
          config: true,
          vente: true
        }
      });

      return ticket;
    } catch (error: any) {
      console.error('Erreur generateTicketAfterVente:', error);
      return null;
    }
  }

  // 4. Scanner et valider un QR code
  static async scanAndApplyQRCode(
    code: string, 
    entrepriseId: string, 
    userId: string,
    commandeId?: string
  ) {
    try {
      const ticket = await prisma.ticketRemiseQR.findUnique({
        where: { code },
        include: { 
          config: true,
          vente: { include: { commande: true } }
        }
      });

      if (!ticket) {
        throw new Error('Code QR invalide ou introuvable');
      }

      if (ticket.config.entrepriseId !== entrepriseId) {
        throw new Error('Ce code ne peut pas être utilisé dans cet établissement');
      }

      if (ticket.isUsed) {
        throw new Error('Ce code a déjà été utilisé');
      }

      if (new Date() > ticket.dateExpiration) {
        throw new Error('Ce code a expiré');
      }

      const updatedTicket = await prisma.ticketRemiseQR.update({
        where: { id: ticket.id },
        data: {
          isUsed: true,
          dateUtilisation: new Date()
        }
      });

      let applicationResult = null;
      
      if (commandeId) {
        applicationResult = await this.applyRemiseToCommande(
          commandeId,
          ticket.pourcentage,
          userId
        );
      }

      return {
        success: true,
        validation: {
          pourcentage: ticket.pourcentage,
          message: `Remise de ${ticket.pourcentage}% validée`,
          dateExpiration: ticket.dateExpiration
        },
        application: applicationResult,
        ticket: updatedTicket
      };
    } catch (error: any) {
      console.error('Erreur scanAndApplyQRCode:', error);
      throw error;
    }
  }

  // 5. Appliquer la remise à une commande
  static async applyRemiseToCommande(commandeId: string, pourcentage: number, userId: string) {
    try {
      const commande = await prisma.commande.findUnique({
        where: { id: commandeId },
        include: { ventes: true }
      });

      if (!commande) {
        throw new Error('Commande non trouvée');
      }

      const totalAvantRemise = Number(commande.total);
      const montantRemise = (totalAvantRemise * pourcentage) / 100;
      const nouveauTotal = totalAvantRemise - montantRemise;

      const updatedCommande = await prisma.commande.update({
        where: { id: commandeId },
        data: {
          total: nouveauTotal,
          remise: { increment: montantRemise }
        }
      });

      return {
        success: true,
        commandeId,
        remiseAppliquee: montantRemise,
        pourcentage: pourcentage,
        totalAvant: totalAvantRemise,
        totalApres: nouveauTotal,
        message: `Remise de ${pourcentage}% appliquée avec succès`
      };
    } catch (error: any) {
      console.error('Erreur applyRemiseToCommande:', error);
      throw error;
    }
  }

 // 6. Préparer les données du QR code (pas le générer)
static async getQRCodeData(ticketId: string) {
  const ticket = await prisma.ticketRemiseQR.findUnique({
    where: { id: ticketId },
    include: { config: true }
  });

  if (!ticket) return null;

  return {
    type: 'QR_REMISE',
    code: ticket.code,
    pourcentage: ticket.pourcentage,
    dateExpiration: ticket.dateExpiration.toISOString(),
    entrepriseId: ticket.config.entrepriseId
  };
}

  // 7. Récupérer les statistiques
  static async getStats(entrepriseId: string) {
    try {
      const config = await this.getActiveConfig(entrepriseId);
      
      const tickets = await prisma.ticketRemiseQR.findMany({
        where: {
          config: {
            entrepriseId
          }
        }
      });

      const now = new Date();
      const used = tickets.filter(t => t.isUsed).length;
      const expired = tickets.filter(t => now > t.dateExpiration && !t.isUsed).length;
      const available = tickets.filter(t => !t.isUsed && now <= t.dateExpiration).length;

      return {
        success: true,
        config,
        totalTickets: tickets.length,
        ticketsUtilises: used,
        ticketsExpires: expired,
        ticketsDisponibles: available,
        tauxUtilisation: tickets.length > 0 ? (used / tickets.length) * 100 : 0,
        derniereGeneration: tickets.length > 0 ? 
          new Date(Math.max(...tickets.map(t => new Date(t.createdAt).getTime()))).toLocaleDateString() 
          : 'Aucune'
      };
    } catch (error: any) {
      console.error('Erreur getStats:', error);
      throw error;
    }
  }

  // 8. Vérifier si une vente a généré un QR code
  static async checkVenteHasQR(venteId: string) {
    try {
      const ticket = await prisma.ticketRemiseQR.findFirst({
        where: { 
          venteId,
          isUsed: false,
          dateExpiration: { gt: new Date() }
        }
      });
      
      return ticket ? { hasQR: true, ticket } : { hasQR: false };
    } catch (error) {
      console.error('Erreur checkVenteHasQR:', error);
      return { hasQR: false };
    }
  }
}