const { PrismaClient, Decimal } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

const ENTREPRISE_ID = "660f9511-f3ab-52e5-b827";
const USER_ID = "cd0af3bb-18ad-4f47-9705-9e167df1a420";

// Génération de produits
async function generateProducts(count) {
  console.log(`🚀 Génération de ${count} PRODUITS...`);

  const batchSize = 5000;

  for (let i = 0; i < count; i += batchSize) {
    const batch = [];

    for (let j = 0; j < Math.min(batchSize, count - i); j++) {
      batch.push({
        id: faker.string.uuid(),
        codeBarre: faker.string.numeric(13),
        designation: faker.commerce.productName(),
        categorieId: "test-categorie",
        entrepriseId: ENTREPRISE_ID,
        puht: new Decimal(faker.number.float({ min: 1, max: 200 })),
        tva: new Decimal(0),
        remise: new Decimal(0),
        stockInitial: faker.number.int({ min: 0, max: 200 }),
        quantite: faker.number.int({ min: 1, max: 50 }),
        featuredOnPos: false,
        active: true,
        isDefaultOperator: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await prisma.produit.createMany({ data: batch });
    console.log(`✔ Batch ${i} → ${i + batch.length} produits créés`);
  }

  console.log("✅ Tous les produits ont été générés !");
}

// Génération de ventes
async function generateVentes(count) {
  console.log(`🚀 Génération de ${count} VENTES...`);

  // Récupérer produits existants
  const produits = await prisma.produit.findMany({
    select: { id: true, codeBarre: true, designation: true, puht: true },
  });

  const startDate = new Date("2024-01-01");
  const endDate   = new Date("2024-12-31");

  for (let i = 0; i < count; i++) {
    const randomDate = faker.date.between({ from: startDate, to: endDate });
    const produit = faker.helpers.arrayElement(produits);

    // Créer la commande associée
    const commande = await prisma.commande.create({
      data: {
        userId: USER_ID,
        entrepriseId: ENTREPRISE_ID,
        total: new Decimal(faker.number.float({ min: 5, max: 500 })),
        tpeAmount: new Decimal(0),
        especeAmount: new Decimal(0),
        ticketAmount: new Decimal(0),
        chequeAmount: new Decimal(0),
        isWaiting: false,
        createdAt: randomDate,
        updatedAt: randomDate,
      },
    });

    // Créer la vente
    await prisma.vente.create({
      data: {
        codeBarre: produit.codeBarre,
        designation: produit.designation,
        puht: produit.puht,
        tva: new Decimal(0),
        remise: new Decimal(0),
        quantite: faker.number.int({ min: 1, max: 10 }),
        totalHT: new Decimal(faker.number.float({ min: 5, max: 500 })),
        totalTTC: new Decimal(faker.number.float({ min: 5, max: 500 })),
        createdAt: randomDate,
        updatedAt: randomDate,
        commandeId: commande.id,
        entrepriseId: ENTREPRISE_ID,
        id: faker.string.uuid(),
      },
    });

    if ((i + 1) % 10 === 0) {
      console.log(`✔ ${i + 1} ventes générées`);
    }
  }

  console.log("✅ Toutes les ventes ont été générées !");
}

// Exécution
async function main() {
  console.log("📌 DÉBUT DU STRESS TEST...");

  await generateProducts(50000);
  await generateVentes(100000);

  console.log("🎉 Stress test complet !");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
