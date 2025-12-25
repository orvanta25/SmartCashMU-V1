await prisma.$executeRawUnsafe(`PRAGMA journal_mode = WAL;`);
await prisma.$executeRawUnsafe(`PRAGMA synchronous = NORMAL;`);
await prisma.$executeRawUnsafe(`PRAGMA temp_store = MEMORY;`);
await prisma.$executeRawUnsafe(`PRAGMA cache_size = -2000;`); 
