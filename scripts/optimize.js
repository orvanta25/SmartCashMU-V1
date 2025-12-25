const { execSync } = require('child_process');
execSync('sqlite3 data/dev.db "VACUUM;"', { stdio: 'inherit' });
console.log('Database vacuum completed');
