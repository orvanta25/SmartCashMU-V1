const { execSync } = require('child_process')

console.log('Setting up Prisma for Electron...')

try {
  // Générer le client Prisma directement dans node_modules/.prisma/client
  execSync('npx prisma generate', { stdio: 'inherit' })

  // Mettre la DB à jour si besoin
  execSync('npx prisma db push', { stdio: 'inherit' })

  console.log('Prisma client generated and database synced successfully')
} catch (err) {
  console.error('Error generating Prisma client or syncing database:', err)
  process.exit(1)
}