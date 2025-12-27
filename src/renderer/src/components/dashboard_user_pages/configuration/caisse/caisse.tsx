"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Wifi, 
  WifiOff, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle,
  Server,
  Network,
  HardDrive,
  Store,
  Crown,
  Upload,
  Download,
  XCircle
} from "lucide-react";
import { toast } from "react-toastify";

// ✅ Import de l'API IPC
import { caisseApi } from '@renderer/api/caisse.api';

interface Caisse {
  id: string;
  name: string;
  ip: string;
  port: number;
  status: "online" | "offline" | "syncing" | "error";
  lastSync: string | null;
  isActive: boolean;
  createdAt: string;
  macAddress?: string;
  version?: string;
  isCentral?: boolean;
  storeId?: string;
}

export default function GestionCaisses() {
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCaisse, setSelectedCaisse] = useState<Caisse | null>(null);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [syncLoading, setSyncLoading] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    syncing: 0
  });

  const [formData, setFormData] = useState({
    name: "",
    ip: "192.168.1.",
    port: 3000,
    macAddress: "",
    isCentral: false
  });

  // ✅ CHARGER LES CAISSES VIA IPC
  useEffect(() => {
    fetchCaisses();
  }, []);

  const fetchCaisses = async () => {
    try {
      console.log("🔄 Chargement des caisses via IPC...");
      const data = await caisseApi.getAll();
      console.log("✅ Caisses chargées:", data);
      setCaisses(data);
    } catch (error: any) {
      console.error("❌ Erreur chargement caisses:", error);
      toast.error(`Erreur lors du chargement des caisses: ${error.message}`);
    }
  };

  // Calculer les statistiques
  useEffect(() => {
    const total = caisses.length;
    const online = caisses.filter(c => c.status === "online").length;
    const offline = caisses.filter(c => c.status === "offline").length;
    const syncing = caisses.filter(c => c.status === "syncing").length;
    
    setStats({ total, online, offline, syncing });
  }, [caisses]);

  // ✅ TEST CONNEXION VIA IPC
  const testCaisseConnection = async (caisse: Caisse) => {
    setIsLoading(prev => ({ ...prev, [caisse.id]: true }));
    
    try {
      console.log("🧪 Test connexion via IPC:", caisse.name);
      const result = await caisseApi.test(caisse.id);
      console.log("📊 Résultat test:", result);
      
      // Rafraîchir la liste pour voir le statut mis à jour
      await fetchCaisses();
      
      if (result.status === 'online') {
        const latencyMsg = result.latency ? `(${result.latency}ms)` : '';
        toast.success(`✅ ${caisse.name} est en ligne ${latencyMsg}`);
      } else {
        toast.error(`❌ ${caisse.name} est hors ligne`);
      }
    } catch (error: any) {
      console.error("❌ Erreur test:", error);
      toast.error(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [caisse.id]: false }));
    }
  };

  // ✅ SYNCHRONISER LE STOCK (télécharger depuis le serveur)
  const syncStockFromServer = async (caisse: Caisse) => {
    setSyncLoading(prev => ({ ...prev, [caisse.id]: true }));
    
    try {
      // Mettre à jour le statut en syncing
      await updateCaisseStatus(caisse.id, 'syncing');
      
      const response = await fetch(`http://${caisse.ip}:${caisse.port}/sync/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Mettre à jour le statut et la date de synchronisation
        await updateCaisseStatus(caisse.id, 'online', new Date().toISOString());
        await fetchCaisses();
        
        toast.success(`✅ Stock synchronisé: ${data.products} produits`);
      } else {
        await updateCaisseStatus(caisse.id, 'error');
        toast.error("❌ Erreur synchronisation stock");
      }
    } catch (error) {
      await updateCaisseStatus(caisse.id, 'error');
      toast.error("❌ Impossible de synchroniser le stock");
      console.error("Sync stock échoué:", error);
    } finally {
      setSyncLoading(prev => ({ ...prev, [caisse.id]: false }));
    }
  };

  // ✅ ENVOYER LES VENTES AU SERVEUR (upload)
  const sendSalesToServer = async (caisse: Caisse) => {
    setSyncLoading(prev => ({ ...prev, [caisse.id]: true }));
    
    try {
      // Mettre à jour le statut en syncing
      await updateCaisseStatus(caisse.id, 'syncing');
      
      // Récupérer les ventes non synchronisées
      const response = await fetch(`http://${caisse.ip}:${caisse.port}/sync/sales/pending`);
      const pendingSales = await response.json();
      
      if (pendingSales.length > 0) {
        // Envoyer au serveur central via IPC
        const sendResult = await window.electron.sync.sendSalesToServer({
          caisseId: caisse.id,
          sales: pendingSales 
        });
        
        if (sendResult.success) {
          // Marquer comme synchronisées
          await fetch(`http://${caisse.ip}:${caisse.port}/sync/sales/mark-synced`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ salesIds: pendingSales.map((s: any) => s.id) })
          });
          
          // Mettre à jour le statut et la date de synchronisation
          await updateCaisseStatus(caisse.id, 'online', new Date().toISOString());
          await fetchCaisses();
          
          toast.success(`✅ ${pendingSales.length} ventes envoyées au serveur`);
        } else {
          await updateCaisseStatus(caisse.id, 'error');
          toast.error("❌ Erreur envoi ventes");
        }
      } else {
        toast.info("ℹ️ Aucune vente à synchroniser");
      }
    } catch (error) {
      await updateCaisseStatus(caisse.id, 'error');
      toast.error("❌ Erreur synchronisation ventes");
      console.error("Sync ventes échoué:", error);
    } finally {
      setSyncLoading(prev => ({ ...prev, [caisse.id]: false }));
    }
  };

  // ✅ Fonction utilitaire pour mettre à jour le statut d'une caisse
  const updateCaisseStatus = async (id: string, status: Caisse["status"], lastSync?: string) => {
    try {
      // Mettre à jour localement
      const updatedCaisses = caisses.map(c => 
        c.id === id 
          ? { 
              ...c, 
              status,
              lastSync: lastSync || c.lastSync
            }
          : c
      );
      setCaisses(updatedCaisses);
      
      // Optionnellement, vous pourriez avoir une API pour mettre à jour le statut
      // await caisseApi.updateStatus(id, status);
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
    }
  };

  // ✅ CRÉER UNE CAISSE VIA IPC
  const handleCreateCaisse = async () => {
    if (!formData.name || !formData.ip) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      console.log("➕ Création caisse via IPC:", formData);
      const newCaisse = await caisseApi.create({
        name: formData.name,
        ip: formData.ip,
        port: formData.port,
        macAddress: formData.macAddress || undefined,
        isCentral: formData.isCentral
      });

      console.log("✅ Caisse créée:", newCaisse);
      setCaisses(prev => [...prev, newCaisse]);
      setShowCreateModal(false);
      resetForm();
      toast.success(`Caisse "${formData.name}" créée avec succès`);
    } catch (error: any) {
      console.error("❌ Erreur création:", error);
      toast.error(error.message || "Erreur lors de la création de la caisse");
    }
  };

  // ✅ MODIFIER UNE CAISSE VIA IPC
  const handleEditCaisse = async () => {
    if (!selectedCaisse) return;

    try {
      console.log("✏️ Modification caisse via IPC:", selectedCaisse.id, formData);
      const updatedCaisse = await caisseApi.update(selectedCaisse.id, {
        name: formData.name,
        ip: formData.ip,
        port: formData.port,
        macAddress: formData.macAddress || undefined,
        isCentral: formData.isCentral
      });

      console.log("✅ Caisse modifiée:", updatedCaisse);
      const updatedCaisses = caisses.map(c =>
        c.id === selectedCaisse.id ? updatedCaisse : c
      );
      setCaisses(updatedCaisses);
      setShowEditModal(false);
      setSelectedCaisse(null);
      resetForm();
      toast.success("Caisse modifiée avec succès");
    } catch (error: any) {
      console.error("❌ Erreur modification:", error);
      toast.error(error.message || "Erreur lors de la modification");
    }
  };

  // ✅ SUPPRIMER UNE CAISSE VIA IPC
  const handleDeleteCaisse = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la caisse "${name}" ?`)) {
      return;
    }

    try {
      console.log("🗑️ Suppression caisse via IPC:", id);
      await caisseApi.delete(id);
      console.log("✅ Caisse supprimée");
      setCaisses(prev => prev.filter(c => c.id !== id));
      toast.success("Caisse supprimée avec succès");
    } catch (error: any) {
      console.error("❌ Erreur suppression:", error);
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  // ✅ DÉFINIR COMME CENTRALE VIA IPC
  const setAsCentralCaisse = async (caisseId: string) => {
    try {
      console.log("👑 Définir comme centrale via IPC:", caisseId);
      await caisseApi.setCentral(caisseId);
      
      const updatedCaisses = caisses.map(c => ({
        ...c,
        isCentral: c.id === caisseId
      }));
      setCaisses(updatedCaisses);
      toast.success("Caisse centrale définie avec succès");
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      toast.error(error.message || "Erreur lors de la définition de la caisse centrale");
    }
  };

  // ✅ TESTER TOUTES LES CAISSES
  const testAllConnections = async () => {
    const promises = caisses.map(caisse => testCaisseConnection(caisse));
    await Promise.all(promises);
    toast.info("Test de toutes les connexions terminé");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      ip: "192.168.1.",
      port: 3000,
      macAddress: "",
      isCentral: false
    });
  };

  const openEditModal = (caisse: Caisse) => {
    setSelectedCaisse(caisse);
    setFormData({
      name: caisse.name,
      ip: caisse.ip,
      port: caisse.port,
      macAddress: caisse.macAddress || "",
      isCentral: caisse.isCentral || false
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusClasses = (status: Caisse["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "offline":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "syncing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "error":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: Caisse["status"]) => {
    switch (status) {
      case "online":
        return <Wifi className="w-4 h-4" />;
      case "offline":
        return <WifiOff className="w-4 h-4" />;
      case "syncing":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "error":
        return <XCircle className="w-4 h-4" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Caisse["status"]) => {
    switch (status) {
      case "online": return "En ligne";
      case "offline": return "Hors ligne";
      case "syncing": return "Synchronisation";
      case "error": return "Erreur";
      default: return "Inconnu";
    }
  };

  // ✅ Ajouter le type pour window.electron.sync
  declare global {
    interface Window {
      electron: {
        caisse: any;
        sync: {
          sendSalesToServer: (data: { caisseId: string; sales: any[] }) => Promise<{ success: boolean }>;
        };
      };
    }
  }

  return (
    <div className="p-6 bg-orvanta min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Server className="w-6 h-6" />
              Gestion des Caisses
            </h1>
            <p className="text-gray-400">Configurez et surveillez toutes vos caisses connectées</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={testAllConnections}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Wifi className="w-4 h-4" />
              Tester toutes
            </button>
            
            <button
              onClick={() => fetchCaisses()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvelle caisse
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Caisses</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <Server className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En ligne</p>
                <p className="text-3xl font-bold text-green-400">{stats.online}</p>
              </div>
              <Wifi className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Hors ligne</p>
                <p className="text-3xl font-bold text-red-400">{stats.offline}</p>
              </div>
              <WifiOff className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Centrales</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {caisses.filter(c => c.isCentral).length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des caisses */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="py-3 px-4 text-left text-gray-300 font-semibold">Nom de la caisse</th>
                <th className="py-3 px-4 text-left text-gray-300 font-semibold">IP / Port</th>
                <th className="py-3 px-4 text-left text-gray-300 font-semibold">Statut</th>
                <th className="py-3 px-4 text-left text-gray-300 font-semibold">Dernière synchro</th>
                <th className="py-3 px-4 text-left text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {caisses.map((caisse) => (
                <tr key={caisse.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${caisse.isCentral ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                        {caisse.isCentral ? (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <Store className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{caisse.name}</p>
                          {caisse.isCentral && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                              Centrale
                            </span>
                          )}
                        </div>
                        {caisse.macAddress && (
                          <p className="text-xs text-gray-400 font-mono">{caisse.macAddress}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-mono text-white">{caisse.ip}:{caisse.port}</p>
                        {caisse.version && (
                          <p className="text-xs text-gray-400">v{caisse.version}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusClasses(caisse.status)}`}>
                      {getStatusIcon(caisse.status)}
                      <span className="text-sm font-medium">{getStatusText(caisse.status)}</span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{formatDate(caisse.lastSync)}</span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {/* Test connexion */}
                      <button
                        onClick={() => testCaisseConnection(caisse)}
                        disabled={isLoading[caisse.id]}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Tester la connexion"
                      >
                        {isLoading[caisse.id] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wifi className="w-4 h-4" />
                        )}
                      </button>
                      
                      {/* Télécharger stock */}
                      {!caisse.isCentral && caisse.status === "online" && (
                        <button
                          onClick={() => syncStockFromServer(caisse)}
                          disabled={syncLoading[caisse.id]}
                          className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Synchroniser le stock"
                        >
                          {syncLoading[caisse.id] ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      {/* Envoyer ventes */}
                      {!caisse.isCentral && caisse.status === "online" && (
                        <button
                          onClick={() => sendSalesToServer(caisse)}
                          disabled={syncLoading[caisse.id]}
                          className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Envoyer les ventes au serveur"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Définir comme centrale */}
                      {!caisse.isCentral && (
                        <button
                          onClick={() => setAsCentralCaisse(caisse.id)}
                          className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg border border-yellow-500/30 transition-colors"
                          title="Définir comme caisse centrale"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Modifier */}
                      <button
                        onClick={() => openEditModal(caisse)}
                        className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg border border-yellow-500/30 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* Supprimer */}
                      {!caisse.isCentral && (
                        <button
                          onClick={() => handleDeleteCaisse(caisse.id, caisse.name)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {caisses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Server className="w-12 h-12" />
                      <p>Aucune caisse configurée</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Créer votre première caisse
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal création caisse */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0a0e17] to-[#050811] rounded-2xl border border-[#00ffea]/30 shadow-2xl shadow-[#00ffea]/20 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouvelle Caisse
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nom de la caisse *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#050811] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ffea]"
                    placeholder="Ex: Caisse Principale"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Adresse IP *</label>
                  <input
                    type="text"
                    value={formData.ip}
                    onChange={(e) => setFormData(prev => ({ ...prev, ip: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#050811] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ffea]"
                    placeholder="Ex: 192.168.1.100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Port *</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 3000 }))}
                    className="w-full px-3 py-2 bg-[#050811] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ffea]"
                    placeholder="3000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Adresse MAC (optionnel)</label>
                  <input
                    type="text"
                    value={formData.macAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, macAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#050811] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ffea]"
                    placeholder="Ex: 00:1A:2B:3C:4D:5E"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCentral"
                    checked={formData.isCentral}
                    onChange={(e) => setFormData(prev => ({ ...prev, isCentral: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isCentral" className="text-sm text-gray-300">
                    Définir comme caisse centrale
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleCreateCaisse}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Créer la caisse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal édition caisse */}
      {showEditModal && selectedCaisse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0a0e17] to-[#050811] rounded-2xl border border-[#00ffea]/30 shadow-2xl shadow-[#00ffea]/20 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Modifier la Caisse
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nom de la caisse *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#050811] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ffea]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Adresse IP *</label>
                  <input
                    type="text"
                    value={formData.ip}
                    onChange={(e) => setFormData(prev => ({ ...prev, ip: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#050811] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ffea]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Port *</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 3000 }))}
                    className="w-full px-3 py-2 bg-[#050811] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ffea]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Adresse MAC (optionnel)</label>
                  <input
                    type="text"
                    value={formData.macAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, macAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#050811] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ffea]"
                  />
                </div>
                
                {!selectedCaisse.isCentral && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editIsCentral"
                      checked={formData.isCentral}
                      onChange={(e) => setFormData(prev => ({ ...prev, isCentral: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="editIsCentral" className="text-sm text-gray-300">
                      Définir comme caisse centrale
                    </label>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCaisse(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleEditCaisse}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}