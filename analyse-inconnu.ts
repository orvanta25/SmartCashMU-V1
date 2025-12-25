// analyse-inconnu-correct.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyseInconnuUsers() {
  console.log('🔍 ANALYSE DES UTILISATEURS INCONNU');
  
  try {
    // Trouver tous les utilisateurs avec nom vide ou "Inconnu"
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { 
            nom: { 
              contains: 'inconnu'
              // SUPPRIMÉ: mode: 'insensitive' 
            } 
          },
          { nom: '' },
          { prenom: '' },
          { nom: null },
          { prenom: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        entreprise: { select: { id: true, nom: true } },
        commandes: { 
          take: 5, 
          orderBy: { createdAt: 'desc' },
          select: { id: true, createdAt: true, total: true }
        },
        retours: { 
          take: 5, 
          orderBy: { createdAt: 'desc' },
          select: { id: true, createdAt: true, totalRetour: true }
        }
      }
    });
    
    console.log(`\n📊 ${users.length} utilisateurs problématiques trouvés`);
    
    if (users.length === 0) {
      console.log('✅ Aucun utilisateur problématique trouvé !');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. 👤 ID: ${user.id}`);
      console.log(`   Nom: "${user.nom || '(vide)'}", Prénom: "${user.prenom || '(vide)'}"`);
      console.log(`   Rôle: ${user.role}, Entreprise: ${user.entreprise?.nom || 'N/A'}`);
      console.log(`   Créé le: ${user.createdAt.toLocaleString('fr-FR')}`);
      console.log(`   isBootstrap: ${user.isBootstrap}, isDefaultAdmin: ${user.isDefaultAdmin}`);
      console.log(`   PIN: ${user.pin}`);
      console.log(`   Commandes: ${user.commandes.length}, Retours: ${user.retours.length}`);
      
      if (user.commandes.length > 0) {
        console.log(`   Dernière commande: ${user.commandes[0].createdAt.toLocaleString('fr-FR')} (${user.commandes[0].total} DT)`);
      }
      if (user.retours.length > 0) {
        console.log(`   Dernier retour: ${user.retours[0].createdAt.toLocaleString('fr-FR')} (${user.retours[0].totalRetour} DT)`);
      }
    });
    
    // Analyser par date
    console.log('\n📅 ANALYSE PAR DATE DE CRÉATION');
    const byDate: Record<string, number> = {};
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });
    
    Object.entries(byDate)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 10)
      .forEach(([date, count]) => {
        console.log(`   ${date}: ${count} utilisateur(s) problématique(s)`);
      });
    
    // Analyser par rôle
    console.log('\n👥 ANALYSE PAR RÔLE');
    const byRole: Record<string, number> = {};
    users.forEach(user => {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
    });
    
    Object.entries(byRole).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} utilisateur(s)`);
    });
    
    // Vérifier s'il y a des utilisateurs avec PIN "0000"
    console.log('\n🔐 UTILISATEURS AVEC PIN "0000":');
    const usersWith0000 = users.filter(user => user.pin === '0000');
    console.log(`   ${usersWith0000.length} utilisateur(s) avec PIN 0000`);
    
    // Chercher des patterns dans les noms
    console.log('\n📝 PATTERNS DANS LES NOMS:');
    const nomPatterns: Record<string, number> = {};
    users.forEach(user => {
      const nom = user.nom || '';
      if (nom.includes('inconnu') || nom.includes('Inconnu')) {
        nomPatterns['Inconnu'] = (nomPatterns['Inconnu'] || 0) + 1;
      } else if (nom === '') {
        nomPatterns['Nom vide'] = (nomPatterns['Nom vide'] || 0) + 1;
      } else if (nom === 'ADMIN') {
        nomPatterns['ADMIN'] = (nomPatterns['ADMIN'] || 0) + 1;
      } else {
        nomPatterns[nom] = (nomPatterns[nom] || 0) + 1;
      }
    });
    
    Object.entries(nomPatterns).forEach(([pattern, count]) => {
      console.log(`   "${pattern}": ${count}`);
    });
      
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Analyse terminée');
  }
}

// Exécutez la fonction
analyseInconnuUsers().catch(console.error);