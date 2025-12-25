'use client';

import React, { useEffect, useState } from 'react';

import { useDeviceType } from '../../hooks/useDeviceType';
import { ShoppingCart, Check } from 'lucide-react';
import { ProductForPos } from '../../api/produit';
import { getImage } from '@renderer/api/image';
import { useBarcodeScanner } from '@renderer/hooks/BarcodeScanner';
import { useAuth } from '../auth/auth-context';
interface ProductProps {
  product: ProductForPos;
  onClick?: (product: ProductForPos) => void;
  className?: string;
  showPrice?: boolean;
  showCategory?: boolean;
}

const ProductCart: React.FC<ProductProps> = ({ product, onClick, className = '', showPrice = true, showCategory = true }) => {
  const priceWithTva = product.puht * (1 + product.tva / 100) * (1 - product.remise / 100);
  const { isMobile } = useDeviceType();
  const [showAdded, setShowAdded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageUrl,setImageUrl] = useState<string|undefined>(undefined)
  const {entreprise} = useAuth()
  const {cartItems} = useBarcodeScanner(entreprise?.id??"")
useEffect(()=>{
  if(!entreprise?.id) return
  console.log("product clicked:",cartItems)
},[cartItems])
  const handleClick = () => {
    if (isMobile) {
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 2000);
    }
    // Call onClick after showing the box (or immediately if not mobile)
    if (!isMobile) {
      
      // console.log("product clicked",product.id,cartItems,entreprise?.id!)
      onClick?.(product);
    } else {
      setTimeout(() => onClick?.(product), 100);
    }
  };
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
    <div className="relative">
      {/* Modern Success Notification */}
      {isMobile && showAdded && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">Produit ajouté au panier</span>
            </div>
          </div>
        </div>
      )}

      {/* Modern Product Card */}
      <div
        onClick={
          (product.quantite > 0 ||
            product.designation.toLowerCase().includes('ooredoo') ||
            product.designation.toLowerCase().includes('telecom') ||
            product.designation.toLowerCase().includes('orange'))
            ? handleClick
            : undefined
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group relative bg-gradient-to-br from-purple-100/80 to-violet-200/70 backdrop-blur-sm rounded-2xl border border-purple-200/50 p-4 
          hover:border-purple-300/70 hover:shadow-lg hover:shadow-purple-200/30
          transition-all duration-300 
          flex flex-col items-center overflow-hidden
          ${isHovered ? 'transform -translate-y-1' : ''}
          ${className}
          ${(product.quantite > 0 ||
            product.designation.toLowerCase().includes('ooredoo') ||
            product.designation.toLowerCase().includes('telecom') ||
            product.designation.toLowerCase().includes('orange'))
            ? 'cursor-pointer'
            : 'pointer-events-none opacity-50 cursor-not-allowed'}
          ${product.active === false || product.featuredOnPos===false ?
            "hidden":""
          }
        `}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 to-violet-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Image Container */}
        <div className="relative w-20 h-20 bg-gradient-to-br from-white/90 to-purple-50/80 rounded-xl mb-3 flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow duration-300">
          <img
            src={imageUrl}
            alt={product.designation}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (img.src.endsWith('/placeholder-product.png')) return;
              img.src = '/placeholder-product.png';
            }}
          />

          {/* Hover overlay with cart icon */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <ShoppingCart className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="relative z-10 text-center w-full">
          <h3 className="font-semibold text-sm text-gray-800 truncate w-full mb-2 group-hover:text-purple-900 transition-colors duration-300">
            {product.designation}
          </h3>

          {/* Category Badge */}
          {showCategory && product.categorie?.nom && (
            <div className="inline-block px-2 py-1 bg-white/60 text-purple-700 text-xs rounded-full mb-2 group-hover:bg-white/80 group-hover:text-purple-800 transition-colors duration-300">
              {product.categorie.nom}
            </div>
          )}

          {/* Price and Lot Pricing */}
          {showPrice && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center gap-1">
                <p className="text-purple-700 text-base font-bold group-hover:text-purple-800 transition-colors duration-300">
                  {priceWithTva.toFixed(2)}
                </p>
                <span className="text-gray-600 text-xs font-medium">DT</span>
              </div>
              {product.ventesParLot && product.ventesParLot.length > 0 && (
                <div className="text-xs text-gray-600">
                  {product.ventesParLot.map((lot) => (
                    <p key={lot.id}>
                      {lot.qte} pour {(lot.prix * (1 + product.tva / 100) * (1 - product.remise / 100)).toFixed(2)} DT
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stock indicator */}
          <div className="mt-2 flex items-center justify-center gap-1">
            {!(product.designation.toLowerCase().includes('ooredoo') || product.designation.toLowerCase().includes('telecom') || product.designation.toLowerCase().includes('orange')) ? (
              <>
                <div className={`w-2 h-2 rounded-full ${product.quantite > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-600">{product.quantite > 0 ? 'En stock' : 'Rupture'}</span>
              </>
            ) : (
              product.quantite > 0 && (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-600">En stock</span>
                </>
              )
            )}
          </div>
        </div>

        {/* Subtle border glow on hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-purple-300/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
};

export default ProductCart;
