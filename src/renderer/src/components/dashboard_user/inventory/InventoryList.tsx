"use client";

import { useState, useEffect, useCallback } from "react";
import { Search,Loader2} from "lucide-react";
import { useAuth } from "../../auth/auth-context";
import { toast } from "react-toastify";

import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { getAllInventory, updateInventorById, UpdateInventory } from "@renderer/api/inventaire";

interface SearchFilters {
  searchQuery: string;
  dateDebut?: string;
  dateFin?: string;
}

interface InventoryItem {
  id: string;
  responsable: string;
  codeBarre: string;
  designation: string;
  quantite: number;
  createdAt: string;
  createdTime?: string;
  entrepriseId: string;
  updatedAt?: string;
  updatedTime?: string;
}

export function InventoryList() {
  const { entreprise } = useAuth();
  const { isMobile, } = useDeviceType();
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ searchQuery: "", dateDebut: "", dateFin: "" });
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState<UpdateInventory>({responsable:"",quantite:0});
  const [updating, setUpdating] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!entreprise?.id) {
      setError("");
      toast.error("Utilisateur non authentifié.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      
      const response = await getAllInventory(entreprise.id,filters)

      setInventoryData(response);
    } catch (err: unknown) {
      const message = err || "Échec de la récupération des données.";
      setError(String(message));
      toast.error(String(message));
    } finally {
      setLoading(false);
    }
  }, [entreprise?.id, filters]);

  useEffect(() => {
    if (entreprise?.id) fetchInventory();
  }, [fetchInventory]);

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id as any);
    setEditingData({ responsable: item.responsable, quantite: item.quantite });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({
      ...prev,
      [name]: name === "quantite" ? Number.parseFloat(value) || 0 : value,
    }));
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({responsable:"",quantite:0});
  };

  const handleSave = async (id: string) => {
    if (!entreprise?.id) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    setUpdating(true);
    try {
      await updateInventorById(entreprise.id,id,{
          responsable: editingData.responsable,
          quantite: editingData.quantite,
        })

      fetchInventory()

      toast.success("Inventaire mis à jour !");
      setEditingId(null);
      setEditingData({responsable:"",quantite:0});
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSearch = () => fetchInventory();

  const clearFilters = () => {
    setFilters({ searchQuery: "", dateDebut: "", dateFin: "" });
    setShowFilters(!isMobile);
    fetchInventory();
  };

  const calculateSummary = () =>
    inventoryData.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + 1,
        totalQuantity: acc.totalQuantity + item.quantite,
      }),
      { totalItems: 0, totalQuantity: 0 }
    );

  const summary = calculateSummary();

  const filteredInventoryData = filters.searchQuery.trim()
    ? inventoryData.filter((item) =>
        [item.responsable, item.codeBarre, item.designation].some((field) => field.toLowerCase().includes(filters.searchQuery.toLowerCase()))
      )
    : inventoryData;

  const inputClass = "w-full px-2 py-1 bg-black/20 border border-white/10 rounded text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200";
  const buttonClass = "px-3 py-1.5 text-white rounded-md hover:bg-white/10 transition-all duration-200 text-xs";
  const tableInputClass = "w-16 px-1 py-0.5 bg-black/20 border border-white/10 rounded text-white text-xs no-spinner";

  return (
    <div className="min-h-screen bg-orvanta py-4 px-4">
      <div className="max-w-5xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-base font-bold text-white">Liste d'Inventaire</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              id="searchQuery"
              placeholder="Nom, désignation ou code-barres..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key.toLowerCase() === "m") {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Blocked Ctrl + M from scanner");
                }
                e.key === "Enter" && handleSearch()}}
              className={`${inputClass} sm:w-56`}
              aria-label="Recherche générale"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Rechercher"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
              Rechercher
            </button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 text-red-300 p-2 rounded-md text-xs">{error}</div>}

        <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-md border border-white/10 p-3 shadow-lg">
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`${buttonClass} w-full bg-white/10 hover:bg-white/20 font-medium mb-3`}
              aria-label={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            >
              {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            </button>
          )}

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              <div className="space-y-1">
                <label htmlFor="dateDebut" className="text-xs font-medium text-white/80">Date de début</label>
                <input
                  type="date"
                  id="dateDebut"
                  value={filters.dateDebut}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateDebut: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="dateFin" className="text-xs font-medium text-white/80">Date de fin</label>
                <input
                  type="date"
                  id="dateFin"
                  value={filters.dateFin}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFin: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end mb-3">
            <button onClick={clearFilters} className={`${buttonClass} text-white/70 hover:text-white`}>Effacer</button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-white/5 rounded-md border border-white/10">
            <div>
              <span className="text-xs text-white/60">Nombre d'articles</span>
              <p className="text-base font-bold text-white">{summary.totalItems}</p>
            </div>
            <div>
              <span className="text-xs text-white/60">Quantité totale</span>
              <p className="text-base font-bold text-white">{summary.totalQuantity}</p>
            </div>
          </div>

          {isMobile ? (
            <div className="space-y-3">
              {filteredInventoryData.length >0 && filteredInventoryData.map((item) => (
                <div key={item.id} className="bg-white/5 p-3 rounded-md border border-white/10">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-white/60">Date</span>
                    <span className="text-white">
                      {item.createdAt
                        ? `${new Date(item.createdAt).toLocaleDateString("fr-FR")} ${new Date(item.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                        : "-"}
                    </span>
                    <span className="text-white/60">Mise à jour</span>
                    <span className="text-white">{item.updatedAt || "-"} {item.updatedTime}</span>
                    <span className="text-white/60">Responsable</span>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        name="responsable"
                        value={editingData.responsable || ""}
                        onChange={handleChange}
                        className={inputClass}
                        disabled={updating}
                        autoFocus
                        required
                      />
                    ) : (
                      <span className="text-white">{item.responsable}</span>
                    )}
                    <span className="text-white/60">Code à barre</span>
                    <span className="text-white">{item.codeBarre}</span>
                    <span className="text-white/60">Désignation</span>
                    <span className="text-white truncate" title={item.designation}>{item.designation}</span>
                    <span className="text-white/60">Quantité</span>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        name="quantite"
                        value={editingData.quantite === 0 || editingData.quantite === undefined ? "" : editingData.quantite}
                        onChange={handleChange}
                        min="0"
                        className={tableInputClass}
                        style={{ MozAppearance: "textfield", appearance: "textfield" }}
                        inputMode="decimal"
                        disabled={updating}
                        required
                      />
                    ) : (
                      <span className="text-white">{item.quantite}</span>
                    )}
                  </div>
                  <div className="flex justify-end gap-1.5 mt-2">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => handleSave(item.id)}
                          disabled={updating}
                          className="px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs min-w-[32px]"
                          aria-label="Enregistrer"
                        >
                          {updating ? "..." : "✓"}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={updating}
                          className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs min-w-[32px]"
                          aria-label="Annuler"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs min-w-[32px]"
                        aria-label="Modifier"
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4 text-white/60 text-xs">Chargement...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-400 text-xs">{error}</div>
              ) : filteredInventoryData.length === 0 ? (
                <div className="text-center py-6 text-white/60 text-xs">Aucun article trouvé</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-2 py-1 text-left font-medium text-white/60">Date / Heure</th>
                      <th className="px-2 py-1 text-left font-medium text-white/60">Mise à jour</th>
                      <th className="px-2 py-1 text-left font-medium text-white/60">Responsable</th>
                      <th className="px-2 py-1 text-left font-medium text-white/60">Code à barre</th>
                      <th className="px-2 py-1 text-left font-medium text-white/60">Désignation</th>
                      <th className="px-2 py-1 text-right font-medium text-white/60">Quantité</th>
                      <th className="px-2 py-1 text-right font-medium text-white/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredInventoryData.length >0 && filteredInventoryData.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-2 py-1 text-white">
                          {item.createdAt
                            ? `${new Date(item.createdAt).toLocaleDateString("fr-FR")} ${new Date(item.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                            : "-"}
                        </td>
                        <td className="px-2 py-1 text-white">{item.updatedAt || "-"} {item.updatedTime}</td>
                        <td className="px-2 py-1 text-white">
                          {editingId === item.id ? (
                            <input
                              type="text"
                              name="responsable"
                              value={editingData.responsable || ""}
                              onChange={handleChange}
                              className={inputClass}
                              disabled={updating}
                              autoFocus
                              required
                            />
                          ) : (
                            item.responsable
                          )}
                        </td>
                        <td className="px-2 py-1 text-white">{item.codeBarre}</td>
                        <td className="px-2 py-1 text-white max-w-24 truncate" title={item.designation}>
                          {item.designation}
                        </td>
                        <td className="px-2 py-1 text-white text-right">
                          {editingId === item.id ? (
                            <input
                              type="number"
                              name="quantite"
                              value={editingData.quantite === 0 || editingData.quantite === undefined ? "" : editingData.quantite}
                              onChange={handleChange}
                              min="0"
                              className={tableInputClass}
                              style={{ MozAppearance: "textfield", appearance: "textfield" }}
                              inputMode="decimal"
                              disabled={updating}
                              required
                            />
                          ) : (
                            item.quantite
                          )}
                        </td>
                        <td className="px-2 py-1 text-right space-x-1">
                          {editingId === item.id ? (
                            <>
                              <button
                                onClick={() => handleSave(item.id)}
                                disabled={updating}
                                className="px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs min-w-[32px]"
                                aria-label="Enregistrer"
                              >
                                {updating ? "..." : "✓"}
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={updating}
                                className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs min-w-[32px]"
                                aria-label="Annuler"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(item)}
                              className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs min-w-[32px]"
                              aria-label="Modifier"
                            >
                              ✏️
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}