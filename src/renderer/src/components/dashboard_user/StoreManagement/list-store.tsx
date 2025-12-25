"use client"
import { useState, useEffect } from "react"
import { Briefcase, MapPin, Store, Plus, Search, Edit, XCircle, Package, Grid, List } from "lucide-react"
import {Link} from "react-router-dom"

const API_URL = ""
import { useAuth } from "../../auth/auth-context"
import { getProducts, Product } from "@renderer/api/produit"

interface Store {
  id: string
  nom: string
  nomResponsable: string
  secteur: string
  region: string
  ville: string
  pays: string
  adresse?: string
  isActive: boolean
}

// interface Product {
//   id: string
//   designation: string
//   categorieId: string
//   puht: number
//   codeBarre: string
//   tva: number
//   remise: number
//   dateDebutRemise?: string | null
//   dateFinRemise?: string | null
//   active: boolean
//   stockInitial: number
//   quantite: number
//   stockSecurite: number
//   imagePath?: string
// }

export default function ListStore() {
  const [stores, setStores] = useState<Store[]>([
    {
      id: "1",
      nom: "Magasin Central",
      nomResponsable: "Ahmed",
      secteur: "Commerce de détail",
      region: "Tunis",
      ville: "Tunis",
      pays: "Tunisie",
      isActive: true,
    },
    {
      id: "2",
      nom: "Magasin Nord",
      nomResponsable: "Fatima",
      secteur: "Électronique",
      region: "Bizerte",
      ville: "Bizerte",
      pays: "Tunisie",
      isActive: true,
    },
  ])

  const [search, setSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Product assignment state
  const [productModalStoreId, setProductModalStoreId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [errorProducts, setErrorProducts] = useState<string | null>(null)
  const [storeProducts, setStoreProducts] = useState<{ [storeId: string]: string[] }>({})

  const { entreprise } = useAuth()

  const fetchProducts = async ()=>{
    if (productModalStoreId && entreprise?.id) {
      setLoadingProducts(true)
      const fetchedProducts = await getProducts(entreprise.id)
      if(fetchedProducts)setProducts(fetchedProducts)
        else setErrorProducts("Impossible de recuperer les produits")
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [productModalStoreId, entreprise?.id])

  const filteredStores = stores.filter(
    (s) =>
      s.nom.toLowerCase().includes(search.toLowerCase()) ||
      s.nomResponsable.toLowerCase().includes(search.toLowerCase()) ||
      s.secteur.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredProducts = products.filter(
    (product) =>
      (productSearch.trim() === "" || product.designation.toLowerCase().includes(productSearch.toLowerCase())) &&
      !(
        product.designation.toLowerCase().includes("ooredoo") ||
        product.designation.toLowerCase().includes("orange") ||
        product.designation.toLowerCase().includes("telecom")
      ),
  )

  const handleDeactivate = (id: string) => {
    setStores((prev) => prev.map((store) => (store.id === id ? { ...store, isActive: !store.isActive } : store)))
  }

  const handleAssignProduct = (storeId: string, productId: string) => {
    setStoreProducts((prev) => ({
      ...prev,
      [storeId]: prev[storeId] ? [...prev[storeId], productId] : [productId],
    }))
  }

  // const handleUnassignProduct = (storeId: string, productId: string) => {
  //   setStoreProducts((prev) => ({
  //     ...prev,
  //     [storeId]: prev[storeId]?.filter((id) => id !== productId) || [],
  //   }))
  // }

  const currentStore = stores.find((s) => s.id === productModalStoreId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-700/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Gestion des Magasins</h1>
              <p className="text-purple-200/80 text-lg">Gérez vos magasins et leurs produits en toute simplicité</p>
            </div>
            <Link
              to="/dashboard_user/StoreManagement/store"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 font-semibold border border-blue-400/30 hover:scale-105 transform"
            >
              <Plus className="w-5 h-5" />
              Nouveau Magasin
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl border border-purple-700/30 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                placeholder="Rechercher par nom, responsable ou secteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-sm font-medium">Vue:</span>
              <div className="flex bg-white/10 rounded-lg p-1 border border-purple-400/30">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-purple-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-purple-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Store List */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl border border-purple-700/30 p-8">
          {filteredStores.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Store className="w-12 h-12 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun magasin trouvé</h3>
              <p className="text-purple-200/70">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className={`group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-purple-400/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/40 ${
                    viewMode === "list" ? "p-6" : "p-6"
                  }`}
                >
                  <div className={viewMode === "list" ? "flex items-center gap-6" : "space-y-4"}>
                    {/* Store Header */}
                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Store className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                              {store.nom}
                            </h3>
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                store.isActive
                                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                  : "bg-red-500/20 text-red-300 border border-red-500/30"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  store.isActive ? "bg-green-400" : "bg-red-400"
                                }`}
                              />
                              {store.isActive ? "Actif" : "Inactif"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Store Details */}
                      <div className={`space-y-3 ${viewMode === "list" ? "grid grid-cols-2 gap-4 space-y-0" : ""}`}>
                        <div className="flex items-center gap-3 text-purple-100/90">
                          <Store className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <span className="text-sm font-medium">{store.nomResponsable}</span>
                        </div>
                        <div className="flex items-center gap-3 text-purple-100/90">
                          <Briefcase className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <span className="text-sm">{store.secteur}</span>
                        </div>
                        <div className="flex items-center gap-3 text-purple-100/90">
                          <MapPin className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <span className="text-sm">
                            {store.region}, {store.ville}, {store.pays}
                          </span>
                        </div>
                        {store.adresse && (
                          <div className="flex items-center gap-3 text-purple-100/90">
                            <MapPin className="w-4 h-4 text-purple-300 flex-shrink-0" />
                            <span className="text-sm">{store.adresse}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex gap-2 ${viewMode === "list" ? "flex-col" : "flex-wrap"}`}>
                      <Link
                        to={`/dashboard_user/store/edit-store/${store.id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl backdrop-blur-sm border border-blue-400/30"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDeactivate(store.id)}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 ${
                          store.isActive
                            ? "bg-red-500/80 hover:bg-red-500 border-red-400/30"
                            : "bg-green-500/80 hover:bg-green-500 border-green-400/30"
                        } text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl backdrop-blur-sm border`}
                      >
                        <XCircle className="w-4 h-4" />
                        {store.isActive ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/80 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-purple-400/30"
                        onClick={() => setProductModalStoreId(store.id)}
                      >
                        <Package className="w-4 h-4" />
                        Produits
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Assignment Modal */}
        {productModalStoreId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-purple-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Gestion des Produits</h2>
                      <p className="text-purple-100">{currentStore?.nom}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProductModalStoreId(null)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                    aria-label="Fermer"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Products Grid */}
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <span className="ml-4 text-gray-600">Chargement des produits...</span>
                  </div>
                ) : errorProducts ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-600 font-medium">{errorProducts}</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                    <p className="text-gray-500">Aucun produit ne correspond à votre recherche</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                      const assigned = storeProducts[productModalStoreId]?.includes(product.id)
                      return (
                        <div
                          key={product.id}
                          className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-purple-300"
                        >
                          {/* Product Image */}
                          <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                            {product.imagePath ? (
                              <img
                                src={
                                  product.imagePath.startsWith("http")
                                    ? product.imagePath
                                    : `${API_URL}${product.imagePath}`
                                }
                                alt={product.designation}
                                className="w-full h-full object-contain rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                              {product.designation}
                            </h3>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-lg font-bold text-purple-600">{product.puht} TND</span>
                              <span className="text-sm text-gray-500">Stock: {product.quantite}</span>
                            </div>
                            <button
                              className={`w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                assigned
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                              }`}
                              onClick={() => !assigned && handleAssignProduct(productModalStoreId, product.id)}
                              disabled={assigned}
                            >
                              {assigned ? "Déjà assigné" : "Assigner au magasin"}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
