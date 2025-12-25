const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_commande_date ON Commande(date);`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_vente_codebarre ON Vente(codeBarre);`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_produit_categorie ON Produit(categorieId);`;
  console.log('Indexes created successfully');
  await prisma.$disconnect();
}

main();
