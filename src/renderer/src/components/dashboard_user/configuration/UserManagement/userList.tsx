"use client";

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Edit, Ban, Users, Filter, Trash2, UserCheck, CheckCircle, AlertTriangle, X, AlertCircle, Shield, Activity, Cpu } from "lucide-react";
import { getAllEmployees, type Employee, deleteEmployee, toggleEmployeeStatus } from "@renderer/api/user-management";

const ROLES_LABELS: { [key: string]: string } = {
  ADMIN: "Admin",
  CAISSIER: "Caissier",
  MAGASINIER: "Magasinier",
  CHEF_RAYON: "Chef de rayon",
  SERVEUR: "Serveur",
  COMPTABLE: "Comptable",
  GERANT: "Gérant",
};

const ROLE_COLORS: { [key: string]: string } = {
  ADMIN: "bg-gradient-to-r from-[#00ffea]/20 to-[#0099ff]/20 text-[#00ffea] border border-[#00ffea]/30",
  CAISSIER: "bg-gradient-to-r from-[#00a2ff]/20 to-[#0055ff]/20 text-[#00a2ff] border border-[#00a2ff]/30",
  MAGASINIER: "bg-gradient-to-r from-[#00ff88]/20 to-[#00ccaa]/20 text-[#00ff88] border border-[#00ff88]/30",
  CHEF_RAYON: "bg-gradient-to-r from-[#ffaa00]/20 to-[#ff6600]/20 text-[#ffaa00] border border-[#ffaa00]/30",
  SERVEUR: "bg-gradient-to-r from-[#ff00aa]/20 to-[#cc00ff]/20 text-[#ff00aa] border border-[#ff00aa]/30",
  COMPTABLE: "bg-gradient-to-r from-[#ffff00]/20 to-[#ffcc00]/20 text-[#ffff00] border border-[#ffff00]/30",
  GERANT: "bg-gradient-to-r from-[#ff416c]/20 to-[#ff6b9d]/20 text-[#ff416c] border border-[#ff416c]/30",
};

export default function UserList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(new Set<string>());
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; user: Employee | null }>({ isOpen: false, user: null });
  const router = useNavigate();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    setLoading(true);
    getAllEmployees()
      .then((data: Employee[]) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des utilisateurs." as any);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
    return
  }, [notification]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telephone.includes(searchTerm);
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, selectedRole, users]);

  const handleDeleteClick = (user: Employee) => {
    setDeleteConfirmation({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.user) return;
    const userId = deleteConfirmation.user.id;
    setActionLoading((prev) => new Set(prev).add(userId + "-delete"));
    setDeleteConfirmation({ isOpen: false, user: null });

    try {
      await deleteEmployee(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setNotification({ type: "success", message: "Utilisateur supprimé." });
    } catch (err: unknown) {
      setNotification({ type: "error", message: "Erreur lors de la suppression." });
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev);
        next.delete(userId + "-delete");
        return next;
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, user: null });
  };

  const handleToggleBan = async (userId: string, isActive: boolean) => {
    setActionLoading((prev) => new Set(prev).add(userId + "-ban"));
    try {
      await toggleEmployeeStatus(userId, !isActive);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u)));
      setNotification({ type: "success", message: isActive ? "Utilisateur banni." : "Utilisateur réactivé." });
    } catch (err: unknown) {
      setNotification({ type: "error", message: "Erreur lors du changement de statut." });
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev);
        next.delete(userId + "-ban");
        return next;
      });
    }
  };

  const cardClass = `bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl border border-[#00ffea]/20 rounded-xl shadow-2xl shadow-[#00ffea]/5 ${isMobile ? "p-2" : "p-3"}`;
  const inputClass = `w-full ${isMobile ? "py-1.5 text-xs" : "py-2 text-sm"} pl-7 bg-[#0a0e17]/50 border border-[#00ffea]/30 rounded-lg text-white placeholder:text-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300`;
  const buttonClass = `px-3 ${isMobile ? "py-1.5 text-xs" : "py-2 text-sm"} rounded-lg transition-all duration-300 font-orbitron tracking-wider`;
  const textClass = isMobile ? "text-xs" : "text-sm";
  const iconClass = isMobile ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#050811] p-3">
      <div className={`${isMobile ? "max-w-full px-2" : "max-w-4xl px-3"} mx-auto space-y-3`}>
        {notification && (
          <div className={`fixed top-3 ${isMobile ? "left-2 right-2 max-w-[90vw]" : "right-3 max-w-xs"} z-50 p-3 rounded-xl border backdrop-blur-xl shadow-2xl ${notification.type === "success" ? "bg-gradient-to-br from-[#00ff88]/10 to-transparent border-[#00ff88]/30 text-[#00ff88]" : notification.type === "error" ? "bg-gradient-to-br from-[#ff416c]/10 to-transparent border-[#ff416c]/30 text-[#ff416c]" : "bg-gradient-to-br from-[#ffaa00]/10 to-transparent border-[#ffaa00]/30 text-[#ffaa00]"}`}>
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg ${notification.type === "success" ? "bg-gradient-to-br from-[#00ff88]/20 to-[#00ccaa]/20" : notification.type === "error" ? "bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20" : "bg-gradient-to-br from-[#ffaa00]/20 to-[#ffcc00]/20"}`}>
                {notification.type === "success" && <CheckCircle className={iconClass} />}
                {notification.type === "error" && <AlertTriangle className={iconClass} />}
                {notification.type === "warning" && <AlertTriangle className={iconClass} />}
              </div>
              <p className={`flex-1 font-medium font-orbitron tracking-wider ${textClass}`}>{notification.message}</p>
              <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-lg transition-all duration-200">
                <X className={iconClass} />
              </button>
            </div>
          </div>
        )}

        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={handleDeleteCancel} />
            <div className={`relative ${cardClass} ${isMobile ? "max-w-[85vw]" : "max-w-xs"} w-full`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg">
                  <AlertCircle className={iconClass + " text-[#ff416c]"} />
                </div>
                <div>
                  <h3 className={`${textClass} font-bold font-orbitron tracking-wider text-white`}>CONFIRMER SUPPRESSION</h3>
                  <p className={`${textClass} text-[#00ffea]/70`}>Action irréversible</p>
                </div>
              </div>
              <div className="mb-3">
                <p className={`${textClass} text-[#00ffea]/70 mb-2`}>Supprimer cet utilisateur ?</p>
                {deleteConfirmation.user && (
                  <div className="p-2 bg-gradient-to-br from-[#0a0e17]/60 to-[#050811]/60 rounded-lg border border-[#00ffea]/20">
                    <div className="flex items-center gap-2">
                      <div className={`${isMobile ? "w-6 h-6 text-xs" : "w-7 h-7 text-sm"} rounded-lg bg-gradient-to-br from-[#00ffea] to-[#0099ff] flex items-center justify-center text-white font-bold font-orbitron`}>
                        {deleteConfirmation.user.prenom[0]}{deleteConfirmation.user.nom[0]}
                      </div>
                      <div>
                        <p className={`${textClass} text-white font-bold font-orbitron tracking-wider`}>{deleteConfirmation.user.prenom} {deleteConfirmation.user.nom}</p>
                        <p className={`${textClass} text-[#00ffea]/70 truncate max-w-[180px]`}>{deleteConfirmation.user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                <p className={`${textClass} text-[#ff416c] mt-2 flex items-center gap-1`}>
                  <AlertTriangle className="w-3 h-3" /> Données perdues définitivement.
                </p>
              </div>
              <div className={`flex ${isMobile ? "flex-col gap-2" : "flex-row gap-2"}`}>
                <button onClick={handleDeleteCancel} className={`${buttonClass} flex-1 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white`}>ANNULER</button>
                <button onClick={handleDeleteConfirm} className={`${buttonClass} flex-1 bg-gradient-to-r from-[#ff416c] to-[#ff6b9d] hover:from-[#ff416c] hover:to-[#ff6b9d] text-white font-bold shadow-lg shadow-[#ff416c]/25 hover:shadow-xl hover:shadow-[#ff416c]/40`}>SUPPRIMER</button>
              </div>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-3 mb-4 ${isMobile ? 'flex-col items-start' : 'flex-row'}`}>
          <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-[#00ffea] to-[#0099ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#00ffea]/30`}>
            <Users className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
          </div>
          <div className={isMobile ? 'text-center w-full' : 'flex-1'}>
            <h1 className={`${isMobile ? "text-lg" : "text-2xl"} font-bold font-orbitron tracking-wider text-white mb-1`}>GESTION DES UTILISATEURS</h1>
            <p className={`${textClass} text-[#00ffea]/70`}>Supervisez vos utilisateurs système</p>
          </div>
          <div className={`${isMobile ? 'w-full mt-2' : ''}`}>
            <button
              onClick={() => router("/dashboard_user/configuration/user-management/add")}
              className={`group px-4 py-2 bg-gradient-to-r from-[#00ffea] to-[#0099ff] hover:from-[#00ffea] hover:to-[#0099ff] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#00ffea]/25 hover:shadow-xl hover:shadow-[#00ffea]/40 ${isMobile ? 'w-full text-sm' : ''}`}
            >
              <Users className="w-4 h-4 transition-transform group-hover:scale-110" />
              AJOUTER UTILISATEUR
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <div className={`flex ${isMobile ? "flex-col gap-2" : "flex-row gap-3"} items-center`}>
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass} text-[#00ffea]`} />
              <input 
                type="text" 
                placeholder="RECHERCHER..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className={inputClass}
              />
            </div>
            <div className={`flex items-center gap-2 ${isMobile ? "w-full" : "w-40"}`}>
              <Filter className={iconClass + " text-[#00ffea]"} />
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)} 
                className={inputClass.replace("pl-7", "px-3")}
              >
                <option value="all">TOUS LES RÔLES</option>
                {Object.entries(ROLES_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isMobile ? "" : "sm:grid-cols-3"} gap-3 mb-4`}>
          {[
            { 
              label: "TOTAL UTILISATEURS", 
              value: users.length, 
              icon: Users, 
              bg: "bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20", 
              iconBg: "from-[#00ffea] to-[#0099ff]",
              iconColor: "text-white" 
            },
            { 
              label: "RÉSULTATS FILTRÉS", 
              value: filteredUsers.length, 
              icon: Search, 
              bg: "bg-gradient-to-br from-[#00a2ff]/20 to-[#0055ff]/20", 
              iconBg: "from-[#00a2ff] to-[#0055ff]",
              iconColor: "text-white" 
            },
            { 
              label: "RÔLES SYSTÈME", 
              value: Object.keys(ROLES_LABELS).length, 
              icon: Cpu, 
              bg: "bg-gradient-to-br from-[#ff00aa]/20 to-[#cc00ff]/20", 
              iconBg: "from-[#ff00aa] to-[#cc00ff]",
              iconColor: "text-white" 
            },
          ].map((stat, idx) => (
            <div key={idx} className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${textClass} text-[#00ffea]/70 font-orbitron tracking-wider`}>{stat.label}</p>
                  <p className={`${isMobile ? "text-xl" : "text-2xl"} font-bold font-orbitron tracking-wider text-white`}>{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.iconBg} shadow-lg`}>
                  <stat.icon className={iconClass + " " + stat.iconColor} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={cardClass + " overflow-hidden"}>
          <div className={`bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 border-b border-[#00ffea]/20 ${isMobile ? "px-3 py-2" : "px-4 py-3"}`}>
            <div className="flex items-center gap-2 text-white font-bold font-orbitron tracking-wider">
              <Users className={iconClass} />
              <span className={textClass}>UTILISATEURS ({filteredUsers.length})</span>
            </div>
          </div>
          <div className="divide-y divide-[#00ffea]/10">
            {loading ? (
              <div className={`py-6 text-center ${textClass}`}>
                <div className="w-8 h-8 border-4 border-[#00ffea]/30 border-t-[#00ffea] rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-[#00ffea] font-orbitron tracking-wider">CHARGEMENT...</p>
              </div>
            ) : error ? (
              <div className={`py-6 text-center ${textClass}`}>
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className={iconClass + " text-[#ff416c]"} />
                </div>
                <p className="text-[#ff416c] font-orbitron tracking-wider">ERREUR DE CHARGEMENT</p>
                <p className="text-[#ff416c]/70 mt-1">{error}</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="p-3 hover:bg-gradient-to-r hover:from-[#00ffea]/5 hover:to-[#0099ff]/5 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`${isMobile ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"} rounded-lg bg-gradient-to-br from-[#00ffea] to-[#0099ff] flex items-center justify-center text-white font-bold font-orbitron tracking-wider shadow-lg shadow-[#00ffea]/30`}>
                      {user.prenom[0]}{user.nom[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`${textClass} text-white font-bold font-orbitron tracking-wider`}>{user.prenom} {user.nom}</p>
                        {user.isActive === false && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-gradient-to-r from-[#ff416c]/20 to-[#ff6b9d]/20 text-[#ff416c] border border-[#ff416c]/30 font-orbitron">
                            BANNI
                          </span>
                        )}
                      </div>
                      <p className={`${textClass} text-[#00ffea]/70 truncate max-w-[200px]`}>{user.email}</p>
                      <p className={`${textClass} text-[#00ffea]/50`}>{user.telephone}</p>
                      <span className={`inline-block px-2 py-1 mt-2 rounded-lg border font-bold font-orbitron tracking-wider ${textClass} ${ROLE_COLORS[user.role]}`}>
                        {ROLES_LABELS[user.role]}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      className={`${isMobile ? "h-8 w-8" : "h-9 w-9"} p-0 rounded-lg bg-gradient-to-br from-[#00ffea]/10 to-[#0099ff]/10 border border-[#00ffea]/30 text-[#00ffea] hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 hover:border-[#00ffea] transition-all duration-300`}
                      title="Voir les détails"
                      onClick={() => router(`/dashboard_user/configuration/user-management/details/${user.id}`)}
                    >
                      <Eye className="w-3.5 h-3.5 mx-auto" />
                    </button>
                    <button
                      className={`${isMobile ? "h-8 w-8" : "h-9 w-9"} p-0 rounded-lg bg-gradient-to-br from-[#ffff00]/10 to-[#ffcc00]/10 border border-[#ffff00]/30 text-[#ffff00] hover:from-[#ffff00]/20 hover:to-[#ffcc00]/20 hover:border-[#ffff00] transition-all duration-300`}
                      title="Modifier"
                      onClick={() => router(`/dashboard_user/configuration/user-management/edit/${user.id}`)}
                    >
                      <Edit className="w-3.5 h-3.5 mx-auto" />
                    </button>
                    <button
                      className={`${isMobile ? "h-8 w-8" : "h-9 w-9"} p-0 rounded-lg ${user.isActive === false ? "bg-gradient-to-br from-[#00ff88]/10 to-[#00ccaa]/10 border border-[#00ff88]/30 text-[#00ff88] hover:from-[#00ff88]/20 hover:to-[#00ccaa]/20 hover:border-[#00ff88]" : "bg-gradient-to-br from-[#ff416c]/10 to-[#ff6b9d]/10 border border-[#ff416c]/30 text-[#ff416c] hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 hover:border-[#ff416c]"} transition-all duration-300`}
                      title={user.isActive === false ? "Débannir" : "Bannir"}
                      disabled={actionLoading.has(user.id + "-ban")}
                      onClick={() => handleToggleBan(user.id, user.isActive !== false)}
                    >
                      {actionLoading.has(user.id + "-ban") ? (
                        <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin mx-auto"></div>
                      ) : user.isActive === false ? (
                        <UserCheck className="w-3.5 h-3.5 mx-auto" />
                      ) : (
                        <Ban className="w-3.5 h-3.5 mx-auto" />
                      )}
                    </button>
                    <button
                      className={`${isMobile ? "h-8 w-8" : "h-9 w-9"} p-0 rounded-lg bg-gradient-to-br from-[#ff416c]/10 to-[#ff6b9d]/10 border border-[#ff416c]/30 text-[#ff416c] hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 hover:border-[#ff416c] transition-all duration-300`}
                      title="Supprimer"
                      disabled={actionLoading.has(user.id + "-delete")}
                      onClick={() => handleDeleteClick(user)}
                    >
                      {actionLoading.has(user.id + "-delete") ? (
                        <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin mx-auto"></div>
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Search className={iconClass + " text-[#00ffea]"} />
                </div>
                <p className={`${textClass} text-[#00ffea] font-orbitron tracking-wider`}>AUCUN UTILISATEUR TROUVÉ</p>
                <p className={`${textClass} text-[#00ffea]/50 mt-1`}>Modifiez vos critères de recherche</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}