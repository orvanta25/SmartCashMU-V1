const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../prisma/dev.db');
const dest = path.join(__dirname, '../data/backups/dev-' + Date.now() + '.db');

fs.copyFileSync(src, dest);
console.log('Backup created at', dest);
