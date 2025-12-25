"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/auth-context";
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify";
// import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { getProductById } from "@renderer/api/produit";
import { getImage } from "@renderer/api/image";

interface Category {
  id: string;
  nom: string;
}

interface VenteParLot {
  id: string;
  qte: number;
  prix: number;
}

interface Product {
  id: string;
  designation: string;
  categorie: Category;
  puht: number | string;
  codeBarre: string;
  tva: number;
  remise: number;
  dateDebutRemise?: string | null;
  dateFinRemise?: string | null;
  active: boolean;
  stockInitial: number;
  quantite: number;
  stockSecurite?: number;
  imagePath?: string;
  // Vente par lot (optional)
  ventesParLot?: VenteParLot[];
  showInPos?: boolean;
}

const ProductDetails: React.FC = () => {
  const { entreprise, user, loading: authLoading } = useAuth();
  const router = useNavigate();
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageUrl,setImageUrl] = useState<string|null>(null)

  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.isActive) {
      router('/banned');
      return;
    }

    if (user.role !== 'ADMIN' && !user.permissions.includes('Gestion des produits')) {
      router('/unauthorized');
      return;
    }

    if (entreprise?.id && productId) {
      const fetchProduct = async () => {
        try {
          const response = await getProductById(entreprise.id, productId);
          setProduct(response as unknown as Product);
          
        } catch (err: unknown) {
          const errorMessage = err || "Erreur lors de la récupération du produit.";
          setError(String(errorMessage));
          toast.error(String(errorMessage));
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [authLoading, user, entreprise, productId, router]);

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
    
  },[imageUrl,product])

  if (authLoading || loading) {
    return (
      <div className="text-white text-center py-8">
        <div className="inline-flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-blue-500"></div>
          <span>Chargement des détails du produit...</span>
        </div>
      </div>
    );
  }

  if (!user || !user.isActive || (user.role !== 'ADMIN' && !user.permissions.includes('Gestion des produits'))) {
    return null; // Redirect handled in useEffect
  }

  if (!entreprise) {
    return <div className="text-white text-center py-8">Veuillez vous connecter.</div>;
  }

  if (error || !product) {
    return (
      <div className="space-y-4 px-4 sm:px-6">
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm">{error || "Produit non trouvé."}</div>
        <button
          onClick={() => router("/dashboard_user/products/list")}
          className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-sm"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const puhtNumber = typeof product.puht === "string" ? Number.parseFloat(product.puht) : Number(product.puht);
  const price = puhtNumber * (1 + product.tva / 100) * (1 - (product.remise ?? 0) / 100);

  const getStockStatus = () => {
    if (product.quantite <= 0) return { status: "Rupture", color: "text-red-300", bg: "bg-red-500/20" };
    if (product.stockSecurite && product.quantite <= product.stockSecurite) return { status: "Stock faible", color: "text-yellow-300", bg: "bg-yellow-500/20" };
    return { status: "En stock", color: "text-green-300", bg: "bg-green-500/20" };
  };

  const stockStatus = getStockStatus();

  // Format dates for display
  const formatDate = (date?: string | null) => {
    if (!date) return '-';
    const parsedDate = new Date(date);
    return parsedDate.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasLots = Array.isArray(product.ventesParLot) && product.ventesParLot.length > 0;

  return (
    <div className="space-y-4 px-4 sm:px-6">
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={() => router("/dashboard_user/products/list")}
          className="text-white hover:text-blue-400 text-2xl focus:outline-none"
          aria-label="Retour à la liste"
        >
          ←
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-white">Détails du Produit</h1>
      </div>

      <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={product.designation}
                className="w-full h-48 object-contain rounded-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-48 bg-black/20 rounded-lg flex items-center justify-center">
                <span className="text-white/60 text-sm">Aucune image</span>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">{product.designation}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-white/60">Code-barre</span>
                  <p className="text-sm text-white">{product.codeBarre}</p>
                </div>
                <div>
                  <span className="text-xs text-white/60">Catégorie</span>
                  <p className="text-sm text-white">{product.categorie.nom}</p>
                </div>
                <div>
                  <span className="text-xs text-white/60">État</span>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm text-white">{product.active ? "Actif" : "Inactif"}</p>
                    <span className={product.showInPos ? "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/15 text-green-300 border border-green-400/20" : "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/15 text-red-300 border border-red-400/20"}>
                      {product.showInPos ? "Sur POS" : "Hors POS"}
                    </span>
                  </div>
                </div>
                {hasLots && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-white/60">Vente par lot</span>
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.ventesParLot?.map((lot) => (
                        <div key={lot.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-400/20">Lot</span>
                            <span className="text-xs text-white/60">Quantité</span>
                            <span className="text-sm text-white/90 font-medium">{lot.qte}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60">Prix</span>
                            <span className="text-sm text-blue-300 font-semibold">{Number(lot.prix).toFixed(3)} TND</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-white/60">Prix HT</span>
                <p className="text-sm text-white">{puhtNumber.toFixed(3)} TND</p>
              </div>
              <div>
                <span className="text-xs text-white/60">TVA</span>
                <p className="text-sm text-white">{product.tva}%</p>
              </div>
              <div>
                <span className="text-xs text-white/60">Remise</span>
                <p className="text-sm text-white">{product.remise !== undefined ? `${product.remise}%` : '-'}</p>
              </div>
              <div>
                <span className="text-xs text-white/60">Début de Remise</span>
                <p className="text-sm text-white">{formatDate(product.dateDebutRemise)}</p>
              </div>
              <div>
                <span className="text-xs text-white/60">Fin de Remise</span>
                <p className="text-sm text-white">{formatDate(product.dateFinRemise)}</p>
              </div>
              <div className="col-span-2 bg-blue-500/20 rounded-lg p-2">
                <span className="text-xs text-blue-300">Prix TTC</span>
                <p className="text-sm text-blue-400 font-semibold">{price.toFixed(2)} TND</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`${stockStatus.bg} rounded-lg p-2`}>
                <span className="text-xs text-white/60">État du Stock</span>
                <p className={`text-sm ${stockStatus.color}`}>{stockStatus.status}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-white/60">Stock Initial</span>
                  <p className="text-sm text-white">{product.stockInitial}</p>
                </div>
                <div>
                  <span className="text-xs text-white/60">Quantité Actuelle</span>
                  <p className="text-sm text-white">{product.quantite}</p>
                </div>
                <div>
                  <span className="text-xs text-white/60">Stock Sécurité</span>
                  <p className="text-sm text-white">{product.stockSecurite}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => router(`/dashboard_user/products/edit?id=${product.id}`)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25 text-sm"
          >
            Modifier le Produit
          </button>
          <button
            onClick={() => router("/dashboard_user/products/list")}
            className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-sm"
          >
            Retour à la Liste
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;