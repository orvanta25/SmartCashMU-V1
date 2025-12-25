'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../auth/auth-context';
import { toast } from 'react-toastify';
import { getAllForPos, getProductsByCategory, ProductForPos, ProductType } from '../../api/produit';
import ProductCart from './ProductCart';
import { Check, Search, X } from 'lucide-react';
import { debounce } from 'lodash';
import CartFooter from '../pos/CartPanel/CartFooter'; // Import du CartFooter

interface ProductsGridProps {
  onProductClick?: (product: ProductForPos, selectedLotId?: string) => void;
  className?: string;
  selectedCategoryId?: string | null;
  showPrice?: boolean;
  showCategory?: boolean;
  refreshKey?: number;
  // Props pour CartFooter
  cartItems: any[];
  clearCart: () => void;
  companyName: string;
  city: string;
  telephone: string;
  setCartItems: (items: any[]) => void;
  selectedTable: { id: string; number: string } | null;
  setSelectedTable: (table: { id: string; number: string } | null) => void;
  activeCommandId: string | null;
  setActiveCommandId: (id: string | null) => void;
  onCommandeConfirm: () => void;
}

export default function ProductGrid({
  onProductClick,
  className = '',
  selectedCategoryId = null,
  showPrice = true,
  showCategory = true,
  refreshKey,
  // Props pour CartFooter
  cartItems,
  clearCart,
  companyName,
  city,
  telephone,
  setCartItems,
  selectedTable,
  setSelectedTable,
  activeCommandId,
  setActiveCommandId,
  onCommandeConfirm,
}: ProductsGridProps) {
  const { entreprise } = useAuth();
  const [products, setProducts] = useState<ProductForPos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(18);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isForMagasin,setIsForMagasin] = useState(true)

  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced function to update searchTerm
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setPage(1); // Reset to first page on search
    }, 300),
    []
  );

  useEffect(() => {
    const fetchProducts = async () => {
      if (!entreprise?.id) {
        setError('Veuillez vous connecter.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let response;
        if (selectedCategoryId) {
          response = await getProductsByCategory(entreprise.id, selectedCategoryId, page, limit, searchTerm);
        } else {
          response = await getAllForPos(entreprise.id, page, limit, searchTerm);
        }

        if(isForMagasin){
          setProducts(response.data);
        } else{
          const products : ProductForPos[] = response.data
          setProducts(products && products.filter(product=>(product.type === ProductType.POS)))
        }

        setTotalPages(response.totalPages);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des produits.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [entreprise?.id, selectedCategoryId, page, searchTerm, refreshKey, limit,isForMagasin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchTerm(value);
  };

  const handleClearSearch = () => {
    setInputValue('');
    setSearchTerm('');
    setPage(1);
    if (inputRef.current) {
      inputRef.current.focus(); // Retain focus after clearing
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      if (inputRef.current) {
        inputRef.current.focus(); // Retain focus after pagination
      }
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      if (inputRef.current) {
        inputRef.current.focus(); // Retain focus after pagination
      }
    }
  };

  if (!entreprise) {
    return <div className="p-4 text-center text-white">Veuillez vous connecter.</div>;
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Zone de recherche */}
      <div className="mb-4 p-2 flex gap-4 flex-col">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/80" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-10 py-2 rounded-lg bg-blue-500/10 border border-blue-400/20 text-blue-100 placeholder-blue-200/70 outline-none focus:border-blue-300/40 focus:bg-blue-500/15 focus:ring-2 focus:ring-blue-400/20 transition"
          />
          {inputValue && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-blue-500/10 text-blue-300 hover:text-blue-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <label className="inline-flex items-center gap-3 cursor-pointer">
                
                <div className="relative">
                  <input type="checkbox" name="POS/MAGASIN" checked={isForMagasin} onChange={(e)=>{
                    setIsForMagasin(e.target.checked)}}
                    className="sr-only" />
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${isForMagasin ? 'bg-gradient-to-r from-[#00ffea] to-[#000] shadow-lg shadow-[#ff00aa]/30' : 'bg-[#0a0e17]/50 border border-[#00ffea]/30'}`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 ${
                        isForMagasin ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`}
                    >
                      {isForMagasin && (
                        <Check className="w-3 h-3 text-[#000] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-orbitron tracking-wider text-white">{isForMagasin ? "Produit Magasin" : "Produit POS"}</span>
                </div>
              </label>
      </div>

      {/* Zone des produits avec défilement */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {loading ? (
          <div className="text-center py-6 text-white/60">Chargement...</div>
        ) : error ? (
          <div className="text-center py-6 text-red-400">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-6 text-white/60">
            {searchTerm ? 'Aucun produit actif trouvé.' : 'Aucun produit actif disponible.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {products.map((product) => (
                <ProductCart
                  key={product.id}
                  product={product}
                  onClick={onProductClick}
                  className="h-full"
                  showPrice={showPrice}
                  showCategory={showCategory}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg text-white ${
                  page === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition`}
              >
                Précédent
              </button>
              <span className="text-white/80">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg text-white ${
                  page === totalPages ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition`}
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>

      {/* CartFooter fixe en bas */}
      <div className="border-t border-blue-400/20 bg-blue-500/5">
        <CartFooter
          cartItems={cartItems}
          entrepriseId={entreprise.id}
          clearCart={clearCart}
          companyName={companyName}
          city={city}
          telephone={telephone}
          setCartItems={setCartItems}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          activeCommandId={activeCommandId}
          setActiveCommandId={setActiveCommandId}
          onCommandeConfirm={onCommandeConfirm}
        />
      </div>
    </div>
  );
}