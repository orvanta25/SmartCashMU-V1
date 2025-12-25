'use client';

import { useEffect, useState, FormEvent } from 'react';
import { createCategory, CreateCategorieDto } from '@renderer/api/categorie';
import { useAuth } from '../auth/auth-context';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom"
import { Check, FolderPlus, AlertCircle, RefreshCw } from 'lucide-react';

const CategoryForm = () => {
  const { user, entreprise, loading: authLoading } = useAuth();
  const [categoryName, setCategoryName] = useState('');
  const [featuredOnPos, setFeaturedOnPos] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.isActive) {
      router('/banned');
      return;
    }

    if (user.role !== 'ADMIN' && !user.permissions.includes('Gestion des catégories')) {
      router('/unauthorized');
      return;
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e17] to-[#050811]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00ffea]/30 border-t-[#00ffea] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#00ffea] font-orbitron tracking-wider">CHARGEMENT...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isActive || (user.role !== 'ADMIN' && !user.permissions.includes('Gestion des catégories'))) {
    return null; // Redirect handled in useEffect
  }

  if (!entreprise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e17] to-[#050811]">
        <div className="text-center p-8 bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-[#ff416c]" />
          </div>
          <h2 className="text-xl font-orbitron tracking-wider text-white mb-2">ACCÈS REFUSÉ</h2>
          <p className="text-[#00ffea]/70">Veuillez vous connecter</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!entreprise?.id) {
      setError('Utilisateur non authentifié.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const categoryData: CreateCategorieDto = {
        nom: categoryName,
        showInPos: featuredOnPos,
      };

      await createCategory(entreprise.id, categoryData);
      toast.success('Catégorie ajoutée avec succès !');
      setCategoryName('');
      setFeaturedOnPos(false); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'ajout de la catégorie.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#050811] p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 p-5">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ffea]/10 via-transparent to-[#0099ff]/10"></div>
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ffea] to-[#0099ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#00ffea]/30">
                <FolderPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-orbitron tracking-wider text-white mb-1">NOUVELLE CATÉGORIE</h2>
                <p className="text-sm text-[#00ffea]/70">
                  Créer une nouvelle catégorie de produits
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-3 h-3 text-[#ff416c]" />
              </div>
              <div>
                <h4 className="text-[#ff416c] font-orbitron tracking-wider text-sm mb-1">ERREUR</h4>
                <p className="text-[#ff416c]/80 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-5">
            {/* Category Name Field */}
            <div className="space-y-1.5 mb-4">
              <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                <div className="flex items-center gap-2 mb-1">
                  <FolderPlus className="w-3 h-3 text-[#00ffea]" />
                  Nom de la catégorie <span className="text-[#ff416c]">*</span>
                </div>
              </label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                required
                placeholder="Entrez le nom de la catégorie"
                disabled={loading}
              />
            </div>

            {/* Featured on POS Section */}
            <div className="pt-4 pb-5 border-t border-[#00ffea]/20">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-orbitron tracking-wider text-white">AFFICHAGE SUR POS</h3>
                  <p className="text-xs text-[#00ffea]/70">Mettre en avant sur la page POS</p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={featuredOnPos}
                      onChange={(e) => setFeaturedOnPos(e.target.checked)}
                      className="sr-only"
                      disabled={loading}
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition-all duration-300 ${
                        featuredOnPos ? 'bg-gradient-to-r from-[#00ffea] to-[#0099ff] shadow-lg shadow-[#00ffea]/30' : 'bg-[#0a0e17]/50 border border-[#00ffea]/30'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 ${
                          featuredOnPos ? 'translate-x-6' : 'translate-x-0.5'
                        } translate-y-0.5`}
                      >
                        {featuredOnPos && (
                          <Check className="w-3 h-3 text-[#00ffea] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-orbitron tracking-wider ${featuredOnPos ? 'text-[#00ffea]' : 'text-[#00ffea]/70'}`}>
                    {featuredOnPos ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#00ffea]/20">
              <button
                type="button"
                onClick={() => {
                  setCategoryName('');
                  setFeaturedOnPos(false);
                }}
                className="group px-4 py-2 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                RÉINITIALISER
              </button>
              <button
                type="submit"
                className="group px-5 py-2 bg-gradient-to-r from-[#00ffea] to-[#0099ff] hover:from-[#00ffea] hover:to-[#0099ff] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#00ffea]/25 hover:shadow-xl hover:shadow-[#00ffea]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-xs">AJOUT...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FolderPlus className="w-3 h-3 transition-transform group-hover:scale-110" />
                    <span className="text-xs">AJOUTER</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;