"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useAuth } from "../auth/auth-context"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { useDeviceType } from "@renderer/hooks/useDeviceType"
import { Package, Upload, Check, Loader2, ArrowLeft, Save, Plus, Trash2, Edit, Layers } from "lucide-react"
import { deleteProductPhoto, ProductType, updateProduct } from "@renderer/api/produit"
import { productVariantApi } from "@renderer/api/product-variant.api"
import { getCategoriesForProduct } from "@renderer/api/categorie";
import { getImage, storeImage } from "@renderer/api/image"
import ProductVariantModal from "./productVariant"

interface Category {
  id: string
  nom: string
}

interface BulkSaleItem {
  id: string
  quantity: number
  price: number
}

interface ProductVariant {
  id?: string
  productId: string
  combination: string
  attributes: Record<string, string>
  price?: number
  stock: number
  sku?: string
}

interface Product {
  id: string
  designation: string
  categorieId: string
  puht: number | string
  codeBarre: string
  tva: number
  remise: number
  type: ProductType
  dateDebutRemise?: string | null
  dateFinRemise?: string | null
  active: boolean
  stockInitial: number
  quantite: number
  stockSecurite?: number
  imagePath?: string
  bulkSales?: BulkSaleItem[]
  showInPos?: boolean
  variants?: ProductVariant[]
}

interface ProductEditFormProps {
  product: Product
}

interface ProductFormData {
  designation: string
  categorieId: string
  puht: number
  codeBarre: string
  tva: number
  remise: number
  type: ProductType
  dateDebutRemise?: string | null
  dateFinRemise?: string | null
  active: boolean
  stockInitial: number
  stockSecurite?: number
  image?: string
  bulkSales: BulkSaleItem[]
  showInPos?: boolean
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({ product }) => {
  const { entreprise, user, loading: authLoading } = useAuth()
  const router = useNavigate()
  const { isMobile } = useDeviceType()
  const puhtInitial = typeof product.puht === "string" ? Number.parseFloat(product.puht) : Number(product.puht)
  
  // Initialize bulkSales from either existing bulkSales or map backend ventesParLot
  const initialBulkSales: BulkSaleItem[] = (product.bulkSales && product.bulkSales.length > 0)
    ? product.bulkSales
    : (((product as any).ventesParLot || []).map((lot: any) => ({
        id: lot.id || Date.now().toString(),
        quantity: Number(lot.qte) || 0,
        price: Number(lot.prix) || 0,
      })) as BulkSaleItem[])
  
  const [formData, setFormData] = useState<ProductFormData>({
    designation: product.designation,
    categorieId: product.categorieId,
    puht: puhtInitial,
    codeBarre: product.codeBarre,
    tva: Number(product.tva),
    remise: product.remise ?? 0,
    type: product.type,
    dateDebutRemise: product.dateDebutRemise ?? null,
    dateFinRemise: product.dateFinRemise ?? null,
    active: product.active,
    stockInitial: Number(product.stockInitial),
    stockSecurite: product.stockSecurite !== undefined ? Number(product.stockSecurite) : undefined,
    bulkSales: initialBulkSales,
    showInPos: product.showInPos ?? true,
    image: product.imagePath
  })
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>()
  const [hasVariants, setHasVariants] = useState(!!product.variants?.length || false)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [productVariants, setProductVariants] = useState<ProductVariant[]>(product.variants || [])
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({})
  const [variantFamilies, setVariantFamilies] = useState<any[]>([])
  const [loadingVariants, setLoadingVariants] = useState(false)
  
  // Handle authentication and authorization redirects
  useEffect(() => {
    if (authLoading) return
    if (!user || !user.isActive) {
      router('/banned')
      return
    }
    if (user.role !== 'ADMIN' && !user.permissions.includes('Gestion des produits')) {
      router('/unauthorized')
      return
    }
  }, [authLoading, user, router])

  // Fetch categories
  useEffect(() => {
    if (entreprise?.id) {
      const fetchCategories = async () => {
        try {
          const categories = await getCategoriesForProduct(entreprise.id);
          setCategories(categories);
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Impossible de charger les catégories.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      };
      fetchCategories();
    }
  }, [entreprise])

  // Fetch existing variants if product has variants
useEffect(() => {
  const fetchExistingVariants = async () => {
    if (hasVariants && product.id && entreprise?.id) {
      setLoadingVariants(true)
      try {
        const existingVariants = await productVariantApi.getProductVariants(product.id)

        if (existingVariants && existingVariants.length > 0) {
          setProductVariants(existingVariants)

          // Calculer les stocks
          const stocks: Record<string, number> = {}
          existingVariants.forEach(variant => {
            if (variant.id) {
              stocks[variant.id] = variant.stock || 0
            }
          })
          setVariantStocks(stocks)

          // Calculer le stock total
          const totalStock = Object.values(stocks).reduce((sum, stock) => sum + stock, 0)
          setFormData(prev => ({ ...prev, stockInitial: totalStock }))
        }
      } catch (error) {
        console.error("Erreur lors du chargement des variantes:", error)
        toast.error("Impossible de charger les variantes existantes")
      } finally {
        setLoadingVariants(false)
      }
    }
  }

  fetchExistingVariants()
}, [hasVariants, product.id, entreprise?.id])


  const handleSaveVariants = (variants: any[], stocks: Record<string, number>, families: any[]) => {
    setProductVariants(variants);
    setVariantStocks(stocks);
    setVariantFamilies(families);
    setShowVariantModal(false);
    
    // Calculer le stock total
    const totalStock = Object.values(stocks).reduce((sum, stock) => sum + stock, 0);
    setFormData(prev => ({ ...prev, stockInitial: totalStock }));
    
    // Si des variantes sont ajoutées, activer le toggle
    if (variants.length > 0) {
      setHasVariants(true);
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    // Ouvrir le modal en mode édition avec la variante sélectionnée
    setShowVariantModal(true);
    // Note: Vous devrez passer l'état de la variante au modal
    // Cela nécessitera une modification du modal pour accepter une variante à éditer
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!entreprise?.id || !variantId) return;
    
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette variante ?");
    if (!confirmDelete) return;
    
    try {
      setLoadingVariants(true);
      // Ici, vous devrez implémenter l'API pour supprimer une variante
      // await deleteProductVariant(entreprise.id, product.id, variantId);
      
      // Pour l'instant, on filtre simplement la liste locale
      setProductVariants(prev => prev.filter(v => v.id !== variantId));
      
      // Mettre à jour les stocks
      const newStocks = { ...variantStocks };
      delete newStocks[variantId];
      setVariantStocks(newStocks);
      
      // Recalculer le stock total
      const totalStock = Object.values(newStocks).reduce((sum, stock) => sum + stock, 0);
      setFormData(prev => ({ ...prev, stockInitial: totalStock }));
      
      toast.success("Variante supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de la variante:", error);
      toast.error("Erreur lors de la suppression de la variante");
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleToggleVariants = (checked: boolean) => {
    setHasVariants(checked);
    if (checked && productVariants.length === 0) {
      // S'il n'y a pas encore de variantes, ouvrir le modal
      setShowVariantModal(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!entreprise?.id) {
      setError("Utilisateur non authentifié.")
      toast.error("Utilisateur non authentifié.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Préparer les données avec les variantes si activées
      const productData = {
        ...formData,
        hasVariants,
        variants: hasVariants ? productVariants : [],
        variantFamilies: hasVariants ? variantFamilies : []
      };

      await updateProduct(entreprise.id, product.id, productData)
      toast.success("Produit mis à jour avec succès !")
      router("/dashboard_user/products/list")
    } catch (err: unknown) {
      const errorMessage = err || "Erreur lors de la mise à jour du produit."
      setError(String(errorMessage))
      toast.error(String(errorMessage))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    let newValue: string | number | boolean | File | undefined | null = value

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked
    } else if (type === "number") {
      newValue = value === '' ? 0 : Number.parseFloat(value)
    } else if (type === "file" && e.target instanceof HTMLInputElement && e.target.files?.[0]) {
          try {
            const base64Image = await storeImage(e as React.ChangeEvent<HTMLInputElement>);
            if (base64Image) {
              setImagePreview(base64Image.image64);
              newValue = base64Image.imageName;
            }
          } catch (error) {
            console.error("Error storing image:", error);
          }
    } else if (type === "datetime-local") {
      newValue = value || null
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }))
  }

  const addBulkSaleItem = () => {
    const newItem: BulkSaleItem = {
      id: Date.now().toString(),
      quantity: 0,
      price: 0,
    };
    setFormData(prev => ({
      ...prev,
      bulkSales: [...prev.bulkSales, newItem]
    }));
  };

  const removeBulkSaleItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      bulkSales: prev.bulkSales.filter(item => item.id !== id)
    }));
  };

  const updateBulkSaleItem = (id: string, field: 'quantity' | 'price', value: number) => {
    setFormData(prev => ({
      ...prev,
      bulkSales: prev.bulkSales.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleRemoveImage = async () => {
    if (!entreprise?.id) {
      setError("Utilisateur non authentifié.")
      toast.error("Utilisateur non authentifié.")
      return
    }

    setLoading(true)
    try {
      await deleteProductPhoto(entreprise.id, product.id)
      setFormData((prev) => ({ ...prev, image: undefined }))
      setImagePreview(null)
      toast.success("Image du produit supprimée avec succès !")
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression de l'image."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchImage = async () => {
    try {
      if (!product) return
      const response = await getImage(product.imagePath)
      if (!response) return
      setImagePreview(response)
    } catch (error) {
      console.error("error fetching image :", error)
    }
  }
  
  useEffect(() => {
    fetchImage()
  }, [product])

  // Conditional rendering after all hooks
  if (authLoading || loading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Chargement...</div>
  }

  if (!user || !user.isActive || (user.role !== 'ADMIN' && !user.permissions.includes('Gestion des produits'))) {
    return null // Redirect handled in useEffect
  }

  if (!entreprise) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Package className="w-8 h-8 sm:w-12 sm:h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white text-center">Veuillez vous connecter.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Modifier le Produit</h1>
            {!isMobile && <p className="text-white/60 text-sm">Modifiez les informations du produit</p>}
          </div>
        </div>
        <button
          onClick={() => router("/dashboard_user/products/list")}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-all duration-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          {!isMobile && "Retour"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-sm">{error}</div>
      )}

      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* ... (les autres champs restent inchangés) ... */}
            <div className="space-y-1 sm:col-span-2 md:col-span-2">
              <label htmlFor="designation" className="block text-xs font-medium text-white/90">
                Désignation <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm"
                required
                placeholder="Nom du produit"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="categorieId" className="block text-xs font-medium text-white/90">
                Catégorie <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="categorieId"
                  name="categorieId"
                  value={formData.categorieId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm appearance-none"
                  required
                >
                  <option value="" disabled className="bg-purple-800">
                    Sélectionner une catégorie
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-purple-800">
                      {category.nom}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={formData.type === ProductType.MAGASIN ? "space-y-1" : "hidden"}>
              <label htmlFor="codeBarre" className="block text-xs font-medium text-white/90">
                Code-barre <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                id="codeBarre"
                name="codeBarre"
                value={formData.codeBarre}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm"
                required={formData.type === ProductType.MAGASIN}
                placeholder="Code-barres du produit"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="puht" className="block text-xs font-medium text-white/90">
                Prix HT <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="puht"
                  name="puht"
                  value={formData.puht}
                  onChange={handleChange}
                  step="0.001"
                  min="0"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm no-spinner"
                  required
                  placeholder="0.000"
                  style={{ MozAppearance: 'textfield', appearance: 'textfield' }}
                  onWheel={e => e.currentTarget.blur()}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-xs font-medium">TND</span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="tva" className="block text-xs font-medium text-white/90">
                TVA <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="tva"
                  name="tva"
                  value={formData.tva}
                  onChange={handleChange}
                  step="1"
                  min="0"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm no-spinner"
                  required
                  placeholder="0"
                  style={{ MozAppearance: 'textfield', appearance: 'textfield' }}
                  onWheel={e => e.currentTarget.blur()}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-xs font-medium">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="remise" className="block text-xs font-medium text-white/90">
                Remise (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="remise"
                  name="remise"
                  value={formData.remise}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm no-spinner"
                  placeholder="0"
                  style={{ MozAppearance: 'textfield', appearance: 'textfield' }}
                  onWheel={e => e.currentTarget.blur()}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-xs font-medium">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="dateDebutRemise" className="block text-xs font-medium text-white/90">
                Début de Remise
              </label>
              <input
                type="datetime-local"
                id="dateDebutRemise"
                name="dateDebutRemise"
                value={formData.dateDebutRemise || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm"
                placeholder="Sélectionner la date de début"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="dateFinRemise" className="block text-xs font-medium text-white/90">
                Fin de Remise
              </label>
              <input
                type="datetime-local"
                id="dateFinRemise"
                name="dateFinRemise"
                value={formData.dateFinRemise || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm"
                placeholder="Sélectionner la date de fin"
              />
            </div>

            <div className="space-y-1 hidden" >
              <label htmlFor="stockInitial" className="block text-xs font-medium text-white/90">
                Stock Initial <span className="text-pink-400">*</span>
              </label>
              <input
                type="number"
                id="stockInitial"
                name="stockInitial"
                value={formData.stockInitial}
                onChange={handleChange}
                min="0"
                step="0.001"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm no-spinner"
                disabled
                placeholder="0"
                style={{ MozAppearance: 'textfield', appearance: 'textfield' }}
                onWheel={e => e.currentTarget.blur()}
              />
              <p className="text-xs text-white/50">⚠️ Modifiable uniquement si aucune opération n'existe</p>
            </div>

            <div className={formData.type === ProductType.MAGASIN ? "space-y-1" : "hidden"}>
              <label htmlFor="stockSecurite" className="block text-xs font-medium text-white/90">
                Stock Sécurité
              </label>
              <input
                type="number"
                id="stockSecurite"
                name="stockSecurite"
                value={formData.stockSecurite === undefined ? '' : formData.stockSecurite}
                onChange={handleChange}
                min="0"
                step="0.001"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm no-spinner"
                placeholder="0"
                style={{ MozAppearance: 'textfield', appearance: 'textfield' }}
                onWheel={e => e.currentTarget.blur()}
              />
            </div>

          </div>

          {/* Toggle Variantes avec gestion des variantes existantes */}
          <div className="mt-4">
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <div>
                <span className="text-xs font-medium text-white/90">Produit avec variantes</span>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {hasVariants && productVariants.length > 0 
                    ? `${productVariants.length} variante(s) configurée(s)` 
                    : "Activer pour gérer différentes combinaisons"}
                </p>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={hasVariants}
                  onChange={(e) => handleToggleVariants(e.target.checked)}
                  className="sr-only" 
                />
                <div className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-all duration-300 ${hasVariants ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30' : 'bg-white/10 border border-white/30'}`}>
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 ${
                      hasVariants ? 'translate-x-5 sm:translate-x-5' : 'translate-x-0.5'
                    } translate-y-0.5`}
                  >
                    {hasVariants && (
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
              </div>
            </label>

            {/* Affichage des variantes existantes */}
            {hasVariants && productVariants.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-white/90 flex items-center gap-2">
                    <Layers className="w-3 h-3" />
                    Variantes configurées
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowVariantModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs transition-all duration-200"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </button>
                </div>
                
                {loadingVariants ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {productVariants.map((variant) => (
                      <div 
                        key={variant.id || variant.combination} 
                        className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white/90">
                              {variant.combination || "Variante sans nom"}
                            </span>
                            {variant.price !== undefined && variant.price !== formData.puht && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                +{((variant.price - formData.puht) / formData.puht * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[11px] text-white/70">
                              Stock: <span className="font-medium">{variant.stock}</span>
                            </span>
                            {variant.sku && (
                              <span className="text-[11px] text-white/70">
                                SKU: <span className="font-medium">{variant.sku}</span>
                              </span>
                            )}
                          </div>
                          {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                            <div className="mt-1">
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <span 
                                  key={key} 
                                  className="inline-block text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded mr-1 mb-1"
                                >
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditVariant(variant)}
                            className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-200"
                            title="Modifier"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => variant.id && handleDeleteVariant(variant.id)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Vente par lots Section */}
          <div className="space-y-4 pt-4 border-t border-white/10 ">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/90">Vente par lots</h3>
              <button
                type="button"
                onClick={addBulkSaleItem}
                className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl text-sm transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            
            {formData.bulkSales.length > 0 && (
              <div className="space-y-3">
                {formData.bulkSales.map((item) => (
                  <div key={item.id} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-white/70 mb-2">
                        Quantité
                      </label>
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) => updateBulkSaleItem(item.id, 'quantity', Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm no-spinner"
                        min="0"
                        step="1"
                        placeholder="0"
                        style={{ MozAppearance: "textfield", appearance: "textfield" }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-white/70 mb-2">
                        Prix (TND)
                      </label>
                      <input
                        type="number"
                        value={item.price || ""}
                        onChange={(e) => updateBulkSaleItem(item.id, 'price', Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm no-spinner"
                        min="0"
                        step="0.001"
                        placeholder="0.000"
                        style={{ MozAppearance: "textfield", appearance: "textfield" }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBulkSaleItem(item.id)}
                      className="px-3 py-2 sm:px-4 sm:py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1 sm:col-span-2 md:col-span-3">
            <label htmlFor="image" className="block text-xs font-medium text-white/90">
              Image du produit
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500/20 file:text-white/80 hover:file:bg-purple-500/30 transition-all duration-200"
                  />
                  <Upload className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40 pointer-events-none" />
                </div>
              </div>
              {imagePreview && (
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Aperçu du produit"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-sm transition-all duration-200"
              >
                Supprimer
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-white/10 space-y-3 sm:space-y-0">
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-colors duration-200 ${formData.active ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/10"}`}
                >
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${formData.active ? "translate-x-5 sm:translate-x-5" : "translate-x-0.5"} translate-y-0.5`}
                  >
                    {formData.active && (
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-white/90">Produit actif</span>
            </label>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router("/dashboard_user/products/list")}
                className="px-4 py-2 sm:px-6 sm:py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium text-sm"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Mettre à jour</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={formData.type === ProductType.MAGASIN ? "mt-2" : "hidden"}>
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.04]">
              <div>
                <label className="block text-xs font-medium text-white/90">Afficher dans POS</label>
                <p className="text-[11px] text-white/50 mt-0.5">Rendre ce produit visible et vendable dans la caisse POS.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, showInPos: !(prev.showInPos ?? false) }))}
                aria-pressed={(formData.showInPos ?? true) ? 'true' : 'false'}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${formData.showInPos ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/15'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.showInPos ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Variant Modal */}
      {showVariantModal && (
        <ProductVariantModal
          isOpen={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          onSave={handleSaveVariants}
          existingVariants={productVariants}
          productId={product.id}
        />
      )}
    </div>
  )
}

export default ProductEditForm