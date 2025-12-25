import React, { useState, useEffect } from 'react';
import { useVariantFamilies } from '../../hooks/useVariantFamilies';
import { useVariantValues } from '../../hooks/useVariantValues';
import { VariantFamily, VariantValue } from '../../types/variant.types';
import { Layers, Plus, X, AlertCircle, Check } from 'lucide-react';

interface ProductVariantSelectorProps {
  onVariantsChange: (variants: any[]) => void;
  initialVariants?: any[];
  basePrice?: number;
  baseCost?: number;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  onVariantsChange,
  initialVariants = [],
  basePrice = 0,
  baseCost = 0
}) => {
  const { families, loading: familiesLoading } = useVariantFamilies();
  const { values: allValues, loadValuesByFamily } = useVariantValues();
  
  const [hasVariants, setHasVariants] = useState(initialVariants.length > 0);
  const [selectedFamilies, setSelectedFamilies] = useState<VariantFamily[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<number, VariantValue[]>>({});
  const [variantCombinations, setVariantCombinations] = useState<any[]>(initialVariants);
  const [loadingCombinations, setLoadingCombinations] = useState(false);

  // Charger les valeurs pour les familles sélectionnées
  useEffect(() => {
    selectedFamilies.forEach(family => {
      loadValuesByFamily(family.id);
    });
  }, [selectedFamilies]);

  // Générer les combinaisons lorsque les sélections changent
  useEffect(() => {
    if (hasVariants && selectedFamilies.length > 0) {
      generateCombinations();
    } else {
      setVariantCombinations([]);
      onVariantsChange([]);
    }
  }, [hasVariants, selectedFamilies, selectedValues]);

  const generateCombinations = () => {
    setLoadingCombinations(true);
    
    const valueArrays = selectedFamilies.map(family => selectedValues[family.id] || []);
    
    // Fonction récursive pour générer toutes les combinaisons
    const generate = (current: VariantValue[], index: number, results: any[]) => {
      if (index === valueArrays.length) {
        if (current.length > 0) {
          // Créer un nom pour la variante
          const variantName = current.map(v => v.value).join(' - ');
          
          // Vérifier si cette combinaison existe déjà
          const existingVariant = variantCombinations.find(v => 
            v.variantValueIds.length === current.length &&
            v.variantValueIds.every((id: number, idx: number) => id === current[idx].id)
          );
          
          results.push({
            variantValueIds: current.map(v => v.id),
            values: [...current],
            sku: existingVariant?.sku || '',
            priceAdjustment: existingVariant?.priceAdjustment || 0,
            costAdjustment: existingVariant?.costAdjustment || 0,
            variantName
          });
        }
        return;
      }
      
      const family = selectedFamilies[index];
      
      // Si la famille a des valeurs sélectionnées
      if (valueArrays[index].length > 0) {
        for (const value of valueArrays[index]) {
          generate([...current, value], index + 1, results);
        }
      } else if (!family.isRequired) {
        // Si la famille est optionnelle et n'a pas de valeurs sélectionnées
        generate(current, index + 1, results);
      }
    };
    
    const results: any[] = [];
    generate([], 0, results);
    
    setVariantCombinations(results);
    onVariantsChange(results);
    setLoadingCombinations(false);
  };

  const handleFamilyToggle = (family: VariantFamily) => {
    if (selectedFamilies.find(f => f.id === family.id)) {
      // Retirer la famille
      setSelectedFamilies(prev => prev.filter(f => f.id !== family.id));
      
      // Retirer les valeurs associées
      const newSelectedValues = { ...selectedValues };
      delete newSelectedValues[family.id];
      setSelectedValues(newSelectedValues);
    } else {
      // Ajouter la famille
      setSelectedFamilies(prev => [...prev, family]);
      
      // Initialiser avec un tableau vide pour les valeurs
      setSelectedValues(prev => ({
        ...prev,
        [family.id]: []
      }));
    }
  };

  const handleValueToggle = (familyId: number, value: VariantValue) => {
    const currentValues = selectedValues[familyId] || [];
    
    if (currentValues.find(v => v.id === value.id)) {
      // Retirer la valeur
      setSelectedValues(prev => ({
        ...prev,
        [familyId]: currentValues.filter(v => v.id !== value.id)
      }));
    } else {
      // Ajouter la valeur
      setSelectedValues(prev => ({
        ...prev,
        [familyId]: [...currentValues, value]
      }));
    }
  };

  const updateVariantField = (index: number, field: string, value: any) => {
    const updated = [...variantCombinations];
    updated[index] = { ...updated[index], [field]: value };
    setVariantCombinations(updated);
    onVariantsChange(updated);
  };

  if (familiesLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ffea]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Variant Toggle */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-xl border border-[#00ffea]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#00ffea]" />
          </div>
          <div>
            <h3 className="text-base font-bold font-orbitron tracking-wider text-white">
              VARIANTES DE PRODUIT
            </h3>
            <p className="text-sm text-[#00ffea]/70">
              Ce produit existe en plusieurs versions (couleurs, tailles, etc.)
            </p>
          </div>
        </div>
        
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-all duration-300 ${hasVariants ? 'bg-gradient-to-r from-[#00ffea] to-[#0099ff] shadow-lg shadow-[#00ffea]/30' : 'bg-[#0a0e17]/50 border border-[#00ffea]/30'}`}>
              <div
                className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 ${
                  hasVariants ? 'translate-x-6' : 'translate-x-0.5'
                } translate-y-0.5`}
              >
                {hasVariants && (
                  <Check className="w-3 h-3 text-[#00ffea] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
          </div>
        </label>
      </div>

      {hasVariants && (
        <div className="space-y-6">
          {/* Available Families */}
          <div className="space-y-4">
            <h4 className="text-sm font-orbitron tracking-wider text-white">
              CARACTÉRISTIQUES DISPONIBLES
            </h4>
            
            {families.length === 0 ? (
              <div className="text-center py-6 border border-[#00ffea]/20 rounded-xl bg-gradient-to-br from-[#0a0e17]/30 to-[#050811]/30">
                <AlertCircle className="w-8 h-8 text-[#00ffea]/30 mx-auto mb-2" />
                <p className="text-sm text-[#00ffea]/50">
                  Aucune famille de variantes définie
                </p>
                <p className="text-xs text-[#00ffea]/30 mt-1">
                  Configurez d'abord les familles depuis le menu Variantes
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {families.map(family => {
                  const isSelected = selectedFamilies.some(f => f.id === family.id);
                  const familyValues = allValues.filter(v => v.variantFamilyId === family.id);
                  
                  return (
                    <div
                      key={family.id}
                      className={`border rounded-lg p-3 transition-all duration-300 ${
                        isSelected
                          ? 'border-[#00ffea] bg-gradient-to-br from-[#00ffea]/5 to-transparent'
                          : 'border-[#00ffea]/20 hover:border-[#00ffea]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded flex items-center justify-center">
                            <Layers className="w-3 h-3 text-[#00ffea]" />
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-white">
                              {family.name}
                            </h5>
                            <p className="text-xs text-[#00ffea]/70">
                              {family.isRequired ? 'Requis' : 'Optionnel'}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleFamilyToggle(family)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            isSelected
                              ? 'bg-[#00ffea] text-[#0a0e17]'
                              : 'bg-[#0a0e17]/50 text-white border border-[#00ffea]/30'
                          }`}
                        >
                          {isSelected ? 'Sélectionné' : 'Sélectionner'}
                        </button>
                      </div>
                      
                      {/* Values for this family */}
                      {isSelected && familyValues.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-[#00ffea]/70">
                            Sélectionnez les valeurs:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {familyValues.map(value => {
                              const isValueSelected = selectedValues[family.id]?.some(v => v.id === value.id);
                              
                              return (
                                <button
                                  key={value.id}
                                  type="button"
                                  onClick={() => handleValueToggle(family.id, value)}
                                  className={`px-2 py-1 text-xs rounded transition-all duration-300 ${
                                    isValueSelected
                                      ? 'bg-gradient-to-r from-[#00ffea] to-[#0099ff] text-white'
                                      : 'bg-[#0a0e17]/50 text-white/70 hover:text-white hover:bg-[#00ffea]/10 border border-[#00ffea]/20'
                                  }`}
                                >
                                  {value.value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Generated Variants */}
          {selectedFamilies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-orbitron tracking-wider text-white">
                  VARIANTES GÉNÉRÉES ({variantCombinations.length})
                </h4>
                
                {loadingCombinations && (
                  <div className="text-xs text-[#00ffea] flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00ffea]"></div>
                    Génération...
                  </div>
                )}
              </div>
              
              {variantCombinations.length === 0 ? (
                <div className="text-center py-6 border border-[#00ffea]/20 rounded-xl bg-gradient-to-br from-[#0a0e17]/30 to-[#050811]/30">
                  <AlertCircle className="w-8 h-8 text-[#00ffea]/30 mx-auto mb-2" />
                  <p className="text-sm text-[#00ffea]/50">
                    Sélectionnez des valeurs pour générer des variantes
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#00ffea]/20">
                        <th className="text-left py-2 px-3 text-xs font-orbitron tracking-wider text-[#00ffea]/70">
                          VARIANTE
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-orbitron tracking-wider text-[#00ffea]/70">
                          SKU
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-orbitron tracking-wider text-[#00ffea]/70">
                          AJUSTEMENT PRIX
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-orbitron tracking-wider text-[#00ffea]/70">
                          AJUSTEMENT COÛT
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-orbitron tracking-wider text-[#00ffea]/70">
                          PRIX FINAL
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-orbitron tracking-wider text-[#00ffea]/70">
                          COÛT FINAL
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantCombinations.map((variant, index) => {
                        const finalPrice = basePrice + (variant.priceAdjustment || 0);
                        const finalCost = baseCost + (variant.costAdjustment || 0);
                        
                        return (
                          <tr key={index} className="border-b border-[#00ffea]/10 hover:bg-[#00ffea]/5">
                            <td className="py-3 px-3">
                              <div className="text-sm text-white">
                                {variant.values?.map((v: VariantValue) => v.value).join(' - ') || variant.variantName}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="text"
                                value={variant.sku || ''}
                                onChange={(e) => updateVariantField(index, 'sku', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea]"
                                placeholder="SKU unique"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-[#00ffea]/70">TND</span>
                                <input
                                  type="number"
                                  value={variant.priceAdjustment || 0}
                                  onChange={(e) => updateVariantField(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 rounded bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea]"
                                  step="0.001"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-[#00ffea]/70">TND</span>
                                <input
                                  type="number"
                                  value={variant.costAdjustment || 0}
                                  onChange={(e) => updateVariantField(index, 'costAdjustment', parseFloat(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 rounded bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea]"
                                  step="0.001"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="text-sm text-white">
                                {finalPrice.toFixed(3)} TND
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="text-sm text-white">
                                {finalCost.toFixed(3)} TND
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;