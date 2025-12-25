"use client";

import { useState, FormEvent } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../auth/auth-context";
// import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { createTicketResto } from "@renderer/api/ticket-resto";
import type { CreateTicketRestoDto } from "@renderer/types/ticket-resto";
import { Loader2, Plus, ArrowLeft, Ticket } from "lucide-react";
import { useNavigate,Link } from "react-router-dom";

interface TicketRestoFormData {
  fournisseur: string;
  codeInterne: string;
  pourcentage?: number | "";
}

const initialForm: TicketRestoFormData = {
  fournisseur: "",
  codeInterne: "",
  pourcentage: ""
};

export default function AddTicketResto() {
  // const { isMobile } = useDeviceType();
  const { entreprise, user, loading: authLoading } = useAuth();
  const router = useNavigate();

  const [form, setForm] = useState<TicketRestoFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth guards (align with private pages)
  if (!authLoading && (!user || !user.isActive)) {
    router("/banned");
    return null;
  }
  if (!authLoading && user && user.role !== "ADMIN" && !user.permissions.includes("Gestion des tickets resto")) {
    router("/unauthorized");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "pourcentage") {
      const numeric = value === "" ? "" : Number.parseFloat(value.replace(",", "."));
      setForm((prev) => ({ ...prev, pourcentage: Number.isNaN(numeric as number) ? "" : (numeric as number) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!entreprise?.id) {
      setError("Utilisateur non authentifié.");
      toast.error("Utilisateur non authentifié.");
      return;
    }

    if (!form.fournisseur.trim()) {
      toast.error("Veuillez remplir le champ fournisseur.");
      return;
    }
    if (!form.codeInterne.trim()) {
      toast.error("Veuillez remplir le champ code interne.");
      return;
    }

    try {
      setLoading(true);
      const dto: CreateTicketRestoDto = {
        fournisseur: form.fournisseur.trim(),
        codeInterne: form.codeInterne.trim(),
        pourcentage: form.pourcentage === "" || form.pourcentage === undefined ? undefined : Number(form.pourcentage),
      };
      await createTicketResto(entreprise.id, dto);
      toast.success("Ticket Resto créé avec succès !");
      setForm({
      codeInterne:"",
      fournisseur:"",
      pourcentage:""
    });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Erreur lors de l'ajout du Ticket Resto.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      codeInterne:"",
      fournisseur:"",
      pourcentage:""
    });
    setError(null);
  };

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all duration-200";
  const buttonBase = "px-4 py-2 rounded-lg text-sm transition-colors duration-200";

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Chargement...</div>;
  }

  if (!entreprise) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <Ticket className="w-6 h-6 text-white/40 mx-auto mb-2" />
          <p className="text-white">Veuillez vous connecter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orvanta py-3 px-4">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Nouveau Ticket Resto</h1>
              <p className="text-white/60 text-xs">Ajouter un fournisseur de tickets restaurant</p>
            </div>
          </div>
          <Link to="/dashboard_user/TicketResto/list" className="text-purple-300 hover:text-white inline-flex items-center gap-1 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à la liste
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-2 rounded-md text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-black/20 backdrop-blur-sm rounded-md border border-white/10 p-3 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="fournisseur" className="block text-xs font-medium text-white/90">
                  Fournisseur <span className="text-pink-400">*</span>
                </label>
                <input
                  id="fournisseur"
                  type="text"
                  name="fournisseur"
                  value={form.fournisseur}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ex: Sodexo, Edenred"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="codeInterne" className="block text-xs font-medium text-white/90">
                  Code Interne <span className="text-pink-400">*</span>
                </label>
                <input
                  id="codeInterne"
                  type="text"
                  name="codeInterne"
                  value={form.codeInterne}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ex: TR001"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="pourcentage" className="block text-xs font-medium text-white/90">
                  Pourcentage
                </label>
                <div className="relative">
                  <input
                    id="pourcentage"
                    type="number"
                    name="pourcentage"
                    value={form.pourcentage === "" || form.pourcentage === undefined ? "" : form.pourcentage}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className={`${inputClass} pr-6 no-spinner`}
                    placeholder="0"
                    style={{ MozAppearance: "textfield", appearance: "textfield" }}
                    onWheel={(e) => e.currentTarget.blur()}
                    disabled={loading}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 text-xs">%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={resetForm}
                className={`${buttonBase} text-white/70 hover:text-white hover:bg-white/10`}
                disabled={loading}
              >
                Effacer
              </button>
              <button
                type="submit"
                className={`${buttonBase} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md shadow-purple-500/25 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {loading ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}