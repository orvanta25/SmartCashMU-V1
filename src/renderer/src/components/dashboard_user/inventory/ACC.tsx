"use client";

import { useState, useEffect } from "react";
import { User, Barcode, Package, Hash, FileText, Save, Loader2 } from "lucide-react";
import { useAuth } from "../../auth/auth-context";
import { useNavigate,Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { getProductByBarcode } from "@renderer/api/produit";
import { createAcc } from "@renderer/api/acc";

interface ACCForm {
  responsable: string;
  codeBar: string;
  designation: string;
  quantity: number;
  remarque: string;
}

export function ACC() {
  const { entreprise ,user} = useAuth();
  const router = useNavigate();
  const { isMobile } = useDeviceType();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState<ACCForm>({
    responsable: user?.role !== "ADMIN" ? user?.nom + " " + user?.prenom :"ADMIN",
    codeBar: "",
    designation: "",
    quantity: undefined as any,
    remarque: "",
  });

  useEffect(() => {
    if (formData.codeBar && entreprise?.id) {
      const fetchProduct = async () => {
        try {
          const response = await getProductByBarcode(entreprise.id,formData.codeBar)
          setFormData((prev) => ({ ...prev, designation: response.designation || "" }));
        } catch {
          setError(null);
          setFormData((prev) => ({ ...prev, designation: "" }));
        }
      };
      fetchProduct();
    }
  }, [formData.codeBar, entreprise]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? (value === "" ? undefined : parseFloat(value) || undefined) : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entreprise?.id) {
      setError(null);
      toast.error("Utilisateur non authentifié.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createAcc(entreprise.id,
        {
          codeBarre: formData.codeBar,
          quantite: formData.quantity,
          responsable: formData.responsable,
          remarque: formData.remarque || undefined,
          designation:formData.designation
        }
      );
      setFormData({ responsable: "", codeBar: "", designation: "", quantity: undefined as any, remarque: "" });
      toast.success("ACC créé avec succès !");
      router("/dashboard_user/inventory/acc/list");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-md text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-xs";
  const labelClass = "flex items-center gap-1.5 text-xs font-medium text-white/80";

  return (
    <div className="min-h-screen bg-orvanta py-4 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div className="bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
            <span className="text-white/60 text-xs">Responsable:</span>
            <span className="ml-1.5 text-white font-medium text-xs">{formData.responsable || "Non défini"}</span>
          </div>
          <Link
            to="/dashboard_user/inventory/acc/list"
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center gap-1.5 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Voir Liste
          </Link>
        </div>

        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-xs">{error}</div>}

        <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-md border border-white/10 shadow-lg">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-md">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Détails de l'ACC</h2>
                <p className="text-white/60 text-xs">Remplissez les informations ci-dessous</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="responsable" className={labelClass}>
                  <User className="h-3 w-3 text-white/60" />
                  Responsable
                </label>
                <input
                  type="text"
                  id="responsable"
                  name="responsable"
                  value={formData.responsable}
                  readOnly
                  className={inputClass}
                  placeholder="Nom du responsable"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="codeBar" className={labelClass}>
                  <Barcode className="h-3 w-3 text-white/60" />
                  Code à barre
                </label>
                <input
                  type="text"
                  id="codeBar"
                  name="codeBar"
                  value={formData.codeBar}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Scanner le code à barre"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="designation" className={labelClass}>
                  <Package className="h-3 w-3 text-white/60" />
                  Désignation
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  readOnly
                  className={`${inputClass} text-white/70`}
                  placeholder="Sera rempli automatiquement"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="quantity" className={labelClass}>
                  <Hash className="h-3 w-3 text-white/60" />
                  Quantité
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity === undefined || formData.quantity === 0 ? "" : formData.quantity}
                  onChange={handleChange}
                  min="0.001"
                  step="0.001"
                  className={`${inputClass} no-spinner`}
                  placeholder="0.000"
                  required
                  style={{ MozAppearance: "textfield", appearance: "textfield" }}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="remarque" className={labelClass}>
                  <FileText className="h-3 w-3 text-white/60" />
                  Remarque
                </label>
                <textarea
                  id="remarque"
                  name="remarque"
                  value={formData.remarque}
                  onChange={handleChange}
                  rows={isMobile ? 2 : 3}
                  className={`${inputClass} resize-none`}
                  placeholder="Ajoutez vos remarques..."
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md shadow-green-500/25 flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    Enregistrer
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