// src/renderer/src/pages/vente/VenteListByCommande.tsx
import { useState, useEffect, useRef, useCallback   } from "react";
import { ArrowLeft, FileText, Undo2, Check, X, Package } from "lucide-react";
import { useAuth } from "../../auth/auth-context";
import { toast } from "react-toastify";
import { getVentesByCommandeId } from "@renderer/api/vente";
import { RetourApi } from "@renderer/api/retour";
import type { Vente } from "@renderer/types/vente";
import { useParams, useNavigate } from "react-router-dom";
import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { useSafeSubmit } from '@renderer/hooks/useSafeSubmit';

interface POSData {
  id: string;
  date: string;
  codeBarre: string;
  designation: string;
  puht: number;
  tva: number;
  remise: number;
  quantite: number;
  totalTTC: number;
  retourQuantite: number;
  quantiteDisponible: number;
  totalNet: number; 
}

export function VenteListByCommande() {
  const { entreprise } = useAuth();
  const [posData, setPosData] = useState<POSData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRetourModal, setShowRetourModal] = useState(false);
  const [selectedVentes, setSelectedVentes] = useState<Record<string, number>>({});
  const [retours, setRetours] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useNavigate();
  const params = useParams();
  const commandeId = params.id;
  const { isMobile, isTablet, isIPadMini, isSurfaceDuo, sunMy } = useDeviceType();
    const { safeSubmit, isSubmitting: safeIsSubmitting } = useSafeSubmit();
    const submissionInProgress = useRef(false);

  // Charger les ventes
  const fetchVentes = async () => {
    if (!entreprise?.id || !commandeId) {
      setError("Utilisateur non authentifié ou commande non spécifiée.");
      return;
    }

    console.log("🔄 Chargement des ventes...");
    setIsLoading(true);
    setError(null);

    try {
      const ventes: Vente[] = await getVentesByCommandeId(entreprise.id, commandeId);
      
      if (!ventes || ventes.length === 0) {
        setPosData([]);
        return;
      }

      const formattedData: POSData[] = ventes.map((vente) => {
        const puht = Number(vente.puht) || 0;
        const tva = Number(vente.tva) || 0;
        const remise = Number(vente.remise) || 0;
        const quantite = Number(vente.quantite) || 0;
        const totalTTC = Number(vente.totalTTC) || 0;
        const retourQuantite = Number(vente.retourQuantite) || 0;
        const quantiteDisponible = quantite - retourQuantite;

        const montantUnitaire = totalTTC / quantite;
        const totalRetourne = montantUnitaire * retourQuantite;
        const totalNet = totalTTC - totalRetourne;
        
        return {
          id: vente.id,
          date: vente.createdAt ? new Date(vente.createdAt).toLocaleDateString("fr-FR") : "Date inconnue",
          codeBarre: vente.codeBarre || "N/A",
          designation: vente.designation || "Sans nom",
          puht,
          tva,
          remise,
          quantite,
          totalTTC,
          retourQuantite,
          quantiteDisponible,
          totalNet,
        };
      }).sort((a, b) => {
        try {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch {
          return 0;
        }
      });

      setPosData(formattedData);
      
      // Initialiser les sélections
      const initialSelections: Record<string, number> = {};
      formattedData.forEach((vente) => {
        if (vente.quantiteDisponible > 0) {
          initialSelections[vente.id] = 0;
        }
      });
      setSelectedVentes(initialSelections);

      // Charger les retours
      loadRetours(commandeId);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la récupération des ventes.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les retours
  const loadRetours = async (commandeId: string) => {
    try {
      const response: any = await RetourApi.getRetoursByCommande(commandeId);
      if (response.success) {
        setRetours(response.retours || []);
      }
    } catch (err) {
      console.error("Erreur retours:", err);
    }
  };

  useEffect(() => {
    fetchVentes();
  }, [entreprise?.id, commandeId]);

  // Gérer les quantités
  const handleQuantiteChange = (venteId: string, quantite: number) => {
    const vente = posData.find(v => v.id === venteId);
    if (!vente) return;

    if (quantite < 0) quantite = 0;
    if (quantite > vente.quantiteDisponible) {
      quantite = vente.quantiteDisponible;
      toast.warning(`Quantité maximale disponible: ${vente.quantiteDisponible}`);
    }

    setSelectedVentes(prev => ({
      ...prev,
      [venteId]: quantite
    }));
  };

  // Soumettre le retour - SIMPLIFIÉ
const handleSubmitRetour = async () => {
  console.log("🎯 handleSubmitRetour appelé - VERSION SÉCURISÉE");
  
  // Protection immédiate avec useRef (plus fiable que useState)
  
  
  if (submissionInProgress.current) {
    console.log("⏸️ Soumission déjà en cours, ignorée");
    return;
  }
  
  // 1. Préparer les données
  const lignes = [];
  for (const [venteId, quantite] of Object.entries(selectedVentes)) {
    if (quantite > 0) {
      lignes.push({ venteId, quantite });
    }
  }
  
  if (lignes.length === 0) {
    toast.warning("Sélectionnez un produit");
    return;
  }
  
  console.log("📤 Envoi SÉCURISÉ:", { commandeId, lignes });

  // 2. Marquer comme en cours (avec ref pour synchronisme)
  submissionInProgress.current = true;
  setIsSubmitting(true);
  
  // 3. Fermer le modal IMMÉDIATEMENT
  setShowRetourModal(false);
  
  // 4. Sauvegarder les sélections pour les vider après
  const savedSelections = { ...selectedVentes };
  
  // 5. Vider la sélection IMMÉDIATEMENT
  setSelectedVentes({});
  
  // 6. Montrer un message d'attente (avec ID unique)
  const toastId = `retour-${commandeId}-${Date.now()}`;
  toast.info("Traitement du retour en cours...", { 
    toastId,
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    closeButton: false
  });
  
  try {
    // 7. Envoyer avec gestion complète des erreurs
    const response = await RetourApi.createRetour(commandeId!, lignes);
    
    console.log("✅ Réponse backend reçue:", response);
    
    // 8. Dismiss le toast d'attente
    toast.dismiss(toastId);
    
    if (response?.success) {
      // 9. Afficher succès
      toast.success("Retour effectué avec succès !");
      
      // 10. Rafraîchir APRÈS un court délai
      setTimeout(() => {
        fetchVentes();
      }, 500); // Délai court pour laisser le backend terminer
      
    } else {
      // 11. Gérer l'erreur du backend
      toast.error(response?.error || "Erreur lors du retour");
      
      // 12. Restaurer les sélections en cas d'erreur
      setSelectedVentes(savedSelections);
    }
    
  } catch (err: any) {
    console.error("❌ Erreur complète:", err);
    
    // 13. Dismiss le toast d'attente
    toast.dismiss(toastId);
    
    // 14. Afficher erreur adaptative
    if (err.message.includes("Timeout")) {
      toast.error("Le traitement prend trop de temps. Vérifiez si le retour a été effectué.");
    } else if (err.message.includes("trop rapide")) {
      toast.warning("Veuillez patienter avant de réessayer");
    } else {
      toast.error(`Erreur: ${err.message || "Une erreur est survenue"}`);
    }
    
    // 15. Restaurer les sélections
    setSelectedVentes(savedSelections);
    
    // 16. Rafraîchir pour voir l'état actuel
    setTimeout(() => {
      fetchVentes();
    }, 1000);
    
  } finally {
    // 17. TOUJOURS réinitialiser l'état, même en cas d'erreur
    submissionInProgress.current = false;
    setIsSubmitting(false);
  }
};

  const handleCancelRetour = async (retourId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce retour ? Cette action est irréversible.")) return;

    try {
      const response: any = await RetourApi.cancelRetour(retourId);
      if (response.success) {
        toast.success("Retour annulé avec succès");
        await fetchVentes();
      } else {
        toast.error(response.error || "Erreur lors de l'annulation");
      }
    } catch (error) {
      console.error("Erreur annulation:", error);
      toast.error("Erreur lors de l'annulation");
    }
  };

  const getTotalRetour = () => {
    return Object.entries(selectedVentes).reduce((total, [venteId, quantite]) => {
      if (quantite > 0) {
        const vente = posData.find(v => v.id === venteId);
        if (vente) {
          const montantUnitaire = vente.totalTTC / vente.quantite;
          return total + (montantUnitaire * quantite);
        }
      }
      return total;
    }, 0);
  };

  const getFontSizeClass = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "text-[10px]";
    if (isTablet || isIPadMini) return "text-xs";
    return "text-xs";
  };

  const useCardLayout = isMobile || isSurfaceDuo || sunMy || isTablet || isIPadMini;
  const produitsDisponiblesPourRetour = posData.filter(v => v.quantiteDisponible > 0).length;

  // Le JSX reste le même que vous avez fourni, sauf le bouton rafraîchir
  return (
    <div className="min-h-screen bg-white/5 p-3">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className={`text-xl font-bold text-white/90 mb-0.5 ${isMobile || isSurfaceDuo || sunMy ? "text-base" : "text-xl"}`}>
              Ventes de la Commande
            </h1>
            <p className={`text-white/60 ${isMobile || isSurfaceDuo || sunMy ? "text-xs" : "text-sm"}`}>
              Détails des ventes pour la commande
            </p>
          </div>
          <div className="flex gap-2">
            {produitsDisponiblesPourRetour > 0 && (
              <button
                onClick={() => setShowRetourModal(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-200 font-medium text-xs flex items-center space-x-1"
              >
                <Undo2 className="h-3 w-3" />
                <span>Retour Produit</span>
              </button>
            )}
            <button
              onClick={() => router("/dashboard_user/sales/pos-list")}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-xs flex items-center space-x-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Retour</span>
            </button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 text-red-300 p-2 rounded-lg text-xs">{error}</div>}

        {/* Section des retours existants */}
        {retours.length > 0 && (
          <div className="bg-gradient-to-b from-orange-500/10 to-orange-500/5 backdrop-blur-xl rounded-xl border border-orange-500/20 overflow-hidden shadow-xl">
            <div className="px-3 py-2 border-b border-orange-500/20">
              <div className="flex items-center space-x-1.5">
                <Package className="h-3 w-3 text-orange-400" />
                <h2 className="text-sm font-semibold text-orange-300">Retours effectués</h2>
                <span className="ml-1.5 bg-orange-500/20 text-orange-300 text-xs px-1.5 py-0.5 rounded-full">
                  {retours.length}
                </span>
              </div>
            </div>
            <div className="p-3">
              {retours.map((retour) => (
                <div key={retour.id} className="mb-2 last:mb-0 p-2 bg-orange-500/5 rounded-lg border border-orange-500/10">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-orange-300 text-xs font-medium">
                          Retour du {new Date(retour.createdAt).toLocaleDateString("fr-FR")} à{" "}
                          {new Date(retour.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <span className="text-orange-400/80 text-xs bg-orange-500/10 px-1.5 py-0.5 rounded">
                          {retour.lignes?.length || 0} produit(s)
                        </span>
                      </div>
                      <p className="text-orange-400/80 text-xs">
                        Montant total remboursé: <span className="font-bold">{Number(retour.totalRetour).toLocaleString()} DT</span>
                      </p>
                      {retour.lignes && retour.lignes.length > 0 && (
                        <div className="mt-1 text-xs text-orange-300/70">
                          Produits: {retour.lignes.map((ligne: any) => 
                            `${ligne.vente?.designation || 'Produit'} (${ligne.quantite})`
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleCancelRetour(retour.id)}
                      className="ml-2 px-2 py-1 bg-red-700 text-red-300 rounded text-xs hover:bg-red-500/30 transition-colors whitespace-nowrap"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal pour retour de produits */}
        {showRetourModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Undo2 className="h-5 w-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Retour de produits</h3>
                </div>
                <button
                  onClick={() => setShowRetourModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1">
                <p className="text-white/70 text-sm mb-3">
                  Sélectionnez les produits à retourner et les quantités correspondantes.
                </p>
                
                {posData.filter(v => v.quantiteDisponible > 0).length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-white/40 mx-auto mb-2" />
                    <p className="text-white/70">Tous les produits de cette commande ont déjà été retournés.</p>
                  </div>
                ) : (
                  posData
                    .filter(vente => vente.quantiteDisponible > 0)
                    .map((vente) => (
                      <div key={vente.id} className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{vente.designation}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 text-[10px]">
                                {vente.codeBarre}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-[10px]">
                                Vendu: {vente.quantite}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300 text-[10px]">
                                Déjà retourné: {vente.retourQuantite}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded text-orange-300 text-[10px]">
                                Disponible: {vente.quantiteDisponible}
                              </span>
                            </div>
                          </div>
                          <div className="text-white font-bold text-sm ml-2">
                            {vente.totalTTC.toLocaleString()} DT
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                          <span className="text-white/70 text-xs">Quantité à retourner:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantiteChange(vente.id, selectedVentes[vente.id] - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-white/10 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={!selectedVentes[vente.id] || selectedVentes[vente.id] <= 0}
                            >
                              <span className="text-white">-</span>
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={vente.quantiteDisponible}
                              value={selectedVentes[vente.id] || 0}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value)) {
                                  handleQuantiteChange(vente.id, value);
                                }
                              }}
                              className="w-16 text-center bg-black/20 border border-white/10 rounded text-white text-sm p-1"
                            />
                            <button
                              onClick={() => handleQuantiteChange(vente.id, (selectedVentes[vente.id] || 0) + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-white/10 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={(selectedVentes[vente.id] || 0) >= vente.quantiteDisponible}
                            >
                              <span className="text-white">+</span>
                            </button>
                          </div>
                        </div>
                        
                        {selectedVentes[vente.id] > 0 && (
                          <div className="mt-2 text-right">
                            <span className="text-white/60 text-xs">Montant à retourner: </span>
                            <span className="text-white font-bold text-sm">
                              {((vente.totalTTC / vente.quantite) * selectedVentes[vente.id]).toLocaleString()} DT
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>

              <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-white/70 text-sm">Total à retourner:</span>
                    <p className="text-white/50 text-xs">Ce montant sera remboursé au client</p>
                  </div>
                  <span className="text-white font-bold text-xl">
                    {getTotalRetour().toLocaleString()} DT
                  </span>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowRetourModal(false)}
                    className="px-4 py-2 text-white/80 hover:text-white bg-red-700 hover:bg-red-400 rounded-lg transition-all duration-200 font-medium"
                  >
                    Annuler
                  </button>
                   <button
  onClick={async () => {
    await safeSubmit(
      () => handleSubmitRetour(),
      {
        key: `retour-${commandeId}`,
        onSuccess: (result) => {
          console.log('Retour réussi:', result);
        },
        onError: (error) => {
          console.error('Erreur retour:', error);
        },
        timeout: 25000
      }
    );
  }}
  disabled={getTotalRetour() === 0 || safeIsSubmitting}
  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 font-medium flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {safeIsSubmitting ? 'Traitement...' : 'Confirmer le retour'}
</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tableau des ventes - MÊME JSX */}
        <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-xl">
          <div className="px-3 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="p-1 bg-white/10 rounded-md">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h2 className={`text-base font-semibold text-white ${isMobile || isSurfaceDuo || sunMy ? "text-sm" : "text-base"}`}>
                    Liste des Ventes
                  </h2>
                  <p className="text-white/60 text-[10px]">
                    {posData.length} résultat{posData.length !== 1 ? "s" : ""} trouvé{posData.length !== 1 ? "s" : ""}
                    {produitsDisponiblesPourRetour > 0 && (
                      <span className="ml-2 text-orange-300">
                        • {produitsDisponiblesPourRetour} produit(s) disponible(s) pour retour
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-blue-500"></div>
                  <span className="text-white/60 text-sm">Chargement...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-400 text-sm">{error}</div>
            ) : posData.length === 0 ? (
              <div className="p-4 text-center">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-1.5">
                  <FileText className="h-6 w-6 text-white/40" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Aucune donnée disponible</h3>
                <p className="text-white/60 mb-1.5 text-xs">Aucune vente ne correspond à cette commande.</p>
                <button
                  onClick={() => router("/dashboard_user/sales/pos-list")}
                  className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-xs"
                >
                  Retour
                </button>
              </div>
            ) : useCardLayout ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                {posData.map((pos, index) => (
                  <div
                    key={pos.id}
                    className={`p-3 rounded-lg border ${
                      pos.quantiteDisponible === 0 
                        ? 'border-green-500/20 bg-green-500/5' 
                        : 'border-white/10 bg-white/[0.02]'
                    } shadow-sm`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-white/60 text-[10px]">Date</span>
                        <span className={`text-white/90 font-medium ${getFontSizeClass()}`}>{pos.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-[10px]">Code à barre</span>
                        {["ooredoo", "telecom", "orange"].some((brand) =>
                          pos.designation.toLowerCase().includes(brand)
                        ) ? (
                          <span className="text-white/50 italic">---</span>
                        ) : (
                          <span className={`text-blue-300 font-mono ${getFontSizeClass()}`}>{pos.codeBarre}</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-[10px]">Désignation</span>
                        <span className={`text-white/90 font-medium ${getFontSizeClass()}`}>{pos.designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-[10px]">Prix HT</span>
                        <span className={`text-white/80 ${getFontSizeClass()}`}>
                          {pos.puht.toLocaleString()} <span className="text-white/60">DT</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-[10px]">TVA</span>
                        <span className={`text-green-300 ${getFontSizeClass()}`}>{pos.tva}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-[10px]">Remise</span>
                        <span className={`text-yellow-300 ${getFontSizeClass()}`}>{pos.remise}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-[10px]">Qté vendue</span>
                        <span className={`text-white/80 font-medium ${getFontSizeClass()}`}>{pos.quantite}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-[10px]">Qté retournée</span>
                        <span className={`text-orange-300 font-medium ${getFontSizeClass()}`}>{pos.retourQuantite}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-[10px]">Qté disponible</span>
                        <span className={`${
                          pos.quantiteDisponible === 0 ? 'text-green-300' : 'text-yellow-300'
                        } font-bold ${getFontSizeClass()}`}>
                          {pos.quantiteDisponible}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-white/10">
                        <span className="text-white/60 text-[10px]">Total TTC</span>
                        <span className={`text-white font-bold ${isMobile || isSurfaceDuo || sunMy ? "text-sm" : "text-base"}`}>
                          {pos.totalTTC.toLocaleString()} <span className={`text-white/80 ${getFontSizeClass()}`}>DT</span>
                        </span>
                      </div>
                      {pos.quantiteDisponible === 0 && (
                        <div className="mt-1 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-500/20 text-green-300 text-[10px] rounded-full">
                            <Check className="h-2 w-2 mr-1" />
                            Complètement retourné
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
             <table className="w-full">
  <thead>
    <tr className="border-b border-white/10 bg-gradient-to-r from-white/10 to-white/5">
      <th className={`px-4 py-3 text-left text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>Date</th>
      <th className={`px-4 py-3 text-left text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>Code à barre</th>
      <th className={`px-4 py-3 text-left text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>Désignation</th>
      <th className={`px-4 py-3 text-left text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>Prix HT</th>
      <th className={`px-4 py-3 text-left text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>TVA</th>
      <th className={`px-4 py-3 text-left text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>Remise</th>
      <th className={`px-4 py-3 text-left text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>Qté vendue</th>
      <th className={`px-4 py-3 text-left text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>Retourné</th>
      <th className={`px-4 py-3 text-left text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>Disponible</th>
      <th className={`px-4 py-3 text-right text-xs font-semibold text-white/90 ${getFontSizeClass()}`}>Total TTC / Net</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-white/5">
    {posData.map((pos, index) => {
      // Calcul du total net : total original moins montant retourné
      const montantUnitaire = pos.totalTTC / pos.quantite;
      const montantRetourne = montantUnitaire * pos.retourQuantite;
      const totalNet = pos.totalTTC - montantRetourne;
      
      return (
        <tr
          key={pos.id}
          className={`hover:bg-white/5 transition-all duration-200 ${
            index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
          } ${pos.quantiteDisponible === 0 ? 'bg-green-500/5' : ''}`}
        >
          <td className="px-4 py-3">
            <div className={`text-white/90 font-medium ${getFontSizeClass()}`}>{pos.date}</div>
          </td>
          <td className="px-4 py-3">
            {["ooredoo", "telecom", "orange"].some((brand) =>
              pos.designation.toLowerCase().includes(brand)
            ) ? (
              <div className="text-white/50 italic">---</div>
            ) : (
              <div className="inline-flex items-center px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <span className={`text-blue-300 text-xs font-mono ${getFontSizeClass()}`}>{pos.codeBarre}</span>
              </div>
            )}
          </td>
          <td className="px-4 py-3">
            <div className={`text-white/90 font-medium ${getFontSizeClass()}`}>{pos.designation}</div>
          </td>
          <td className="px-4 py-3">
            <div className={`text-white/80 ${getFontSizeClass()}`}>
              <span className="font-semibold">{pos.puht.toLocaleString()}</span>
              <span className="text-white/60 ml-1">DT</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="inline-flex items-center px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded-md">
              <span className={`text-green-300 text-xs font-medium ${getFontSizeClass()}`}>{pos.tva}%</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="inline-flex items-center px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-md">
              <span className={`text-yellow-300 text-xs font-medium ${getFontSizeClass()}`}>{pos.remise}%</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className={`text-white/80 font-medium ${getFontSizeClass()}`}>{pos.quantite}</div>
          </td>
          <td className="px-4 py-3">
            <div className={`text-orange-300 font-medium ${getFontSizeClass()}`}>{pos.retourQuantite}</div>
          </td>
          <td className="px-4 py-3">
            <div className={`${
              pos.quantiteDisponible === 0 
                ? 'text-green-300 bg-green-500/10 px-2 py-0.5 rounded' 
                : 'text-yellow-300'
            } font-bold ${getFontSizeClass()}`}>
              {pos.quantiteDisponible}
              {pos.quantiteDisponible === 0 && (
                <span className="ml-1 text-[8px]">✓</span>
              )}
            </div>
          </td>
          <td className="px-4 py-3 text-right">
            {/* Ligne 1 : Total TTC original avec style barré */}
            <div className={`text-white/60 line-through ${isMobile || isSurfaceDuo || sunMy ? "text-sm" : "text-base"}`}>
              {pos.totalTTC.toLocaleString()} DT
            </div>
            {/* Ligne 2 : Total Net en vert */}
            <div className={`text-green-300 font-bold ${isMobile || isSurfaceDuo || sunMy ? "text-sm" : "text-base"}`}>
              {totalNet.toLocaleString()} DT
            </div>
            {/* Ligne 3 : Différence */}
            <div className="text-orange-300 text-[10px] mt-0.5">
              -{montantRetourne.toLocaleString()} DT retourné
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}