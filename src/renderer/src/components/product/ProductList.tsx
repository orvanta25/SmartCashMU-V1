"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllForList, getActive, getInactive } from "@renderer/api/produit"
import { ProductForList, PaginatedResponse } from "@renderer/api/produit"
import { useAuth } from "../auth/auth-context"
import { toast } from "react-toastify"
import { ProductCard } from "./ProductCard"
import { useNavigate,Link } from "react-router-dom"

export const ProductList = () => {
  const { entreprise, user, loading: authLoading } = useAuth()
  const router = useNavigate()
  const [products, setProducts] = useState<ProductForList[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchProducts = useCallback(async (search: string = "") => {
    if (!entreprise?.id) return
    setLoading(true)
    setError(null)
    try {
      var response: PaginatedResponse<ProductForList>
      if (filterStatus === "active") {
        response = await getActive(entreprise.id, page, 8, search)
      } else if (filterStatus === "inactive") {
        response = await getInactive(entreprise.id, page, 8, search)
      } else {
        response = await getAllForList(entreprise.id, page, 8, search)
        console.log("response in the product list: ",await getAllForList(entreprise.id, page, 8, search))
      }
      setProducts(response.data)
      setTotalPages(response.totalPages)
    } catch (err: any) {
      const errorMessage = err|| "Erreur lors de la récupération des produits."
      setError(String(errorMessage))
      toast.error(String(errorMessage))
    } finally {
      setLoading(false)
    }
  }, [entreprise?.id, page, filterStatus])

  useEffect(() => {
    if (authLoading) return

    if (!user || !user.isActive) {
      router("/banned")
      return
    }

    if (user.role !== "ADMIN" && !user.permissions.includes("Gestion des produits")) {
      router("/unauthorized")
      return
    }

    fetchProducts()
  }, [authLoading, user, router, page, filterStatus])

  const handleSearch = () => {
    setPage(1)
    fetchProducts(searchQuery)
  }

  const handleProductClick = (id: string) => {
    router(`/dashboard_user/products/details/${id}`)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const buttonClass = "px-3 py-1.5 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-xs bg-blue-600"
  const selectClass = "w-32 px-2 py-2 bg-white/5 border border-white/10 rounded-md text-white/90 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-xs appearance-none pr-8"

  if (authLoading || loading) {
    return <div className="flex justify-center items-center min-h-screen text-white text-xs">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-orvanta py-4 px-4">
      <div className="max-w-5xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-white">Liste des Produits</h1>
            <p className="text-white/60 text-xs">Gérez vos produits</p>
          </div>
          <Link to="/dashboard_user/products/new" className={buttonClass}>
            Ajouter Produit
          </Link>
        </div>

        {error && <div className="bg-red-500/20 text-red-300 p-2 rounded-md text-xs">{error}</div>}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-8 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-150"
            />
            <svg
              className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all duration-200"
          >
            Rechercher
          </button>
          <div className="relative w-full sm:w-32">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as "all" | "active" | "inactive")
                setPage(1)
              }}
              className={selectClass}
            >
              <option value="all" className="bg-gray-900 text-xs">Tous</option>
              <option value="active" className="bg-gray-900 text-xs">Actifs</option>
              <option value="inactive" className="bg-gray-900 text-xs">Inactifs</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/50 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-4 text-white/60 text-xs">
            {searchQuery || filterStatus !== "all" ? "Aucun produit trouvé." : "Aucun produit disponible."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={handleProductClick}
                  onActionSuccess={() => fetchProducts(searchQuery)}
                />
              ))}
            </div>
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-xs font-medium transition-colors disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-white/90 text-xs">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-xs font-medium transition-colors disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}