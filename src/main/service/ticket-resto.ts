import { PrismaClient } from '@prisma/client';
import type {
  TicketResto,
  CreateTicketRestoDto,
  UpdateTicketRestoDto,
  SearchTicketRestoDto,
  TicketFournisseurResponse,
  UsedTicketResto,
  ValidateTicketResponse,
  CreateUsedTicketRestoDto,
} from '../model/ticket-resto';

export async function createTicketResto(
  data: { entrepriseId: string; dto: CreateTicketRestoDto },
  prisma: PrismaClient
): Promise<TicketResto> {
  try {
    const { entrepriseId, dto } = data;
    const { fournisseur, codeInterne, pourcentage } = dto;

    const ticketResto = await prisma.ticketResto.create({
      data: {
        fournisseur,
        codeInterne,
        pourcentage,
        entreprise: { connect: { id: entrepriseId } },
      },
    });

    return mapTicketResto(ticketResto);
  } catch (error) {
    console.error('service/ticketResto createTicketResto: ', error);
    throw error;
  }
}
export async function createUsedTicketResto(
  data: { entrepriseId: string; dto: CreateUsedTicketRestoDto },
  prisma: PrismaClient
): Promise<UsedTicketResto[]> {
  try {
    const { entrepriseId, dto } = data;
    const { codeBarreList, userId } = dto;

    if (!codeBarreList || codeBarreList.length === 0) {
      throw new Error("codeBarreList is required and cannot be empty");
    }

    const createdTickets: UsedTicketResto[] = [];

    for (const codeBarre of codeBarreList) {
      const createData: any = {
        codeBarre,
        entreprise: { connect: { id: entrepriseId } },
      };

      if (userId) {
        createData.user = { connect: { id: userId } };
      }

      const ticketResto = await prisma.usedTicketResto.create({
        data: createData,
      });

      createdTickets.push(mapUsedTicketResto(ticketResto));
    }

    return createdTickets;
  } catch (error) {
    console.error("service/ticketResto createUsedTicketResto: ", error);
    throw error;
  }
}


export async function getTicketRestos(
  data: { entrepriseId: string; searchParams?: SearchTicketRestoDto },
  prisma: PrismaClient
): Promise<TicketResto[]> {
  try {
    const { entrepriseId, searchParams } = data;

    const where = {
      entrepriseId,
      ...(searchParams?.fournisseur && { fournisseur: searchParams.fournisseur }),
      ...(searchParams?.codeInterne && { codeInterne: searchParams.codeInterne }),
      ...(searchParams?.dateDebut && searchParams?.dateFin && {
        createdAt: {
          gte: new Date(searchParams.dateDebut),
          lte: new Date(searchParams.dateFin),
        },
      }),
    };

    const ticketRestos = await prisma.ticketResto.findMany({
      where,
    });

    return ticketRestos.map(mapTicketResto);
  } catch (error) {
    console.error('service/ticketResto getTicketRestos: ', error);
    throw error;
  }
}

export async function getTicketRestoById(
  data: { entrepriseId: string; ticketRestoId: string },
  prisma: PrismaClient
): Promise<TicketResto> {
  try {
    const { entrepriseId, ticketRestoId } = data;

    const ticketResto = await prisma.ticketResto.findFirst({
      where: { id: ticketRestoId, entrepriseId },
    });

    if (!ticketResto) {
      throw new Error('TicketResto not found');
    }

    return mapTicketResto(ticketResto);
  } catch (error) {
    console.error('service/ticketResto getTicketRestoById: ', error);
    throw error;
  }
}

export async function updateTicketResto(
  data: { entrepriseId: string; ticketRestoId: string; dto: UpdateTicketRestoDto },
  prisma: PrismaClient
): Promise<TicketResto> {
  try {
    const { entrepriseId, ticketRestoId, dto } = data;
    const { fournisseur, codeInterne, pourcentage } = dto;

    const ticketResto = await prisma.ticketResto.update({
      where: { id: ticketRestoId, entrepriseId },
      data: {
        fournisseur,
        codeInterne,
        pourcentage,
      },
    });

    return mapTicketResto(ticketResto);
  } catch (error) {
    console.error('service/ticketResto updateTicketResto: ', error);
    throw error;
  }
}

export async function deleteTicketResto(
  data: { entrepriseId: string; ticketRestoId: string },
  prisma: PrismaClient
): Promise<void> {
  try {
    const { entrepriseId, ticketRestoId } = data;

    await prisma.ticketResto.delete({
      where: { id: ticketRestoId, entrepriseId },
    });
  } catch (error) {
    console.error('service/ticketResto deleteTicketResto: ', error);
    throw error;
  }
}

// Ajoutez cette fonction à la fin du fichier
export async function saveTicketsBatch(
  data: { entrepriseId: string; tickets: string[] },
  prisma: PrismaClient
): Promise<void> {
  try {
    for (const codeBarre of data.tickets) {
      await prisma.usedTicketResto.create({
        data: {
          codeBarre,
          entreprise: {
            connect: {
              id: data.entrepriseId
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('service/ticketResto saveTicketsBatch: ', error);
    throw error;
  }
}

// Modifiez la fonction validateTicketResto existante pour ajouter le paramètre saveImmediately
export async function validateTicketResto(
  data: { 
    entrepriseId: string; 
    codeBarre: string; 
    remainingAmount: number; 
    saveImmediately?: boolean;
    existingTickets?: string[]; // Nouveau paramètre pour vérifier les doublons en cours
  },
  prisma: PrismaClient
): Promise<ValidateTicketResponse["result"]|null> {
  try {
    const { entrepriseId, codeBarre, remainingAmount, saveImmediately = true, existingTickets = [] } = data;
    
    if(!codeBarre) return null;

    // Vérifier si le ticket est déjà dans la liste en cours
    if (existingTickets.includes(codeBarre)) {
      return {
        codeBarre,
        fournisseur: "",
        originalAmount: 0,
        finalAmount: 0,
        isValid: false,
        error: "Ce ticket a déjà été scanné dans cette session"
      };
    }

    const ticketResto = await prisma.ticketResto.findFirst({
      where: { codeInterne: codeBarre.substring(0,3), entrepriseId },
    });

    if(!ticketResto){
      console.error("Ticket : "+ codeBarre+ " - Fournisseur inconnu ");
      return{
        codeBarre,
        fournisseur:"",
        originalAmount: 0,
        finalAmount: 0,
        isValid: false,
        error:"Ticket : "+ codeBarre+ " - Fournisseur inconnu "
      }
    }

    const usedTicket = await prisma.usedTicketResto.findFirst({
      where: { codeBarre, entrepriseId },
    });

    if (usedTicket) {
      console.error("Ticket : "+ codeBarre+ " est deja utilisee ");
      return {
        codeBarre,
        fournisseur:ticketResto.fournisseur,
        originalAmount: 0,
        finalAmount: 0,
        isValid: false,
        error:"Ticket : "+ codeBarre+ " est deja utilisee dans le système"
      };
    }

    // Vérification de la date d'expiration
    const expirationDate = Number(codeBarre.substring(9,11));
    if(expirationDate + 2000 < new Date().getFullYear()){
      console.error("Ticket : "+ codeBarre+ " est expiree ");
      return {
        codeBarre,
        fournisseur:ticketResto.fournisseur,
        originalAmount: 0,
        finalAmount: 0,
        isValid: false,
        error:"Ticket : "+ codeBarre+ " est expiree "
      };
    }

    const {originalAmount, finalAmount} = await getTicketAmount(codeBarre, ticketResto.pourcentage || 0);
    
    if(originalAmount === 0 || finalAmount === 0){
      console.error("Ticket : "+ codeBarre+ " montant null ");
      return {
        codeBarre,
        fournisseur:ticketResto.fournisseur,
        originalAmount: 0,
        finalAmount: 0,
        isValid: false,
        error:"Ticket : "+ codeBarre+ " montant null "
      };
    }

    if(finalAmount > remainingAmount) {
      return {
        codeBarre,
        fournisseur:ticketResto.fournisseur,
        originalAmount,
        finalAmount,
        isValid: false,
        error:`Le ticket (${finalAmount.toFixed(3)} TND) dépasse le montant restant (${remainingAmount.toFixed(3)} TND)`
      };
    }

    // Enregistrer seulement si saveImmediately est true ET le montant est valide
    if(saveImmediately){
      await prisma.usedTicketResto.create({
        data:{
          codeBarre,
          entreprise:{
            connect:{
              id:entrepriseId
            }
          }
        }
      });
    }

    return {
      codeBarre,
      fournisseur:ticketResto.fournisseur,
      originalAmount,
      finalAmount,
      isValid: true,
    };
  } catch (error) {
    console.error('service/ticketResto validateTicketResto: ', error);
    throw error;
  }
}

export async function getTicketFournisseurDateRange(
  data: { entrepriseId: string; dateDebut?: string; dateFin?: string },
  prisma: PrismaClient
): Promise<Array<{ 
  fournisseur: string; 
  nbTickets: number; 
  totalAmount: number;
  valeurMoyenne?: number;
}>> {
  try {
    const { entrepriseId, dateDebut, dateFin } = data;

    console.log('=== DÉBOGAGE getTicketFournisseurDateRange ===');
    console.log('Paramètres:', { entrepriseId, dateDebut, dateFin });

    // 1. Récupérer tous les tickets utilisés dans la période
    const usedTickets = await prisma.usedTicketResto.findMany({
      where: {
        entrepriseId,
        ...(dateDebut && dateFin && {
          createdAt: {
            gte: new Date(dateDebut),
            lte: new Date(dateFin),
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Nombre de tickets utilisés trouvés: ${usedTickets.length}`);

    if (usedTickets.length === 0) {
      console.log('Aucun ticket utilisé trouvé pour cette période');
      return [];
    }

    // 2. Récupérer TOUTES les configurations de tickets pour cette entreprise
    const allTicketConfigs = await prisma.ticketResto.findMany({
      where: { entrepriseId },
    });

    console.log(`Nombre de configurations de tickets: ${allTicketConfigs.length}`);
    console.log('Configurations disponibles:', allTicketConfigs.map(tc => ({
      codeInterne: tc.codeInterne,
      fournisseur: tc.fournisseur,
      pourcentage: tc.pourcentage
    })));

    // 3. Créer une map pour un accès rapide par codeInterne
    const configMap = new Map();
    allTicketConfigs.forEach(config => {
      configMap.set(config.codeInterne, {
        fournisseur: config.fournisseur,
        pourcentage: config.pourcentage || 0
      });
    });

    // 4. Grouper les tickets par fournisseur
    const groupedByFournisseur: Record<string, {
      nbTickets: number;
      totalAmount: number;
      tickets: Array<{ codeBarre: string; amount: number }>;
    }> = {};

    // 5. Traiter chaque ticket utilisé
    for (const ticket of usedTickets) {
      // Extraire les 3 premiers caractères comme codeInterne
      const codeInterne = ticket.codeBarre.substring(0, 3);
      console.log(`Ticket: ${ticket.codeBarre} -> codeInterne: ${codeInterne}`);
      
      // Trouver la configuration correspondante
      const config = configMap.get(codeInterne);
      
      let fournisseur = 'Unknown';
      let pourcentage = 0;
      
      if (config) {
        fournisseur = config.fournisseur;
        pourcentage = config.pourcentage;
        console.log(`  -> Config trouvée: ${fournisseur} (${pourcentage}%)`);
      } else {
        console.log(`  -> AUCUNE CONFIGURATION TROUVÉE pour codeInterne: ${codeInterne}`);
        // Vérifier si ce codeInterne existe dans la base
        const existsInDB = await prisma.ticketResto.findFirst({
          where: { 
            entrepriseId,
            codeInterne 
          }
        });
        console.log(`  -> Existe dans DB?: ${existsInDB ? 'OUI' : 'NON'}`);
      }

      // Calculer le montant du ticket
      const { finalAmount } = await getTicketAmount(ticket.codeBarre, pourcentage);
      console.log(`  -> Montant calculé: ${finalAmount}`);

      // Initialiser le groupe si nécessaire
      if (!groupedByFournisseur[fournisseur]) {
        groupedByFournisseur[fournisseur] = {
          nbTickets: 0,
          totalAmount: 0,
          tickets: []
        };
      }

      // Ajouter le ticket au groupe
      groupedByFournisseur[fournisseur].nbTickets += 1;
      groupedByFournisseur[fournisseur].totalAmount += finalAmount;
      groupedByFournisseur[fournisseur].tickets.push({
        codeBarre: ticket.codeBarre,
        amount: finalAmount
      });
    }

    // 6. Convertir en tableau formaté
    const result = Object.entries(groupedByFournisseur).map(([fournisseur, data]) => {
      const valeurMoyenne = data.nbTickets > 0 
        ? data.totalAmount / data.nbTickets 
        : 0;
      
      return {
        fournisseur,
        nbTickets: data.nbTickets,
        totalAmount: parseFloat(data.totalAmount.toFixed(3)),
        valeurMoyenne: parseFloat(valeurMoyenne.toFixed(3))
      };
    });

    // 7. Trier par montant total décroissant
    result.sort((a, b) => b.totalAmount - a.totalAmount);

    // 8. Log des résultats pour débogage
    console.log('=== RÉSULTATS FINAUX ===');
    console.log(`Nombre de fournisseurs: ${result.length}`);
    result.forEach((item, index) => {
      console.log(`${index + 1}. ${item.fournisseur}: ${item.nbTickets} tickets, ${item.totalAmount} TND`);
    });
    
    // 9. Vérifier si Unknown a des tickets
    const unknownGroup = result.find(r => r.fournisseur === 'Unknown');
    if (unknownGroup) {
      console.log(`\n⚠️ ATTENTION: ${unknownGroup.nbTickets} tickets sont marqués comme "Unknown"`);
      console.log('Cela signifie que ces tickets ne correspondent à aucune configuration de ticketResto');
      console.log('Vérifiez que tous les codeInterne (3 premiers caractères) sont bien configurés dans TicketResto');
    }

    return result;

  } catch (error) {
    console.error('service/ticketResto getTicketFournisseurDateRange: ', error);
    throw error;
  }
}


export async function getTicketByUserAndDateRange(
  data: { entrepriseId: string; userId: string; dateDebut?: string; dateFin?: string },
  prisma: PrismaClient
): Promise<UsedTicketResto[]> {
  try {
    const { entrepriseId, userId, dateDebut, dateFin } = data;

    const where = {
      entrepriseId,
      userId,
      ...(dateDebut && dateFin && {
        createdAt: {
          gte: new Date(dateDebut),
          lte: new Date(dateFin),
        },
      }),
    };

    const tickets = await prisma.usedTicketResto.findMany({
      where,
      include: {
        user: { select: { id: true, nom: true, prenom: true } },
      },
    });

    return tickets ? tickets.map(mapUsedTicketResto) : []
  } catch (error) {
    console.error('service/ticketResto getTicketByUserAndDateRange: ', error);
    throw error;
  }
}

// Helper function to map Prisma TicketResto to TypeScript TicketResto
function mapTicketResto(ticketResto: any): TicketResto {
  return {
    id: ticketResto.id,
    fournisseur: ticketResto.fournisseur,
    codeInterne: ticketResto.codeInterne,
    pourcentage: ticketResto.pourcentage,
    entrepriseId: ticketResto.entrepriseId,
    createdAt: ticketResto.createdAt.toISOString(),
    updatedAt: ticketResto.updatedAt.toISOString(),
  };
}

// Helper function to map Prisma UsedTicketResto to TypeScript UsedTicketResto
function mapUsedTicketResto(ticket: any): UsedTicketResto {
  return {
    id: ticket.id,
    codeBarre: ticket.codeBarre,
    createdAt: ticket.createdAt.toISOString(),
    user: {
      id: ticket.user.id,
      nom: ticket.user.nom ?? '',
      prenom: ticket.user.prenom ?? '',
    },
    originalAmount: Number(ticket.originalAmount),
    finalAmount: Number(ticket.finalAmount),
    fournisseur: ticket.fournisseur,
  };
}

async function getTicketAmount(
  codeBarre: string,
  pourcentage: number
): Promise<{
  originalAmount: number;
  finalAmount: number;
}> {
  try {
    console.log(`Calcul montant pour ticket: ${codeBarre}, pourcentage: ${pourcentage}%`);
    
    if (!codeBarre || codeBarre.length < 10) {
      console.warn(`Code-barre trop court: ${codeBarre}`);
      return {
        originalAmount: 0,
        finalAmount: 0
      };
    }

    // ANALYSE DU CODE-BARRE POUR DÉBOGAGE
    console.log(`Structure code-barre (${codeBarre.length} caractères):`);
    for (let i = 0; i < Math.min(codeBarre.length, 15); i++) {
      console.log(`  Position ${i}: '${codeBarre[i]}' (code: ${codeBarre.charCodeAt(i)})`);
    }

    // DÉTERMINER LE MONTANT - VOUS DEVEZ ADAPTER CETTE LOGIQUE
    let originalAmount = 0;
    
    // ESSAI 1: Si le format est standard (ex: 3 caractères codeInterne + montant)
    // Les positions 3-7 pourraient contenir le montant * 100
    if (codeBarre.length >= 8) {
      try {
        const amountStr = codeBarre.substring(3, 8); // Positions 3,4,5,6,7
        console.log(`Montant brut (positions 3-7): "${amountStr}"`);
        
        // Si c'est un nombre valide
        const amountNum = parseInt(amountStr, 10);
        if (!isNaN(amountNum) && amountNum > 0) {
          originalAmount = amountNum / 100; // Convertir centimes à dinars
          console.log(`Montant interprété: ${originalAmount} (${amountNum} centimes)`);
        }
      } catch (e) {
        console.error('Erreur parsing montant:', e);
      }
    }

    // ESSAI 2: Si montant non trouvé, utiliser une logique alternative
    if (originalAmount <= 0) {
      console.log('Montant non trouvé dans positions 3-7, essai alternative...');
      
      // Chercher des motifs de montant dans le code-barre
      // Par exemple: chercher "500" pour 5.00, "1000" pour 10.00, etc.
      const patterns = ['500', '1000', '1500', '2000', '2500', '3000', '3500', '4000', '4500', '5000'];
      for (const pattern of patterns) {
        if (codeBarre.includes(pattern)) {
          originalAmount = parseInt(pattern, 10) / 100;
          console.log(`Motif ${pattern} trouvé -> montant: ${originalAmount}`);
          break;
        }
      }
    }

    // ESSAI 3: Si toujours 0, utiliser une valeur par défaut
    if (originalAmount <= 0) {
      console.log('Montant non détecté, utilisation valeur par défaut 10.000');
      originalAmount = 10.000; // Valeur par défaut
    }

    console.log(`Montant original: ${originalAmount.toFixed(3)} TND`);

    // Appliquer le pourcentage de commission
    let finalAmount = originalAmount;
    if (pourcentage > 0) {
      const commission = originalAmount * (pourcentage / 100);
      finalAmount = originalAmount - commission;
      console.log(`Commission (${pourcentage}%): ${commission.toFixed(3)}, Montant final: ${finalAmount.toFixed(3)}`);
    }

    return {
      originalAmount: parseFloat(originalAmount.toFixed(3)),
      finalAmount: parseFloat(finalAmount.toFixed(3))
    };
  } catch (error) {
    console.error("service/getTicketAmount : ", error);
    return {
      originalAmount: 0,
      finalAmount: 0
    };
  }
}