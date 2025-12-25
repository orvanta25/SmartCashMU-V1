"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { activateProduct, deactivateProduct, deleteProduct } from "@renderer/api/produit"
import { ProductForList } from "@renderer/api/produit"
import { useAuth } from "../auth/auth-context"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { getImage } from "@renderer/api/image"

interface ProductCardProps {
  product: ProductForList
  onProductClick: (id: string) => void
  onActionSuccess?: () => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, onActionSuccess }) => {
  const { entreprise } = useAuth()
  const router = useNavigate()
  const [imageError, setImageError] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const puhtNumber = typeof product.puht === "string" ? Number.parseFloat(product.puht) : Number(product.puht)
  const price = puhtNumber * (1 + product.tva / 100) * (1 - (product.remise ?? 0) / 100)
  const [imageUrl,setImageUrl]= useState<string|null>()

  // Format dates for display
  const formatDate = (date?: string | null) => {
    if (!date) return '-'
    const parsedDate = new Date(date)
    return parsedDate.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleActivate = async () => {
    if (!entreprise?.id) return
    try {
      console.log(await activateProduct(entreprise.id, product.id))
      toast.success("Produit activé avec succès !")
      if (onActionSuccess) {
        onActionSuccess()
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'activation du produit."
      toast.error(errorMessage)
    }
  }

  const handleDeactivate = async () => {
    if (!entreprise?.id) return
    try {
      console.log(await deactivateProduct(entreprise.id, product.id))
      toast.success("Produit désactivé avec succès !")
      if (onActionSuccess) {
        onActionSuccess()
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la désactivation du produit."
      toast.error(errorMessage)
    }
  }

  const handleDelete = async () => {
    if (!entreprise?.id) return
    try {
      await deleteProduct(entreprise.id, product.id)
      toast.success("Produit supprimé avec succès !")
      if (onActionSuccess) {
        onActionSuccess()
      }
      setShowDeleteDialog(false)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression du produit."
      toast.error(errorMessage)
    }
  }
 const fetchImage = async ()=>{
      try {
      if(!product)return
  
        const response = await getImage(product.imagePath)
      if(!response)return
  
      setImageUrl(response)
      } catch (error) {
        console.error("error fetching image :",error)
      }
    }
  
    useEffect(()=>{
      fetchImage()
    },[product])
  return (
    <>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10 group">
        <div
          className="aspect-square bg-white/5 relative overflow-hidden cursor-pointer"
          onClick={() => onProductClick(product.id)}
        >
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.designation}
              className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              onError={() => {
                console.error(`Failed to load image for ${product.designation}: ${imageUrl}`)
                setImageError(true)
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <span className="text-white/60 text-sm font-medium">{product.quantite} unités</span>
            </div>
          )}

          <div
            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              product.active
                ? "bg-green-500 text-green-100 border border-green-500/30"
                : "bg-red-500 text-red-100 border border-red-500/30"
            }`}
          >
            {product.active ? "Actif" : "Inactif"}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-white/90 font-medium truncate" title={product.designation}>
              {product.designation}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-blue-400 font-bold">{price.toFixed(2)} DT</p>
            </div>
            {product.remise > 0 && (
              <div className="text-xs text-white/60 mt-1">
                <span>Remise: {product.remise}%</span>
                {product.dateDebutRemise && product.dateFinRemise && (
                  <span> ({formatDate(product.dateDebutRemise)} - {formatDate(product.dateFinRemise)})</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onProductClick(product.id)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Détails
            </button>
            <button
              onClick={() => router(`/dashboard_user/products/edit?id=${product.id}`)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Modifier
            </button>

            {product.active ? (
              <button
                onClick={handleDeactivate}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-medium transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 0 0118 0z"
                  />
                </svg>
                Désactiver
              </button>
            ) : (
              <button
                onClick={handleActivate}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-xs font-medium transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 0 0118 0z"
                  />
                </svg>
                Activer
              </button>
            )}

            {!product.hasOperations && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className=" hidden px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium transition-all duration-200 hover:scale-105"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteDialog(false)} />
          <div className="relative bg-gradient-to-br from-purple-900/95 to-violet-900/95 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Supprimer le produit</h3>
                <p className="text-white/70 leading-relaxed">
                  Voulez-vous vraiment supprimer le produit{" "}
                  <span className="font-medium text-white">"{product.designation}"</span> ? Cette action est
                  irréversible.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium transition-all duration-200 hover:scale-105"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}