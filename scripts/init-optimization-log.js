const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS OptimizationLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lastRun TEXT NOT NULL
    );
  `;
  console.log("Table OptimizationLog créée si nécessaire !");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
