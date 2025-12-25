'use client';

import { useEffect, useState } from 'react';

import ProductEditForm from '../../../../components/product/ProductEditForm';
import { useAuth } from '../../../../components/auth/auth-context';
import { useSearchParams } from 'react-router-dom';
import { getProductById, Product } from '@renderer/api/produit';

// interface Product {
//   id: string;
//   designation: string;
//   categorieId: string;
//   puht: number | string;
//   codeBarre: string;
//   tva: number;
//   active: boolean;
//   stockInitial: number;
//   quantite: number;
//   stockSecurite: number;
//   imagePath?: string;
//   remise: number;
// }

export default function ProductEditPage() {
  const { entreprise } = useAuth();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entreprise?.id && productId) {
      const fetchProduct = async () => {
        try {
          const response = await getProductById(entreprise.id,productId)
          setProduct(response);
        } catch (err: any) {
          const errorMessage = err.response?.data?.message   || 'Erreur lors de la récupération du produit.';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else if (!productId) {
      setError('Aucun ID de produit fourni.');
      setLoading(false);
    }
  }, [entreprise, productId]);

  if (!entreprise) {
    return <div className="text-white">Veuillez vous connecter.</div>;
  }

  if (loading) {
    return <div className="text-center py-8 text-white/60">Chargement...</div>;
  }

  if (error || !product) {
    return <div className="text-center py-8 text-red-400">{error || 'Produit non trouvé.'}</div>;
  }

  return (
    <div className="p-6">
      <ProductEditForm product={product} />
    </div>
  );
}