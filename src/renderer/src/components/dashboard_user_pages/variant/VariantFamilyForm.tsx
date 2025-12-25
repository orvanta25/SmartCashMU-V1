'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tag, X, Search, Plus, Trash2, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useVariantStore } from '../../../stores/variant.store';
import { useVariantValues } from '../../../hooks/useVariantValues';
import VariantFamilyList from './VariantFamilyList';

interface VariantFamilyFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const VariantFamilyForm: React.FC<VariantFamilyFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
  loading = false
}) => {
  const navigate = useNavigate();
  
  // États pour le formulaire
  const [familyName, setFamilyName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Store et hooks
  const { createFamily, updateFamily } = useVariantStore();
  const { values: allValues, loadAllValues } = useVariantValues();

  // Charger toutes les valeurs au montage
  useEffect(() => {
    loadAllValues();
  }, []);

  // Initialiser avec les données existantes
  useEffect(() => {
    if (initialData) {
      setFamilyName(initialData.name || '');
      if (initialData.values) {
        setSelectedValues(initialData.values);
      }
    }
  }, [initialData]);

  // Filtrer les résultats de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = allValues.filter(value => {
      const alreadySelected = selectedValues.some(sv => sv.id === value.id);
      return !alreadySelected && value.value.toLowerCase().includes(term);
    });

    setSearchResults(filtered);
  }, [searchTerm, allValues, selectedValues]);

  // Fermer les résultats de recherche en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ajouter une valeur à la sélection
  const handleAddValue = (value: any) => {
    if (!selectedValues.some(v => v.id === value.id)) {
      setSelectedValues(prev => [...prev, value]);
      setSearchTerm('');
      setSearchResults([]);
      searchInputRef.current?.focus();
    }
  };

  // Supprimer une valeur de la sélection
  const handleRemoveValue = (valueId: number) => {
    setSelectedValues(prev => prev.filter(v => v.id !== valueId));
  };

  // Créer une nouvelle valeur directement
 const handleCreateNewValue = () => {
  toast.error("Créez d'abord la valeur dans la liste des valeurs");
  return;
};


  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!familyName.trim()) {
      setError('Le nom de la famille est requis');
      return;
    }

    if (selectedValues.length === 0) {
      setError('Vous devez sélectionner au moins une valeur');
      return;
    }

    try {
      const familyData = {
        name: familyName.trim(),
        description: '',
        code: familyName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_'),
        isRequired: false,
        sortOrder: 0,
        valueIds: selectedValues.map(v => v.id)
      };

      if (initialData) {
        // Mise à jour
        await updateFamily(initialData.id, familyData);
        toast.success('Famille mise à jour avec succès');
      } else {
        // Création
        await createFamily(familyData);
        toast.success('Famille créée avec succès');
      }

     if (typeof onSuccess === 'function') {
  onSuccess();
}
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
      toast.error(err.message || 'Erreur lors de l\'opération');
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    setFamilyName('');
    setSelectedValues([]);
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
  };

  // Aller à la liste des valeurs
  const goToValuesList = () => {
  if (typeof onCancel === 'function') {
    onCancel(); // ferme le modal si présent
    setTimeout(() => {
      navigate('/dashboard_user/variant/families/list');
    }, 100);
  } else {
    // pas de modal → navigation directe
    navigate('/dashboard_user/variant/families/list');
  }
};

  return (
    
    <div className="bg-gradient-to-br from-[#0a0e17]/95 to-[#050811]/95 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 overflow-hidden max-w-md w-full mx-4 my-8">
      {/* Header */}
      <div className="p-5 border-b border-[#00ffea]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00ffea] to-[#0099ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#00ffea]/30">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-orbitron tracking-wider text-white">
                {initialData ? 'MODIFIER FAMILLE' : 'NOUVELLE FAMILLE'}
              </h3>
              <p className="text-sm text-[#00ffea]/70">
                {initialData ? 'Modifiez la famille' : 'Créez une nouvelle famille'}
              </p>
            </div>
          </div>
          
          {/* Bouton VOIR LA LISTE - Ajouté ici */}
          <button
            type="button"
            onClick={goToValuesList}
            className="px-4 py-2 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-2"
            disabled={loading}
          >
            <Eye className="w-4 h-4" />
            VOIR LA LISTE
          </button>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-xl p-3">
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

        {/* Nom de la famille */}
        <div className="space-y-2">
          <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
            NOM DE LA FAMILLE *
          </label>
          <input
            type="text"
            value={familyName}
            onChange={(e) => {
              setFamilyName(e.target.value);
              setError(null);
            }}
            className="w-full px-4 py-3 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
            placeholder="Ex: Couleur, Taille, Pointure"
            required
            autoFocus
            disabled={loading}
          />
          <p className="text-xs text-[#00ffea]/50">
            Saisissez le nom de la famille de variantes
          </p>
        </div>

        {/* Zone de recherche des valeurs */}
        <div className="space-y-2" ref={searchRef}>
          <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
            RECHERCHER DES VALEURS
          </label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#00ffea]/50" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                placeholder="Tapez pour rechercher des valeurs..."
                disabled={loading}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#0a0e17]/30 rounded"
                >
                  <X className="w-3 h-3 text-[#00ffea]/50" />
                </button>
              )}
            </div>

            {/* Bouton créer nouvelle valeur */}
            {searchTerm.trim() && !searchResults.some(v => v.value.toLowerCase() === searchTerm.toLowerCase().trim()) && (
              <button
                type="button"
                onClick={handleCreateNewValue}
                className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                CRÉER "{searchTerm.trim()}"
              </button>
            )}

            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-gradient-to-br from-[#0a0e17] to-[#050811] border border-[#00ffea]/30 rounded-lg shadow-2xl shadow-[#00ffea]/5">
                {searchResults.map((value) => (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => handleAddValue(value)}
                    className="w-full px-4 py-3 text-left hover:bg-[#00ffea]/10 border-b border-[#00ffea]/10 last:border-b-0 transition-colors duration-200 flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded flex items-center justify-center">
                      <Tag className="w-3 h-3 text-[#00ffea]" />
                    </div>
                    <span className="text-white text-sm">{value.value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-[#00ffea]/50">
            Recherchez des valeurs existantes ou créez-en de nouvelles
          </p>
        </div>

        {/* Valeurs sélectionnées */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
              VALEURS SÉLECTIONNÉES ({selectedValues.length})
            </label>
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedValues([])}
                className="text-xs text-[#ff416c] hover:text-[#ff416c]/80 transition-colors"
                disabled={loading}
              >
                Tout supprimer
              </button>
            )}
          </div>

          {selectedValues.length === 0 ? (
            <div className="py-6 text-center border border-[#00ffea]/20 border-dashed rounded-lg bg-gradient-to-br from-[#0a0e17]/30 to-[#050811]/30">
              <Tag className="w-6 h-6 text-[#00ffea]/20 mx-auto mb-2" />
              <p className="text-sm text-[#00ffea]/50">
                Aucune valeur sélectionnée
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {selectedValues.map((value) => (
                <div
                  key={value.id}
                  className="bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-lg border border-[#00ffea]/20 p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded flex items-center justify-center flex-shrink-0">
                      <Tag className="w-3 h-3 text-[#00ffea]" />
                    </div>
                    <span className="text-white text-sm truncate">
                      {value.value}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(value.id)}
                    className="p-1 hover:bg-[#ff416c]/10 rounded transition-colors flex-shrink-0"
                    disabled={loading}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#ff416c]" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[#00ffea]/50">
            Cliquez sur une valeur pour la supprimer
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-[#00ffea]/20">
          <button
            type="button"
            onClick={() => {
              handleReset();
              if (typeof onCancel === 'function') {
  onCancel();
}

            }}
            className="px-4 py-2 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300"
            disabled={loading}
          >
            ANNULER
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-[#00ffea] to-[#0099ff] hover:from-[#00ffea] hover:to-[#0099ff] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#00ffea]/25 hover:shadow-xl hover:shadow-[#00ffea]/40 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>EN COURS...</span>
              </>
            ) : (
              <>
                <Tag className="w-4 h-4" />
                <span>{initialData ? 'MODIFIER' : 'CRÉER'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VariantFamilyForm;