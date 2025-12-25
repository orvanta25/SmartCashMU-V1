import { useState } from 'react';
import { getProductByBarcode, getProductById, Product } from '../api/produit';
import { getAllBalanceConfigs } from '../api/balance';
import { CartItem } from '../types/product';
import { calculatePriceWithVenteParLot} from '../components/pos/CartPanel/priceCalculator';
import { toast } from 'react-toastify';
export const useBarcodeScanner = (entrepriseId: string) => {
  const [scannedCode, setScannedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleScan = async (barcodeRaw: string) => {
    const barcode = barcodeRaw.trim();

    if (isLoading) {
      return;
    }

    if (!barcode || barcode.length < 7) {
      setError('Rescanner le code à barre');
      return;
    }

    setIsLoading(true);
    setError('');
    setScannedCode(barcode);

    try {
      const balanceConfigs = await getAllBalanceConfigs(entrepriseId);
      const matchingConfigs = balanceConfigs.filter(
        (config) => config.barcodeLength === barcode.length
      );

      let processed = false;
      for (const config of matchingConfigs) {
        if (barcode.startsWith(config.balanceCode)) {
          await handleBalanceBarcode(barcode, config);
          processed = true;
          break;
        }
      }

      if (!processed) {
        await verifyStandardBarcode(barcode);
      }
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err: 'Erreur inconnue'}`);
      console.error('[handleScan] Erreur attrapée:', err);
    } finally {
      setIsLoading(false);
      setScannedCode('');
    }
  };

const handleBalanceBarcode = async (barcode: string, config) => {
  if (config.priceLength !== 5) {
    setError("Configuration de balance invalide");
    return;
  }

  const productStart = config.productCodeStart - 1;
  const priceStart = config.priceStart - 1;

  const productCodePart = barcode.substring(
    productStart,
    productStart + config.productCodeLength
  );

  const pricePart = barcode.substring(
    priceStart,
    priceStart + config.priceLength
  );

  if (!/^\d{5}$/.test(pricePart)) {
    setError("Prix issu du ticket invalide");
    return;
  }

  const priceNumber = parseFloat(pricePart);
  const prixTicket = priceNumber / 1000;  // EX: 14850 → 14.850 TND

  // Récupérer produit
  const product = await getProductByBarcode(entrepriseId, productCodePart);
  if (!product) {
    setError("Produit balance non trouvé");
    return;
  }

  // Prix au kilo correct
  const prixBase = Number(product.puht);
  const prixKilo = prixBase * (1 + (product.tva ?? 0) / 100); // EX: 60 * 1.1 = 66

  // Calcul du poids réel vendu
  const poidsVendu = Number((prixTicket / prixKilo).toFixed(3)); // EX: 14.850 / 66 = 0.225

  const tempItem: CartItem = {
    id: product.id,
    designation: product.designation,
    priceUnit: Number(prixKilo.toFixed(3)),  // PU = prix kilo
    quantity: poidsVendu,                    // quantité = poids vendu
    totalPrice: Number(prixTicket.toFixed(3)) // PT = prix du ticket EXACT
  };

  addToCart(tempItem, product, poidsVendu);
};



 /* const verifyStandardBarcode = async (barcode: string) => {
    try {
      const product = await getProductByBarcode(entrepriseId, barcode);

      if (!product) {
        setError('Aucun produit existant!');
        return;
      }

      const puht = Number(product.puht);
      const priceUnit = puht * (1 + product.tva / 100);
      if (isNaN(priceUnit)) {
        setError('Prix du produit invalide');
        return;
      }

      addToCart({
        id: product.id,
        designation: product.designation,
        priceUnit: Number(priceUnit.toFixed(3)),
        quantity: 1,
        totalPrice: Number(priceUnit.toFixed(3)),
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Produit non trouvé (404)');
        console.error('[verifyStandardBarcode] Produit non trouvé (404) pour le code:', `"${barcode}"`);
      } else {
        setError('Erreur lors de la recherche du produit');
        console.error('[verifyStandardBarcode] Erreur lors de la recherche:', error);
      }
    }
  };*/

// In useBarcodeScanner hook
const verifyStandardBarcode = async (barcode: string) => {
  try {
    const product = await getProductByBarcode(entrepriseId, barcode);

    if (!product) {
      setError('Aucun produit existant!');
      return;
    }

    const puht = Number(product.puht);
    const priceUnit = puht * (1 + (product.tva ?? 0) / 100) * (1 - (product.remise ?? 0) / 100);
    if (isNaN(priceUnit)) {
      setError('Prix du produit invalide');
      return;
    }

    addToCart({
      id: product.id,
      designation: product.designation,
      priceUnit: Number(priceUnit.toFixed(3)),
      quantity: 1,
      ventesParLot: product.ventesParLot, // Store only VenteParLot data
      totalPrice: Number(priceUnit.toFixed(3)), // Initial total for 1 item
    },product);
  } catch (error: any) {
    if (error.response?.status === 404) {
      setError('Produit non trouvé (404)');
      console.error('[verifyStandardBarcode] Produit non trouvé (404) pour le code:', `"${barcode}"`);
    } else {
      setError('Erreur lors de la recherche du produit');
      console.error('[verifyStandardBarcode] Erreur lors de la recherche:', error);
    }
  }
};
const addToCart = (item: CartItem, product, newQuantity?: number) => {
  const requestedQuantity = newQuantity ?? item.quantity ?? 1; // si item.quantity déjà renseigné (balance), l'utiliser

  if (!product.quantite && product.quantite !== 0) {
    toast.error("Produit en rupture de stock !");
    return;
  }

  setCartItems((prevItems) => {
    const existingItem = prevItems.find((i) => i.id === item.id);

    let finalQuantity = requestedQuantity;

    if (existingItem) {
      finalQuantity = existingItem.quantity + requestedQuantity;
      if (finalQuantity > product.quantite) {
        finalQuantity = product.quantite;
        toast.error(`Quantité maximale disponible : ${product.quantite}`);
      }

      const totalPrice = calculatePriceWithVenteParLot(
        existingItem.priceUnit,
        existingItem.ventesParLot,
        finalQuantity
      );

      return prevItems.map((i) =>
        i.id === item.id
          ? { ...i, quantity: Number(finalQuantity.toFixed(3)), totalPrice: Number(totalPrice.toFixed(3)) }
          : i
      );
    }

    // Nouveau produit (ici item.quantity peut venir de barcode pesée)
    if (finalQuantity > product.quantite) {
      finalQuantity = product.quantite;
      toast.error(`Quantité maximale disponible : ${product.quantite}`);
    }

    const totalPrice = calculatePriceWithVenteParLot(
      item.priceUnit,
      item.ventesParLot,
      finalQuantity
    );

    return [...prevItems, { ...item, quantity: Number(finalQuantity.toFixed(3)), totalPrice: Number(totalPrice.toFixed(3)) }];
  });
};


const updateItemQuantity = async (id: string, newQuantity: number) => {
  try {
    const product = await getProductById(entrepriseId, id);

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          // Vérifier la quantité demandée contre le stock
          if (newQuantity > product.quantite) {
            toast.error(`Quantité maximale disponible : ${product.quantite}`);
            return item; // ne pas appliquer la modification
          }

          // Calculate new total with VenteParLot
          const totalPrice = calculatePriceWithVenteParLot(
            item.priceUnit,
            item.ventesParLot,
            newQuantity
          );
          
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: Number(totalPrice.toFixed(3)),
          };
        }
        return item;
      })
    );
  } catch (error) {
    console.error("updateItemQuantity barcodescanner: ", error);
  }
};


  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return {
    scannedCode,
    setScannedCode,
    handleScan,
    isLoading,
    error,
    cartItems,
    setCartItems,
    addProductToCart: addToCart,
    updateProductQuantity: updateItemQuantity,
    removeProductFromCart: removeItem,
    clearCart,
  };
};