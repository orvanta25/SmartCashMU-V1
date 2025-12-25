'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Plus, Eye, Tag, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useVariantStore } from '../../../stores/variant.store';
import VariantFamilyForm from './VariantFamilyForm';

const VariantFamilyList: React.FC = () => {
  const navigate = useNavigate();
 const { 
  families, 
  loadingFamilies,   
  error, 
  loadFamilies, 
  deleteFamily 
} = useVariantStore();
  
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFamilies();
  }, []);

  // Fermer le modal en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showForm && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showForm]);

  const handleEdit = (family: any) => {
    setEditingFamily(family);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFamily(id);
      toast.success('Famille supprimée avec succès');
      setConfirmDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingFamily(null);
    loadFamilies();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFamily(null);
  };

  const toggleFamilyValues = (id: number) => {
    setSelectedFamilyId(selectedFamilyId === id ? null : id);
  };

  const goToValueCreation = () => {
    navigate('/dashboard_user/variant/values/create');
  };

  const goToValuesList = () => {
    navigate('/dashboard_user/variant/values/list');
  };

  if (loadingFamilies) 
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00ffea]"></div>
      </div>
    );
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#050811] p-4">
      {/* Header avec navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {/* Boutons de navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToValuesList}
              className="px-4 py-2 bg-gradient-to-r from-[#0099ff]/10 to-[#00ffea]/10 hover:from-[#0099ff]/20 hover:to-[#00ffea]/20 border border-[#0099ff]/30 hover:border-[#0099ff] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Liste Valeurs
            </button>
          </div>

          {/* Bouton Nouvelle Famille */}
          <button
            onClick={() => {
              setEditingFamily(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#00ffea] to-[#0099ff] hover:from-[#00ffea] hover:to-[#0099ff] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#00ffea]/25 hover:shadow-xl hover:shadow-[#00ffea]/40"
          >
            <Plus className="w-4 h-4" />
            NOUVELLE FAMILLE
          </button>
        </div>
      </div>

      {/* Titre principal */}
      <div className="max-w-7xl mx-auto mb-6">
        <h2 className="text-2xl font-bold font-orbitron tracking-wider text-white mb-2">
          FAMILLES DE VARIANTES
        </h2>
        <p className="text-sm text-[#00ffea]/70">
          Gérez les caractéristiques de vos produits (couleur, taille, pointure, etc.)
        </p>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="w-full max-w-md">
            <VariantFamilyForm
              initialData={editingFamily}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
              loading={loadingFamilies}
            />
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-[#ff416c]" />
              </div>
              <div>
                <h4 className="text-[#ff416c] font-orbitron tracking-wider text-sm mb-1">
                  ERREUR
                </h4>
                <p className="text-[#ff416c]/80 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des familles en cartes */}
      <div className="max-w-7xl mx-auto">
        {families.length === 0 ? (
          <div className="text-center py-12 border border-[#00ffea]/20 rounded-xl bg-gradient-to-br from-[#0a0e17]/30 to-[#050811]/30">
            <Tag className="w-16 h-16 text-[#00ffea]/20 mx-auto mb-4" />
            <h3 className="text-xl font-orbitron tracking-wider text-white mb-3">
              AUCUNE FAMILLE
            </h3>
            <p className="text-sm text-[#00ffea]/70 mb-6">
              Commencez par créer votre première famille de variantes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {families.map((family) => (
              <div
                key={family.id}
                className="bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 overflow-hidden transition-all duration-300 hover:border-[#00ffea]/40 hover:transform hover:scale-[1.02] group"
              >
                {/* Carte de la famille */}
                <div className="p-0">
                  {/* Header de la carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Tag className="w-6 h-6 text-[#00ffea]" />
                      </div>
                      <div>
                        <h3 className="font-orbitron tracking-wider text-white text-lg">
                          {family.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#00ffea]/70 bg-[#00ffea]/10 px-2 py-0.5 rounded">
                            ID: {family.id}
                          </span>
                          {family.values && (
                            <span className="text-xs text-[#00ffea]/70 bg-[#00ffea]/10 px-2 py-0.5 rounded">
                              {family.values.length} valeur(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bouton Afficher les valeurs */}
                  <div className="pt-4">
                    <button
                      onClick={() => toggleFamilyValues(family.id)}
                      className=" px-3 py-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-3 h-3" />
                      {selectedFamilyId === family.id ? 'MASQUER' : 'AFFICHER'}
                    </button>
                  </div>

                  {/* Liste des valeurs (expandable) */}
                  {selectedFamilyId === family.id && family.values && family.values.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-br from-[#0a0e17]/60 to-[#050811]/60 rounded-lg border border-[#00ffea]/20">
                      <h4 className="text-sm font-orbitron tracking-wider text-[#00ffea]/70 mb-3">
                        VALEURS DE CETTE FAMILLE
                      </h4>
                      <div className="space-y-2">
                        {family.values.map((value: any) => (
                          <div
                            key={value.id}
                            className="bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-lg border border-[#00ffea]/20 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded flex items-center justify-center">
                                  <Tag className="w-3 h-3 text-[#00ffea]" />
                                </div>
                                <span className="text-white text-sm">
                                  {value.value}
                                </span>
                              </div>
                              <span className="text-xs text-[#00ffea]/70">
                                ID: {value.id}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Modifier/Supprimer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#00ffea]/10">
                    <button
                      onClick={() => handleEdit(family)}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider text-xs rounded-lg transition-all duration-300 flex items-center gap-1"
                      title="Modifier la famille"
                    >
                      <Edit2 className="w-3 h-3" />
                      MODIFIER
                    </button>
                    
                    {confirmDelete === family.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(family.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#ff416c]/10 to-[#ff6b9d]/10 hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 border border-[#ff416c]/30 hover:border-[#ff416c] text-white font-orbitron tracking-wider text-xs rounded-lg transition-all duration-300 flex items-center gap-1"
                          title="Confirmer"
                        >
                          <Check className="w-3 h-3" />
                          OUI
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider text-xs rounded-lg transition-all duration-300 flex items-center gap-1"
                          title="Annuler"
                        >
                          <X className="w-3 h-3" />
                          NON
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(family.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#ff416c]/10 to-[#ff6b9d]/10 hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 border border-[#ff416c]/30 hover:border-[#ff416c] text-white font-orbitron tracking-wider text-xs rounded-lg transition-all duration-300 flex items-center gap-1"
                        title="Supprimer la famille"
                      >
                        <Trash2 className="w-3 h-3" />
                        SUPPRIMER
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantFamilyList;