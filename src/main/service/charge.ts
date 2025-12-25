//main/service/charge.ts


import { Charge, CreateChargeDto, SearchChargeDto, UpdateChargeDto, getTotalChargesByDateRange } from "../model/charge";

import { PrismaClient, Prisma } from "@prisma/client";

// ---------- CREATE ----------
export async function createCharge(
  data: { entrepriseId: string; dto: CreateChargeDto },
  prisma: PrismaClient
): Promise<Charge | null> {
  try {
    const { entrepriseId, dto } = data;

    if(!entrepriseId || !dto)return null

    const {
    typeChargeId,
    montant,
    dateEcheance,
    datePaiement,
    dateDebutRepartition,
    dateFinRepartition} = dto

    // ============================================
    // 🚨 CORRECTION : Déterminer automatiquement `paye`
    // ============================================
    const paye = !!datePaiement; // Si datePaiement existe, alors paye = true

    const charge = await prisma.charge.create({
      data: {
        montant: new Prisma.Decimal(montant),
        dateEcheance: new Date(dateEcheance),
        datePaiement: datePaiement ?  new Date(datePaiement) : undefined,
        dateDebutRepartition: new Date(dateDebutRepartition),
        dateFinRepartition: new Date(dateFinRepartition),
        paye: paye, // 🚨 AJOUTER CETTE LIGNE
        entreprise:{
          connect:{
            id:entrepriseId
          },
        },
        typeCharge:{
          connect:{
            id:typeChargeId
          }
        }
      },
    });

    return {...charge,
      montant:Number(charge.montant),
      dateEcheance:charge.dateEcheance.toISOString(),
      datePaiement:charge.datePaiement?.toISOString(),
      dateDebutRepartition:charge.dateDebutRepartition.toISOString(),
      dateFinRepartition:charge.dateFinRepartition.toISOString(),
    };
  } catch (error) {
    console.error("service/charge createCharge: ", error);
    return null;
  }
}
// ---------- FIND ALL ----------
export async function findAllCharge(
  data: { entrepriseId: string; searchParams: SearchChargeDto },
  prisma: PrismaClient
): Promise<Charge[] | null> {
  try {
    const { entrepriseId, searchParams } = data;
    const { typeChargeId,
        statut,
        orderBy,
        orderDirection} = searchParams;

    const whereClause: any[] = [{ entrepriseId }];
    const orderClause: any = {}

    if(statut == "paye"){
      whereClause.push({paye:true})
    }else if(statut == "non_paye"){
      whereClause.push({paye:false})
    }

    if(typeChargeId)whereClause.push({typeChargeId:typeChargeId})

    switch(orderBy){
      case "createdAt":
        orderClause.createdAt = orderDirection
        break
      case "dateEcheance":
        orderClause.dateEcheance = orderDirection
        break
      case "datePaiement":
        orderClause.datePaiement = orderDirection
    }

    const charges = await prisma.charge.findMany({
      where: { AND: whereClause },
      include: { typeCharge: true },
      orderBy: orderClause,
    });

    if(charges){
      return charges.map(charge=>(
      {...charge,
      montant:Number(charge.montant),
      dateEcheance:charge.dateEcheance.toISOString(),
      datePaiement:charge.datePaiement?.toISOString(),
      dateDebutRepartition:charge.dateDebutRepartition.toISOString(),
      dateFinRepartition:charge.dateFinRepartition.toISOString(),
    }
      ))
    }
    return null
    
  } catch (error) {
    console.error("service/charge findAllCharge: ", error);
    return null;
  }
}

// ---------- FIND BY ID ----------
export async function findChargeById(
  data: { entrepriseId: string; id: string },
  prisma: PrismaClient
): Promise<Charge | null> {
  try {
    const { entrepriseId, id } = data;

    if(!entrepriseId || !id)return null

    const charge = await prisma.charge.findFirst({
      where: { id, entrepriseId },
      include: { typeCharge: true },
    });

    if(charge) return{...charge,
      montant:Number(charge.montant),
      dateEcheance:charge.dateEcheance.toISOString(),
      datePaiement:charge.datePaiement?.toISOString(),
      dateDebutRepartition:charge.dateDebutRepartition.toISOString(),
      dateFinRepartition:charge.dateFinRepartition.toISOString(),
    };
    return null
  } catch (error) {
    console.error("service/charge findChargeById: ", error);
    return null;
  }
}

// ---------- UPDATE ----------
export async function updateChargeById(
  data: { entrepriseId: string; id: string; dto: UpdateChargeDto },
  prisma: PrismaClient
): Promise<Charge | null> {
  try {
    const { entrepriseId, id, dto } = data;

    if(!entrepriseId || !id || !dto) return null

    const {
      typeChargeId,
    montant,
    dateEcheance,
    datePaiement,
    dateDebutRepartition,
    dateFinRepartition
    } = dto

    const updateClause :any= {typeCharge:{
          connect:{
            id:typeChargeId
          }
        }}

    if(montant)updateClause.montant=new Prisma.Decimal(montant)

    if(dateEcheance)updateClause.dateEcheance=new Date(dateEcheance)

    if(dateDebutRepartition)updateClause.dateDebutRepartition=new Date(dateDebutRepartition)

    if(dateFinRepartition)updateClause.dateFinRepartition=new Date(dateFinRepartition)

    if(datePaiement !== undefined) {
      updateClause.datePaiement = datePaiement ? new Date(datePaiement) : null;
      // ============================================
      // 🚨 CORRECTION : Mettre à jour `paye` automatiquement
      // ============================================
      updateClause.paye = !!datePaiement; // true si datePaiement existe, false sinon
    }

    const charge = await prisma.charge.update({
      where: { id:id },
      data: updateClause,
    });

    
if(charge) return{...charge,
      montant:Number(charge.montant),
      dateEcheance:charge.dateEcheance.toISOString(),
      datePaiement:charge.datePaiement?.toISOString(),
      dateDebutRepartition:charge.dateDebutRepartition.toISOString(),
      dateFinRepartition:charge.dateFinRepartition.toISOString(),
    };
    return null
    
  } catch (error) {
    console.error("service/charge updateChargeById: ", error);
    return null;
  }
}

// ---------- DELETE ----------
export async function deleteChargeById(
  data: { entrepriseId: string; id: string },
  prisma: PrismaClient
): Promise<boolean | null> {
  try {
    const { entrepriseId, id } = data;

    if(!entrepriseId || !id)return null

    const deleted = await prisma.charge.deleteMany({
      where: { id, entrepriseId },
    });

    return deleted.count > 0;
  } catch (error) {
    console.error("service/charge deleteChargeById: ", error);
    return null;
  }
}

// ---------- LAST WEEK ----------
export async function getChargesOfLastWeek(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<Charge[] | null> {
  try {
    const { entrepriseId } = data;


    if(!entrepriseId )return null

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const charges = await prisma.charge.findMany({
      where: {
        entrepriseId,
        createdAt: {
          gte: oneWeekAgo,
          lte: now,
        },
      },
      include: { typeCharge: true },
      orderBy: { createdAt: "desc" },
    });

    if(charges){
      return charges.map(charge=>(
      {...charge,
      montant:Number(charge.montant),
      dateEcheance:charge.dateEcheance.toISOString(),
      datePaiement:charge.datePaiement?.toISOString(),
      dateDebutRepartition:charge.dateDebutRepartition.toISOString(),
      dateFinRepartition:charge.dateFinRepartition.toISOString(),
    }
      ))
    }
    return null
  } catch (error) {
    console.error("service/charge getChargesOfLastWeek: ", error);
    return null;
  }
}

// Nouvelle fonction pour calculer le total des charges sur une période
export async function getTotalChargesByDateRange(
  data: { entrepriseId: string; searchParams: SearchChargeDto },
  prisma: PrismaClient
): Promise<number> {
  try {
    const { entrepriseId, searchParams } = data;
    const {
      datePaiementDebut,
      datePaiementFin,
      statut
    } = searchParams;

    console.log('🔍 [SERVICE] getTotalChargesByDateRange appelé avec:', {
      entrepriseId,
      datePaiementDebut,
      datePaiementFin,
      statut
    });

    const whereClause: any = { entrepriseId };

    if (statut === 'paye') {
      whereClause.paye = true;
      whereClause.datePaiement = {
        not: null
      };
      
      // Ajouter les filtres de date
      if (datePaiementDebut) {
        whereClause.datePaiement.gte = new Date(datePaiementDebut);
      }
      if (datePaiementFin) {
        whereClause.datePaiement.lte = new Date(datePaiementFin);
      }
    } else if (statut === 'non_paye') {
      whereClause.paye = false;
    }

    console.log('🔍 [SERVICE] Clause WHERE:', JSON.stringify(whereClause, null, 2));

    // ============================================
    // 🚨 CORRECTION : Supprimez 'designation' car il n'existe pas dans le modèle
    // ============================================
    // D'abord, récupérez les charges pour voir ce qui est trouvé
    const charges = await prisma.charge.findMany({
      where: whereClause,
      select: {
        id: true,
        montant: true,
        datePaiement: true,
        paye: true,
        typeCharge: {
          select: {
            nom: true
          }
        }
      }
    });

    console.log(`🔍 [SERVICE] ${charges.length} charge(s) trouvée(s) dans la période:`);
    
    if (charges.length > 0) {
      console.log('🔍 [SERVICE] Détail des charges trouvées:');
      charges.forEach(charge => {
        console.log(`  - ${charge.typeCharge?.nom || 'Sans nom'}: ${charge.montant}€, 
          Payé: ${charge.paye}, 
          Date paiement: ${charge.datePaiement ? charge.datePaiement.toISOString() : 'null'}`);
      });
    } else {
      console.log('⚠️ [SERVICE] AUCUNE charge trouvée avec ces critères');
      
      // Pour déboguer, vérifiez quelles charges existent
      const allCharges = await prisma.charge.findMany({
        where: { entrepriseId },
        select: {
          id: true,
          montant: true,
          datePaiement: true,
          paye: true,
          typeCharge: {
            select: {
              nom: true
            }
          }
        },
        take: 5
      });
      
      console.log(`🔍 [SERVICE] Exemples de charges en base (${allCharges.length} total):`);
      allCharges.forEach(charge => {
        console.log(`  - ${charge.typeCharge?.nom || 'Sans nom'}: ${charge.montant}€, 
          Date paiement: ${charge.datePaiement ? charge.datePaiement.toISOString() : 'null'},
          Payé: ${charge.paye}`);
      });
    }

    // Récupérer le total des charges
    const result = await prisma.charge.aggregate({
      where: whereClause,
      _sum: {
        montant: true
      }
    });

    const total = Number(result._sum.montant) || 0;
    console.log(`💰 [SERVICE] Total calculé: ${total}€`);

    return total;
  } catch (error) {
    console.error("❌ [SERVICE] Erreur getTotalChargesByDateRange:", error);
    return 0;
  }
}