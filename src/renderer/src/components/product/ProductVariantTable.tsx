import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, Package, DollarSign, Tag, AlertCircle } from 'lucide-react';

interface ProductVariantTableProps {
  variants: any[];
  onVariantsUpdate: (variants: any[]) => void;
  basePrice?: number;
  baseCost?: number;
}

const ProductVariantTable: React.FC<ProductVariantTableProps> = ({
  variants,
  onVariantsUpdate,
  basePrice = 0,
  baseCost = 0
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  const handleEdit = (index: number) => {
    setEditingId(index);
    setEditingData({ ...variants[index] });
  };

  const handleSave = () => {
    if (editingId !== null) {
      const updated = [...variants];
      updated[editingId] = editingData;
      onVariantsUpdate(updated);
    }
    setEditingId(null);
    setEditingData(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleDelete = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onVariantsUpdate(updated);
  };

  const updateEditingField = (field: string, value: any) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (variants.length === 0) {
    return (
      <div className="text-center py-8 border border-[#00ffea]/20 rounded-xl bg-gradient-to-br from-[#0a0e17]/30 to-[#050811]/30">
        <Package className="w-12 h-12 text-[#00ffea]/30 mx-auto mb-3" />
        <p className="text-sm text-[#00ffea]/50">
          Aucune variante générée
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold font-orbitron tracking-wider text-white">
          VARIANTES DU PRODUIT ({variants.length})
        </h3>
        <div className="text-xs text-[#00ffea]/70">
          Prix de base: {basePrice.toFixed(3)} TND • Coût de base: {baseCost.toFixed(3)} TND
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#00ffea]/20">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10">
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                VARIANTE
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                SKU
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                AJUSTEMENT PRIX
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                AJUSTEMENT COÛT
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                PRIX FINAL
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                COÛT FINAL
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => {
              const isEditing = editingId === index;
              const finalPrice = basePrice + (variant.priceAdjustment || 0);
              const finalCost = baseCost + (variant.costAdjustment || 0);
              
              return (
                <tr 
                  key={index} 
                  className="border-b border-[#00ffea]/10 hover:bg-[#00ffea]/5 transition-colors"
                >
                  {/* Variant Name */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingData.variantName || ''}
                        onChange={(e) => updateEditingField('variantName', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea]"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded flex items-center justify-center">
                          <Tag className="w-3 h-3 text-[#00ffea]" />
                        </div>
                        <span className="text-sm text-white">
                          {variant.variantName || variant.values?.map((v: any) => v.value).join(' - ')}
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* SKU */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingData.sku || ''}
                        onChange={(e) => updateEditingField('sku', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea]"
                        placeholder="SKU unique"
                      />
                    ) : (
                      <span className="text-sm text-white font-mono">
                        {variant.sku || 'Non défini'}
                      </span>
                    )}
                  </td>
                  
                  {/* Price Adjustment */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-[#00ffea]/70">TND</span>
                        <input
                          type="number"
                          value={editingData.priceAdjustment || 0}
                          onChange={(e) => updateEditingField('priceAdjustment', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 rounded bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea]"
                          step="0.001"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-[#00ffea]/70" />
                        <span className={`text-sm ${variant.priceAdjustment > 0 ? 'text-green-400' : variant.priceAdjustment < 0 ? 'text-red-400' : 'text-white'}`}>
                          {variant.priceAdjustment > 0 ? '+' : ''}{variant.priceAdjustment.toFixed(3)} TND
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* Cost Adjustment */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-[#00ffea]/70">TND</span>
                        <input
                          type="number"
                          value={editingData.costAdjustment || 0}
                          onChange={(e) => updateEditingField('costAdjustment', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 rounded bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea]"
                          step="0.001"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-[#00ffea]/70" />
                        <span className={`text-sm ${variant.costAdjustment > 0 ? 'text-red-400' : variant.costAdjustment < 0 ? 'text-green-400' : 'text-white'}`}>
                          {variant.costAdjustment > 0 ? '+' : ''}{variant.costAdjustment.toFixed(3)} TND
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* Final Price */}
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-white">
                      {finalPrice.toFixed(3)} TND
                    </div>
                  </td>
                  
                  {/* Final Cost */}
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-white">
                      {finalCost.toFixed(3)} TND
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="p-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-[#00ffea] rounded-lg transition-all duration-300"
                            title="Enregistrer"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1.5 bg-gradient-to-r from-[#ff416c]/10 to-[#ff6b9d]/10 hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 border border-[#ff416c]/30 hover:border-[#ff416c] text-[#ff416c] rounded-lg transition-all duration-300"
                            title="Annuler"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(index)}
                            className="p-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-[#00ffea] rounded-lg transition-all duration-300"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-1.5 bg-gradient-to-r from-[#ff416c]/10 to-[#ff6b9d]/10 hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 border border-[#ff416c]/30 hover:border-[#ff416c] text-[#ff416c] rounded-lg transition-all duration-300"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-lg border border-[#00ffea]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-[#00ffea]" />
            <h4 className="text-sm font-orbitron tracking-wider text-white">
              TOTAL VARIANTES
            </h4>
          </div>
          <p className="text-2xl font-bold text-white">{variants.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-lg border border-[#00ffea]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-orbitron tracking-wider text-white">
              PRIX MOYEN
            </h4>
          </div>
          <p className="text-2xl font-bold text-white">
            {((basePrice + variants.reduce((sum, v) => sum + (v.priceAdjustment || 0), 0) / variants.length) || 0).toFixed(3)} TND
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-lg border border-[#00ffea]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-orbitron tracking-wider text-white">
              VARIATION
            </h4>
          </div>
          <p className="text-2xl font-bold text-white">
            {variants.length > 0 
              ? Math.max(...variants.map(v => v.priceAdjustment || 0)) - Math.min(...variants.map(v => v.priceAdjustment || 0)) === 0 
                ? '0.000' 
                : `${Math.min(...variants.map(v => v.priceAdjustment || 0)).toFixed(3)} à ${Math.max(...variants.map(v => v.priceAdjustment || 0)).toFixed(3)}`
              : '0.000'} TND
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantTable;