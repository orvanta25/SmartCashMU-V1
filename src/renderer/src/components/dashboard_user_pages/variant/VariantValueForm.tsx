// src/components/variant/VariantValueForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Tag, AlertCircle, X, ArrowLeft, Eye } from 'lucide-react';
import { useVariantValues } from '../../../hooks/useVariantValues';

const VariantValueCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [valueName, setValueName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Utilisation du hook - c'est la seule source de vérité
  const { createValue, loading } = useVariantValues();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedValue = valueName.trim();
    
    if (!trimmedValue) {
      setError('Le nom de la valeur est requis');
      return;
    }

    setError(null);

    try {
      // Appel direct via le store - pas d'IPC manuel
      await createValue({
        value: trimmedValue,
        sortOrder: 0,
      });

      toast.success('Valeur ajoutée avec succès !');
      setValueName('');
      
      // Optionnel: rediriger vers la liste après création
      // navigate('/dashboard_user/variant/values/list');
    } catch (err: any) {
      // Gestion spécifique des erreurs de contrainte unique depuis la DB
      const errorMessage = err.message || 'Une erreur est survenue';
      
      if (errorMessage.includes('Unique constraint') || 
          errorMessage.includes('unique') || 
          errorMessage.includes('UNIQUE')) {
        setError(`La valeur "${trimmedValue}" existe déjà dans la base de données.`);
        toast.error('Cette valeur existe déjà');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
      
      console.error('❌ Erreur lors de la création:', err);
    }
  };

  const handleReset = () => {
    setValueName('');
    setError(null);
  };

  const goToList = () => {
    navigate('/dashboard_user/variant/values/list');
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#050811] p-4">
      {/* Header de la page avec boutons de navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {/* Bouton retour */}
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {/* Bouton Liste */}
          <button
            onClick={goToList}
            className="px-4 py-2 bg-gradient-to-r from-[#0099ff] to-[#00ffea] hover:from-[#0099ff] hover:to-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#0099ff]/25"
          >
            <Eye className="w-4 h-4" />
            liste des valeurs
          </button>
        </div>
      </div>

      {/* Conteneur principal centré */}
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          {/* Header du formulaire */}
          <div className="mb-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 p-5">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffea]/10 via-transparent to-[#0099ff]/10"></div>

              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00ffea] to-[#0099ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#00ffea]/30">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-l font-bold font-orbitron tracking-wider text-white mb-1">
                    CRÉER UNE NOUVELLE VALEUR
                  </h2>
                  <p className="text-sm text-[#00ffea]/70">
                    Ajouter une valeur de variante à votre catalogue
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-[#ff416c]" />
                </div>
                <div>
                  <h4 className="text-[#ff416c] font-orbitron tracking-wider text-sm mb-1">ERREUR</h4>
                  <p className="text-[#ff416c]/80 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              {/* Value Name Field */}
              <div className="space-y-1.5 mb-8">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="w-3 h-3 text-[#00ffea]" />
                    Nom de la valeur <span className="text-[#ff416c]">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={valueName}
                  onChange={(e) => {
                    setValueName(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                  required
                  placeholder="Ex: Rouge, M, XL, 41, 42"
                  autoFocus
                  disabled={loading}
                />
                <p className="text-xs text-[#00ffea]/50 mt-1">
                  Saisissez le nom de la valeur que vous souhaitez créer
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-[#00ffea]/20">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <X className="w-3 h-3" />
                  RÉINITIALISER
                </button>

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-gradient-to-r from-[#00ffea] to-[#0099ff] hover:from-[#00ffea] hover:to-[#0099ff] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#00ffea]/25 hover:shadow-xl hover:shadow-[#00ffea]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>CRÉATION EN COURS...</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span>CRÉER</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#00ffea]/50">
              Après avoir créé cette valeur, vous pourrez l'utiliser dans vos familles de variantes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantValueCreatePage;