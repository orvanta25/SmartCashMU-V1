import React, { useState, useEffect } from 'react';
import { useProductVariantStock } from '../../hooks/useProductVariants';
import { Package, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Warehouse } from 'lucide-react';

interface ProductVariantStockProps {
  variantId: number;
  magasinId?: string;
}

const ProductVariantStock: React.FC<ProductVariantStockProps> = ({
  variantId,
  magasinId
}) => {
  const {
    stocks,
    loading,
    error,
    loadStocks,
    updateStock,
    getStock,
    getTotalStock,
    getLowStockMagasins,
    getExcessStockMagasins
  } = useProductVariantStock(variantId);
  
  const [editingStock, setEditingStock] = useState<{
    magasinId: string;
    quantity: number;
    minStock: number;
    maxStock: number | null;
  } | null>(null);
  
  const [stockAdjustment, setStockAdjustment] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (variantId) {
      loadStocks();
    }
  }, [variantId, loadStocks]);
  
  const handleSaveStock = async (magasinId: string) => {
    if (!editingStock || editingStock.magasinId !== magasinId) return;
    
    try {
      await updateStock(
        magasinId,
        editingStock.quantity,
        editingStock.minStock,
        editingStock.maxStock ?? undefined
      );
      setEditingStock(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du stock:', err);
    }
  };
  
  const handleAdjustStock = (magasinId: string, adjustment: number) => {
    const currentStock = getStock(magasinId);
    const newQuantity = Math.max(0, currentStock + adjustment);
    
    if (stockAdjustment[magasinId] !== undefined) {
      setStockAdjustment(prev => ({
        ...prev,
        [magasinId]: prev[magasinId] + adjustment
      }));
    } else {
      setStockAdjustment(prev => ({
        ...prev,
        [magasinId]: adjustment
      }));
    }
    
    // Mettre à jour immédiatement pour un feedback visuel
    const stock = stocks.find(s => s.magasinId === magasinId);
    if (stock) {
      updateStock(
        magasinId, 
        newQuantity, 
        stock.minStock, 
        stock.maxStock ?? undefined
      );
    }
  };
  
  const applyStockAdjustment = async (magasinId: string) => {
    const adjustment = stockAdjustment[magasinId] || 0;
    if (adjustment === 0) return;
    
    const currentStock = getStock(magasinId);
    const stock = stocks.find(s => s.magasinId === magasinId);
    
    await updateStock(
      magasinId,
      currentStock + adjustment,
      stock?.minStock || 0,
      stock?.maxStock ?? undefined
    );
    
    setStockAdjustment(prev => {
      const newState = { ...prev };
      delete newState[magasinId];
      return newState;
    });
  };
  
  const getStockStatus = (quantity: number, minStock: number, maxStock: number | null) => {
    if (quantity <= minStock) return 'LOW';
    if (maxStock !== null && quantity > maxStock) return 'EXCESS';
    return 'OK';
  };
  
  const inputClassName = "w-full px-3 py-1.5 rounded bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white text-sm focus:outline-none focus:border-[#00ffea]";
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ffea]"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded-lg flex items-center justify-center">
            <Warehouse className="w-5 h-5 text-[#00ffea]" />
          </div>
          <div>
            <h3 className="text-base font-bold font-orbitron tracking-wider text-white">
              GESTION DES STOCKS
            </h3>
            <p className="text-sm text-[#00ffea]/70">
              Stock total: <span className="text-white font-medium">{getTotalStock()} unités</span>
            </p>
          </div>
        </div>
        
        <button
          onClick={() => variantId && loadStocks()}
          className="p-2 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-[#00ffea] rounded-lg transition-all duration-300"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
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
      
      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-white" />
            <h4 className="text-sm font-orbitron tracking-wider text-white">
              STOCK TOTAL
            </h4>
          </div>
          <p className="text-2xl font-bold text-white">{getTotalStock()}</p>
          <p className="text-xs text-[#00ffea]/70 mt-1">unités disponibles</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-xl border border-[#ff416c]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-[#ff416c]" />
            <h4 className="text-sm font-orbitron tracking-wider text-white">
              STOCKS BAS
            </h4>
          </div>
          <p className="text-2xl font-bold text-[#ff416c]">{getLowStockMagasins().length}</p>
          <p className="text-xs text-[#ff416c]/70 mt-1">magasins concernés</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50 backdrop-blur-xl rounded-xl border border-[#ffaa00]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#ffaa00]" />
            <h4 className="text-sm font-orbitron tracking-wider text-white">
              STOCKS EXCÉDENTAIRES
            </h4>
          </div>
          <p className="text-2xl font-bold text-[#ffaa00]">{getExcessStockMagasins().length}</p>
          <p className="text-xs text-[#ffaa00]/70 mt-1">magasins concernés</p>
        </div>
      </div>
      
      {/* Stocks Table */}
      <div className="overflow-x-auto rounded-xl border border-[#00ffea]/20">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10">
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                MAGASIN
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                STOCK ACTUEL
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                STOCK MIN
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                STOCK MAX
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                STATUT
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                AJUSTEMENT RAPIDE
              </th>
              <th className="text-left py-3 px-4 text-xs font-orbitron tracking-wider text-white">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  <div className="text-center py-6">
                    <Package className="w-12 h-12 text-[#00ffea]/30 mx-auto mb-2" />
                    <p className="text-sm text-[#00ffea]/50">
                      Aucun stock défini pour cette variante
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              stocks.map((stock) => {
                const status = getStockStatus(stock.quantity, stock.minStock, stock.maxStock);
                const adjustment = stockAdjustment[stock.magasinId] || 0;
                
                return (
                  <tr key={stock.id} className="border-b border-[#00ffea]/10 hover:bg-[#00ffea]/5">
                    {/* Magasin */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded flex items-center justify-center">
                          <Warehouse className="w-3 h-3 text-[#00ffea]" />
                        </div>
                        <span className="text-sm text-white">
                          Magasin {stock.magasinId}
                        </span>
                      </div>
                    </td>
                    
                    {/* Stock Actuel */}
                    <td className="py-3 px-4">
                      {editingStock?.magasinId === stock.magasinId ? (
                        <input
                          type="number"
                          value={editingStock.quantity}
                          onChange={(e) => setEditingStock(prev => 
                            prev ? { ...prev, quantity: parseInt(e.target.value) || 0 } : null
                          )}
                          className={inputClassName}
                          min="0"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            status === 'LOW' ? 'text-[#ff416c]' :
                            status === 'EXCESS' ? 'text-[#ffaa00]' :
                            'text-white'
                          }`}>
                            {stock.quantity}
                          </span>
                          {adjustment !== 0 && (
                            <span className={`text-xs ${adjustment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({adjustment > 0 ? '+' : ''}{adjustment})
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    {/* Stock Min */}
                    <td className="py-3 px-4">
                      {editingStock?.magasinId === stock.magasinId ? (
                        <input
                          type="number"
                          value={editingStock.minStock}
                          onChange={(e) => setEditingStock(prev => 
                            prev ? { ...prev, minStock: parseInt(e.target.value) || 0 } : null
                          )}
                          className={inputClassName}
                          min="0"
                        />
                      ) : (
                        <span className="text-sm text-white">
                          {stock.minStock}
                        </span>
                      )}
                    </td>
                    
                    {/* Stock Max */}
                    <td className="py-3 px-4">
                      {editingStock?.magasinId === stock.magasinId ? (
                        <input
                          type="number"
                          value={editingStock.maxStock || ''}
                          onChange={(e) => setEditingStock(prev => 
                            prev ? { 
                              ...prev, 
                              maxStock: e.target.value === '' ? null : parseInt(e.target.value) || 0 
                            } : null
                          )}
                          className={inputClassName}
                          min="0"
                          placeholder="Illimité"
                        />
                      ) : (
                        <span className="text-sm text-white">
                          {stock.maxStock || 'Illimité'}
                        </span>
                      )}
                    </td>
                    
                    {/* Statut */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'LOW' 
                          ? 'bg-[#ff416c]/20 text-[#ff416c] border border-[#ff416c]/30' 
                          : status === 'EXCESS' 
                          ? 'bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/30'
                          : 'bg-[#00ffea]/20 text-[#00ffea] border border-[#00ffea]/30'
                      }`}>
                        {status === 'LOW' ? 'Stock bas' : status === 'EXCESS' ? 'Excès' : 'Normal'}
                      </span>
                    </td>
                    
                    {/* Ajustement Rapide */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjustStock(stock.magasinId, -1)}
                          className="p-1.5 bg-gradient-to-r from-[#ff416c]/10 to-[#ff6b9d]/10 hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 border border-[#ff416c]/30 hover:border-[#ff416c] text-[#ff416c] rounded-lg transition-all duration-300"
                          title="Diminuer de 1"
                        >
                          -1
                        </button>
                        
                        <button
                          onClick={() => handleAdjustStock(stock.magasinId, 1)}
                          className="p-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-[#00ffea] rounded-lg transition-all duration-300"
                          title="Augmenter de 1"
                        >
                          +1
                        </button>
                        
                        {adjustment !== 0 && (
                          <button
                            onClick={() => applyStockAdjustment(stock.magasinId)}
                            className="p-1.5 bg-gradient-to-r from-[#00ffea] to-[#0099ff] text-white text-xs rounded-lg transition-all duration-300"
                          >
                            Appliquer
                          </button>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {editingStock?.magasinId === stock.magasinId ? (
                          <>
                            <button
                              onClick={() => handleSaveStock(stock.magasinId)}
                              className="p-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-[#00ffea] rounded-lg transition-all duration-300"
                              title="Enregistrer"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="p-1.5 bg-gradient-to-r from-[#ff416c]/10 to-[#ff6b9d]/10 hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 border border-[#ff416c]/30 hover:border-[#ff416c] text-[#ff416c] rounded-lg transition-all duration-300"
                              title="Annuler"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingStock({
                              magasinId: stock.magasinId,
                              quantity: stock.quantity,
                              minStock: stock.minStock,
                              maxStock: stock.maxStock
                            })}
                            className="p-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-[#00ffea] rounded-lg transition-all duration-300"
                            title="Modifier"
                          >
                            Éditer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Alerts */}
      {getLowStockMagasins().length > 0 && (
        <div className="bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#ff416c] mt-0.5" />
            <div className="flex-1">
              <h4 className="text-[#ff416c] font-orbitron tracking-wider text-sm mb-2">
                ALERTE STOCK BAS
              </h4>
              <div className="space-y-2">
                {getLowStockMagasins().map((stock, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-white">Magasin {stock.magasinId}</span>
                    <span className="text-[#ff416c]">
                      {stock.quantity} / {stock.minStock} unités
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantStock;