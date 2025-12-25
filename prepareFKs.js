const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function prepareFKs() {
  // Créer l'entreprise "test"
  await prisma.entreprise.upsert({
    where: { id: "test-entreprise" },
    update: {},
    create: {
      id: "test-entreprise",
      nom: "Entreprise Test"
    }
  });

  // Créer la catégorie "test" en liant à l'entreprise existante
  await prisma.categorie.upsert({
    where: { id: "test-categorie" },
    update: {},
    create: {
      id: "test-categorie",
      nom: "Catégorie Test",
      entrepriseId: "test-entreprise" // <- lien avec l'entreprise créée
    }
  });

  console.log("✅ Clés étrangères prêtes !");
}

prepareFKs()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
