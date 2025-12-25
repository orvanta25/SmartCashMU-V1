"use client";
import { useState, useEffect } from "react";
import { getCategoriesForProduct } from '@renderer/api/categorie';
import { createProduct} from '@renderer/api/produit';
import { useAuth } from "../auth/auth-context";
import { toast } from "react-toastify";
import { Package, Upload, Check, Trash2, Image as ImageIcon, DollarSign, Percent, Barcode, Layers, Shield, Calendar, RefreshCw, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storeImage } from "@renderer/api/image";
import ProductVariantModal, { ProductFromVariant } from "./productVariant";
// ============================================
// TYPES TYPESCRIPT
// ============================================
interface Category {
  id: string;
  nom: string;
}
export interface BulkSaleItem {
  id: string;
  quantity: number;
  price: number;
}
export enum ProductType {
  POS = "POS",
  MAGASIN = "MAGASIN"
}
export interface ProductFormData {
  designation: string;
  categorieId: string;
  puht: number;
  codeBarre: string;
  tva: number;
  remise: number;
  type: ProductType;
  dateDebutRemise?: string | null;
  dateFinRemise?: string | null;
  active: boolean;
  stockInitial: number;
  stockSecurite?: number;
  image?: string;
  bulkSales: BulkSaleItem[];
  featuredOnPos: boolean;
  hasVariants?: boolean;
}
const initialFormState: ProductFormData = {
  designation: "",
  categorieId: "",
  puht: 0,
  codeBarre: "",
  tva: 0,
  remise: 0,
  type: ProductType.MAGASIN,
  dateDebutRemise: null,
  dateFinRemise: null,
  active: true,
  stockInitial: 0,
  stockSecurite: undefined,
  bulkSales: [],
  featuredOnPos: true,
  hasVariants: false,
};
// ============================================
// FONCTIONS UTILITAIRES
// ============================================
// Fonction pour générer un code-barre unique
const generateBarcode = (prefix: string = "PROD"): string => {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}${random}`;
};
// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function ProductForm() {
  const { entreprise, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProductMagasin, setIsProductMagasin] = useState(true);
  const [isProductWeighted, setIsProductWeighted] = useState(false);
  // États pour la gestion des variantes
  const [hasVariants, setHasVariants] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantProducts, setVariantProducts] = useState<ProductFromVariant[]>([]);
  const router = useNavigate();
  // Gérer la sauvegarde des variantes depuis le modal
  const handleVariantsSave = (productsFromVariants: ProductFromVariant[]) => {
    setVariantProducts(productsFromVariants);
    toast.success(`${productsFromVariants.length} variante(s) configurée(s)`);
  };
  // ============================================
  // EFFECTS - Chargement initial et vérifications
  // ============================================
  // Vérifications d'authentification et autorisation
  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.isActive) {
      router("/banned");
      return;
    }
    if (user.role !== "ADMIN" && !user.permissions.includes("Gestion des produits")) {
      router("/unauthorized");
      return;
    }
    if (entreprise?.id) {
      const fetchCategories = async () => {
        try {
          const data = await getCategoriesForProduct(entreprise.id);
          setCategories(data);
        } catch {
          setError('');
          toast.error("Impossible de charger les catégories.");
        }
      };
      fetchCategories();
    }
  }, [authLoading, user, entreprise, router]);
  // Générer un code-barre initial au montage
  useEffect(() => {
    const initialBarcode = generateBarcode(isProductMagasin ? "PROD" : "POS");
    setFormData(prev => ({
      ...prev,
      codeBarre: initialBarcode
    }));
  }, []);
  // Mettre à jour le type de produit et générer un code-barre
  useEffect(() => {
    const newType = isProductMagasin ? ProductType.MAGASIN : ProductType.POS;
    setFormData((prev) => ({
      ...prev,
      type: newType
    }));
   
    // Générer un nouveau code-barre approprié
    const newBarcode = generateBarcode(isProductMagasin ? "PROD" : "POS");
    setFormData(prev => ({
      ...prev,
      codeBarre: newBarcode
    }));
  }, [isProductMagasin]);
  // Assurer au moins une ligne de vente par lot par défaut
  useEffect(() => {
    if (formData.bulkSales.length === 0) {
      setFormData(prev => ({
        ...prev,
        bulkSales: [{ id: Date.now().toString(), quantity: 0, price: 0 }]
      }));
    }
  }, []);
  // ============================================
  // HANDLERS - Gestion des événements
  // ============================================
  // Soumettre le formulaire principal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entreprise?.id) {
      toast.error("Utilisateur non authentifié.");
      return;
    }
    if (hasVariants && variantProducts.length === 0) {
      toast.error("Configurez au moins une variante ou désactivez les variantes.");
      return;
    }
    setLoading(true);
    try {
      if (hasVariants && variantProducts.length > 0) {
        // Créer un produit séparé pour chaque variante
        const createdProducts = await Promise.all(
          variantProducts.map(variant => {
            const payload = {
              designation: variant.designation,
              categorieId: formData.categorieId,
              puht: variant.puht,
              codeBarre: variant.codeBarre, // Code-barre unique de la variante
              tva: formData.tva,
              remise: formData.remise,
              type: formData.type,
              dateDebutRemise: formData.dateDebutRemise,
              dateFinRemise: formData.dateFinRemise,
              active: formData.active,
              stockInitial: formData.stockInitial,
              stockSecurite: formData.stockSecurite,
              bulkSales: formData.bulkSales,
              image: variant.image, // Image spécifique de la variante (peut être undefined)
              featuredOnPos: formData.featuredOnPos,
              hasVariants: false
            };
            return createProduct(entreprise.id, payload);
          })
        );
        toast.success(`${createdProducts.length} produit(s) avec variantes créés avec succès !`);
        console.log("Produits créés :", createdProducts.map(p => ({ id: p.id, designation: p.designation, codeBarre: p.codeBarre })));
      } else {
        // Produit sans variantes
        const productPayload = {
          ...formData,
          hasVariants: false,
          type: isProductMagasin ? ProductType.MAGASIN : ProductType.POS
        };
        const productResponse = await createProduct(entreprise.id, productPayload);
        toast.success("Produit créé avec succès !");
        console.log("Produit créé avec ID :", productResponse.id);
      }
      // Réinitialiser le formulaire
      const newBarcode = generateBarcode(isProductMagasin ? "PROD" : "POS");
      setFormData({
        ...initialFormState,
        codeBarre: newBarcode,
        bulkSales: [{ id: Date.now().toString(), quantity: 0, price: 0 }],
        type: isProductMagasin ? ProductType.MAGASIN : ProductType.POS
      });
      setImagePreview(null);
      setHasVariants(false);
      setVariantProducts([]);
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      const errorMessage = err?.message || err?.response?.data?.message || "Erreur lors de l'ajout du produit.";
      setError(String(errorMessage));
      toast.error(String(errorMessage));
    } finally {
      setLoading(false);
    }
  };
  // Gérer les changements dans le formulaire
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let newValue: string | number | boolean | File | undefined | null = value;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      newValue = value === "" ? undefined : Number.parseFloat(value);
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
      newValue = value || null;
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };
  // Gestion des ventes par lots
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
  // Régénérer le code-barre
  const regenerateBarcode = () => {
    const newBarcode = generateBarcode(isProductMagasin ? "PROD" : "POS");
    setFormData(prev => ({ ...prev, codeBarre: newBarcode }));
    toast.info("Nouveau code-barre généré");
  };
  // ============================================
  // STYLES CSS
  // ============================================
  const inputClass = "w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300 text-sm";
  const selectClass = "w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300 text-sm appearance-none";
  const buttonClass = "px-4 py-2 text-white rounded-lg transition-all duration-300 text-sm font-orbitron tracking-wider";
  // ============================================
  // ÉTATS DE CHARGEMENT
  // ============================================
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e17] to-[#050811]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#00ffea]/30 border-t-[#00ffea] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#00ffea] font-orbitron tracking-wider">CHARGEMENT...</p>
      </div>
    </div>
  );
  if (!entreprise)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e17] to-[#050811]">
        <div className="text-center p-8 bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-[#ff416c]" />
          </div>
          <h2 className="text-xl font-orbitron tracking-wider text-white mb-2">CONNEXION REQUISE</h2>
          <p className="text-[#00ffea]/70">Veuillez vous connecter.</p>
        </div>
      </div>
    );
  // ============================================
  // RENDU PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#050811] p-4">
      <div className="max-w-6xl mx-auto space-y-4">
       
          {/* ========== HEADER ========== */}
<div className="relative overflow-hidden bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 p-5">
  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffea]/10 via-transparent to-[#0099ff]/10"></div>
  <div className="relative flex items-center gap-4">
    <div className="w-12 h-12 bg-gradient-to-br from-[#00ffea] to-[#0099ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#00ffea]/30">
      <Package className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1">
      <h1 className="text-xl font-bold font-orbitron tracking-wider text-white mb-1">NOUVEAU PRODUIT</h1>
      <p className="text-sm text-[#00ffea]/70">Créez un nouveau produit dans votre catalogue</p>
    </div>

    {/* ========== TOGGLES ========== */}
    <div className="flex gap-4">
      {/* Toggle Produit Magasin */}
      <label className="inline-flex items-center gap-3 cursor-pointer">
        <div>
          <span className="text-sm font-orbitron tracking-wider text-white">
            {isProductMagasin ? "Produit Magasin" : "Produit POS"}
          </span>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={isProductMagasin}
            onChange={(e) => setIsProductMagasin(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-12 h-6 rounded-full transition-all duration-300 ${isProductMagasin ? 'bg-gradient-to-r from-[#00ffea] to-[#0099ff] shadow-lg shadow-[#00ffea]/30' : 'bg-[#0a0e17]/50 border border-[#00ffea]/30'}`}>
            <div
              className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 ${
                isProductMagasin ? 'translate-x-6' : 'translate-x-0.5'
              } translate-y-0.5`}
            >
              {isProductMagasin && (
                <Check className="w-3 h-3 text-[#00ffea] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>
        </div>
      </label>

      {/* Toggle Produit Pesé */}
      <label className="inline-flex items-center gap-3 cursor-pointer">
        <div>
          <span className="text-sm font-orbitron tracking-wider text-white">
            {isProductWeighted ? "Produit Pesé" : "Produit Normal"}
          </span>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={isProductWeighted}
            onChange={(e) => setIsProductWeighted(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-12 h-6 rounded-full transition-all duration-300 ${isProductWeighted ? 'bg-gradient-to-r from-[#00ffea] to-[#0099ff] shadow-lg shadow-[#00ffea]/30' : 'bg-[#0a0e17]/50 border border-[#00ffea]/30'}`}>
            <div
              className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 ${
                isProductWeighted ? 'translate-x-6' : 'translate-x-0.5'
              } translate-y-0.5`}
            >
              {isProductWeighted && (
                <Check className="w-3 h-3 text-[#00ffea] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>
        </div>
      </label>
    </div>
  </div>
</div>

        {/* ========== MESSAGE D'ERREUR ========== */}
        {error && (
          <div className="bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#ff416c]" />
              </div>
              <div>
                <h4 className="text-[#ff416c] font-orbitron tracking-wider text-sm mb-1">ERREUR</h4>
                <p className="text-[#ff416c]/80 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* ========== APERÇU DES VARIANTES CONFIGURÉES ========== */}
        {hasVariants && variantProducts.length > 0 && (
          <div className="bg-gradient-to-br from-[#00ffea]/10 to-[#0099ff]/10 backdrop-blur-xl border border-[#00ffea]/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#00ffea]" />
                <h3 className="text-sm font-orbitron tracking-wider text-white">
                  {variantProducts.length} VARIANTE{variantProducts.length !== 1 ? 'S' : ''} CONFIGURÉE{variantProducts.length !== 1 ? 'S' : ''}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVariantModal(true)}
                className="px-3 py-1 bg-gradient-to-r from-[#00ffea]/20 to-[#0099ff]/20 hover:from-[#00ffea]/30 hover:to-[#0099ff]/30 border border-[#00ffea]/40 text-white text-xs rounded-lg transition-all duration-300"
              >
                MODIFIER
              </button>
            </div>
           
            {/* Liste des variantes */}
            <div className="space-y-2">
              {variantProducts.map((variant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/10"
                >
                  <div className="flex items-center gap-3">
                    {variant.image ? (
                      <div className="w-10 h-10 rounded overflow-hidden border border-[#00ffea]/20">
                        <img src={variant.image} alt={variant.variantName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded border border-[#00ffea]/20 bg-[#0a0e17]/30 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-[#00ffea]/30" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-white font-medium">{variant.designation}</div>
                      <div className="text-xs text-white/70">
                        SKU: {variant.sku} • {variant.codeBarre}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#00ffea]">{variant.puht.toFixed(3)} TND</div>
                    <div className="text-xs text-white/70">{variant.variantName}</div>
                  </div>
                </div>
              ))}
            </div>
           
            <div className="text-xs text-[#00ffea]/70 mt-3">
              ✓ Chaque variante a son propre code-barre scannable au POS
            </div>
          </div>
        )}
        {/* ========== FORMULAIRE PRINCIPAL ========== */}
        <div className="bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            
              {/* ========== TOGGLE VARIANTES ========== */}
              <div className="space-y-1.5 md:col-span-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-[#00ffea]/20 bg-gradient-to-br from-[#0a0e17]/50 to-[#050811]/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-[#00ffea]" />
                      <span className="text-sm font-orbitron tracking-wider text-white">PRODUIT AVEC VARIANTES</span>
                    </div>
                    <p className="text-xs text-[#00ffea]/70">
                      {hasVariants
                        ? `${variantProducts.length} variante(s) configurée(s) - Pas de code-barre principal`
                        : 'Activer pour créer différentes versions (couleurs, tailles, etc.)'}
                    </p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setHasVariants(checked);
                        setFormData(prev => ({ ...prev, hasVariants: checked }));
                        if (checked) {
                          setShowVariantModal(true);
                        } else {
                          setVariantProducts([]);
                        }
                      }}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-all duration-300 ${hasVariants ? 'bg-gradient-to-r from-[#00ffea] to-[#0099ff] shadow-lg shadow-[#00ffea]/30' : 'bg-[#0a0e17]/50 border border-[#00ffea]/30'}`}>
                      <div
                        className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 ${
                          hasVariants ? 'translate-x-6' : 'translate-x-0.5'
                        } translate-y-0.5`}
                      >
                        {hasVariants && (
                          <Check className="w-3 h-3 text-[#00ffea] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
             
              {/* ========== DÉSIGNATION ========== */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-3 h-3 text-[#00ffea]" />
                    DÉSIGNATION <span className="text-[#ff416c]">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="Nom du produit"
                />
              </div>
              {/* ========== CATÉGORIE ========== */}
              <div className="space-y-1.5">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-3 h-3 text-[#00ffea]" />
                    CATÉGORIE <span className="text-[#ff416c]">*</span>
                  </div>
                </label>
                <div className="relative">
                  <select id="categorieId" name="categorieId" value={formData.categorieId} onChange={handleChange} className={selectClass} required>
                    <option value="" disabled className="bg-[#0a0e17] text-sm">
                      Sélectionner une catégorie
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-[#0a0e17] text-sm">
                        {category.nom}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#00ffea]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {/* ========== PRIX HT (caché si variantes) ========== */}
              {!hasVariants && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3 h-3 text-[#00ffea]" />
                      PRIX HT <span className="text-[#ff416c]">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="puht"
                      name="puht"
                      value={formData.puht === undefined ? "" : formData.puht}
                      onChange={handleChange}
                      step="0.001"
                      min="0"
                      className={`${inputClass} pr-10 no-spinner`}
                      required
                      placeholder="0.000"
                      style={{ MozAppearance: "textfield", appearance: "textfield" }}
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ffea]/50 text-sm">TND</span>
                  </div>
                </div>
              )}
              {/* Message si variantes actives */}
              {hasVariants && (
                <div className="space-y-1.5 md:col-span-2">
                  <div className="p-3 rounded-lg bg-[#00ffea]/5 border border-[#00ffea]/20">
                    <div className="flex items-center gap-2 text-sm text-[#00ffea]">
                      <DollarSign className="w-4 h-4" />
                      <span>Prix définis individuellement pour chaque variante dans le modal</span>
                    </div>
                  </div>
                </div>
              )}
              {/* ========== TVA ========== */}
              <div className="space-y-1.5">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  <div className="flex items-center gap-2 mb-1">
                    <Percent className="w-3 h-3 text-[#00ffea]" />
                    TVA <span className="text-[#ff416c]">*</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="tva"
                    name="tva"
                    value={formData.tva === undefined ? "" : formData.tva}
                    onChange={handleChange}
                    step="1"
                    min="0"
                    className={`${inputClass} pr-8 no-spinner`}
                    required
                    placeholder="0"
                    style={{ MozAppearance: "textfield", appearance: "textfield" }}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ffea]/50 text-sm">%</span>
                </div>
              </div>
              {/* ========== REMISE ========== */}
              <div className="space-y-1.5">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  <div className="flex items-center gap-2 mb-1">
                    <Percent className="w-3 h-3 text-[#00ffea]" />
                    REMISE
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="remise"
                    name="remise"
                    value={formData.remise === undefined ? "" : formData.remise}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className={`${inputClass} pr-8 no-spinner`}
                    placeholder="0"
                    style={{ MozAppearance: "textfield", appearance: "textfield" }}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ffea]/50 text-sm">%</span>
                </div>
              </div>
              {/* ========== DÉBUT REMISE ========== */}
              <div className="space-y-1.5">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-[#00ffea]" />
                    DÉBUT REMISE
                  </div>
                </label>
                <input
                  type="datetime-local"
                  id="dateDebutRemise"
                  name="dateDebutRemise"
                  value={formData.dateDebutRemise || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Sélectionner"
                />
              </div>
              {/* ========== FIN REMISE ========== */}
              <div className="space-y-1.5">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-[#00ffea]" />
                    FIN REMISE
                  </div>
                </label>
                <input
                  type="datetime-local"
                  id="dateFinRemise"
                  name="dateFinRemise"
                  value={formData.dateFinRemise || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Sélectionner"
                />
              </div>
              {/* ========== CODE-BARRE (caché si variantes) ========== */}
              {!hasVariants && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                    <div className="flex items-center gap-2 mb-1">
                      <Barcode className="w-3 h-3 text-[#00ffea]" />
                      CODE-BARRE <span className="text-[#ff416c]">*</span>
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        id="codeBarre"
                        name="codeBarre"
                        value={formData.codeBarre}
                        onChange={handleChange}
                        className={inputClass}
                        required
                        placeholder="Code-barre généré automatiquement"
                        readOnly={!isProductMagasin}
                      />
                      {!isProductMagasin && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Check className="w-4 h-4 text-green-400" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={regenerateBarcode}
                      className="px-3 py-2 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white rounded-lg transition-all duration-300"
                      title="Générer un nouveau code-barre"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#00ffea]/70 mt-1">
                    Code-barre du produit
                  </p>
                </div>
              )}
              {/* Message si variantes actives pour code-barre */}
              {hasVariants && (
                <div className="space-y-1.5 md:col-span-2">
                  <div className="p-3 rounded-lg bg-[#00ffea]/5 border border-[#00ffea]/20">
                    <div className="flex items-center gap-2 text-sm text-[#00ffea]">
                      <Barcode className="w-4 h-4" />
                      <span>Code-barres définis individuellement pour chaque variante dans le modal</span>
                    </div>
                  </div>
                </div>
              )}
              {/* ========== STOCK SÉCURITÉ ========== */}
              <div className={isProductMagasin ? "space-y-1.5" : "hidden"}>
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-[#00ffea]" />
                    STOCK SÉCURITÉ
                  </div>
                </label>
                <input
                  type="number"
                  id="stockSecurite"
                  name="stockSecurite"
                  value={formData.stockSecurite === undefined ? "" : formData.stockSecurite}
                  onChange={handleChange}
                  min="0"
                  step="0.001"
                  className={`${inputClass} no-spinner`}
                  placeholder="0.000"
                  style={{ MozAppearance: "textfield", appearance: "textfield" }}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              {/* ========== STOCK INITIAL (CACHÉ) ========== */}
              <div className="space-y-1.5 hidden">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  STOCK INITIAL <span className="text-[#ff416c]">*</span>
                </label>
                <input
                  type="number"
                  id="stockInitial"
                  name="stockInitial"
                  value={formData.stockInitial === undefined ? "" : formData.stockInitial}
                  onChange={handleChange}
                  min="0"
                  step="0.001"
                  className={`${inputClass} no-spinner`}
                  disabled
                  placeholder="0.000"
                  style={{ MozAppearance: "textfield", appearance: "textfield", backgroundColor: "gray" }}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            </div>
            {/* ========== VENTE PAR LOTS ========== */}
            <div className={isProductMagasin ? "space-y-3 pt-4 pb-6 border-t border-[#00ffea]/20" : "hidden"}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold font-orbitron tracking-wider text-white">VENTE PAR LOTS</h3>
                  <p className="text-sm text-[#00ffea]/70">Configurez les prix par quantité</p>
                </div>
                <button
                  type="button"
                  onClick={addBulkSaleItem}
                  className="group px-3 py-1.5 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1"
                >
                  <svg className="w-3 h-3 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  AJOUTER
                </button>
              </div>
             
              {formData.bulkSales.length > 0 && (
                <div className="space-y-3">
                  {formData.bulkSales.map((item) => (
                    <div key={item.id} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-[#00ffea]/70 mb-1">
                          QUANTITÉ
                        </label>
                        <input
                          type="number"
                          value={item.quantity || ""}
                          onChange={(e) => updateBulkSaleItem(item.id, 'quantity', Number(e.target.value) || 0)}
                          className={`${inputClass} text-sm no-spinner`}
                          min="0"
                          step="1"
                          placeholder="0"
                          style={{ MozAppearance: "textfield", appearance: "textfield" }}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-[#00ffea]/70 mb-1">
                          PRIX (TND)
                        </label>
                        <input
                          type="number"
                          value={item.price || ""}
                          onChange={(e) => updateBulkSaleItem(item.id, 'price', Number(e.target.value) || 0)}
                          className={`${inputClass} text-sm no-spinner`}
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
                        className="px-3 py-2 bg-gradient-to-r from-[#ff416c]/10 to-[#ff6b9d]/10 hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 border border-[#ff416c]/30 hover:border-[#ff416c] text-[#ff416c] rounded-lg transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* ========== IMAGE (caché si variantes) ========== */}
            {!hasVariants && (
              <div className="space-y-1.5 pt-4 border-t border-[#00ffea]/20">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="w-3 h-3 text-[#00ffea]" />
                    IMAGE DU PRODUIT
                  </div>
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleChange}
                      className={`${inputClass} file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[#00ffea]/10 file:to-[#0099ff]/10 file:text-white/80 hover:file:bg-gradient-to-r hover:file:from-[#00ffea]/20 hover:file:to-[#0099ff]/20`}
                    />
                    <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ffea]/50" />
                  </div>
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#00ffea]/30 bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80">
                        <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Message si variantes actives pour image */}
            {hasVariants && (
              <div className="space-y-1.5 pt-4 border-t border-[#00ffea]/20">
                <div className="p-3 rounded-lg bg-[#00ffea]/5 border border-[#00ffea]/20">
                  <div className="flex items-center gap-2 text-sm text-[#00ffea]">
                    <ImageIcon className="w-4 h-4" />
                    <span>Images optionnelles définies individuellement pour chaque variante dans le modal</span>
                  </div>
                </div>
              </div>
            )}
            {/* ========== CHECKBOXES ========== */}
            <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-[#00ffea]/20">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="sr-only" />
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.active ? 'bg-gradient-to-r from-[#00ffea] to-[#0099ff] shadow-lg shadow-[#00ffea]/30' : 'bg-[#0a0e17]/50 border border-[#00ffea]/30'}`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 ${
                        formData.active ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`}
                    >
                      {formData.active && (
                        <Check className="w-3 h-3 text-[#00ffea] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-orbitron tracking-wider text-white">ACTIF</span>
                  <p className="text-xs text-[#00ffea]/70">Produit disponible à la vente</p>
                </div>
              </label>
              <label className={isProductMagasin ? "inline-flex items-center gap-3 cursor-pointer" : "hidden"}>
                <div className="relative">
                  <input type="checkbox" name="featuredOnPos" checked={formData.featuredOnPos} onChange={handleChange} className="sr-only" />
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.featuredOnPos ? 'bg-gradient-to-r from-[#ff00aa] to-[#cc00ff] shadow-lg shadow-[#ff00aa]/30' : 'bg-[#0a0e17]/50 border border-[#ff00aa]/30'}`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-lg shadow-md transform transition-transform duration-300 ${
                        formData.featuredOnPos ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`}
                    >
                      {formData.featuredOnPos && (
                        <Check className="w-3 h-3 text-[#ff00aa] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-orbitron tracking-wider text-white">MISE EN AVANT POS</span>
                  <p className="text-xs text-[#ff00aa]/70">Afficher en avant sur le terminal</p>
                </div>
              </label>
            </div>
            {/* ========== BOUTONS DE SOUMISSION ========== */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-4 border-t border-[#00ffea]/20 gap-3">
              <button
                type="button"
                onClick={() => {
                  const newBarcode = generateBarcode(isProductMagasin ? "PROD" : "POS");
                  setFormData({
                    ...initialFormState,
                    codeBarre: newBarcode,
                    bulkSales: [{ id: Date.now().toString(), quantity: 0, price: 0 }],
                    type: isProductMagasin ? ProductType.MAGASIN : ProductType.POS
                  });
                  setImagePreview(null);
                  setIsProductMagasin(true);
                  setHasVariants(false);
                  setVariantProducts([]);
                }}
                className={`${buttonClass} bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white w-full sm:w-auto`}
                disabled={loading}
              >
                RÉINITIALISER
              </button>
              <button
                type="submit"
                className={`${buttonClass} bg-gradient-to-r from-[#00ffea] to-[#0099ff] hover:from-[#00ffea] hover:to-[#0099ff] text-white shadow-lg shadow-[#00ffea]/25 hover:shadow-xl hover:shadow-[#00ffea]/40 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center gap-2 group`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>CRÉATION EN COURS...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>
                      CRÉER LE PRODUIT
                      {hasVariants && variantProducts.length > 0 && ` AVEC ${variantProducts.length} VARIANTE${variantProducts.length !== 1 ? 'S' : ''}`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* ========== MODAL DE CONFIGURATION DES VARIANTES ========== */}
      {showVariantModal && (
        <ProductVariantModal
          isOpen={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          onSave={handleVariantsSave}
          productName={formData.designation || 'Nouveau Produit'}
          basePrice={formData.puht}
          productBarcode={formData.codeBarre}
          initialVariants={[]}
        />
      )}
    </div>
  );
}