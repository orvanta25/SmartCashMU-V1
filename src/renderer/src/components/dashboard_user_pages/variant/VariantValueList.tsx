// Ajoutez ceci temporairement dans votre VariantValueList.tsx
// pour nettoyer le cache et tester

import React, { useEffect, useState, useRef } from 'react';
import { useVariantValues } from '../../../hooks/useVariantValues';
import VariantValueForm from './VariantValueForm';
import { Edit2, Trash2, Plus, AlertCircle, Tag, X, Check, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const VariantValueList: React.FC = () => {
  const {
    values,
    loading,
    error,
    loadAllValues,
    createValue,
    updateValue,
    deleteValue,
  } = useVariantValues();

  const [showForm, setShowForm] = useState(false);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 30;
  const valuesPerRow = 6;

  useEffect(() => {
    loadAllValues();
  }, []);

  // Log pour déboguer
  useEffect(() => {
    console.log('🔍 Valeurs actuelles dans le composant:', values);
  }, [values]);

  // Fermer le modal en cliquant n'importe où à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showForm && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showForm]);

  const handleEdit = (value: any) => {
    setEditingValue(value);
    setShowForm(true);
    setFormError(null);
  };

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    setFormError(null);

    try {
      if (editingValue) {
        await updateValue(editingValue.id, data);
        toast.success('Valeur mise à jour avec succès');
      } else {
        await createValue(data);
        toast.success('Valeur créée avec succès');
      }
      
      setShowForm(false);
      setEditingValue(null);
      // Ne pas recharger - le store est déjà à jour
      // loadAllValues(); ❌ Supprimez cette ligne
    } catch (err: any) {
      setFormError(err.message || 'Une erreur est survenue');
      toast.error(err.message || 'Erreur lors de l\'opération');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteValue(id);
      toast.success('Valeur supprimée avec succès');
      setConfirmDelete(null);
      // Ne pas recharger - le store est déjà à jour
      // loadAllValues(); ❌ Supprimez cette ligne
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingValue(null);
    setFormError(null);
  };

  // Fonction pour forcer le rechargement (debug seulement)
  const handleForceRefresh = async () => {
    console.log('🔄 Rechargement forcé...');
    await loadAllValues();
    toast.info('Liste rechargée');
  };

  // Filtrer les valeurs
  const filteredValues = values.filter(v =>
    v.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredValues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentValues = filteredValues.slice(startIndex, startIndex + itemsPerPage);

  // Organiser les valeurs en groupes de 6 par ligne
  const groupedValues = [];
  for (let i = 0; i < currentValues.length; i += valuesPerRow) {
    groupedValues.push(currentValues.slice(i, i + valuesPerRow));
  }

  // Gestion de la pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Réinitialiser la page quand on recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-orbitron tracking-wider text-white">
          VALEURS ({values.length})
        </h4>
        <div className="flex gap-2">
          {/* Bouton de rechargement pour debug */}
          <button
            onClick={handleForceRefresh}
            className="px-3 py-1.5 bg-gradient-to-r from-[#0099ff]/10 to-[#00ffea]/10 hover:from-[#0099ff]/20 hover:to-[#00ffea]/20 border border-[#0099ff]/30 hover:border-[#0099ff] text-white text-xs font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1"
            title="Recharger la liste"
          >
            <RefreshCw className="w-3 h-3" />
            RECHARGER
          </button>
          
          <button
            onClick={() => {
              setEditingValue(null);
              setShowForm(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white text-xs font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            AJOUTER
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Rechercher une valeur..."
        className="mb-3 p-2 rounded border border-[#00ffea]/30 bg-[#0a0e17]/50 text-white text-sm w-full"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {error && (
        <div className="bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#ff416c] mt-0.5" />
            <div>
              <h4 className="text-[#ff416c] font-orbitron tracking-wider text-xs mb-1">
                ERREUR
              </h4>
              <p className="text-[#ff416c]/80 text-xs">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal centré */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            ref={modalRef}
            className="bg-gradient-to-br from-[#0a0e17]/95 to-[#050811]/95 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 w-full max-w-md mx-4 my-auto"
          >
            <div className="relative">
              <button
                onClick={handleCancel}
                className="absolute right-4 top-4 z-10 p-1.5 hover:bg-[#00ffea]/10 rounded-full transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4 text-[#00ffea]" />
              </button>
              
              <VariantValueForm
                editingValue={editingValue}
                onSuccess={handleFormSubmit}
                onCancel={handleCancel}
                loading={isLoading}
                error={formError}
              />
            </div>
          </div>
        </div>
      )}

      {values.length === 0 ? (
        <div className="text-center py-6 border border-[#00ffea]/20 rounded-xl bg-gradient-to-br from-[#0a0e17]/30 to-[#050811]/30">
          <Tag className="w-8 h-8 text-[#00ffea]/20 mx-auto mb-2" />
          <p className="text-sm text-[#00ffea]/50">
            Aucune valeur définie
          </p>
        </div>
      ) : (
        <>
          {/* Container avec défilement vertical mais sans barres latérales */}
          <div className="h-[600px] overflow-y-auto scrollbar-hide mb-4">
            {groupedValues.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap gap-3 mb-3">
                {row.map((value) => (
                  <div
                    key={value.id}
                    className="flex-1 min-w-[calc(16.666%-12px)] max-w-[calc(16.666%-12px)] bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-lg border border-[#00ffea]/20 p-3 hover:border-[#00ffea]/40 transition-colors duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded flex items-center justify-center">
                          <Tag className="w-3 h-3 text-[#00ffea]" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-sm font-medium text-white truncate" title={value.value}>
                            {value.value}
                          </h5>
                          <p className="text-xs text-[#00ffea]/50 truncate">
                            ID: {value.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(value)}
                          className="p-1.5 hover:bg-[#00ffea]/10 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#00ffea]" />
                        </button>

                        {confirmDelete === value.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(value.id)}
                              className="p-1.5 hover:bg-[#ff416c]/10 rounded transition-colors"
                              title="Confirmer"
                            >
                              <Check className="w-3.5 h-3.5 text-[#ff416c]" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="p-1.5 hover:bg-[#00ffea]/10 rounded transition-colors"
                              title="Annuler"
                            >
                              <X className="w-3.5 h-3.5 text-[#00ffea]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(value.id)}
                            className="p-1.5 hover:bg-[#ff416c]/10 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#ff416c]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Remplir les cases vides pour maintenir l'alignement */}
                {row.length < valuesPerRow && (
                  Array.from({ length: valuesPerRow - row.length }).map((_, idx) => (
                    <div
                      key={`empty-${rowIndex}-${idx}`}
                      className="flex-1 min-w-[calc(16.666%-12px)] max-w-[calc(16.666%-12px)]"
                    />
                  ))
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#00ffea]/20 pt-4">
              <div className="text-sm text-[#00ffea]/70">
                Page {currentPage} sur {totalPages} • {filteredValues.length} valeurs
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border ${
                    currentPage === 1
                      ? 'border-[#00ffea]/10 text-[#00ffea]/30 cursor-not-allowed'
                      : 'border-[#00ffea]/30 text-[#00ffea] hover:bg-[#00ffea]/10'
                  } transition-colors`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-[#00ffea]/20 to-[#0099ff]/20 border border-[#00ffea]/40 text-white'
                            : 'border border-[#00ffea]/20 text-[#00ffea]/70 hover:bg-[#00ffea]/10'
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border ${
                    currentPage === totalPages
                      ? 'border-[#00ffea]/10 text-[#00ffea]/30 cursor-not-allowed'
                      : 'border-[#00ffea]/30 text-[#00ffea] hover:bg-[#00ffea]/10'
                  } transition-colors`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VariantValueList;