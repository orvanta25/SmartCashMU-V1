'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { getCategoriesForPos } from '../../../api/categorie';
import { getEntreprise, updateEpicerieModule } from '../../../api/entreprise';
import { Coffee, Milk, Cookie, ShoppingBasket, Sparkles, Apple, ChevronRight, Search, X } from 'lucide-react';
import { Link, Links } from 'react-router-dom';

interface SideBarProps {
  isDesktop: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onCategoryClick?: (categoryId: string | null) => void;
  onEpicerieToggle?: () => void;
}

const categoryIconMap: Record<string, { icon: any; color: string }> = {
  Ooredoo: { icon: Coffee, color: 'from-red-500/40 to-orange-500/40' },
  Telecom: { icon: ShoppingBasket, color: 'from-blue-500/40 to-cyan-500/40' },
  Orange: { icon: Sparkles, color: 'from-orange-500/40 to-yellow-500/40' },
  Boissons: { icon: Coffee, color: 'from-blue-500/40 to-indigo-500/40' },
  'Produits Laitiers': { icon: Milk, color: 'from-yellow-500/40 to-orange-500/40' },
  Snacks: { icon: Cookie, color: 'from-purple-500/40 to-pink-500/40' },
  Épicerie: { icon: ShoppingBasket, color: 'from-green-500/40 to-emerald-500/40' },
  Hygiène: { icon: Sparkles, color: 'from-indigo-500/40 to-blue-500/40' },
  'Fruits & Légumes': { icon: Apple, color: 'from-red-500/40 to-rose-500/40' },
};

const operatorCategories = ['Ooredoo', 'Telecom', 'Orange'];

export default function SideBar({
  isDesktop,
  isOpen = false,
  onClose,
  onCategoryClick,
  onEpicerieToggle,
}: SideBarProps) {
  const { entreprise, user } = useAuth();
  const [categories, setCategories] = useState<{ id: string; nom: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isEpicerieActive, setIsEpicerieActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!entreprise?.id) return;
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesForPos(entreprise.id);
        const sortedCategories = data.sort((a, b) => {
          const priorityOrder = ['Ooredoo', 'Telecom', 'Orange'];
          const aPriority = priorityOrder.indexOf(a.nom);
          const bPriority = priorityOrder.indexOf(b.nom);
          if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
          if (aPriority !== -1) return -1;
          if (bPriority !== -1) return 1;
          return a.nom.localeCompare(b.nom);
        });
        setCategories(sortedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [entreprise?.id]);

  useEffect(() => {
    async function fetchEnterprise() {
      try {
        const entreprise = await getEntreprise();
        setIsEpicerieActive(entreprise.hasEpicerieModule || false);
      } catch (error) {
        console.error('Error fetching enterprise:', error);
      }
    }
    fetchEnterprise();
  }, []);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    onCategoryClick?.(categoryId);
  };

  const handleEpicerieToggle = async () => {
    try {
      const newState = !isEpicerieActive;
      await updateEpicerieModule({ hasEpicerieModule: newState });
      setIsEpicerieActive(newState);
      onEpicerieToggle?.();
    } catch (error) {
      console.error('Error toggling epicerie module:', error);
      setIsEpicerieActive(isEpicerieActive);
    }
  };

  // Filter categories based on toggle state
// Garder uniquement les catégories visibles en POS
const posCategories = categories.filter(cat => cat.showInPos === true);

// Filtre logique épicerie
const filteredCategories = isEpicerieActive
  ? posCategories
  : posCategories.filter(category => !operatorCategories.includes(category.nom));

// Si recherche : on recherche dans toutes les POS
// Sinon : on applique les filtres normaux
const baseListForDisplay = searchTerm.trim() ? posCategories : filteredCategories;

// Filtre de recherche
const visibleCategories = baseListForDisplay.filter(category =>
  category.nom.toLowerCase().includes(searchTerm.toLowerCase())
);


  const dashboardLink = user?.role === 'ADMIN' ? '/dashboard_user' : '/dashboard_user';

  // Overlay mode for mobile/tablet
  if (!isDesktop && isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <aside className="relative w-64 bg-orvanta shadow-xl flex flex-col h-full">
          <div className="flex-1 flex flex-col bg-transparent backdrop-blur-2xl border-b border-white/10 p-6 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h3 className="text-white/90 font-bold text-lg tracking-tight">Catégories</h3>
            </div>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/80" />
                <input
                  aria-label="Rechercher une catégorie"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une catégorie..."
                  className="w-full pl-10 pr-10 py-2 rounded-lg bg-blue-500/10 border border-blue-400/20 text-blue-100 placeholder-blue-200/70 outline-none focus:border-blue-300/40 focus:bg-blue-500/15 focus:ring-2 focus:ring-blue-400/20 transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    aria-label="Effacer la recherche"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-blue-500/10 text-blue-300 hover:text-blue-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-3 max-h-[30rem] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent hover:scrollbar-thumb-white/10">
              {visibleCategories.length === 0 && (
                <div className="flex items-center gap-2 text-blue-200/80 text-sm px-2">
                  <Search className="w-4 h-4 text-blue-300/80" />
                  <span>Aucune catégorie trouvée</span>
                </div>
              )}
              <div
                className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  selectedCategoryId === null ? 'bg-white/20 border-white/20' : ''
                }`}
                onClick={() => handleCategoryClick(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/50 to-gray-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3 p-3 bg-white/10 group-hover:bg-white/20 border border-white/20 group-hover:border-white/30 rounded-xl transition-all duration-300">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <Coffee className="w-4 h-4 text-white/70 group-hover:text-white/90 transition-colors duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white/80 group-hover:text-white/95 font-medium text-sm transition-colors duration-300 truncate">
                      Toutes les catégories
                    </h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {visibleCategories.map((category) => {
                const iconData = categoryIconMap[category.nom] || { icon: Coffee, color: 'from-gray-500/50 to-gray-600/50' };
                const IconComponent = iconData.icon;
                return (
                  <div
                    key={category.id}
                    className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                      selectedCategoryId === category.id ? 'bg-white/20 border-white/20' : ''
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${iconData.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>
                    <div className="relative flex items-center gap-3 p-3 bg-white/10 group-hover:bg-white/20 border border-white/20 group-hover:border-white/30 rounded-xl transition-all duration-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        <IconComponent className="w-4 h-4 text-white/70 group-hover:text-white/90 transition-colors duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white/80 group-hover:text-white/95 font-medium text-sm transition-colors duration-300 truncate">
                          {category.nom}
                        </h4>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </div>
                );
              })}
            </div>
            
          </div>
          <div className="p-6 bg-orvanta">
            <div className="flex flex-col items-center gap-4">
              <Link
                to={dashboardLink}
                className="px-5 py-2 bg-cyan-500 text-white rounded-lg shadow-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition text-sm w-[80%]"
              >
                Aller au Dashboard
              </Link>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-orvanta shadow-xl flex-shrink-0 flex flex-col h-full">
      <div className="flex-1 flex flex-col bg-transparent backdrop-blur-2xl border-b border-white/10 p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <h3 className="text-white/90 font-bold text-lg tracking-tight">Catégories</h3>
          <span className="text-white/40 text-sm mb-0 ml-2">{visibleCategories.length} catégories</span>
        </div>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/80" />
            <input
              aria-label="Rechercher une catégorie"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une catégorie..."
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-blue-500/10 border border-blue-400/20 text-blue-100 placeholder-blue-200/70 outline-none focus:border-blue-300/40 focus:bg-blue-500/15 focus:ring-2 focus:ring-blue-400/20 transition"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-blue-500/10 text-blue-300 hover:text-blue-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3 max-h-[30rem] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent hover:scrollbar-thumb-white/10">
          {visibleCategories.length === 0 && (
            <div className="flex items-center gap-2 text-blue-200/80 text-sm px-2">
              <Search className="w-4 h-4 text-blue-300/80" />
              <span>Aucune catégorie trouvée</span>
            </div>
          )}
          <div
            className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
              selectedCategoryId === null ? 'bg-white/20 border-white/20' : ''
            }`}
            onClick={() => handleCategoryClick(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/50 to-gray-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3 p-3 bg-white/10 group-hover:bg-white/20 border border-white/20 group-hover:border-white/30 rounded-xl transition-all duration-300">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <Coffee className="w-4 h-4 text-white/70 group-hover:text-white/90 transition-colors duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white/80 group-hover:text-white/95 font-medium text-sm transition-colors duration-300 truncate">
                  Toutes les catégories
                </h4>
              </div>
              <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
          {visibleCategories.map((category) => {
            const iconData = categoryIconMap[category.nom] || { icon: Coffee, color: 'from-gray-500/50 to-gray-600/50' };
            const IconComponent = iconData.icon;
            return (
              <div
                key={category.id}
                className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  selectedCategoryId === category.id ? 'bg-white/20 border-white/20' : ''
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${iconData.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>
                <div className="relative flex items-center gap-3 p-3 bg-white/10 group-hover:bg-white/20 border border-white/20 group-hover:border-white/30 rounded-xl transition-all duration-300">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <IconComponent className="w-4 h-4 text-white/70 group-hover:text-white/90 transition-colors duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white/80 group-hover:text-white/95 font-medium text-sm transition-colors duration-300 truncate">
                      {category.nom}
                    </h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between my-4">
          <span className="text-white/70 text-sm">Opérateur Telephonique</span>
          <button
            onClick={handleEpicerieToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isEpicerieActive ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                isEpicerieActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
    </aside>
  );
}
