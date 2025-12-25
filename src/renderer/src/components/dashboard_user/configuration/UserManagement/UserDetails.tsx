"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Settings,
  Crown,
  Briefcase,
  Store,
  Coffee,
  Calculator,
  UserCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getEmployeeById, type Employee } from "@renderer/api/user-management";
import { useDeviceType } from "@renderer/hooks/useDeviceType";

const ROLES_LABELS: { [key: string]: string } = {
  ADMIN: "Administrateur",
  CAISSIER: "Caissier",
  MAGASINIER: "Magasinier",
  CHEF_RAYON: "Chef de rayon",
  SERVEUR: "Serveur",
  COMPTABLE: "Comptable",
  GERANT: "Gérant",
};

const ROLE_ICONS: { [key: string]: any } = {
  ADMIN: Crown,
  CAISSIER: Store,
  MAGASINIER: Briefcase,
  CHEF_RAYON: UserCheck,
  SERVEUR: Coffee,
  COMPTABLE: Calculator,
  GERANT: Shield,
};

const ROLE_COLORS: { [key: string]: string } = {
  ADMIN: "from-purple-500 to-pink-500",
  CAISSIER: "from-blue-500 to-cyan-500",
  MAGASINIER: "from-green-500 to-emerald-500",
  CHEF_RAYON: "from-orange-500 to-amber-500",
  SERVEUR: "from-pink-500 to-rose-500",
  COMPTABLE: "from-yellow-500 to-orange-500",
  GERANT: "from-red-500 to-pink-500",
};

const PERMISSION_ICONS: { [key: string]: any } = {
  "Gestion des catégories": Settings,
  "Gestion des produits": Store,
  "Gestion de l'inventaire": Briefcase,
  "Gestion des acc": Users,
  "Gestion des charges": Calculator,
  "Gestion des achats fournisseurs": Briefcase,
  "Gestion des ventes": Store,
  "Gestion des tickets resto": Coffee,
  "Gestion de la balance": Calculator,
};

export default function UserDetails() {
  const { isMobile, isTablet } = useDeviceType();
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const id = params.id as string || searchParams.get("id");

  useEffect(() => {
    if (!id) {
      setError("Aucun utilisateur spécifié.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getEmployeeById(id)
      .then((data: Employee) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(String(err)||"Erreur lors du chargement des détails de l'utilisateur.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${isMobile ? 'p-2' : isTablet ? 'p-4' : 'p-6'}`}>
        <div className={`${isMobile ? 'max-w-full px-2' : isTablet ? 'max-w-3xl px-4' : 'max-w-4xl px-6'} mx-auto flex items-center justify-center min-h-[60vh]`}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} animate-spin text-purple-400`} />
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-purple-200`}>Chargement des détails...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${isMobile ? 'p-2' : isTablet ? 'p-4' : 'p-6'}`}>
        <div className={`${isMobile ? 'max-w-full px-2' : isTablet ? 'max-w-3xl px-4' : 'max-w-4xl px-6'} mx-auto flex items-center justify-center min-h-[60vh]`}>
          <div className="text-center">
            <AlertCircle className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-red-400 mx-auto mb-3`} />
            <p className={`${isMobile ? 'text-base' : 'text-lg'} text-red-200`}>{error || "Utilisateur non trouvé."}</p>
          </div>
        </div>
      </div>
    );
  }

  const RoleIcon = ROLE_ICONS[user.role] || User;
  const roleGradient = ROLE_COLORS[user.role] || "from-purple-500 to-blue-500";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${isMobile ? 'p-2' : isTablet ? 'p-4' : 'p-6'}`}>
      <div className={`${isMobile ? 'max-w-full px-2' : isTablet ? 'max-w-3xl px-4' : 'max-w-4xl px-6'} mx-auto`}>
        {/* Header Section */}
        <div className={`mb-6 ${isMobile ? 'pt-2' : 'pt-4'}`}>
          <button
            onClick={() => router("/dashboard_user/configuration/user-management/list")}
            className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} group-hover:-translate-x-1 transition-transform`} />
            Retour à la liste
          </button>

          <div className={`flex ${isMobile ? 'flex-col gap-3 items-start' : 'flex-row items-center gap-4'}`}>
            <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg`}>
              <Users className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
            </div>
            <div className={isMobile ? 'text-center w-full' : ''}>
              <h1 className={`${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-1`}>Profil utilisateur</h1>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-purple-300`}>Informations détaillées et permissions</p>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isTablet ? 'lg:grid-cols-3' : 'xl:grid-cols-3'} gap-4`}>
          {/* User Profile Card */}
          <div className={`${isTablet ? 'lg:col-span-1' : 'xl:col-span-1'}`}>
            <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6'} shadow-xl`}>
              {/* Avatar Section */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <div className={`${isMobile ? 'w-16 h-16 text-xl' : isTablet ? 'w-20 h-20 text-2xl' : 'w-24 h-24 text-3xl'} bg-gradient-to-br ${roleGradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                    {user.prenom?.[0]?.toUpperCase()}
                    {user.nom?.[0]?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <div className={`p-1.5 bg-gradient-to-r ${roleGradient} rounded-full shadow-lg`}>
                      <RoleIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mt-3`}>{user.prenom} {user.nom}</h2>
                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gradient-to-r ${roleGradient} text-white text-sm font-medium mt-2`}>
                  <RoleIcon className="w-4 h-4" />
                  {ROLES_LABELS[user.role]}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                {[
                  { icon: Mail, label: "Email", value: user.email },
                  { icon: Phone, label: "Téléphone", value: user.telephone },
                  {
                    icon: Calendar,
                    label: "Statut",
                    value: (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white text-sm font-medium">Actif</span>
                      </div>
                    ),
                  },
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-purple-500/20`}>
                    <item.icon className={`w-4 h-4 text-purple-400 flex-shrink-0`} />
                    <div>
                      <p className={`text-purple-200 ${isMobile ? 'text-xs' : 'text-sm'} mb-1`}>{item.label}</p>
                      <div className="text-white font-medium text-sm">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Details and Permissions */}
          <div className={`${isTablet ? 'lg:col-span-2' : 'xl:col-span-2'} space-y-4`}>
            {/* Personal Information */}
            <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6'} shadow-xl`}>
              <div className={`flex items-center gap-2 mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
                <User className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-white">Informations personnelles</h3>
              </div>

              <div className={`grid grid-cols-1 ${isTablet ? 'md:grid-cols-2' : 'lg:grid-cols-2'} gap-3`}>
                {[
                  { label: "Nom de famille", value: user.nom },
                  { label: "Prénom", value: user.prenom },
                  { label: "Adresse email", value: user.email },
                  { label: "Numéro de téléphone", value: user.telephone },
                  {
                    label: "Fond de caisse",
                    value: user.fondcaisse !== undefined && user.fondcaisse !== null ? `${user.fondcaisse}` : "-",
                  },
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 bg-white/5 rounded-lg border border-purple-500/20`}>
                    <p className={`text-purple-200 ${isMobile ? 'text-xs' : 'text-sm'} mb-1`}>{item.label}</p>
                    <p className="text-white font-medium text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden">
              <div className={`bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-purple-500/20 ${isMobile ? 'px-3 py-2' : isTablet ? 'px-4 py-3' : 'px-6 py-4'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>Permissions & Accès</h3>
                  </div>
                  <div className={`flex items-center gap-2 px-2 py-1 bg-purple-500/20 rounded-full ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-purple-200">{user.permissions?.length || 0} permission(s)</span>
                  </div>
                </div>
              </div>

              <div className={`${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6'}`}>
                {user.permissions && user.permissions.length > 0 ? (
                  <div className={`grid grid-cols-1 ${isTablet ? 'md:grid-cols-2' : 'lg:grid-cols-2'} gap-3`}>
                    {user.permissions.map((perm, idx) => {
                      const PermIcon = PERMISSION_ICONS[perm] || Settings;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-purple-500/20 hover:border-purple-400/40 transition-all hover:scale-[1.02]`}
                        >
                          <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                            <PermIcon className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-white font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{perm}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span className={`text-green-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>Autorisé</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <XCircle className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-purple-400 mx-auto mb-3 opacity-50`} />
                    <p className={`${isMobile ? 'text-sm' : 'text-base'} text-purple-200`}>Aucune permission spécifique attribuée</p>
                    <p className={`text-purple-300 ${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                      Les permissions par défaut du rôle s'appliquent
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}