'use client';

import React, { useState, useEffect } from 'react';
import { X, Tag, Package, Layers, Hash, DollarSign, AlertCircle, Check, Barcode, Upload, Image as ImageIcon, Trash2, Percent, Calendar } from 'lucide-react';
import { useVariantStore } from '../../stores/variant.store';
import { storeImage } from '@renderer/api/image';

// ============================================
// TYPES TYPESCRIPT
// ============================================

interface VariantFamily {
  id: number;
  name: string;
  code: string;
}

interface VariantValue {
  id: number;
  value: string;
  variantFamilyId: number;
  sortOrder: number;
}

interface SelectedValue {
  familyId: number;
  familyName: string;
  valueId: number;
  valueLabel: string;
}

export interface BulkSaleItem {
  id: string;
  quantity: number;
  price: number;
}

// Structure de variante interne au modal
interface VariantCombination {
  id: string;
  values: SelectedValue[];
  sku: string;
  price: number;
  variantName: string;
  image?: string; // Nom de l'image stockée
  imagePreview?: string; // Base64 pour l'aperçu
  bulkSales: BulkSaleItem[];
  dateDebutRemise: string | null;
  dateFinRemise: string | null;
}

// Structure de produit à renvoyer au ProductForm
export interface ProductFromVariant {
  designation: string;
  puht: number;
  codeBarre: string;
  sku: string;
  variantName: string;
  image?: string;
  imagePreview?: string;
  variantValues: SelectedValue[];
  stock: number;
  bulkSales: BulkSaleItem[];
  dateDebutRemise: string | null;
  dateFinRemise: string | null;
}

interface ProductVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (products: ProductFromVariant[]) => void;
  productName?: string;
  basePrice?: number;
  productBarcode?: string;
  initialVariants?: VariantCombination[];
  baseBulkSales?: BulkSaleItem[];
  baseDateDebutRemise?: string | null;
  baseDateFinRemise?: string | null;
  isProductMagasin?: boolean;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ProductVariantModal: React.FC<ProductVariantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productName = 'Produit',
  basePrice = 0,
  productBarcode = '',
  initialVariants = [],
  baseBulkSales = [],
  baseDateDebutRemise = null,
  baseDateFinRemise = null,
  isProductMagasin = true
}) => {
  const { families, values, loadFamilies, loadAllValues } = useVariantStore();
  
  // États locaux
  const [selectedFamilies, setSelectedFamilies] = useState<number[]>([]);
  const [selectedValues, setSelectedValues] = useState<SelectedValue[]>([]);
  const [combinations, setCombinations] = useState<VariantCombination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  useEffect(() => {
    if (isOpen) {
      loadFamilies();
      loadAllValues();
    }
  }, [isOpen, loadFamilies, loadAllValues]);

  // Initialiser avec les variantes existantes
  useEffect(() => {
    if (initialVariants.length > 0 && isOpen) {
      const familiesSet = new Set<number>();
      const valuesArray: SelectedValue[] = [];
      
      initialVariants.forEach(variant => {
        variant.values?.forEach((val: SelectedValue) => {
          familiesSet.add(val.familyId);
          if (!valuesArray.find(v => v.familyId === val.familyId && v.valueId === val.valueId)) {
            valuesArray.push(val);
          }
        });
      });
      
      setSelectedFamilies(Array.from(familiesSet));
      setSelectedValues(valuesArray);
      setCombinations(initialVariants);
    }
  }, [initialVariants, isOpen]);

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================

  // Générer un SKU unique
  const generateSKU = (values: SelectedValue[]): string => {
    const timestamp = Date.now().toString().slice(-6);
    const variantCodes = values
      .map(v => v.valueLabel.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))
      .join('-');
    return `${timestamp}-${variantCodes}`;
  };

  // Générer un code-barre pour une variante
    const generateVariantBarcode = (sku: string, values: SelectedValue[]): string => {
  const cleanProductBarcode = productBarcode.replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const cleanSku = sku.replace(/[^A-Z0-9]/g, '').slice(0, 6);
  
  // Générer un hash unique basé sur les valeurs des variantes
  const variantHash = values
    .map(v => v.valueId.toString(36).toUpperCase()) // Convertir ID en base36
    .join('')
    .slice(0, 4);
  
  return `${cleanProductBarcode}-${cleanSku}-${variantHash}`;
};
  // ============================================
  // GESTION DES SÉLECTIONS
  // ============================================

  const handleFamilyToggle = (familyId: number) => {
    setSelectedFamilies(prev => {
      const newSelected = prev.includes(familyId)
        ? prev.filter(id => id !== familyId)
        : [...prev, familyId];
      
      // Supprimer les valeurs de la famille désélectionnée
      if (!newSelected.includes(familyId)) {
        const newValues = selectedValues.filter(v => v.familyId !== familyId);
        setSelectedValues(newValues);
        generateCombinations(newSelected, newValues);
      } else {
        generateCombinations(newSelected, selectedValues);
      }
      
      return newSelected;
    });
  };

  const handleValueToggle = (familyId: number, valueId: number, valueLabel: string) => {
    const family = families.find(f => f.id === familyId);
    if (!family) return;

    setSelectedValues(prev => {
      const exists = prev.find(v => v.familyId === familyId && v.valueId === valueId);
      const newValues = exists
        ? prev.filter(v => !(v.familyId === familyId && v.valueId === valueId))
        : [...prev, {
            familyId,
            familyName: family.name,
            valueId,
            valueLabel
          }];
      
      generateCombinations(selectedFamilies, newValues);
      return newValues;
    });
  };

  // ============================================
  // GÉNÉRATION DES COMBINAISONS
  // ============================================

  const generateCombinations = (familyIds: number[], values: SelectedValue[]) => {
    if (familyIds.length === 0 || values.length === 0) {
      setCombinations([]);
      return;
    }

    // Grouper les valeurs par famille
    const valuesByFamily = familyIds.map(familyId => 
      values.filter(v => v.familyId === familyId)
    );

    // Vérifier que toutes les familles ont au moins une valeur
    if (valuesByFamily.some(fv => fv.length === 0)) {
      setCombinations([]);
      return;
    }

    // Générer le produit cartésien
    const combinations: SelectedValue[][] = [];
    
    const generate = (current: SelectedValue[], index: number) => {
      if (index === valuesByFamily.length) {
        combinations.push([...current]);
        return;
      }

      valuesByFamily[index].forEach(value => {
        generate([...current, value], index + 1);
      });
    };

    generate([], 0);

    // Convertir en objets VariantCombination
    const variantCombinations: VariantCombination[] = combinations.map(combo => {
      const id = combo.map(v => `${v.familyId}-${v.valueId}`).join('_');
      const variantName = combo.map(v => v.valueLabel).join(' / ');
      const sku = generateSKU(combo);
      
      // Préserver les données existantes
      const existing = initialVariants.find(v => v.id === id);

      return {
        id,
        values: combo,
        sku,
        variantName,
        price: existing?.price || basePrice,
        image: existing?.image,
        imagePreview: existing?.imagePreview,
        bulkSales: existing?.bulkSales || [...baseBulkSales],
        dateDebutRemise: existing?.dateDebutRemise || baseDateDebutRemise,
        dateFinRemise: existing?.dateFinRemise || baseDateFinRemise
      };
    });

    setCombinations(variantCombinations);
  };

  // ============================================
  // GESTION DES MODIFICATIONS
  // ============================================

  const handlePriceChange = (combinationId: string, price: number) => {
    setCombinations(prev => prev.map(combo =>
      combo.id === combinationId ? { ...combo, price } : combo
    ));
  };

  const handleImageChange = async (combinationId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const base64Image = await storeImage(e);
      if (base64Image) {
        setCombinations(prev => prev.map(combo =>
          combo.id === combinationId 
            ? { ...combo, image: base64Image.imageName, imagePreview: base64Image.image64 }
            : combo
        ));
      }
    } catch (error) {
      console.error("Erreur lors du stockage de l'image:", error);
      setError("Erreur lors du téléchargement de l'image");
    }
  };

  const addBulkToCombination = (combinationId: string) => {
    setCombinations(prev => prev.map(combo =>
      combo.id === combinationId
        ? { ...combo, bulkSales: [...combo.bulkSales, { id: Date.now().toString(), quantity: 0, price: 0 }] }
        : combo
    ));
  };

  const removeBulkFromCombination = (combinationId: string, bulkId: string) => {
    setCombinations(prev => prev.map(combo =>
      combo.id === combinationId
        ? { ...combo, bulkSales: combo.bulkSales.filter(b => b.id !== bulkId) }
        : combo
    ));
  };

  const updateBulkInCombination = (combinationId: string, bulkId: string, field: 'quantity' | 'price', value: number) => {
    setCombinations(prev => prev.map(combo =>
      combo.id === combinationId
        ? {
            ...combo,
            bulkSales: combo.bulkSales.map(b =>
              b.id === bulkId ? { ...b, [field]: value } : b
            )
          }
        : combo
    ));
  };

  const handleDateDebutChange = (combinationId: string, value: string) => {
    setCombinations(prev => prev.map(combo =>
      combo.id === combinationId ? { ...combo, dateDebutRemise: value || null } : combo
    ));
  };

  const handleDateFinChange = (combinationId: string, value: string) => {
    setCombinations(prev => prev.map(combo =>
      combo.id === combinationId ? { ...combo, dateFinRemise: value || null } : combo
    ));
  };

  // ============================================
  // SAUVEGARDE ET VALIDATION
  // ============================================

  const handleSaveVariants = () => {
    // Validation
    if (combinations.length === 0) {
      setError('Veuillez sélectionner au moins une famille et une valeur');
      return;
    }

    const invalidVariants = combinations.filter(c => c.price <= 0);
    if (invalidVariants.length > 0) {
      setError('Toutes les variantes doivent avoir un prix supérieur à 0');
      return;
    }

    // Convertir les combinaisons en produits pour ProductForm
    const productsFromVariants: ProductFromVariant[] = combinations.map(combo => ({
      designation: `${productName} - ${combo.variantName}`,
      puht: combo.price,
      codeBarre: generateVariantBarcode(combo.sku, combo.values),
      sku: combo.sku,
      variantName: combo.variantName,
      image: combo.image,
      imagePreview: combo.imagePreview,
      variantValues: combo.values,
      stock: 0,
      bulkSales: combo.bulkSales,
      dateDebutRemise: combo.dateDebutRemise,
      dateFinRemise: combo.dateFinRemise
    }));

    setError(null);
    onSave(productsFromVariants);
    onClose();
  };

  const handleReset = () => {
    setSelectedFamilies([]);
    setSelectedValues([]);
    setCombinations([]);
    setError(null);
  };

  if (!isOpen) return null;

  // ============================================
  // RENDU UI
  // ============================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#0a0e17] to-[#050811] rounded-2xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#00ffea]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ffea] to-[#0099ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#00ffea]/30">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-orbitron tracking-wider text-white">
                  VARIANTES DU PRODUIT
                </h2>
                <p className="text-sm text-[#00ffea]/70">
                  {productName} - Configurez les variantes et leurs prix
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#00ffea]/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#00ffea]" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#ff416c] mt-0.5" />
              <div>
                <h4 className="text-[#ff416c] font-orbitron tracking-wider text-xs mb-1">ERREUR</h4>
                <p className="text-[#ff416c]/80 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sélection des familles et valeurs */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-orbitron tracking-wider text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#00ffea]" />
                FAMILLES DE VARIANTES
              </h3>
              <div className="space-y-2">
                {families.map(family => {
                  const isSelected = selectedFamilies.includes(family.id);
                  const familyValues = values.filter(v => v.variantFamilyId === family.id);
                  const selectedCount = selectedValues.filter(v => v.familyId === family.id).length;
                  
                  return (
                    <div key={family.id} className="border border-[#00ffea]/20 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleFamilyToggle(family.id)}
                        className={`w-full p-4 text-left transition-all duration-300 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10' 
                            : 'hover:bg-[#0a0e17]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${
                              isSelected 
                                ? 'bg-gradient-to-r from-[#00ffea] to-[#0099ff]' 
                                : 'bg-[#0a0e17]/50 border border-[#00ffea]/20'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <div className="font-medium text-white">{family.name}</div>
                              <div className="text-xs text-[#00ffea]/70">
                                {selectedCount} / {familyValues.length} sélectionnée{selectedCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      {isSelected && familyValues.length > 0 && (
                        <div className="p-3 border-t border-[#00ffea]/10 bg-[#0a0e17]/30">
                          <div className="grid grid-cols-2 gap-2">
                            {familyValues.map(value => {
                              const isValueSelected = selectedValues.some(
                                v => v.familyId === family.id && v.valueId === value.id
                              );
                              return (
                                <button
                                  key={value.id}
                                  type="button"
                                  onClick={() => handleValueToggle(family.id, value.id, value.value)}
                                  className={`p-2 rounded text-sm transition-all duration-200 ${
                                    isValueSelected
                                      ? 'bg-gradient-to-r from-[#00ffea]/20 to-[#0099ff]/20 text-white border border-[#00ffea]/30'
                                      : 'bg-[#0a0e17]/50 text-white/70 hover:text-white hover:bg-[#0a0e17]'
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
            </div>

            {/* Aperçu des variantes */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-orbitron tracking-wider text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00ffea]" />
                VARIANTES GÉNÉRÉES ({combinations.length})
              </h3>
              
              {combinations.length === 0 ? (
                <div className="text-center py-12 border border-[#00ffea]/20 border-dashed rounded-xl bg-gradient-to-br from-[#0a0e17]/30 to-[#050811]/30">
                  <Layers className="w-12 h-12 text-[#00ffea]/20 mx-auto mb-4" />
                  <h4 className="text-lg font-orbitron tracking-wider text-white mb-2">AUCUNE VARIANTE</h4>
                  <p className="text-[#00ffea]/70">
                    Sélectionnez des familles et valeurs pour générer des variantes
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {combinations.map(combination => (
                    <div
                      key={combination.id}
                      className="bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 p-4"
                    >
                      <div className="flex items-start gap-4">
                        {/* Image upload */}
                        <div className="flex-shrink-0">
                          {combination.imagePreview ? (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#00ffea]/30">
                              <img 
                                src={combination.imagePreview} 
                                alt={combination.variantName}
                                className="w-full h-full object-cover"
                              />
                              <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                                <Upload className="w-5 h-5 text-white" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(combination.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#00ffea]/30 bg-[#0a0e17]/30 flex items-center justify-center cursor-pointer hover:border-[#00ffea]/50 transition-colors">
                              <ImageIcon className="w-6 h-6 text-[#00ffea]/50" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(combination.id, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* Info variante */}
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {combination.values.map((value, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 text-xs bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 text-white rounded-full border border-[#00ffea]/20 flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" />
                                {value.familyName}: {value.valueLabel}
                              </span>
                            ))}
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-white">
                              <Package className="w-3 h-3 text-[#00ffea]" />
                              <span className="font-medium">{productName} - {combination.variantName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <Hash className="w-3 h-3" />
                              <span>SKU: {combination.sku}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <Barcode className="w-3 h-3" />
                              <span>Code-barre: {generateVariantBarcode(combination.sku, combination.values)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Prix */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs text-[#00ffea]/70 mb-1">PRIX</div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={combination.price}
                              onChange={(e) => handlePriceChange(combination.id, parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.001"
                              className="w-28 px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30"
                            />
                            <span className="text-[#00ffea] text-sm">TND</span>
                          </div>
                        </div>
                      </div>

                      {/* Promotion */}
                      <div className="mt-4">
                        <h5 className="text-xs font-orbitron tracking-wider text-white mb-2 flex items-center gap-2">
                          <Percent className="w-4 h-4 text-[#00ffea]" />
                          PROMOTION (OPTIONNELLE)
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-[#00ffea]/70 mb-1">Début</label>
                            <input
                              type="datetime-local"
                              value={combination.dateDebutRemise || ''}
                              onChange={(e) => handleDateDebutChange(combination.id, e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-[#00ffea]/70 mb-1">Fin</label>
                            <input
                              type="datetime-local"
                              value={combination.dateFinRemise || ''}
                              onChange={(e) => handleDateFinChange(combination.id, e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Vente par lots (si magasin) */}
                      {isProductMagasin && (
                        <div className="mt-4">
                          <h5 className="text-xs font-orbitron tracking-wider text-white mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#00ffea]" />
                            VENTE PAR LOTS (OPTIONNELLE)
                          </h5>
                          <button
                            type="button"
                            onClick={() => addBulkToCombination(combination.id)}
                            className="mb-2 px-3 py-1 bg-gradient-to-r from-[#00ffea]/20 to-[#0099ff]/20 hover:from-[#00ffea]/30 hover:to-[#0099ff]/30 border border-[#00ffea]/40 text-white text-xs rounded-lg transition-all duration-300"
                          >
                            AJOUTER LOT
                          </button>
                          <div className="space-y-2">
                            {combination.bulkSales.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={item.quantity || ''}
                                  onChange={(e) => updateBulkInCombination(combination.id, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                  placeholder="Qté"
                                  min="0"
                                  step="1"
                                  className="w-24 px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30"
                                />
                                <input
                                  type="number"
                                  value={item.price || ''}
                                  onChange={(e) => updateBulkInCombination(combination.id, item.id, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="Prix"
                                  min="0"
                                  step="0.001"
                                  className="w-24 px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30"
                                />
                                <span className="text-[#00ffea] text-sm">TND</span>
                                <button
                                  onClick={() => removeBulkFromCombination(combination.id, item.id)}
                                  className="p-2 text-[#ff416c] hover:bg-[#ff416c]/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Résumé */}
              {combinations.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20">
                  <h4 className="text-sm font-orbitron tracking-wider text-white mb-3">RÉSUMÉ</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-orbitron tracking-wider text-white">
                        {selectedFamilies.length}
                      </div>
                      <div className="text-xs text-[#00ffea]/70">Familles</div>
                    </div>
                    <div>
                      <div className="text-2xl font-orbitron tracking-wider text-white">
                        {selectedValues.length}
                      </div>
                      <div className="text-xs text-[#00ffea]/70">Valeurs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-orbitron tracking-wider text-white">
                        {combinations.length}
                      </div>
                      <div className="text-xs text-[#00ffea]/70">Variantes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-orbitron tracking-wider text-white">
                        {combinations.filter(c => c.image).length}
                      </div>
                      <div className="text-xs text-[#00ffea]/70">Images</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#00ffea]/20 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300"
            >
              RÉINITIALISER
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300"
            >
              ANNULER
            </button>
          </div>
          <button
            onClick={handleSaveVariants}
            disabled={loading || combinations.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-[#00ffea] to-[#0099ff] hover:from-[#00ffea] hover:to-[#0099ff] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#00ffea]/25 hover:shadow-xl hover:shadow-[#00ffea]/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>EN COURS...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>ENREGISTRER {combinations.length} VARIANTE{combinations.length !== 1 ? 'S' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantModal;  