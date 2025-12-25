"use client";

import { useState, useEffect } from "react";
import { Printer, Trash2, Pencil } from "lucide-react";
import { useAuth } from "../../../../../components/auth/auth-context";
import { getAllPrinters, deletePrinter, PrinterModel } from "@renderer/api/printer";
import { useNavigate } from "react-router-dom";

export default function PrinterListPage() {
  const { user, loading } = useAuth();
  const router = useNavigate();
  const [printers, setPrinters] = useState<PrinterModel[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user && user.role !== "ADMIN") {
      router("/unauthorized");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && user.role === "ADMIN") {
      const fetchPrinters = async () => {
        try {
          const printers = await getAllPrinters();
          setPrinters(printers);
        } catch (err: any) {
          setError(err || "Erreur lors de la récupération des imprimantes");
        }
      };
      fetchPrinters();
    }
  }, [loading, user]);

  const handleDelete = async (id: string) => {
    try {
      await deletePrinter(id);
      setPrinters(printers.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la suppression de l’imprimante");
    }
  };

  if (loading) return <div className="text-white/90">Chargement...</div>;
  if (!user) return <div className="text-white/90">Veuillez vous connecter</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
          <Printer className="w-3 h-3 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white/90">Liste des Imprimantes</h1>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-xs">{error}</div>
      )}

      <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl p-4">
        {printers.length === 0 ? (
          <p className="text-white/60 text-sm">Aucune imprimante configurée</p>
        ) : (
          <ul className="space-y-2">
            {printers.map((printer) => (
              <li
                key={printer.id}
                className="flex justify-between items-center p-2 bg-black/20 rounded-lg text-white text-sm"
              >
                <span>
                  {printer.name}{" "}
                  {printer.user ? `(${printer.user.prenom} ${printer.user.nom})` : "(Sans utilisateur)"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => router(`/dashboard_user/configuration/imprimante?edit=${printer.id}`)}
                    className="p-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-200"
                  >
                    <Pencil className="h-4 w-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(printer.id)}
                    className="p-1 bg-red-600 rounded hover:bg-red-700 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}