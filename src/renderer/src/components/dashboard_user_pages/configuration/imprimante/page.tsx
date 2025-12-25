"use client";

import { useState, useEffect } from "react";
import { Printer, Settings } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../../components/auth/auth-context";
import { getAllPrinters, createPrinter, updatePrinter, PrinterModel } from "@renderer/api/printer";

export default function ImprimantePage() {
  const { user, loading } = useAuth();
  const router = useNavigate();
  const [printer, setPrinter] = useState<PrinterModel | null>(null);
  const [printerName, setPrinterName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Normalize role for consistent checks
  const role = user?.role?.toUpperCase();

  // Redirect if not ADMIN or CAISSIER
  useEffect(() => {
    if (!loading && user) {
      if (!role || !["ADMIN", "CAISSIER"].includes(role)) {
        router("/unauthorized");
      }
    }
  }, [user, loading, role, router]);

  // Fetch user's printer on load
  useEffect(() => {
    if (!loading && user && ["ADMIN", "CAISSIER"].includes(role || "")) {
      const fetchPrinter = async () => {
        try {
          const printers = await getAllPrinters();
          if (printers && printers.length > 0) {
            setPrinter(printers[0]);
            setPrinterName(printers[0].name);
          }
        } catch (err: any) {
          setError(err || "Erreur lors de la récupération de l’imprimante");
          setSuccess("");
        }
      };
      fetchPrinter();
    }
  }, [loading, user, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!printerName.trim()) {
      setError("Le nom de l’imprimante est requis.");
      setSuccess("");
      return;
    }
    setError("");
    try {
      if (printer) {
        const response = await updatePrinter(printer.id, { name: printerName.trim() });
        setPrinter(response.printer);
        setSuccess(response.message || "Imprimante mise à jour avec succès !");
      } else {
        const response = await createPrinter({ name: printerName.trim() });
        setPrinter(response.printer);
        setSuccess(response.message || "Imprimante enregistrée avec succès !");
      }
    } catch (err: any) {
      setError(err || "Erreur lors de l’enregistrement de l’imprimante");
      setSuccess("");
    }
  };

  const getFontSizeClass = () => "text-sm";
  const getInputPaddingClass = () => "px-3 py-2";

  if (loading) return <div className="text-white/90">Chargement...</div>;
  if (!user) return <div className="text-white/90">Veuillez vous connecter</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <Printer className="w-3 h-3 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white/90">Paramètres Imprimante</h1>
            <p className="text-white/60">Ajoutez ou modifiez le nom de votre imprimante</p>
            {printer ? (
              <p className="mt-1 text-green-400 text-xs">
                Imprimante connectée : <strong>{printer.name}</strong>
              </p>
            ) : (
              <p className="mt-1 text-yellow-400 text-xs">Aucune imprimante configurée</p>
            )}
          </div>
        </div>
        {role === "ADMIN" && (
          <Link
            to="/dashboard_user/configuration/imprimante/list"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center space-x-1"
          >
            <Printer className="h-4 w-4" />
            <span>Voir Liste</span>
          </Link>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-xs">{error}</div>
      )}
      {success && (
        <div className="bg-green-500/20 text-green-300 p-3 rounded-lg text-xs">{success}</div>
      )}

      {/* Form */}
      <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Configuration</h2>
              <p className="text-white/60 text-xs">Définissez les informations de l’imprimante</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="printerName"
              className="flex items-center space-x-1 text-xs font-medium text-white/80"
            >
              <Printer className="h-3 w-3 text-white/60" />
              <span>Nom de l’imprimante</span>
            </label>
            <input
              type="text"
              id="printerName"
              name="printerName"
              value={printerName}
              onChange={(e) => setPrinterName(e.target.value)}
              className={`w-full ${getInputPaddingClass()} bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 ${getFontSizeClass()}`}
              placeholder="Ex : GP-200i"
              required
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg shadow-green-500/25"
          >
            {printer ? "Mettre à jour" : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
