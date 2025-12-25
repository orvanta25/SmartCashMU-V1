"use client";

import React, { useState, useEffect } from "react";
import { Settings, FileText, Filter } from "lucide-react";
import { useAuth } from "../../../../components/auth/auth-context";
import { toast } from "react-toastify";
import {Link} from "react-router-dom"
import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { getAllBalanceConfigs, updateBalanceConfig, deleteBalanceConfig, BalanceConfig, UpdateBalanceConfigDto, getBalanceConfigByCode } from "@renderer/api/balance";


interface SearchFilters {
  balanceCode: string;
}

interface BalanceConfigRow extends BalanceConfig {
  isEditing: boolean;
  editedValues: UpdateBalanceConfigDto;
}

export function BalanceConfigList() {
  const { entreprise } = useAuth();
  const [balanceConfigs, setBalanceConfigs] = useState<BalanceConfigRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<UpdateBalanceConfigDto>({});
  const [updating, setUpdating] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    balanceCode: "",
  });
  const { isMobile, isTablet, isIPadMini,  isSurfaceDuo, sunMy } = useDeviceType();

  const fetchBalanceConfigs = async () => {
    if (!entreprise?.id) {
      setError("Utilisateur non authentifié.");
      toast.error("Utilisateur non authentifié.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const configs = await getAllBalanceConfigs(entreprise.id);
      setBalanceConfigs(configs.map(config => ({
        ...config,
        isEditing: false,
        editedValues: {
          barcodeLength: config.barcodeLength,
          balanceCode: config.balanceCode,
          productCodeStart: config.productCodeStart,
          productCodeLength: config.productCodeLength,
          priceStart: config.priceStart,
          priceLength: config.priceLength,
          sellerStart: config.sellerStart,
          sellerLength: config.sellerLength,
        },
      })));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la récupération des données.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceConfigs();
  }, [entreprise]);

  const handleEdit = (config: BalanceConfigRow) => {
    setEditingId(config.id);
    setEditingData({
      barcodeLength: config.barcodeLength,
      balanceCode: config.balanceCode,
      productCodeStart: config.productCodeStart,
      productCodeLength: config.productCodeLength,
      priceStart: config.priceStart,
      priceLength: config.priceLength,
      sellerStart: config.sellerStart,
      sellerLength: config.sellerLength,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({
      ...prev,
      [name]: name === "balanceCode" ? value : parseInt(value) || undefined,
    }));
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSave = async (id: number) => {
    if (!entreprise?.id) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    try {
      setUpdating(true);
      const response = await updateBalanceConfig(entreprise.id,id, editingData);
      setBalanceConfigs(prev =>
        prev.map(config =>
          config.id === id
            ? { ...config, ...response.balanceConfig, isEditing: false }
            : config
        )
      );
      setEditingId(null);
      setEditingData({});
      toast.success(response.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la mise à jour de la configuration.";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!entreprise?.id) {
      toast.error("Utilisateur non authentifié.");
      return;
    }
    if (!window.confirm("Voulez-vous vraiment supprimer cette configuration ?")) return;
    try {
      setIsLoading(true);
      await deleteBalanceConfig(entreprise.id, id);
      setBalanceConfigs(prev => prev.filter(config => config.id !== id));
      toast.success("Configuration supprimée avec succès.");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    if(entreprise?.id){
      const searchResult = await getBalanceConfigByCode(entreprise?.id,searchFilters.balanceCode) 
      if(searchResult)setBalanceConfigs(searchResult.map(config => ({
        ...config,
        isEditing: false,
        editedValues: {
          barcodeLength: config.barcodeLength,
          balanceCode: config.balanceCode,
          productCodeStart: config.productCodeStart,
          productCodeLength: config.productCodeLength,
          priceStart: config.priceStart,
          priceLength: config.priceLength,
          sellerStart: config.sellerStart,
          sellerLength: config.sellerLength,
        },
      })))
    }
  };

  // const handleSearch = async () => {
  //   await fetchBalanceConfigs();
  // };

  // const clearFilters = () => {
  //   setSearchFilters({
  //     balanceCode: "",
  //   });
  //   fetchBalanceConfigs();
  // };

  const getFontSizeClass = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "text-xs";
    if (isTablet || isIPadMini) return "text-sm";
    return "text-base";
  };

  // Filtered configs for instant search
  const filteredConfigs = balanceConfigs.filter(config =>
    config.balanceCode.toLowerCase().includes(searchFilters.balanceCode.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-orvanta p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold text-white mb-2 ${getFontSizeClass()}`}>
              Liste des Configurations Balance
            </h1>
            <p className={`text-purple-200 ${getFontSizeClass()}`}>
              Gérer vos configurations de balance
            </p>
          </div>
          <Link
            to="/dashboard_user/configuration/balance"
            className={`px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center space-x-2 ${getFontSizeClass()}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nouveau Balance</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/40 backdrop-blur-xl border border-red-700/50 rounded-lg p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl">
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-700/30 to-purple-600/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/40 rounded-lg">
                <Filter className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Recherche</h2>
                <p className="text-purple-200 text-sm">Recherchez par code balance</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-2 max-w-xs">
              <label
                htmlFor="balanceCode"
                className="flex items-center space-x-2 text-sm font-medium text-purple-200"
              >
                <Settings className="h-4 w-4 text-purple-400" />
                <span>Code balance</span>
              </label>
              <input
                type="text"
                id="balanceCode"
                name="balanceCode"
                value={searchFilters.balanceCode}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200 text-sm"
                placeholder="Code balance"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-700/30 to-purple-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/40 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Liste des Configurations</h2>
                  <p className="text-purple-200 text-sm">
                    {filteredConfigs.length} résultat{filteredConfigs.length !== 1 ? "s" : ""} trouvé{filteredConfigs.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-8 text-purple-200">Chargement...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">{error}</div>
            ) : filteredConfigs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-purple-300/40" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Aucune donnée disponible</h3>
                <p className="text-purple-200 mb-4">Aucune configuration ne correspond à vos critères de recherche.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left text-sm font-medium text-purple-200">Code Balance</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-purple-200">Longueur Code Barre</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-purple-200">Position Produit</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-purple-200">Longueur Produit</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-purple-200">Position Prix</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-purple-200">Longueur Prix</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-purple-200">Position Vendeur</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-purple-200">Longueur Vendeur</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-purple-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredConfigs.map((config) => (
                    <tr key={config.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4">
                        {editingId === config.id ? (
                          <input
                            type="text"
                            name="balanceCode"
                            value={editingData.balanceCode || ""}
                            onChange={handleChange}
                            className="w-full px-2 py-1 bg-purple-900/20 border border-purple-500/30 rounded text-white text-sm"
                            disabled={updating}
                            autoFocus
                            required
                          />
                        ) : (
                          <span className="px-2 py-1 bg-white/10 text-white rounded text-xs font-mono">
                            {config.balanceCode}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === config.id ? (
                          <input
                            type="number"
                            name="barcodeLength"
                            value={editingData.barcodeLength || ""}
                            onChange={handleChange}
                            className="w-full px-2 py-1 bg-purple-900/20 border border-purple-500/30 rounded text-white text-sm"
                            disabled={updating}
                            required
                          />
                        ) : (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-semibold">
                            {config.barcodeLength}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === config.id ? (
                          <input
                            type="number"
                            name="productCodeStart"
                            value={editingData.productCodeStart || ""}
                            onChange={handleChange}
                            className="w-full px-2 py-1 bg-purple-900/20 border border-purple-500/30 rounded text-white text-sm"
                            disabled={updating}
                            required
                          />
                        ) : (
                          <span className="text-white">{config.productCodeStart}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === config.id ? (
                          <input
                            type="number"
                            name="productCodeLength"
                            value={editingData.productCodeLength || ""}
                            onChange={handleChange}
                            className="w-full px-2 py-1 bg-purple-900/20 border border-purple-500/30 rounded text-white text-sm"
                            disabled={updating}
                            required
                          />
                        ) : (
                          <span className="text-white">{config.productCodeLength}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === config.id ? (
                          <input
                            type="number"
                            name="priceStart"
                            value={editingData.priceStart || ""}
                            onChange={handleChange}
                            className="w-full px-2 py-1 bg-purple-900/20 border border-purple-500/30 rounded text-white text-sm"
                            disabled={updating}
                            required
                          />
                        ) : (
                          <span className="text-white">{config.priceStart}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === config.id ? (
                          <input
                            type="number"
                            name="priceLength"
                            value={editingData.priceLength || ""}
                            onChange={handleChange}
                            className="w-full px-2 py-1 bg-purple-900/20 border border-purple-500/30 rounded text-white text-sm"
                            disabled={updating}
                            required
                          />
                        ) : (
                          <span className="text-white">{config.priceLength}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {editingId === config.id ? (
                          <input
                            type="number"
                            name="sellerStart"
                            value={editingData.sellerStart || ""}
                            onChange={handleChange}
                            className="w-full px-2 py-1 bg-purple-900/20 border border-purple-500/30 rounded text-white text-sm"
                            disabled={updating}
                          />
                        ) : (
                          config.sellerStart || "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {editingId === config.id ? (
                          <input
                            type="number"
                            name="sellerLength"
                            value={editingData.sellerLength || ""}
                            onChange={handleChange}
                            className="w-full px-2 py-1 bg-purple-900/20 border border-purple-500/30 rounded text-white text-sm"
                            disabled={updating}
                          />
                        ) : (
                          config.sellerLength || "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {editingId === config.id ? (
                          <>
                            <button
                              onClick={() => handleSave(config.id)}
                              disabled={updating}
                              className="text-green-400 hover:text-green-300 transition-colors px-3 py-1 rounded-md hover:bg-green-400/10 text-sm"
                            >
                              {updating ? "Sauvegarde..." : "Sauvegarder"}
                            </button>
                            <button
                              onClick={handleCancel}
                              disabled={updating}
                              className="text-gray-400 hover:text-gray-300 transition-colors px-3 py-1 rounded-md hover:bg-gray-400/10 text-sm"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(config)}
                              className="text-purple-400 hover:text-purple-300 transition-colors px-3 py-1 rounded-md hover:bg-purple-400/10 text-sm"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(config.id)}
                              className="text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded-md hover:bg-red-400/10 text-sm"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}