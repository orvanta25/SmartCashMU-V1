'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './auth/auth-context';

import { Menu, ShoppingCart } from 'lucide-react';
import AdBanner from './common/AdBanner';
import Logo from './common/logo';
import Timer from './pos/CartPanel/Timer';
import CartHeaderDesktop from './pos/CartPanel/CartHeaderDesktop';
import CartList from './pos/CartPanel/CartList';
import Calculator from './pos/CartPanel/Calculator';
import SideBar from './pos/CartPanel/sideBar';
import ProductGrid from './common/ProductGrid';
import { useBarcodeScanner } from '../hooks/BarcodeScanner';
import { ProductForPos } from '../api/produit';
import { getUserProfile } from '../api/user';
import { useNavigate } from 'react-router-dom';

export default function POSPage() {
  const { user, entreprise, setUser, setEntreprise, loading } = useAuth();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [calculatorValue, setCalculatorValue] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  // const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<{ id: string; number: string } | null>(null);
  const [activeCommandId, setActiveCommandId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useNavigate();

  const {
    scannedCode,
    setScannedCode,
    handleScan,
    isLoading,
    error,
    cartItems,
    addProductToCart,
    updateProductQuantity,
    removeProductFromCart,
    clearCart,
    setCartItems,
  } = useBarcodeScanner(entreprise?.id ?? '');

  const handleUpdateQty = (id: string, qty: number) => {
    updateProductQuantity(id, qty);
  };

  const handleRemoveItem = (id: string) => {
    removeProductFromCart(id);
  };

  const handleCalculatorButtonClick = useCallback(
    (value: string) => {
      if (value === 'C') {
        setCalculatorValue('');
      } else if (value === '=') {
        if (selectedProductId && calculatorValue) {
          const quantity = parseFloat(calculatorValue);
          if (!isNaN(quantity)) {
            handleUpdateQty(selectedProductId, quantity);
          }
        }
        setCalculatorValue('');
      } else {
        setCalculatorValue((prev) => prev + value);
      }
    },
    [calculatorValue, selectedProductId, handleUpdateQty]
  );

  const handleProductClick = useCallback(
    (product: ProductForPos) => {
      const puht = Number(product.puht);
      let quantity = calculatorValue ? parseFloat(calculatorValue) || 1 : 1;
     const priceUnit = puht * (1 + (product.tva ?? 0) / 100) * (1 - (product.remise ?? 0) / 100);
    
      addProductToCart({
        id: product.id,
        designation: product.designation,
        quantity,
        priceUnit: Number(priceUnit.toFixed(3)),
        ventesParLot: product.ventesParLot,
        totalPrice: Number(priceUnit.toFixed(3)),        
      },product);

      setSelectedProductId(product.id);
      setCalculatorValue('');
    },
    [calculatorValue, addProductToCart]
  );

  const handleCategoryClick = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleEpicerieToggle = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // const handleSearch = () => {
  //   setSearchQuery(searchQuery); // Trigger search in ProductGrid
  // };

  const handleCommandeConfirm =()=>{
    setRefreshKey((prev) => prev + 1);
  }
  useEffect(() => {
    console.log('Current cartItems in POSPage:', JSON.stringify(cartItems, null, 2));
  }, [cartItems]);

  const shouldRenderProductGrid = entreprise !== null;

  const isDesktop = windowSize.width >= 1280;
  const isCashRegister = windowSize.width >= 768 && windowSize.width < 1280;
  const isTablet = windowSize.width >= 540;
  const isMobile = windowSize.width < 540;
  const isSurfaceDuo =
    windowSize.width >= 540 && windowSize.width <= 720 && windowSize.height <= 720;

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (window.innerWidth >= 1280) {
        setIsSidebarOpen(false);
        setIsCartOpen(false);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCloseOverlays = () => {
    setIsSidebarOpen(false);
    setIsCartOpen(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!loading && !entreprise) {
        try {
          const response = await getUserProfile();
          console.log("data from responese in os page: ",response)
          setUser(response);
          setEntreprise(response.entreprise || null);
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération du profil.';
          toast.error(errorMessage);
        }
      }
    };

    fetchProfile();
  }, [loading, entreprise, setUser, setEntreprise]);

  useEffect(() => {
    if (loading) return;
    console.log("user data in pos page: ",user)
    if (!user || !user.isActive) {
      console.log("check user data in use effect pos page: ",user)
      router('/banned');
      return;
    }

    if (user.role !== 'ADMIN' && !user.permissions.includes('Gestion des ventes')) {
      router('/unauthorized');
      return;
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Chargement...</div>;
  }

  if (!user || !user.isActive || (user.role !== 'ADMIN' && !user.permissions.includes('Gestion des ventes'))) {
    return null;
  }

  return (
    <>

      <div className="flex flex-col h-screen w-full bg-orvanta text-white font-sans" lang="fr">
        <div
          className={`w-full h-24 bg-orvanta shadow-lg flex-shrink-0 flex relative ${
            isCashRegister ? 'relative' : ''
          }`}
        >
          <div className="w-64 items-center justify-center relative hidden md:flex">
            {isCashRegister && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Ouvrir le menu"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-2 bg-orvanta rounded-md shadow-xl"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Logo />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <AdBanner />
          </div>
          <div className="w-[25.95%] min-w-[259px] items-center justify-center hidden md:flex">
            <Timer caissierName={`${user?.prenom || ''} ${user?.nom || ''}`.trim()} />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {isDesktop && (
            <SideBar
              isDesktop={true}
              onCategoryClick={handleCategoryClick}
              onEpicerieToggle={handleEpicerieToggle}
            />
          )}
          {(!isDesktop && isSidebarOpen) && (
            <SideBar
              isDesktop={false}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onCategoryClick={handleCategoryClick}
              onEpicerieToggle={handleEpicerieToggle}
            />
          )}

          <main className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <section className={`${isDesktop ? 'w-[70%]' : isCashRegister ? 'w-[60%]' : 'w-full'} flex flex-col`}>
            

              {shouldRenderProductGrid ? (
                <ProductGrid
  onProductClick={handleProductClick}
  className="p-3 bg-orvanta shadow-xl"
  selectedCategoryId={selectedCategoryId}
  showPrice={false}
  showCategory={false}
  refreshKey={refreshKey}
  // Nouvelles props pour CartFooter
  cartItems={cartItems}
  clearCart={clearCart}
  companyName={entreprise?.denomination || 'Orvanta'}
  city={entreprise?.ville || 'Tunis'}
  telephone={entreprise?.telephone || '+216 00 000 000'}
  setCartItems={setCartItems}
  selectedTable={selectedTable}
  setSelectedTable={setSelectedTable}
  activeCommandId={activeCommandId}
  setActiveCommandId={setActiveCommandId}
  onCommandeConfirm={handleCommandeConfirm}
/>
              ) : (
                <div className="flex-1 p-3 bg-orvanta shadow-xl flex items-center justify-center">
                  <div className="text-center py-6 text-white/60">Chargement des produits...</div>
                </div>
              )}
            </section>

            {(isDesktop || isCashRegister) && (
              <aside
                className={`${isDesktop ? 'w-[30%]' : 'w-[40%]'} min-w-[350px] bg-orvanta shadow-xl flex flex-col`}
              >
                <div className="p-4 shadow-xl">
                  <CartHeaderDesktop
                    companyName={entreprise?.denomination || 'Orvanta'}
                    city={entreprise?.ville || 'Tunis'}
                    onScan={handleScan}
                    scannedCode={scannedCode}
                    onChangeScannedCode={setScannedCode}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  <CartList
                    items={cartItems}
                    onUpdateQty={handleUpdateQty}
                    onRemoveItem={handleRemoveItem}
                    onTotalChange={setCartTotal}
                  />
                </div>

                <div className="p-4 bg-orvanta/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg">
  <div className="flex justify-between items-center font-bold text-white font-mono text-lg">
    <span className="text-white/80 uppercase tracking-widest text-sm">Total</span>
    <span className="text-amber-300 text-2xl bg-black/30 px-4 py-3 rounded-xl border border-amber-400/40">
      {cartTotal.toFixed(3)}
    </span>
  </div>
</div>

                <div className="p-3 bg-orvanta flex justify-end">
                  <button
                    onClick={() => setIsCalculatorOpen((prev) => !prev)}
                    className="text-white bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {isCalculatorOpen && (
                  <div className="p-3 bg-orvanta transition-all duration-300">
                    <Calculator
                      onButtonClick={handleCalculatorButtonClick}
                      currentValue={calculatorValue}
                    />
                  </div>
                )}

                
              </aside>
            )}

            {(isMobile || isTablet) && isCartOpen && (
              <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 bg-transparent" onClick={handleCloseOverlays} />
                <aside
                  className={`absolute right-0 top-0 h-full bg-orvanta bg-cover bg-center shadow-xl flex flex-col ${
                    isTablet ? 'w-96' : 'w-[80%]'
                  }`}
                >
                  <div className="p-4 shadow-xl">
                    <CartHeaderDesktop
                      companyName={entreprise?.denomination || 'Orvanta'}
                      city={entreprise?.ville || 'Tunis'}
                      onScan={handleScan}
                      scannedCode={scannedCode}
                      onChangeScannedCode={setScannedCode}
                      isLoading={isLoading}
                      error={error}
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    <CartList
                      items={cartItems}
                      onUpdateQty={handleUpdateQty}
                      onRemoveItem={handleRemoveItem}
                      onTotalChange={setCartTotal}
                    />
                  </div>
                  <div className="p-3 shadow-xl bg-orvanta">
                    <div className="flex justify-between items-center font-semibold text-white font-poppins text-lg px-4 py-2 border-t border-white/20">
                      <span>Total</span>
                      <span className="text-[#ffff00] text-2xl">{cartTotal.toFixed(3)}</span>
                    </div>
                  </div>
                  
                </aside>
              </div>
            )}
          </main>
        </div>

        {(isMobile || isSurfaceDuo) && (
          <nav className="fixed bottom-0 left-0 right-0 flex-shrink-0 bg-orvanta shadow-xl flex justify-around p-3 z-40">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Ouvrir le menu"
              className="p-3 bg-gradient-to-r from-blue-200 to-purple-700 shadow-lg rounded-full"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              aria-label="Ouvrir le panier"
              className="p-3 bg-gradient-to-r from-blue-200 to-purple-700 shadow-lg rounded-full relative"
            >
              <ShoppingCart className="w-6 h-6 text-white" />
            </button>
          </nav>
        )}

        {isTablet && !isSurfaceDuo && !isCashRegister && !isDesktop && (
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Ouvrir le panier tablette"
            className="fixed right-4 bottom-4 z-30 p-3 bg-gradient-to-r from-blue-200 to-purple-700 rounded-full shadow-xl"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </>
  );
}