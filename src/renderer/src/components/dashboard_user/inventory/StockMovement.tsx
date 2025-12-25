"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { useAuth } from "../../auth/auth-context";
import { toast } from "react-toastify";
import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { getInventoryByParams } from "@renderer/api/stock-movement";

interface StockMovement {
  id: string;
  date: string;
  time?: string;
  codeBarre: string;
  designation: string;
  stockInitial: number;
  stockSecurite: number;
  achats: number;
  ventes: number;
  acc: number;
  retour: number;
  stockFinalTheoric: number;
  stockFinalReal: number | null;
  ecart: number | null;
  updatedAt?: string;
  updatedTime?: string;
}

interface SearchFilters {
  codeBarre: string;
  designation: string;
  dateDebut: string;
  dateFin: string;
}

export function StockMovementPage() {
  const { entreprise } = useAuth();
  const { isMobile } = useDeviceType();
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ codeBarre: "", designation: "", dateDebut: "", dateFin: "" });

  const fetchStockMovements = useCallback(async () => {
    if (!entreprise?.id) {
      setError(null);
      toast.error("Utilisateur non authentifié.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = {
        codeBarre: searchFilters.codeBarre,
        designation: searchFilters.designation,
        dateDebut: searchFilters.dateDebut,
        dateFin: searchFilters.dateFin,
      };
      const response = await getInventoryByParams(entreprise.id, params);
      const formattedData = response && response.map((movement: any) => ({
        id: movement.id,
        date: new Date(movement.date).toLocaleDateString("fr-FR"),
        time: new Date(movement.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        codeBarre: movement.codeBarre,
        designation: movement.designation,
        stockInitial: movement.stockInitial,
        stockSecurite: movement.stockSecurite,
        achats: movement.achats,
        ventes: movement.ventes,
        acc: movement.acc,
        stockFinalTheoric: movement.stockFinalTheoric,
        stockFinalReal: movement.stockFinalReal,
        ecart: movement.ecart,
        retour: movement.retour || 0,
        updatedAt: movement.updatedAt ? new Date(movement.updatedAt).toLocaleDateString("fr-FR") : undefined,
        updatedTime: movement.updatedAt ? new Date(movement.updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : undefined,
      }));
      setStockMovements(formattedData || []);
    } catch (err: any) {
      const errorMessage = err?.message || err || "Erreur lors de la récupération des données.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [entreprise?.id, searchFilters]);

  const handleSearch = () => fetchStockMovements();

  const clearFilters = () => {
    setSearchFilters({ codeBarre: "", designation: "", dateDebut: "", dateFin: "" });
    setShowFilters(!isMobile);
    fetchStockMovements();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const calculateSummary = () =>
    stockMovements.reduce(
      (acc, movement) => ({
        totalMovements: acc.totalMovements + 1,
        totalAchats: acc.totalAchats + movement.achats,
        totalVentes: acc.totalVentes + movement.ventes,
        totalRetour: acc.totalRetour + (movement.retour || 0),
        totalEcart: acc.totalEcart + (movement.ecart || 0),
      }),
      { totalMovements: 0, totalAchats: 0, totalVentes: 0,totalRetour: 0, totalEcart: 0 }
    );

  useEffect(() => {
    fetchStockMovements();
  }, [fetchStockMovements]);

  const summary = calculateSummary();

  // Classes CSS cyber responsive
  const inputClass = "w-full px-3 py-2 bg-[#0a0e17]/80 border border-[#00ffea]/30 rounded-lg text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-200 text-sm";
  const buttonClass = "px-3 py-2 bg-gradient-to-r from-[#00ffea]/20 to-[#0099ff]/20 text-white rounded-lg border border-[#00ffea]/40 hover:from-[#00ffea]/30 hover:to-[#0099ff]/30 hover:border-[#00ffea] transition-all duration-200 text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#050811] py-4 px-3 md:px-4">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header compact */}
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-6 bg-gradient-to-b from-[#00ffea] to-[#0099ff] rounded-full"></div>
          <h1 className="text-lg md:text-xl font-bold font-orbitron tracking-wide text-white">
            MOUVEMENTS DE <span className="text-[#00ffea]">STOCK</span>
          </h1>
        </div>

        {error && (
          <div className="bg-[#ff416c]/20 text-[#ff416c] p-3 rounded-lg border border-[#ff416c]/30 text-sm">
            {error}
          </div>
        )}

        {/* Carte principale */}
        <div className="bg-gradient-to-br from-[#0a0e17]/90 to-[#050811]/90 backdrop-blur-sm rounded-lg border border-[#00ffea]/20 shadow-lg shadow-[#00ffea]/5 p-3 md:p-4">
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`${buttonClass} w-full flex items-center justify-center gap-2 mb-3`}
              aria-label={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            >
              <Search className="w-4 h-4" />
              {showFilters ? "MASQUER FILTRES" : "AFFICHER FILTRES"}
            </button>
          )}

          {showFilters && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div className="space-y-1">
                  <label htmlFor="codeBarre" className="block text-xs font-medium text-[#00ffea]/70">Code à barre</label>
                  <input
                    type="text"
                    id="codeBarre"
                    name="codeBarre"
                    value={searchFilters.codeBarre}
                    onChange={handleSearchChange}
                    className={inputClass}
                    placeholder="Code à barre"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="designation" className="block text-xs font-medium text-[#00ffea]/70">Désignation</label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={searchFilters.designation}
                    onChange={handleSearchChange}
                    className={inputClass}
                    placeholder="Désignation"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="dateDebut" className="block text-xs font-medium text-[#00ffea]/70">Date début</label>
                  <input
                    type="date"
                    id="dateDebut"
                    name="dateDebut"
                    value={searchFilters.dateDebut}
                    onChange={handleSearchChange}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="dateFin" className="block text-xs font-medium text-[#00ffea]/70">Date fin</label>
                  <input
                    type="date"
                    id="dateFin"
                    name="dateFin"
                    value={searchFilters.dateFin}
                    onChange={handleSearchChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mb-4">
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-[#ff416c]/20 text-[#ff416c] rounded-lg border border-[#ff416c]/40 hover:bg-[#ff416c]/30 transition-all duration-200 text-sm"
                >
                  Effacer
                </button>
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-[#00ff88] to-[#00ccaa] text-white rounded-lg border border-[#00ff88]/40 hover:from-[#00ff88] hover:to-[#00ccaa] transition-all duration-200 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Rechercher
                </button>
              </div>
            </>
          )}

          {/* Statistiques compactes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="bg-[#00ffea]/5 p-2 rounded-lg border border-[#00ffea]/20">
              <div className="text-xs text-[#00ffea]/70 mb-1">Total</div>
              <p className="text-base font-bold text-white font-mono">{summary.totalMovements}</p>
            </div>
            <div className="bg-[#0099ff]/5 p-2 rounded-lg border border-[#0099ff]/20">
              <div className="text-xs text-[#0099ff]/70 mb-1">Achats</div>
              <p className="text-base font-bold text-white font-mono">{summary.totalAchats}</p>
            </div>
            <div className="bg-[#ff416c]/5 p-2 rounded-lg border border-[#ff416c]/20">
              <div className="text-xs text-[#ff416c]/70 mb-1">Ventes</div>
              <p className="text-base font-bold text-white font-mono">{summary.totalVentes}</p>
            </div>
            <div className="bg-[#ffcc00]/5 p-2 rounded-lg border border-[#ffcc00]/20">
              <div className="text-xs text-[#ffcc00]/70 mb-1">Retours</div>
              <p className="text-base font-bold text-white font-mono">{summary.totalRetour}</p>
            </div>

            <div className={`p-2 rounded-lg border ${
              summary.totalEcart >= 0 
                ? 'bg-[#00ff88]/5 border-[#00ff88]/20' 
                : 'bg-[#ff416c]/5 border-[#ff416c]/20'
            }`}>
              <div className={`text-xs mb-1 ${
                summary.totalEcart >= 0 ? 'text-[#00ff88]/70' : 'text-[#ff416c]/70'
              }`}>
                Écart
              </div>
              <p className={`text-base font-bold font-mono ${
                summary.totalEcart >= 0 ? 'text-[#00ff88]' : 'text-[#ff416c]'
              }`}>
                {summary.totalEcart >= 0 ? '+' : ''}{summary.totalEcart}
              </p>
            </div>
          </div>

          {/* Tableau */}
          {isMobile ? (
            <div className="space-y-2">
              {stockMovements.map((movement) => (
                <div key={movement.id} className="bg-[#0a0e17]/50 p-3 rounded-lg border border-[#00ffea]/10">
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <span className="text-[#00ffea]/60">Date</span>
                    <span className="text-white">{movement.date}</span>
                    
                    <span className="text-[#00ffea]/60">Code barre</span>
                    <span className="text-white font-mono text-xs">{movement.codeBarre}</span>
                    
                    <span className="text-[#00ffea]/60">Désignation</span>
                    <span className="text-white truncate" title={movement.designation}>{movement.designation}</span>
                    
                    <span className="text-[#00ffea]/60">Stock</span>
                    <span className="text-white">{movement.stockInitial}</span>
                    
                    <span className="text-[#00ffea]/60">Achats</span>
                    <span className="text-[#0099ff]">{movement.achats}</span>
                    
                    <span className="text-[#00ffea]/60">Ventes</span>
                    <span className="text-[#ff416c]">{movement.ventes}</span>
                    <span className="text-[#00ffea]/60">Retour</span>
<span className="text-white">{movement.retour ?? 0}</span>

                    
                    <span className="text-[#00ffea]/60">Écart</span>
                    <span className={`${movement.ecart !== null ? (movement.ecart < 0 ? "text-[#ff416c]" : "text-[#00ff88]") : "text-white"}`}>
                      {movement.ecart !== null ? (movement.ecart >= 0 ? "+" : "") + movement.ecart : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-2 border-[#00ffea]/30 border-t-[#00ffea] rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-[#00ffea] text-sm">Chargement...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <div className="text-[#ff416c] text-sm">{error}</div>
                </div>
              ) : stockMovements.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[#00ffea]/50 text-sm">Aucun mouvement trouvé</p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#00ffea]/20">
                      <th className="px-3 py-2 text-left font-medium text-[#00ffea]/70">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-[#00ffea]/70">Mise à jour</th>
                      <th className="px-3 py-2 text-left font-medium text-[#00ffea]/70">Code barre</th>
                      <th className="px-3 py-2 text-left font-medium text-[#00ffea]/70">Désignation</th>
                      <th className="px-3 py-2 text-right font-medium text-[#00ffea]/70">Stock Réel</th>
                      <th className="px-3 py-2 text-right font-medium text-[#00ffea]/70">Stock Sécurité</th>
                      <th className="px-3 py-2 text-right font-medium text-[#00ffea]/70">Achats</th>
                      <th className="px-3 py-2 text-right font-medium text-[#00ffea]/70">Ventes</th>
                      <th className="px-3 py-2 text-right font-medium text-[#00ffea]/70">ACC</th>
                      <th className="px-3 py-2 text-right font-medium text-[#00ffea]/70">Retour</th>
                      <th className="px-3 py-2 text-right font-medium text-[#00ffea]/70">Stock Théorique</th>
                      <th className="px-3 py-2 text-right font-medium text-[#00ffea]/70">Inventaire</th>
                      <th className="px-3 py-2 text-right font-medium text-[#00ffea]/70">Écart</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00ffea]/10">
                    {stockMovements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-[#00ffea]/5 transition-colors">
                        <td className="px-3 py-2 text-white">{movement.date}</td>
                        <td className="px-3 py-2 text-white text-xs">{movement.updatedAt || "-"} {movement.updatedTime}</td>
                        <td className="px-3 py-2 text-white font-mono">{movement.codeBarre}</td>
                        <td className="px-3 py-2 text-white truncate max-w-[150px]" title={movement.designation}>
                          {movement.designation}
                        </td>
                        <td className="px-3 py-2 text-white text-right">{movement.stockInitial}</td>
                        <td className="px-3 py-2 text-white text-right">{movement.stockSecurite}</td>
                        <td className="px-3 py-2 text-[#0099ff] text-right">{movement.achats}</td>
                        <td className="px-3 py-2 text-[#ff416c] text-right">{movement.ventes}</td>
                        <td className="px-3 py-2 text-white text-right">{movement.acc}</td>
                        <td className="px-3 py-2 text-white text-right">{movement.retour ?? 0}</td>
                        <td className="px-3 py-2 text-white text-right">{movement.stockFinalTheoric}</td>
                        <td className="px-3 py-2 text-white text-right">{movement.stockFinalReal ?? "-"}</td>
                        <td className={`px-3 py-2 text-right ${
                          movement.ecart !== null 
                            ? (movement.ecart > 0 
                                ? "text-[#00ff88]" 
                                : movement.ecart < 0 
                                  ? "text-[#ff416c]" 
                                  : "text-white")
                            : "text-white"
                        }`}>
                          {movement.ecart !== null 
                            ? (movement.ecart > 0 ? "+" : "") + movement.ecart 
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Footer compact */}
        <div className="text-center">
          <div className="text-xs text-[#00ffea]/50">
            SMARTCASH STOCK SYSTEM © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}