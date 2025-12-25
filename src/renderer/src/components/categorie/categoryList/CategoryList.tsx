"use client";

import { useState, useEffect } from "react";
import { getCategories, updateCategory, deleteCategory } from "@renderer/api/categorie";
import { useAuth } from "../../auth/auth-context";
import { toast } from "react-toastify";
import { SearchBar } from "./SearchBar";
import { CategoryTable } from "./CategoryTable";
import { Category } from "./types";
import { useNavigate,Link } from "react-router-dom";

export default function CategoryList() {
  const { user, entreprise, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed to 10 as per requirement
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const router = useNavigate();

  const fetchCategories = async () => {
      try {
        if (authLoading) return;

        if (!user || !user.isActive) {
          router("/banned");
          return;
        }

        if (user.role !== "ADMIN" && !user.permissions.includes("Gestion des catégories")) {
          router("/unauthorized");
          return;
        }

        if (!entreprise?.id) {
          toast.error("Erreur: ID de l'entreprise manquant.");
          return;
        }
        const response = await getCategories(entreprise.id, searchQuery, page, limit);
        setCategories(response.data);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Erreur lors de la récupération des catégories.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

  useEffect(() => {
    
    fetchCategories();
  }, [authLoading, user, entreprise, router, searchQuery, page, limit]);

  const handleUpdateCategory = async (id: string, newName: string, newShowInPos: boolean) => {
    try {
      const updatedCategorie = await updateCategory(entreprise?.id as string, id, { nom: newName, showInPos: newShowInPos });
      // setCategories(categories.map((cat) =>
      //   cat.id === id ? { ...cat, nom: newName, showInPos: newShowInPos, updatedAt: new Date().toISOString() } : cat
      // ));
      if(updatedCategorie)
      {
        await fetchCategories()
        toast.success("Catégorie mise à jour !");
      }
      else toast.error("Erreur lors de la mise à jour.")
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la mise à jour.";
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(entreprise?.id as string, id);
      await fetchCategories()
      toast.success("Catégorie supprimée !");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression.";
      toast.error(errorMessage);
      throw err;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const buttonClass = "px-3 py-1.5 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-xs bg-blue-600";

  if (authLoading) return <div className="flex justify-center items-center min-h-screen text-white text-xs">Chargement...</div>;

  return (
    <div className="min-h-screen bg-orvanta py-4 px-4">
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-white">Liste des Catégories</h1>
            <p className="text-white/60 text-xs">Gérez vos catégories de produits</p>
          </div>
          <Link to="/dashboard_user/categories/new" className={buttonClass}>
            Ajouter Catégorie
          </Link>
        </div>

        {error && <div className="bg-red-500/20 text-red-300 p-2 rounded-md text-xs">{error}</div>}

        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-md border border-white/10 mt-4 overflow-auto shadow-lg">
          <CategoryTable
            categories={categories}
            error={error}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}