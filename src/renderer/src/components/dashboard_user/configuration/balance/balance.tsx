"use client";

import type React from "react";
import { useState } from "react";
import { Settings, Save } from "lucide-react";
import { useAuth } from "../../../auth/auth-context";
import { toast } from "react-toastify";
import {Link} from "react-router-dom"
import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { createBalanceConfig } from "@renderer/api/balance";

interface BalanceSettingsForm {
  barcodeLength: string;
  balanceCode: string;
  productCodePosition: string;
  productCodeLength: string;
  pricePosition: string;
  priceLength: string;
  sellerCodePosition: string;
  sellerCodeLength: string;
}

export function BalanceSettings() {
  const { entreprise } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BalanceSettingsForm>({
    barcodeLength: "",
    balanceCode: "",
    productCodePosition: "",
    productCodeLength: "",
    pricePosition: "",
    priceLength: "",
    sellerCodePosition: "",
    sellerCodeLength: "",
  });
  const { isMobile, isTablet, isIPadMini,isSurfaceDuo, sunMy } = useDeviceType();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entreprise?.id) {
      setError("Utilisateur non authentifié.");
      toast.error("Utilisateur non authentifié.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dto = {
        entrepriseId: entreprise.id,
        barcodeLength: parseInt(formData.barcodeLength),
        balanceCode: formData.balanceCode,
        productCodeStart: parseInt(formData.productCodePosition),
        productCodeLength: parseInt(formData.productCodeLength),
        priceStart: parseInt(formData.pricePosition),
        priceLength: parseInt(formData.priceLength),
        sellerStart: formData.sellerCodePosition ? parseInt(formData.sellerCodePosition) : undefined,
        sellerLength: formData.sellerCodeLength ? parseInt(formData.sellerCodeLength) : undefined,
      };
      const response = await createBalanceConfig(entreprise.id, dto);
      setFormData({
        barcodeLength: "",
        balanceCode: "",
        productCodePosition: "",
        productCodeLength: "",
        pricePosition: "",
        priceLength: "",
        sellerCodePosition: "",
        sellerCodeLength: "",
      });
      toast.success(response.message);
    } catch (err:unknown) {
      const errorMessage = err || "Erreur lors de l'enregistrement de la configuration.";
      setError(String(errorMessage));
      toast.error(String(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFontSizeClass = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "text-xs";
    if (isTablet || isIPadMini) return "text-sm";
    return "text-sm";
  };

  const getPaddingClass = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "p-1 px-1 py-0.5";
    if (isTablet || isIPadMini) return "p-2 px-1.5 py-0.5";
    return "p-3 px-2 py-1";
  };

  const getInputPaddingClass = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "px-2 py-1";
    if (isTablet || isIPadMini) return "px-2.5 py-1.5";
    return "px-3 py-2";
  };

  return (
    <div className="min-h-screen bg-orvanta p-4">
      <style >{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center ${getPaddingClass()}`}>
              <Settings className={`w-3 h-3 text-white ${getFontSizeClass()}`} />
            </div>
            <div>
              <h1 className={`text-xl font-bold text-white ${getFontSizeClass()}`}>
                Paramètres Balance
              </h1>
              <p className={`text-purple-200 ${getFontSizeClass()}`}>
                Configurez les paramètres de la balance
              </p>
            </div>
          </div>
          <Link
            to="/dashboard_user/configuration/balance/list"
            className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center space-x-1 ${getFontSizeClass()}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>Voir Liste</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/40 backdrop-blur-xl border border-red-700/50 rounded-lg p-3 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl">
          <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-purple-700/30 to-purple-600/30">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-600/40 rounded-lg">
                <Settings className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <h2 className={`text-base font-semibold text-white ${getFontSizeClass()}`}>Paramètres</h2>
                <p className={`text-purple-200 text-xs ${getFontSizeClass()}`}>Entrez les valeurs pour configurer la balance</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className={`text-sm font-semibold text-white ${getFontSizeClass()}`}>Général</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <label
                      htmlFor="barcodeLength"
                      className={`flex items-center space-x-1 text-xs font-medium text-purple-200 ${getFontSizeClass()}`}
                    >
                      <Settings className={`h-3 w-3 text-purple-400 ${getFontSizeClass()}`} />
                      <span>Nombre de caractères du code à barre</span>
                    </label>
                    <input
                      type="number"
                      id="barcodeLength"
                      name="barcodeLength"
                      value={formData.barcodeLength}
                      onChange={handleChange}
                      className={`w-full ${getInputPaddingClass()} bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200 ${getFontSizeClass()}`}
                      placeholder="Ex: 13"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="balanceCode"
                      className={`flex items-center space-x-1 text-xs font-medium text-purple-200 ${getFontSizeClass()}`}
                    >
                      <Settings className={`h-3 w-3 text-purple-400 ${getFontSizeClass()}`} />
                      <span>Code balance</span>
                    </label>
                    <input
                      type="text"
                      id="balanceCode"
                      name="balanceCode"
                      value={formData.balanceCode}
                      onChange={handleChange}
                      className={`w-full ${getInputPaddingClass()} bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200 ${getFontSizeClass()}`}
                      placeholder="Ex: BAL001"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-sm font-semibold text-white ${getFontSizeClass()}`}>Produit</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <label
                      htmlFor="productCodePosition"
                      className={`flex items-center space-x-1 text-xs font-medium text-purple-200 ${getFontSizeClass()}`}
                    >
                      <Settings className={`h-3 w-3 text-purple-400 ${getFontSizeClass()}`} />
                      <span>Position Début Produit</span>
                    </label>
                    <input
                      type="number"
                      id="productCodePosition"
                      name="productCodePosition"
                      value={formData.productCodePosition}
                      onChange={handleChange}
                      className={`w-full ${getInputPaddingClass()} bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200 ${getFontSizeClass()}`}
                      placeholder="Ex: 1"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="productCodeLength"
                      className={`flex items-center space-x-1 text-xs font-medium text-purple-200 ${getFontSizeClass()}`}
                    >
                      <Settings className={`h-3 w-3 text-purple-400 ${getFontSizeClass()}`} />
                      <span>Nombre de caractères Produit</span>
                    </label>
                    <input
                      type="number"
                      id="productCodeLength"
                      name="productCodeLength"
                      value={formData.productCodeLength}
                      onChange={handleChange}
                      className={`w-full ${getInputPaddingClass()} bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200 ${getFontSizeClass()}`}
                      placeholder="Ex: 5"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-sm font-semibold text-white ${getFontSizeClass()}`}>Prix</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <label
                      htmlFor="pricePosition"
                      className={`flex items-center space-x-1 text-xs font-medium text-purple-200 ${getFontSizeClass()}`}
                    >
                      <Settings className={`h-3 w-3 text-purple-400 ${getFontSizeClass()}`} />
                      <span>Position Début Prix</span>
                    </label>
                    <input
                      type="number"
                      id="pricePosition"
                      name="pricePosition"
                      value={formData.pricePosition}
                      onChange={handleChange}
                      className={`w-full ${getInputPaddingClass()} bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200 ${getFontSizeClass()}`}
                      placeholder="Ex: 6"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="priceLength"
                      className={`flex items-center space-x-1 text-xs font-medium text-purple-200 ${getFontSizeClass()}`}
                    >
                      <Settings className={`h-3 w-3 text-purple-400 ${getFontSizeClass()}`} />
                      <span>Nombre de caractères Prix</span>
                    </label>
                    <input
                      type="number"
                      id="priceLength"
                      name="priceLength"
                      value={formData.priceLength}
                      onChange={handleChange}
                      className={`w-full ${getInputPaddingClass()} bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200 ${getFontSizeClass()}`}
                      placeholder="Ex: 6"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-sm font-semibold text-white ${getFontSizeClass()}`}>Vendeur (optionnel)</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <label
                      htmlFor="sellerCodePosition"
                      className={`flex items-center space-x-1 text-xs font-medium text-purple-200 ${getFontSizeClass()}`}
                    >
                      <Settings className={`h-3 w-3 text-purple-400 ${getFontSizeClass()}`} />
                      <span>Position Début Vendeur</span>
                    </label>
                    <input
                      type="number"
                      id="sellerCodePosition"
                      name="sellerCodePosition"
                      value={formData.sellerCodePosition}
                      onChange={handleChange}
                      className={`w-full ${getInputPaddingClass()} bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200 ${getFontSizeClass()}`}
                      placeholder="Ex: 12"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="sellerCodeLength"
                      className={`flex items-center space-x-1 text-xs font-medium text-purple-200 ${getFontSizeClass()}`}
                    >
                      <Settings className={`h-3 w-3 text-purple-400 ${getFontSizeClass()}`} />
                      <span>Nombre de caractères Vendeur</span>
                    </label>
                    <input
                      type="number"
                      id="sellerCodeLength"
                      name="sellerCodeLength"
                      value={formData.sellerCodeLength}
                      onChange={handleChange}
                      className={`w-full ${getInputPaddingClass()} bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200 ${getFontSizeClass()}`}
                      placeholder="Ex: 3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed ${getFontSizeClass()}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className={`h-3 w-3 ${getFontSizeClass()}`} />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}