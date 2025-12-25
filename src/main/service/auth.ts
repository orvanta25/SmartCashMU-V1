import { EntrepriseType, User, UserRole } from '@prisma/client'
import { LoginResponse } from '../model/auth'

// Fonction pour vérifier si le système a un admin bootstrap
async function hasBootstrapAdmin(prisma) {
    return await prisma.user.findFirst({
        where: { 
            isBootstrap: true,
            pin: '0000' // S'assurer que le PIN est toujours 0000
        }
    });
}

// Fonction pour vérifier si le système est déjà initialisé
async function isSystemInitialized(prisma) {
    const userCount = await prisma.user.count();
    return userCount > 0;
}

// Fonction pour créer l'admin bootstrap (seulement si système vide)
async function createBootstrapAdmin(prisma, ses) {
    // Vérifier une seconde fois qu'il n'y a aucun utilisateur
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
        throw new Error("Le système est déjà initialisé");
    }

    // Créer une entreprise par défaut
    const entreprise = await prisma.entreprise.create({
        data: {
            nom: 'Votre Entreprise',
            telephone: '',
            email: '',
            pays: 'tunisie',
            type: EntrepriseType.FOURNISSEUR,
            denomination: "Entreprise"
        }
    });

    // Créer l'admin bootstrap avec le flag isBootstrap
    const bootstrapAdmin = await prisma.user.create({
        data: {
            nom: 'Administrateur',
            prenom: 'Principal',
            telephone: '',
            pin: '0000',
            role: UserRole.ADMIN,
            magasinId: null,
            entrepriseId: entreprise.id,
            permissions: '',
            isBootstrap: true // ← FLAG IMPORTANT
        }
    });

    ses.setUserAgent(bootstrapAdmin.id);
    return { 
        user: {
            id: bootstrapAdmin.id,
            nom: bootstrapAdmin.nom,
            prenom: bootstrapAdmin.prenom,
            role: bootstrapAdmin.role
        },
        isBootstrap: true // Indique au frontend que c'est le premier login
    };
}

export async function firstLogin(data: { pin: string }, prisma, ses): Promise<LoginResponse> {
    try {
        // 1. Recherche normale par PIN (tous les utilisateurs)
        const userByPin = await prisma.user.findFirst({
            where: { pin: data.pin },
            select: {
                id: true,
                nom: true,
                prenom: true,
                role: true,
                isBootstrap: true
            }
        });

        // Si on trouve un utilisateur avec ce PIN, on le connecte
        if (userByPin && userByPin.id) {
            ses.setUserAgent(userByPin.id);
            return { 
                user: userByPin,
                isBootstrap: userByPin.isBootstrap || false
            };
        }

        // 2. Gestion spéciale du PIN "0000" uniquement pour le bootstrap
        if (data.pin === "0000") {
            // Chercher un admin bootstrap existant
            const bootstrapAdmin = await hasBootstrapAdmin(prisma);
            
            if (bootstrapAdmin) {
                // Admin bootstrap existe -> on le connecte
                ses.setUserAgent(bootstrapAdmin.id);
                return { 
                    user: {
                        id: bootstrapAdmin.id,
                        nom: bootstrapAdmin.nom,
                        prenom: bootstrapAdmin.prenom,
                        role: bootstrapAdmin.role
                    },
                    isBootstrap: true
                };
            } else {
                // Pas d'admin bootstrap -> première installation
                // Vérifier que le système est vraiment vide
                const systemInitialized = await isSystemInitialized(prisma);
                
                if (systemInitialized) {
                    // Système déjà initialisé mais pas d'admin bootstrap
                    // Cela signifie que l'admin bootstrap a déjà été transformé
                    return { 
                        user: null, 
                        error: "Le PIN par défaut n'est plus valide. Utilisez votre PIN personnel." 
                    };
                } else {
                    // Système vide -> créer l'admin bootstrap
                    return await createBootstrapAdmin(prisma, ses);
                }
            }
        }

        // 3. Si on arrive ici, c'est que le PIN est incorrect
        return { user: null, error: "Code PIN incorrect" };
        
    } catch (error) {
        console.error("service/auth firstLogin: ", error);
        return { user: null, error: "Erreur d'authentification. Veuillez réessayer." };
    }
}

// Fonction pour transformer l'admin bootstrap en admin réel
export async function transformBootstrapAdmin(
    prisma, 
    userId: string, 
    data: { 
        nom: string; 
        prenom: string; 
        pin: string; 
        telephone?: string 
    }
): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
        // Vérifier que l'utilisateur est bien l'admin bootstrap
        const bootstrapAdmin = await prisma.user.findFirst({
            where: { 
                id: userId,
                isBootstrap: true,
                pin: '0000' // S'assurer que le PIN n'a pas été changé
            }
        });

        if (!bootstrapAdmin) {
            return { 
                success: false, 
                error: "Action non autorisée. Cet utilisateur n'est pas l'admin bootstrap." 
            };
        }

        // Vérifier que le nouveau PIN n'est pas déjà utilisé
        const existingPin = await prisma.user.findFirst({
            where: { 
                pin: data.pin,
                id: { not: userId }
            }
        });

        if (existingPin) {
            return { 
                success: false, 
                error: "Ce PIN est déjà utilisé par un autre utilisateur." 
            };
        }

        // Mettre à jour l'admin bootstrap avec les nouvelles informations
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                nom: data.nom,
                prenom: data.prenom,
                pin: data.pin,
                telephone: data.telephone || bootstrapAdmin.telephone,
                isBootstrap: false // ← DÉSACTIVER LE FLAG BOOTSTRAP
            },
            select: {
                id: true,
                nom: true,
                prenom: true,
                role: true,
                telephone: true
            }
        });

        return { success: true, user: updatedUser };
        
    } catch (error) {
        console.error("service/auth transformBootstrapAdmin: ", error);
        return { success: false, error: "Erreur lors de la mise à jour de l'administrateur." };
    }
}

// Fonction pour vérifier si un admin bootstrap existe
export async function checkBootstrapStatus(prisma): Promise<{ 
    hasBootstrapAdmin: boolean; 
    systemInitialized: boolean; 
    bootstrapAdmin?: any 
}> {
    const bootstrapAdmin = await prisma.user.findFirst({
        where: { isBootstrap: true }
    });
    
    const userCount = await prisma.user.count();
    
    return {
        hasBootstrapAdmin: !!bootstrapAdmin,
        systemInitialized: userCount > 0,
        bootstrapAdmin: bootstrapAdmin ? {
            id: bootstrapAdmin.id,
            nom: bootstrapAdmin.nom,
            prenom: bootstrapAdmin.prenom,
            pin: bootstrapAdmin.pin
        } : undefined
    };
}

export async function getCurrentUser(prisma, ses): Promise<{ 
    userId: string, 
    role: UserRole, 
    entrepriseId: string,
    isBootstrap?: boolean 
} | null> {
    try {
        const userId = ses.getUserAgent();
        if (!userId) return null;
        
        const currentUser: User = await prisma.user.findFirst({
            where: { id: userId },
            include: { entreprise: true }
        });
        
        if (!currentUser || !currentUser.entrepriseId) return null;

        return {
            userId: currentUser.id,
            role: currentUser.role,
            entrepriseId: currentUser.entrepriseId,
            isBootstrap: currentUser.isBootstrap || false
        };
    } catch (error) {
        console.error("service/auth getCurrentUser: ", error);
        return null;
    }
}
