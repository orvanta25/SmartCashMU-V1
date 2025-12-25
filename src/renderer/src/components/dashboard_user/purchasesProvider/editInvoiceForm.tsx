"use client"

import React, { useState, useEffect, useRef } from "react"
import type { FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../auth/auth-context"
import { toast } from "react-toastify"
import {
  Plus,
  Trash2,
  Edit2,
  FileText,
  Calendar,
  User,
  DollarSign,
  Percent,
  CreditCard,
  Download,
  Printer,
  X,
  Check,
  Loader2,
  Barcode,
  Package,
  Hash,
  FileUp,
  ShoppingCart,
  Receipt,
  ArrowLeft,
  Save,
  PackagePlus
} from "lucide-react"
import { useDeviceType } from "@renderer/hooks/useDeviceType"
import {
  getAchatFournisseurById,
  updateAchatFournisseur,
  deleteAchatFournisseurPieceJointe
} from "@renderer/api/achat-fournisseur"
import type { UpdateAchatFournisseurDto, CreateEntreeDto } from "@renderer/types/achat-entree"
import { getProductByBarcode } from "@renderer/api/produit"
import { Fournisseur, getFournisseursByParams } from "@renderer/api/fournisseur"

interface ProductItem {
  id?: string
  codeBar: string
  designation: string
  quantity: number
  puht: number
  tva: number
  remiseArticle?: number
  prixUnitaireTTC: number
  prixTotalTTC: number
  prixTotalHT: number
}

interface InvoiceData {
  id: string
  numeroFacture: string
  fournisseur: string
  montantTotal: number
  montantHT: number
  montantTVA: number
  montantComptant: number | null
  montantRestant: number | null
  remise: number | null
  dateFacture: string
  dateEcheance: string
  datePaiement: string | null
  pieceJointe: string | null
  entrees: Array<{
    id: string
    codeBarre: string
    designation: string
    quantite: number
    puht: number
    tva: number
    prixUnitaireTTC: number
    prixTotalTTC: number
  }>
}

const EditInvoiceForm = () => {
  const { entreprise } = useAuth()
  const router = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  const [activeTab, setActiveTab] = useState<'details' | 'products'>('details')
  const [form, setForm] = useState({
    numeroFacture: "",
    fournisseur: "",
    montantTotal: 0,
    montantHT: 0,
    montantTVA: 0,
    acompte: 0,
    montantRestant: 0,
    remiseGlobale: 0,
    dateFacture: new Date().toISOString().split('T')[0],
    dateEcheance: "",
    datePaiement: "",
    pieceJointe: undefined as File | undefined,
    existingPieceJointe: undefined as string | undefined,
  })

  const [productForm, setProductForm] = useState({
    codeBar: "",
    designation: "",
    quantity: "",
    puht: "",
    tva: "",
    remiseArticle: "",
  })

  const [products, setProducts] = useState<ProductItem[]>([])
  const [originalProducts, setOriginalProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [providers, setProviders] = useState<Fournisseur[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allProviders, setAllProviders] = useState<Fournisseur[]>([])
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null)
  
  const productFormRef = useRef<HTMLDivElement>(null)
  const { isMobile, isTablet, isIPadMini, isIPadPro, isSUNMITablet, isDesktop, isSurfaceDuo, sunMy } = useDeviceType()

  // Récupérer tous les fournisseurs à l'initialisation
  const fetchFournisseur = async () => {
    try {
      if (!entreprise) return
      const fournisseurs = await getFournisseursByParams(entreprise.id, {
        denomination: ""
      })
      if (fournisseurs) {
        setAllProviders(fournisseurs)
        setProviders(fournisseurs)
      }
    } catch (error: any) {
      toast.error("Impossible de récupérer les fournisseurs: " + error.message)
    }
  }

  // Recherche locale dans la liste complète
  const searchFournisseursLocal = (value: string) => {
    if (value.length < 1) {
      setProviders(allProviders)
      setShowSuggestions(false)
      return
    }

    const filtered = allProviders.filter((f) =>
      f.denomination.toLowerCase().includes(value.toLowerCase())
    )
    setProviders(filtered)
    setShowSuggestions(true)
  }

  useEffect(() => {
    fetchFournisseur()
  }, [entreprise])

  useEffect(() => {
    if (!entreprise?.id || !id) return
    
    const fetchInvoice = async () => {
      try {
        setLoading(true)
        const invoice = await getAchatFournisseurById(entreprise.id, id)
        
        // Convertir les entrées du backend au format frontend
        const formattedProducts: ProductItem[] = invoice.entrees.map(entree => ({
          id: entree.id,
          codeBar: entree.codeBarre,
          designation: entree.designation,
          quantity: entree.quantite,
          puht: entree.puht,
          tva: entree.tva,
          prixUnitaireTTC: entree.prixUnitaireTTC,
          prixTotalTTC: entree.prixTotalTTC,
          prixTotalHT: entree.puht * entree.quantite
        }))

        // Calculer les totaux HT et TVA
        const montantHT = formattedProducts.reduce((sum, p) => sum + (p.puht * p.quantity), 0)
        const montantTVA = formattedProducts.reduce((sum, p) => sum + (p.prixTotalHT * p.tva / 100), 0)
        
        setForm({
          numeroFacture: invoice.numeroFacture,
          fournisseur: invoice.fournisseur,
          montantTotal: invoice.montantTotal,
          montantHT,
          montantTVA,
          acompte: invoice.montantComptant || 0,
          montantRestant: invoice.montantRestant || invoice.montantTotal,
          remiseGlobale: invoice.remise || 0,
          dateFacture: new Date().toISOString().split('T')[0],
          dateEcheance: invoice.dateEcheance.split('T')[0],
          datePaiement: invoice.datePaiement ? invoice.datePaiement.split('T')[0] : "",
          pieceJointe: undefined,
          existingPieceJointe: invoice.pieceJointe || undefined,
        })

        setProducts(formattedProducts)
        setOriginalProducts(formattedProducts)
        setError(null)
      } catch (err: any) {
        setError('Erreur lors du chargement de la facture')
        toast.error('Erreur lors du chargement de la facture')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInvoice()
  }, [entreprise?.id, id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    setForm(prev => {
      const numericFields = [
        'montantTotal', 'montantHT', 'montantTVA', 'acompte', 
        'montantRestant', 'remiseGlobale'
      ]
      
      const newValue = numericFields.includes(name) 
        ? (value === "" ? 0 : parseFloat(value) || 0)
        : value
      
      const updated = { ...prev, [name]: newValue }
      
      // Recalculer les montants
      if (name === 'montantTotal' || name === 'acompte' || name === 'remiseGlobale') {
        updated.montantRestant = updated.montantTotal - (updated.acompte || 0)
      }
      
      return updated
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!validTypes.includes(file.type)) {
        setError("Seuls les fichiers PDF, JPG, JPEG et PNG sont acceptés.")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("La taille du fichier ne doit pas dépasser 5 Mo.")
        return
      }
      setForm(prev => ({ ...prev, pieceJointe: file }))
      setError(null)
      toast.success("Nouveau fichier sélectionné")
    }
  }

  const handleDeletePieceJointe = async () => {
    if (!entreprise?.id || !id) return
    if (!confirm('Voulez-vous vraiment supprimer la pièce jointe ?')) return
    try {
      await deleteAchatFournisseurPieceJointe(entreprise.id, id)
      setForm(prev => ({ ...prev, existingPieceJointe: undefined }))
      toast.success('Pièce jointe supprimée avec succès')
    } catch (err) {
      setError('Erreur lors de la suppression de la pièce jointe')
      toast.error('Erreur lors de la suppression de la pièce jointe')
    }
  }

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Permettre seulement les chiffres, le point et la virgule
    let formattedValue = value
    
    // Remplacer les virgules par des points pour le traitement
    if (formattedValue.includes(',')) {
      formattedValue = formattedValue.replace(',', '.')
    }
    
    // Valider que c'est un nombre décimal valide
    if (formattedValue && !/^-?\d*\.?\d*$/.test(formattedValue)) {
      return
    }
    
    setProductForm(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  const parseProductValue = (value: string): number => {
    if (value === "" || value === "." || value === ",") return 0
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  const calculateProductTotals = (product: {
    quantity: string;
    puht: string;
    tva: string;
    remiseArticle: string;
  }) => {
    const quantity = parseProductValue(product.quantity)
    const puht = parseProductValue(product.puht)
    const tva = parseProductValue(product.tva)
    const remiseArticle = parseProductValue(product.remiseArticle)
    
    const ht = quantity * puht
    const remiseAmount = ht * (remiseArticle / 100)
    const htAfterRemise = ht - remiseAmount
    const tvaAmount = htAfterRemise * (tva / 100)
    const ttc = htAfterRemise + tvaAmount
    
    return {
      quantity,
      puht,
      tva,
      remiseArticle,
      prixTotalHT: htAfterRemise,
      prixTotalTTC: ttc,
      prixUnitaireTTC: quantity > 0 ? ttc / quantity : 0
    }
  }

  const addOrUpdateProduct = () => {
    if (!productForm.codeBar || !productForm.designation || !productForm.quantity) {
      setError("Veuillez remplir tous les champs obligatoires du produit")
      return
    }

    const totals = calculateProductTotals(productForm)
    const newProduct: ProductItem = {
      codeBar: productForm.codeBar,
      designation: productForm.designation,
      ...totals
    }

    if (editingProductIndex !== null) {
      // Modification d'un produit existant
      setProducts(prev => {
        const updated = [...prev]
        // Garder l'id si on modifie un produit existant
        const existingId = updated[editingProductIndex]?.id
        updated[editingProductIndex] = {
          ...newProduct,
          id: existingId // Préserver l'id existant
        }
        return updated
      })
      setEditingProductIndex(null)
      toast.success("Produit modifié avec succès")
    } else {
      // Ajout d'un nouveau produit
      setProducts(prev => [...prev, newProduct])
      toast.success("Produit ajouté avec succès")
    }

    // Réinitialiser le formulaire
    setProductForm({
      codeBar: "",
      designation: "",
      quantity: "",
      puht: "",
      tva: "",
      remiseArticle: "",
    })

    // Scroll vers le formulaire
    productFormRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const editProduct = (index: number) => {
    const product = products[index]
    setProductForm({
      codeBar: product.codeBar,
      designation: product.designation,
      quantity: product.quantity.toString(),
      puht: product.puht.toString(),
      tva: product.tva.toString(),
      remiseArticle: (product.remiseArticle || 0).toString(),
    })
    setEditingProductIndex(index)
    setActiveTab('products')
  }

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index))
    toast.success("Produit supprimé avec succès")
  }

  const calculateInvoiceTotals = () => {
    const totalHT = products.reduce((sum, p) => sum + p.prixTotalHT, 0)
    const totalTVA = products.reduce((sum, p) => sum + (p.prixTotalHT * p.tva / 100), 0)
    const totalBeforeGlobalDiscount = totalHT + totalTVA
    const globalDiscountAmount = totalBeforeGlobalDiscount * (form.remiseGlobale / 100)
    const totalTTC = totalBeforeGlobalDiscount - globalDiscountAmount

    setForm(prev => ({
      ...prev,
      montantHT: totalHT,
      montantTVA: totalTVA,
      montantTotal: totalTTC,
      montantRestant: totalTTC - (prev.acompte || 0)
    }))
  }

  useEffect(() => {
    calculateInvoiceTotals()
  }, [products, form.remiseGlobale, form.acompte])

  useEffect(() => {
    if (productForm.codeBar && entreprise?.id) {
      const fetchProduct = async () => {
        try {
          const response = await getProductByBarcode(entreprise.id, productForm.codeBar)
          if (response) {
            setProductForm(prev => ({
              ...prev,
              designation: response.designation || "",
              puht: response.prixVenteHT ? response.prixVenteHT.toString() : "",
            }))
            setError(null)
          }
        } catch (err: any) {
          // Ne pas afficher d'erreur pour la recherche de code barre
        }
      }
      
      const timeoutId = setTimeout(fetchProduct, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [productForm.codeBar, entreprise])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!entreprise?.id || !id) {
      setError("Utilisateur non authentifié.")
      toast.error("Utilisateur non authentifié.")
      return
    }

    if (products.length === 0) {
      setError("Veuillez ajouter au moins un produit à la facture.")
      toast.error("Veuillez ajouter au moins un produit à la facture.")
      return
    }

    if (!form.numeroFacture || !form.fournisseur || !form.dateEcheance) {
      setError("Veuillez remplir tous les champs obligatoires de la facture.")
      toast.error("Veuillez remplir tous les champs obligatoires de la facture.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      // 1. Construire le tableau d'entrées pour la mise à jour
      const entrees = products.map(product => {
        const baseDto: CreateEntreeDto & { id?: string } = {
          codeBarre: product.codeBar,
          designation: product.designation,
          quantite: product.quantity,
          puht: product.puht,
          tva: product.tva,
        }
        
        // Si le produit a un id (existant), l'inclure pour la mise à jour
        if (product.id) {
          return {
            ...baseDto,
            id: product.id
          }
        }
        
        // Nouveau produit sans id
        return baseDto
      })

      // 2. Construire le DTO pour la mise à jour
      const dto: UpdateAchatFournisseurDto = {
        numeroFacture: form.numeroFacture,
        fournisseur: form.fournisseur,
        dateEcheance: form.dateEcheance,
        datePaiement: form.datePaiement || undefined,
        montantComptant: form.acompte > 0 ? form.acompte : undefined,
        remise: form.remiseGlobale > 0 ? form.remiseGlobale : undefined,
        // Ne pas envoyer montantRestant - le backend le calcule
        entrees: entrees
      }

      console.log("Envoi du DTO de mise à jour:", JSON.stringify(dto, null, 2))

      // 3. UN SEUL appel API pour la mise à jour
      const response = await updateAchatFournisseur(entreprise.id, id, dto, form.pieceJointe)
      
      console.log("Réponse du backend:", response)

      // 4. Mettre à jour les données locales avec la réponse
      const updatedProducts: ProductItem[] = response.achatFournisseur.entrees.map(entree => ({
        id: entree.id,
        codeBar: entree.codeBarre,
        designation: entree.designation,
        quantity: entree.quantite,
        puht: entree.puht,
        tva: entree.tva,
        prixUnitaireTTC: entree.prixUnitaireTTC,
        prixTotalTTC: entree.prixTotalTTC,
        prixTotalHT: entree.puht * entree.quantite
      }))

      const montantHT = updatedProducts.reduce((sum, p) => sum + p.prixTotalHT, 0)
      const montantTVA = updatedProducts.reduce((sum, p) => sum + (p.prixTotalHT * p.tva / 100), 0)

      setForm(prev => ({
        ...prev,
        montantTotal: response.achatFournisseur.montantTotal || 0,
        montantRestant: response.achatFournisseur.montantRestant || 0,
        montantHT,
        montantTVA,
        existingPieceJointe: response.achatFournisseur.pieceJointe || undefined
      }))

      setProducts(updatedProducts)
      setOriginalProducts(updatedProducts)
      
      toast.success(`Facture ${form.numeroFacture} mise à jour avec succès - ${products.length} article(s)`)
      
      // Optionnel : rediriger vers la liste des factures
      // router('/dashboard_user/purchasesProvider/payments')
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Erreur lors de la mise à jour"
      console.error("Erreur détaillée:", err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const getResponsiveClasses = () => {
    if (isMobile || isSurfaceDuo || sunMy) return {
      container: "p-2",
      text: "text-xs",
      heading: "text-sm",
      input: "text-xs py-2 px-3",
      button: "text-xs px-3 py-2",
      grid: "grid-cols-1"
    }
    if (isTablet || isIPadMini) return {
      container: "p-4",
      text: "text-sm",
      heading: "text-base",
      input: "text-sm py-2 px-4",
      button: "text-sm px-4 py-2.5",
      grid: "grid-cols-2"
    }
    return {
      container: "p-6",
      text: "text-base",
      heading: "text-lg",
      input: "text-base py-3 px-4",
      button: "text-base px-6 py-3",
      grid: "grid-cols-2"
    }
  }

  const responsive = getResponsiveClasses()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white/60">Chargement de la facture...</p>
        </div>
      </div>
    )
  }

  if (!entreprise) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white/60">Veuillez vous connecter...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 ${responsive.container}`}>
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <button
                onClick={() => router('/dashboard_user/purchasesProvider/payments')}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux factures
              </button>
              <h1 className={`text-3xl font-bold text-white ${responsive.heading}`}>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  <Edit2 className="inline-block mr-3 w-8 h-8" />
                  Modifier Facture #{form.numeroFacture}
                </span>
              </h1>
              <p className="text-white/60 mt-2">Modifiez les informations de la facture fournisseur</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router('/dashboard_user/purchasesProvider/payments')}
                className={`flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl px-4 py-2.5 transition-all duration-200 border border-gray-700 ${responsive.button}`}
              >
                Annuler
              </button>
              
              <button
                className={`flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-4 py-2.5 transition-all duration-200 shadow-lg shadow-purple-500/25 ${responsive.button}`}
                onClick={() => document.getElementById('print-invoice')?.click()}
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
            </div>
          </div>

          {/* Navigation par onglets */}
          <div className="flex border-b border-gray-800 mb-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium ${activeTab === 'details' 
                ? 'text-purple-400 border-b-2 border-purple-400' 
                : 'text-white/60 hover:text-white'
              } transition-colors duration-200 ${responsive.text}`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Détails Facture
              </div>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-medium ${activeTab === 'products' 
                ? 'text-purple-400 border-b-2 border-purple-400' 
                : 'text-white/60 hover:text-white'
              } transition-colors duration-200 ${responsive.text}`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Articles ({products.length})
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400">
              <X className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Détails de la facture */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'details' ? (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
                <h2 className={`text-xl font-bold text-white mb-6 flex items-center gap-2 ${responsive.heading}`}>
                  <FileText className="w-5 h-5 text-purple-400" />
                  Informations de la Facture
                </h2>

                <div className={`grid ${responsive.grid} gap-6`}>
                  {/* Informations de base */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Numéro de facture *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
                          #
                        </div>
                        <input
                          type="text"
                          name="numeroFacture"
                          value={form.numeroFacture}
                          onChange={handleChange}
                          required
                          className={`w-full pl-10 pr-3 ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                          placeholder="FAC-2024-001"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Fournisseur *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="fournisseur"
                          value={form.fournisseur}
                          onChange={(e) => {
                            handleChange(e)
                            searchFournisseursLocal(e.target.value)
                          }}
                          onFocus={() => {
                            if (providers.length > 0) setShowSuggestions(true)
                          }}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          className={`w-full pl-10 pr-3 ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                          placeholder="Rechercher un fournisseur"
                        />
                        {showSuggestions && providers.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {providers.map((provider) => (
                              <button
                                key={provider.id}
                                type="button"
                                onClick={() => {
                                  handleChange({ target: { name: "fournisseur", value: provider.denomination } } as any)
                                  setShowSuggestions(false)
                                }}
                                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700/50 transition-colors duration-150"
                              >
                                {provider.denomination}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Remise globale
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
                          <Percent className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="remiseGlobale"
                          value={form.remiseGlobale === 0 ? "" : form.remiseGlobale.toString()}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                          placeholder="0.000"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          %
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates et acompte */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/80 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date facture
                        </label>
                        <input
                          type="date"
                          name="dateFacture"
                          value={form.dateFacture}
                          onChange={handleChange}
                          className={`w-full ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">
                          Date d'échéance *
                        </label>
                        <input
                          type="date"
                          name="dateEcheance"
                          value={form.dateEcheance}
                          onChange={handleChange}
                          required
                          className={`w-full ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Acompte / Paiement partiel
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="acompte"
                          value={form.acompte === 0 ? "" : form.acompte.toString()}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                          placeholder="0.000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Pièce jointe
                      </label>
                      <div className="space-y-3">
                        {form.existingPieceJointe && (
                          <div className="flex items-center justify-between bg-gray-800/30 rounded-xl p-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300 text-sm">Document actuel</span>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={form.existingPieceJointe}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Voir
                              </a>
                              <button
                                onClick={handleDeletePieceJointe}
                                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="relative group">
                          <input
                            type="file"
                            name="pieceJointe"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl group-hover:border-purple-500/50 transition-colors duration-200">
                            <FileUp className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-400">
                              {form.pieceJointe ? form.pieceJointe.name : 'Cliquez pour modifier le fichier'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Onglet Articles
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
                <div ref={productFormRef} className="mb-8">
                  <h3 className={`text-lg font-bold text-white mb-6 flex items-center gap-2 ${responsive.heading}`}>
                    <PackagePlus className="w-5 h-5 text-green-400" />
                    {editingProductIndex !== null ? 'Modifier l\'article' : 'Ajouter un article'}
                  </h3>
                  
                  <div className={`grid ${responsive.grid} gap-6`}>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80 flex items-center gap-2">
                        <Barcode className="w-4 h-4" />
                        Code à barre *
                      </label>
                      <input
                        type="text"
                        name="codeBar"
                        value={productForm.codeBar}
                        onChange={handleProductChange}
                        className={`w-full ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                        placeholder="Scannez ou entrez le code"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Désignation *
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={productForm.designation}
                        onChange={handleProductChange}
                        className={`w-full ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                        placeholder="Nom du produit"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Quantité *
                      </label>
                      <input
                        type="text"
                        name="quantity"
                        value={productForm.quantity}
                        onChange={handleProductChange}
                        className={`w-full ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                        placeholder="0.000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        PUHT *
                      </label>
                      <input
                        type="text"
                        name="puht"
                        value={productForm.puht}
                        onChange={handleProductChange}
                        className={`w-full ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                        placeholder="0.000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        TVA *
                      </label>
                      <input
                        type="text"
                        name="tva"
                        value={productForm.tva}
                        onChange={handleProductChange}
                        className={`w-full ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                        placeholder="0.000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Remise sur l'article
                      </label>
                      <input
                        type="text"
                        name="remiseArticle"
                        value={productForm.remiseArticle}
                        onChange={handleProductChange}
                        className={`w-full ${responsive.input} bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                        placeholder="0.000"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={addOrUpdateProduct}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl px-6 py-3 transition-all duration-200 shadow-lg shadow-green-500/25"
                    >
                      {editingProductIndex !== null ? (
                        <>
                          <Check className="w-5 h-5" />
                          Modifier l'article
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Ajouter l'article
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Liste des articles */}
                {products.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-bold text-white mb-4 flex items-center gap-2 ${responsive.heading}`}>
                      <ShoppingCart className="w-5 h-5" />
                      Articles ({products.length})
                    </h3>
                    
                    <div className="overflow-x-auto rounded-xl border border-gray-800">
                      <table className="w-full min-w-full">
                        <thead className="bg-gray-800/50">
                          <tr>
                            <th className="py-3 px-4 text-left text-sm font-medium text-white/80">Code</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-white/80">Désignation</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-white/80">Qté</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-white/80">PUHT</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-white/80">TVA</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-white/80">Remise</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-white/80">Total HT</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-white/80">Total TTC</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-white/80">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {products.map((product, index) => (
                            <tr key={product.id || index} className="hover:bg-gray-800/30 transition-colors duration-150">
                              <td className="py-3 px-4 text-white/90 text-sm">{product.codeBar}</td>
                              <td className="py-3 px-4 text-white/90 text-sm">{product.designation}</td>
                              <td className="py-3 px-4 text-white/90 text-sm">{product.quantity.toFixed(3)}</td>
                              <td className="py-3 px-4 text-white/90 text-sm">{product.puht.toFixed(3)}</td>
                              <td className="py-3 px-4 text-white/90 text-sm">{product.tva.toFixed(3)}%</td>
                              <td className="py-3 px-4 text-white/90 text-sm">{product.remiseArticle ? product.remiseArticle.toFixed(3) + '%' : '-'}</td>
                              <td className="py-3 px-4 text-white/90 text-sm">{product.prixTotalHT.toFixed(3)}</td>
                              <td className="py-3 px-4 text-white/90 font-medium text-sm">{product.prixTotalTTC.toFixed(3)}</td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => editProduct(index)}
                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors duration-150"
                                    title="Modifier"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => removeProduct(index)}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors duration-150"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colonne de droite - Récapitulatif */}
          <div className="space-y-6">
            {/* Récapitulatif de la facture */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h3 className={`text-lg font-bold text-white mb-6 flex items-center gap-2 ${responsive.heading}`}>
                <Receipt className="w-5 h-5 text-purple-400" />
                Récapitulatif
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-white/60">Total HT</span>
                  <span className="text-white font-medium">{form.montantHT.toFixed(3)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-white/60">Total TVA</span>
                  <span className="text-blue-400 font-medium">{form.montantTVA.toFixed(3)}</span>
                </div>

                {form.remiseGlobale > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <span className="text-white/60">Remise globale</span>
                    <span className="text-red-400 font-medium">-{form.remiseGlobale.toFixed(3)}%</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-white/60">Total TTC</span>
                  <span className="text-white font-bold text-lg">{form.montantTotal.toFixed(3)}</span>
                </div>

                {form.acompte > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <span className="text-white/60">Acompte payé</span>
                    <span className="text-green-400 font-medium">-{form.acompte.toFixed(3)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3">
                  <span className="text-white font-medium">Montant restant</span>
                  <span className={`text-xl font-bold ${form.montantRestant > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                    {form.montantRestant.toFixed(3)}
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {form.dateEcheance && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Échéance</span>
                    <span className="text-white font-medium">
                      {new Date(form.dateEcheance).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Statut</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    form.montantRestant === 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : form.acompte > 0
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {form.montantRestant === 0 ? 'Payée' : form.acompte > 0 ? 'Partiellement payée' : 'En attente'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={saving || products.length === 0}
                className={`w-full mt-8 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl py-3 px-6 transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed ${responsive.button}`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Sauvegarder les modifications
                  </>
                )}
              </button>

              {/* Boutons cachés pour impression et téléchargement */}
              <div className="hidden">
                <button id="print-invoice">
                  <Printer className="w-5 h-5" />
                </button>
                <button id="download-invoice">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Aperçu rapide */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h4 className={`font-medium text-white mb-4 flex items-center gap-2 ${responsive.heading}`}>
                <FileText className="w-4 h-4" />
                Aperçu rapide
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-white/60">Numéro:</span>
                  <span className="text-white font-medium">{form.numeroFacture || '-'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-white/60">Fournisseur:</span>
                  <span className="text-white font-medium truncate">{form.fournisseur || '-'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-white/60">Articles:</span>
                  <span className="text-white font-medium">{products.length}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-white/60">État:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    form.montantRestant === 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : form.acompte > 0
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {form.montantRestant === 0 ? 'Payée' : form.acompte > 0 ? 'Partiellement payée' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditInvoiceForm