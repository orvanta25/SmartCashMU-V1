"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, User, Barcode, Filter, FileText, Loader2 } from "lucide-react";
import { useAuth } from "../../auth/auth-context";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { findAllAcc, updateAccById } from "@renderer/api/acc";

interface SearchFilters {
  responsable: string;
  codeBar: string;
  startDate: string;
  endDate: string;
}

interface AccData {
  id: string;
  date: string;
  time: string;
  responsable: string;
  codeBar: string;
  designation: string;
  quantity: number;
  remarque: string | null;
  updatedAt?: string;
  updatedTime?: string;
}

export function ACCList() {
  const { entreprise } = useAuth();
  const [accData, setAccData] = useState<AccData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ responsable: "", codeBar: "", startDate: "", endDate: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState<Partial<AccData>>({});
  const [updating, setUpdating] = useState(false);

  const fetchAccidents = async () => {
    if (!entreprise?.id) {
      setError("");
      toast.error("Utilisateur non authentifié.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const params = {
        codeBarre: searchFilters.codeBar ,
        responsable: searchFilters.responsable ,
        dateDebut: searchFilters.startDate ,
        dateFin: searchFilters.endDate ,
      };
      const response = await findAllAcc(entreprise.id,params)

      const formattedData = response.map((acc: any) => ({
        id: acc.id,
        date: new Date(acc.createdAt).toLocaleDateString("fr-FR"),
        time: new Date(acc.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        responsable: acc.responsable,
        codeBar: acc.codeBarre,
        designation: acc.designation,
        quantity: acc.quantite,
        remarque: acc.remarque,
        updatedAt: acc.updatedAt ? new Date(acc.updatedAt).toLocaleDateString("fr-FR") : undefined,
        updatedTime: acc.updatedAt ? new Date(acc.updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : undefined,
      }));

      setAccData(formattedData);
    } catch (err: any) {
      const errorMessage = err || "Erreur lors de la récupération des données.";
      setError(String(errorMessage));
      toast.error(String(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAcc = async (id: string, data: Partial<{ responsable: string; quantite: number; remarque: string }>) => {
    if (!entreprise?.id) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    try {
      await updateAccById(entreprise.id,id,
        { responsable: data.responsable, 
          quantite: data.quantite, 
          remarque: data.remarque })
        
      
      setAccData(
        accData.map((acc) =>
          acc.id === id
            ? {
                ...acc,
                responsable: data.responsable || acc.responsable,
                quantity: data.quantite || acc.quantity,
                remarque: data.remarque || acc.remarque,
                updatedAt: new Date().toLocaleDateString("fr-FR"),
                updatedTime: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              }
            : acc
        )
      );
      toast.success("ACC mis à jour !");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la mise à jour.";
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleEdit = (acc: AccData) => {
    setEditingId(acc.id as any);
    setEditingData({ responsable: acc.responsable, quantity: acc.quantity, remarque: acc.remarque || "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number.parseFloat(value) || 0 : value,
    }));
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSave = async (id: string) => {
    try {
      setUpdating(true);
      await handleUpdateAcc(id, {
        responsable: editingData.responsable,
        quantite: editingData.quantity,
        remarque: editingData.remarque || undefined,
      });
      setEditingId(null);
      setEditingData({});
    } catch {
      // Error handled in handleUpdateAcc
    } finally {
      setUpdating(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => fetchAccidents();

  const clearFilters = () => {
    setSearchFilters({ responsable: "", codeBar: "", startDate: "", endDate: "" });
    fetchAccidents();
  };

  useEffect(() => {
    if (entreprise?.id) fetchAccidents();
  }, [entreprise]);

  const inputClass = "w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-md text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-xs";
  const buttonClass = "px-3 py-1.5 text-white rounded-md hover:bg-white/10 transition-all duration-200 text-xs";
  const tableInputClass = "w-16 px-1 py-0.5 bg-black/20 border border-white/10 rounded text-white text-xs no-spinner";

  return (
    <div className="min-h-screen bg-orvanta py-4 px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-white">Liste des ACC</h1>
            <p className="text-white/60 text-xs">Gérez vos accidents de stock</p>
          </div>
          <Link
            to="/dashboard_user/inventory/acc"
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center gap-1.5 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau ACC
          </Link>
        </div>

        {error && <div className="bg-red-500/20 text-red-300 p-2 rounded-md text-xs">{error}</div>}

        <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-md border border-white/10 shadow-lg">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-md">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Filtres de recherche</h2>
                <p className="text-white/60 text-xs">Affinez votre recherche</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label htmlFor="responsable" className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <User className="h-3 w-3 text-white/60" />
                  Responsable
                </label>
                <input
                  type="text"
                  id="responsable"
                  name="responsable"
                  value={searchFilters.responsable}
                  onChange={handleSearchChange}
                  className={inputClass}
                  placeholder="Nom du responsable"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="codeBar" className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <Barcode className="h-3 w-3 text-white/60" />
                  Code à barre
                </label>
                <input
                  type="text"
                  id="codeBar"
                  name="codeBar"
                  value={searchFilters.codeBar}
                  onChange={handleSearchChange}
                  className={inputClass}
                  placeholder="Code à barre"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="startDate" className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <Calendar className="h-3 w-3 text-white/60" />
                  Date de début
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={searchFilters.startDate}
                  onChange={handleSearchChange}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="endDate" className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <Calendar className="h-3 w-3 text-white/60" />
                  Date de fin
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={searchFilters.endDate}
                  onChange={handleSearchChange}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-3 border-t border-white/10 gap-2">
              <button onClick={clearFilters} className={`${buttonClass} text-white/70 hover:text-white`}>Effacer</button>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                Rechercher
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-md border border-white/10 shadow-lg">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-md">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Liste des ACC</h2>
                  <p className="text-white/60 text-xs">{accData.length} résultat{accData.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-6 text-white/60 text-xs">Chargement...</div>
            ) : error ? (
              <div className="text-center py-6 text-red-400 text-xs">{error}</div>
            ) : accData.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3">
                  <FileText className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Aucune donnée</h3>
                <p className="text-white/60 text-xs mb-3">Aucun ACC ne correspond à vos critères.</p>
                <button onClick={clearFilters} className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}>Effacer</button>
              </div>
            ) : (
              <table className="w-full hidden md:table text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-2 py-1 text-left font-medium text-white/80">Date</th>
                    <th className="px-2 py-1 text-left font-medium text-white/80">Heure</th>
                    <th className="px-2 py-1 text-left font-medium text-white/80">Mise à jour</th>
                    <th className="px-2 py-1 text-left font-medium text-white/80">Responsable</th>
                    <th className="px-2 py-1 text-left font-medium text-white/80">Code à barre</th>
                    <th className="px-2 py-1 text-left font-medium text-white/80">Désignation</th>
                    <th className="px-2 py-1 text-left font-medium text-white/80">Quantité</th>
                    <th className="px-2 py-1 text-left font-medium text-white/80">Remarque</th>
                    <th className="px-2 py-1 text-right font-medium text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {accData.map((acc) => (
                    <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-2 py-1 text-white">{acc.date}</td>
                      <td className="px-2 py-1 text-white">{acc.time}</td>
                      <td className="px-2 py-1 text-white">{acc.updatedAt || "-"} {acc.updatedTime}</td>
                      <td className="px-2 py-1 text-white">
                        {editingId === acc.id ? (
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
                          acc.responsable
                        )}
                      </td>
                      <td className="px-2 py-1">
                        <span className="px-1 py-0.5 bg-white/10 text-white rounded font-mono">{acc.codeBar}</span>
                      </td>
                      <td className="px-2 py-1 text-white max-w-24 truncate" title={acc.designation}>
                        {acc.designation}
                      </td>
                      <td className="px-2 py-1 text-white">
                        {editingId === acc.id ? (
                          <input
                            type="number"
                            name="quantity"
                            value={editingData.quantity === 0 || editingData.quantity === undefined ? "" : editingData.quantity}
                            onChange={handleChange}
                            min="0.001"
                            step="0.001"
                            className={tableInputClass}
                            style={{ MozAppearance: "textfield", appearance: "textfield" }}
                            inputMode="decimal"
                            disabled={updating}
                            required
                          />
                        ) : (
                          <span className="px-1 py-0.5 bg-blue-500/20 text-blue-300 rounded font-semibold">{acc.quantity}</span>
                        )}
                      </td>
                      <td className="px-2 py-1 text-white">
                        {editingId === acc.id ? (
                          <textarea
                            name="remarque"
                            value={editingData.remarque || ""}
                            onChange={handleChange}
                            className={`${inputClass} resize-none`}
                            rows={2}
                            disabled={updating}
                          />
                        ) : (
                          acc.remarque || "-"
                        )}
                      </td>
                      <td className="px-2 py-1 text-right space-x-1">
                        {editingId === acc.id ? (
                          <>
                            <button
                              onClick={() => handleSave(acc.id)}
                              disabled={updating}
                              className="px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs min-w-[32px]"
                              aria-label="Enregistrer"
                            >
                              {updating ? "..." : "✓"}
                            </button>
                            <button
                              onClick={handleCancel}
                              disabled={updating}
                              className="px-2 py-0.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs min-w-[32px]"
                              aria-label="Annuler"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEdit(acc)}
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

          <div className="block md:hidden p-3 space-y-3">
            {accData.length > 0 && !isLoading && !error && accData.map((acc) => (
              <div key={acc.id} className="bg-white/5 rounded-md border border-white/10 p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-white/60">Date</span>
                  <span className="text-white">{acc.date}</span>
                  <span className="text-white/60">Heure</span>
                  <span className="text-white">{acc.time}</span>
                  <span className="text-white/60">Mise à jour</span>
                  <span className="text-white">{acc.updatedAt || "-"} {acc.updatedTime}</span>
                  <span className="text-white/60">Responsable</span>
                  {editingId === acc.id ? (
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
                    <span className="text-white">{acc.responsable}</span>
                  )}
                  <span className="text-white/60">Code à barre</span>
                  <span className="text-white">{acc.codeBar}</span>
                  <span className="text-white/60">Désignation</span>
                  <span className="text-white truncate" title={acc.designation}>{acc.designation}</span>
                  <span className="text-white/60">Quantité</span>
                  {editingId === acc.id ? (
                    <input
                      type="number"
                      name="quantity"
                      value={editingData.quantity === 0 || editingData.quantity === undefined ? "" : editingData.quantity}
                      onChange={handleChange}
                      min="0.001"
                      step="0.001"
                      className={tableInputClass}
                      style={{ MozAppearance: "textfield", appearance: "textfield" }}
                      inputMode="decimal"
                      disabled={updating}
                      required
                    />
                  ) : (
                    <span className="text-white">{acc.quantity}</span>
                  )}
                  <span className="text-white/60">Remarque</span>
                  {editingId === acc.id ? (
                    <textarea
                      name="remarque"
                      value={editingData.remarque || ""}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                      rows={2}
                      disabled={updating}
                    />
                  ) : (
                    <span className="text-white">{acc.remarque || "-"}</span>
                  )}
                </div>
                <div className="flex justify-end gap-1.5 mt-2">
                  {editingId === acc.id ? (
                    <>
                      <button
                        onClick={() => handleSave(acc.id)}
                        disabled={updating}
                        className="px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs min-w-[32px]"
                        aria-label="Enregistrer"
                      >
                        {updating ? "..." : "✓"}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={updating}
                        className="px-2 py-0.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs min-w-[32px]"
                        aria-label="Annuler"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(acc)}
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
        </div>
      </div>
    </div>
  );
}