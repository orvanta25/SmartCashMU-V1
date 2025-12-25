import { useState, useCallback, useEffect } from 'react';
import { 
  ProductVariant, 
  ProductVariantFormData,
  ProductVariantStock,
  IStockUpdateRequest 
} from '../types/variant.types';
import { productVariantApi } from '../api/product-variant.api';
import { useToast } from './useToast';

export const useProductVariant = (variantId?: number) => {
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  // Charger une variante spécifique
  const loadVariant = useCallback(async (id: number) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Note: Nous devons récupérer toutes les variantes du produit,
      // puis trouver celle qui nous intéresse.
      // Pour l'instant, nous allons charger toutes les variantes et filtrer.
      // Dans une vraie implémentation, vous auriez un endpoint API pour récupérer une variante par ID.
      const variants = await productVariantApi.findAllByProduct('');
      const foundVariant = variants.find(v => v.id === id);
      
      if (foundVariant) {
        setVariant(foundVariant);
      } else {
        throw new Error('Variante non trouvée');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors du chargement de la variante';
      setError(errorMsg);
      showToast('error', errorMsg);
      console.error('Error loading variant:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Charger automatiquement si variantId est fourni
  useEffect(() => {
    if (variantId) {
      loadVariant(variantId);
    }
  }, [variantId, loadVariant]);

  // Créer une nouvelle variante
  const createVariant = async (data: ProductVariantFormData): Promise<ProductVariant> => {
    setLoading(true);
    setError(null);
    
    try {
      const newVariant = await productVariantApi.create(data);
      
      // Générer un nom si non fourni
      if (!newVariant.name && newVariant.values && newVariant.values.length > 0) {
        const variantName = newVariant.values.map(v => v.value).join(' - ');
        newVariant.name = variantName;
      }
      
      setVariant(newVariant);
      showToast('success', 'Variante créée avec succès');
      return newVariant;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la création de la variante';
      setError(errorMsg);
      showToast('error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour la variante
  const updateVariant = async (id: number, data: Partial<ProductVariantFormData>): Promise<ProductVariant> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedVariant = await productVariantApi.update(id, data);
      
      // Mettre à jour le nom si nécessaire
      if (!updatedVariant.name && updatedVariant.values && updatedVariant.values.length > 0) {
        const variantName = updatedVariant.values.map(v => v.value).join(' - ');
        updatedVariant.name = variantName;
      }
      
      setVariant(updatedVariant);
      showToast('success', 'Variante mise à jour avec succès');
      return updatedVariant;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la mise à jour de la variante';
      setError(errorMsg);
      showToast('error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer la variante
  const deleteVariant = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await productVariantApi.delete(id);
      setVariant(null);
      showToast('success', 'Variante supprimée avec succès');
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la suppression de la variante';
      setError(errorMsg);
      showToast('error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le stock
  const updateStock = async (
    magasinId: string, 
    quantity: number, 
    minStock?: number, 
    maxStock?: number
  ): Promise<void> => {
    if (!variant) {
      throw new Error('Aucune variante sélectionnée');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await productVariantApi.updateStock(variant.id, magasinId, quantity, minStock, maxStock);
      
      // Mettre à jour localement
      setVariant(prev => {
        if (!prev) return null;
        
        const stockIndex = prev.stocks.findIndex(s => s.magasinId === magasinId);
        
        if (stockIndex >= 0) {
          const updatedStocks = [...prev.stocks];
          updatedStocks[stockIndex] = {
            ...updatedStocks[stockIndex],
            quantity,
            minStock: minStock ?? updatedStocks[stockIndex].minStock,
            maxStock: maxStock ?? updatedStocks[stockIndex].maxStock,
            updatedAt: new Date(),
          };
          return { ...prev, stocks: updatedStocks };
        } else {
          const newStock: ProductVariantStock = {
            id: 0, // temporaire, sera remplacé par le vrai ID après rechargement
            productVariantId: variant.id,
            magasinId,
            quantity,
            minStock: minStock ?? 0,
            maxStock: maxStock ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return { ...prev, stocks: [...prev.stocks, newStock] };
        }
      });
      
      showToast('success', 'Stock mis à jour avec succès');
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la mise à jour du stock';
      setError(errorMsg);
      showToast('error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Incrémenter/décrémenter le stock
  const adjustStock = async (
    magasinId: string,
    adjustment: number,
    reference?: string,
    notes?: string
  ): Promise<void> => {
    if (!variant) {
      throw new Error('Aucune variante sélectionnée');
    }
    
    const currentStock = getStockInMagasin(magasinId);
    const newQuantity = currentStock + adjustment;
    
    if (newQuantity < 0) {
      throw new Error('Stock insuffisant');
    }
    
    return updateStock(magasinId, newQuantity);
  };

  // Obtenir le stock dans un magasin spécifique
  const getStockInMagasin = (magasinId: string): number => {
    if (!variant) return 0;
    
    const stock = variant.stocks.find(s => s.magasinId === magasinId);
    return stock ? stock.quantity : 0;
  };

  // Obtenir le stock minimum dans un magasin spécifique
  const getMinStockInMagasin = (magasinId: string): number => {
    if (!variant) return 0;
    
    const stock = variant.stocks.find(s => s.magasinId === magasinId);
    return stock ? stock.minStock : 0;
  };

  // Obtenir le stock maximum dans un magasin spécifique
  const getMaxStockInMagasin = (magasinId: string): number | null => {
    if (!variant) return null;
    
    const stock = variant.stocks.find(s => s.magasinId === magasinId);
    return stock ? stock.maxStock : null;
  };

  // Vérifier si le stock est faible
  const isStockLow = (magasinId: string): boolean => {
    if (!variant) return false;
    
    const stock = variant.stocks.find(s => s.magasinId === magasinId);
    if (!stock) return false;
    
    return stock.quantity <= stock.minStock;
  };

  // Vérifier si le stock est excédentaire
  const isStockExcess = (magasinId: string): boolean => {
    if (!variant) return false;
    
    const stock = variant.stocks.find(s => s.magasinId === magasinId);
    if (!stock || stock.maxStock === null) return false;
    
    return stock.quantity > stock.maxStock;
  };

  // Obtenir l'état du stock
  const getStockStatus = (magasinId: string): 'OK' | 'LOW' | 'EXCESS' | 'UNKNOWN' => {
    if (!variant) return 'UNKNOWN';
    
    const stock = variant.stocks.find(s => s.magasinId === magasinId);
    if (!stock) return 'UNKNOWN';
    
    if (stock.quantity <= stock.minStock) return 'LOW';
    if (stock.maxStock !== null && stock.quantity > stock.maxStock) return 'EXCESS';
    return 'OK';
  };

  // Calculer le prix total (prix de base + ajustement)
  const calculatePrice = (basePrice: number): number => {
    if (!variant) return basePrice;
    return basePrice + (variant.priceAdjustment || 0);
  };

  // Calculer le coût total (coût de base + ajustement)
  const calculateCost = (baseCost: number): number => {
    if (!variant) return baseCost;
    return baseCost + (variant.costAdjustment || 0);
  };

  // Obtenir la marge brute
  const getGrossMargin = (basePrice: number, baseCost: number): number => {
    const price = calculatePrice(basePrice);
    const cost = calculateCost(baseCost);
    
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  // Générer un nom de variante à partir des valeurs
  const generateVariantName = (): string => {
    if (!variant || !variant.values || variant.values.length === 0) {
      return variant?.name || 'Variante sans nom';
    }
    
    return variant.values.map(v => v.value).join(' - ');
  };

  // Obtenir la liste des valeurs par famille
  const getValuesByFamily = () => {
    if (!variant || !variant.values) return {};
    
    const groupedValues: Record<number, Array<{ id: number; value: string; code: string }>> = {};
    
    variant.values.forEach(value => {
      const familyId = value.variantFamilyId;
      if (!groupedValues[familyId]) {
        groupedValues[familyId] = [];
      }
      groupedValues[familyId].push({
        id: value.id,
        value: value.value,
        code: value.code
      });
    });
    
    return groupedValues;
  };

  // Vérifier si la variante est active et en stock
  const isAvailable = (magasinId?: string): boolean => {
    if (!variant || !variant.isActive) return false;
    
    if (magasinId) {
      return getStockInMagasin(magasinId) > 0;
    }
    
    // Vérifier si au moins un magasin a du stock
    return variant.stocks.some(stock => stock.quantity > 0);
  };

  // Réinitialiser le hook
  const reset = () => {
    setVariant(null);
    setError(null);
    setLoading(false);
    setIsEditing(false);
  };

  // Activer/désactiver le mode édition
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Exporter les données de la variante pour un formulaire
  const exportFormData = (): ProductVariantFormData => {
    if (!variant) {
      throw new Error('Aucune variante à exporter');
    }
    
    return {
      productId: variant.productId,
      sku: variant.sku || '',
      name: variant.name || '',
      priceAdjustment: variant.priceAdjustment,
      costAdjustment: variant.costAdjustment,
      isActive: variant.isActive,
      variantValueIds: variant.values.map(v => v.id)
    };
  };

  return {
    // État
    variant,
    loading,
    error,
    isEditing,
    
    // Actions
    loadVariant,
    createVariant,
    updateVariant: variant ? (data: Partial<ProductVariantFormData>) => updateVariant(variant.id, data) : undefined,
    deleteVariant: variant ? () => deleteVariant(variant.id) : undefined,
    updateStock,
    adjustStock,
    reset,
    toggleEdit,
    
    // Calculs et informations
    getStockInMagasin,
    getMinStockInMagasin,
    getMaxStockInMagasin,
    isStockLow,
    isStockExcess,
    getStockStatus,
    calculatePrice,
    calculateCost,
    getGrossMargin,
    generateVariantName,
    getValuesByFamily,
    isAvailable,
    
    // Utilitaires
    exportFormData,
    
    // Setters
    setVariant,
    setError,
    setLoading,
    setIsEditing
  };
};

// Hook pour la gestion des stocks de variantes
export const useProductVariantStock = (variantId?: number) => {
  const [stocks, setStocks] = useState<ProductVariantStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Charger les stocks d'une variante
  const loadStocks = useCallback(async (id: number) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Pour l'instant, nous devons charger la variante complète
      // Dans une future version, vous pourriez avoir un endpoint dédié
      const variants = await productVariantApi.findAllByProduct('');
      const variant = variants.find(v => v.id === id);
      
      if (variant) {
        setStocks(variant.stocks || []);
      } else {
        throw new Error('Variante non trouvée');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors du chargement des stocks';
      setError(errorMsg);
      showToast('error', errorMsg);
      console.error('Error loading stocks:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Charger automatiquement si variantId est fourni
  useEffect(() => {
    if (variantId) {
      loadStocks(variantId);
    }
  }, [variantId, loadStocks]);

  // Mettre à jour un stock
  const updateStock = async (
    magasinId: string,
    quantity: number,
    minStock?: number,
    maxStock?: number
  ): Promise<void> => {
    if (!variantId) {
      throw new Error('Aucune variante sélectionnée');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await productVariantApi.updateStock(variantId, magasinId, quantity, minStock, maxStock);
      
      // Mettre à jour localement
      setStocks(prev => {
        const stockIndex = prev.findIndex(s => s.magasinId === magasinId);
        
        if (stockIndex >= 0) {
          const updatedStocks = [...prev];
          updatedStocks[stockIndex] = {
            ...updatedStocks[stockIndex],
            quantity,
            minStock: minStock ?? updatedStocks[stockIndex].minStock,
            maxStock: maxStock ?? updatedStocks[stockIndex].maxStock,
            updatedAt: new Date(),
          };
          return updatedStocks;
        } else {
          const newStock: ProductVariantStock = {
            id: 0, // temporaire
            productVariantId: variantId,
            magasinId,
            quantity,
            minStock: minStock ?? 0,
            maxStock: maxStock ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return [...prev, newStock];
        }
      });
      
      showToast('success', 'Stock mis à jour avec succès');
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la mise à jour du stock';
      setError(errorMsg);
      showToast('error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtenir le stock dans un magasin
  const getStock = (magasinId: string): number => {
    const stock = stocks.find(s => s.magasinId === magasinId);
    return stock ? stock.quantity : 0;
  };

  // Obtenir le stock total (tous magasins)
  const getTotalStock = (): number => {
    return stocks.reduce((total, stock) => total + stock.quantity, 0);
  };

  // Obtenir les magasins avec stock bas
  const getLowStockMagasins = (): Array<{ magasinId: string; quantity: number; minStock: number }> => {
    return stocks
      .filter(stock => stock.quantity <= stock.minStock)
      .map(stock => ({
        magasinId: stock.magasinId,
        quantity: stock.quantity,
        minStock: stock.minStock
      }));
  };

  // Obtenir les magasins avec stock excédentaire
  const getExcessStockMagasins = (): Array<{ magasinId: string; quantity: number; maxStock: number }> => {
    return stocks
      .filter(stock => stock.maxStock !== null && stock.quantity > stock.maxStock)
      .map(stock => ({
        magasinId: stock.magasinId,
        quantity: stock.quantity,
        maxStock: stock.maxStock!
      }));
  };

  return {
    // État
    stocks,
    loading,
    error,
    
    // Actions
    loadStocks,
    updateStock,
    
    // Calculs
    getStock,
    getTotalStock,
    getLowStockMagasins,
    getExcessStockMagasins,
    
    // Setters
    setStocks,
    setError,
    setLoading
  };
};

// Hook pour la gestion des mouvements de stock
export const useStockMovements = () => {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Enregistrer un mouvement de stock
  const recordMovement = async (
    variantId: number,
    magasinId: string,
    type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'TRANSFERT',
    quantity: number,
    previousQuantity: number,
    reference?: string,
    notes?: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Ici, vous implémenteriez l'appel API pour enregistrer le mouvement
      // Pour l'instant, nous simulons l'ajout local
      const newMovement = {
        id: Date.now(), // temporaire
        productVariantId: variantId,
        magasinId,
        type,
        quantity,
        previousQuantity,
        newQuantity: previousQuantity + (type === 'SORTIE' ? -quantity : quantity),
        reference,
        notes,
        createdAt: new Date(),
        createdBy: 'system' // À remplacer par l'utilisateur connecté
      };
      
      setMovements(prev => [newMovement, ...prev]);
      showToast('success', 'Mouvement enregistré avec succès');
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de l\'enregistrement du mouvement';
      setError(errorMsg);
      showToast('error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les mouvements pour une variante
  const getMovementsForVariant = (variantId: number): any[] => {
    return movements.filter(movement => movement.productVariantId === variantId);
  };

  // Obtenir les mouvements pour un magasin
  const getMovementsForMagasin = (magasinId: string): any[] => {
    return movements.filter(movement => movement.magasinId === magasinId);
  };

  // Filtrer les mouvements par type
  const filterMovementsByType = (type: string): any[] => {
    return movements.filter(movement => movement.type === type);
  };

  return {
    // État
    movements,
    loading,
    error,
    
    // Actions
    recordMovement,
    
    // Recherches
    getMovementsForVariant,
    getMovementsForMagasin,
    filterMovementsByType,
    
    // Setters
    setMovements,
    setError,
    setLoading
  };
};