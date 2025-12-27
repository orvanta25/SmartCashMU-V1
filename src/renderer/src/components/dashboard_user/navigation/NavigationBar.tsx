//src/components/dashboard_user/navigation/NavigationBar.tsx

'use client';

import { useState, useEffect } from 'react';
import {Link,useLocation,useNavigate} from "react-router-dom"
import { useAuth } from '../../auth/auth-context';


interface NavigationSubItem {
  name: string;
  href: string;
  permission?: string;
  adminOnly?: boolean;
  roles?: string[]; // Allow specific roles to see this item
  subItems?: NavigationSubItem[];
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  subItems?: NavigationSubItem[];
  permission?: string;
  adminOnly?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard_user',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    name: 'Caisse (Pos)',
    href: '/pos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    permission: 'Gestion des ventes',
  },
  // Dans le tableau navigationItems, modifiez la section 'Gestion de Stock' :
{
  name: 'Gestion de Stock',
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  subItems: [
    { name: 'Catégories', href: '/dashboard_user/categories', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
    { name: 'Produits', href: '/dashboard_user/products', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
    { 
      name: 'Variantes', 
      href: '/dashboard_user/variant',
      subItems: [
        { name: 'Familles de variantes', href: '/dashboard_user/variant/families', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
        { name: 'Valeurs de variantes', href: '/dashboard_user/variant/values', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
        { name: 'Gestion des variantes', href: '/dashboard_user/variant/manage', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
      ]
    },
    {
      name: 'Control & Mouvement de stock',
      href: '/dashboard_user/stock-control',
      subItems: [
        { name: "Fiche D'inventaire", href: '/dashboard_user/stock/inventory-form', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
        { name: 'Fiche ACC', href: '/dashboard_user/stock/acc-form', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
        { name: 'État des écarts', href: '/dashboard_user/stock/discrepancies', roles: ['ADMIN'] }, 
      ],
    },
  ],
},
  {
    name: 'Comptabilité & Finance',
icon: (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
),
subItems: [
  { name: 'Charges', href: '/dashboard_user/charges', roles: ['ADMIN'] },
  { name: 'Gestion des factures', href: '/dashboard_user/purchases', roles: ['ADMIN', 'CAISSIER'] },
  { name: 'Ventes POS', href: '/dashboard_user/sales/pos-list', roles: ['ADMIN'] },
  { name: 'Historique des Échéances payées', href: '/dashboard_user/Deadlines/history', roles: ['ADMIN'] },
  { name: 'Déclaration mensuelle', href: '/dashboard_user/Monthly-report', roles: ['ADMIN'] },
],

  },
  {
    name: 'Modalités de Paiement',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    subItems: [
      { name: 'Ticket Resto', href: '/dashboard_user/TicketResto', permission: 'Gestion des tickets resto' },
    ],
  },
  // Ajouter dans le tableau navigationItems
{
  name: 'Marketing & Remise',
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-6 3h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  subItems: [
    { 
      name: 'Configuration de Remise', 
      href: '/dashboard_user/remise/configuration', 
      roles: ['ADMIN'] 
    },
  ],
},

  {
    name: 'Configuration & Matériel',
icon: (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h6m4 0h6M12 4v4m-8 6h6m4 0h6M12 12v4m-8 6h6m4 0h6M12 20v4M8 6a2 2 0 104 0 2 2 0 00-4 0m8 8a2 2 0 104 0 2 2 0 00-4 0m-8 8a2 2 0 104 0 2 2 0 00-4 0" />
  </svg>
),
subItems: [
  { name: 'Gestion des Caisses', href: '/dashboard_user/configuration/caisses', roles: ['ADMIN'] },
  { name: 'Balance', href: '/dashboard_user/configuration/balance', roles: ['ADMIN'] },
  { name: 'Imprimante', href: '/dashboard_user/configuration/imprimante', roles: ['ADMIN'] },
  { name: 'Création de facture', href: '/dashboard_user/provider-Invoice/invoice/add', roles: ['ADMIN'] },
  { name: 'Modifier une facture', href: '/dashboard_user/provider-Invoice/invoice/edit', roles: ['ADMIN'] },
],

  },
  {
    name: 'Utilisateurs & Accès',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0013.586 3H7zm3 6h4m-2-2v4m-2 2s0 2 2 2 2-2 2-2" />
      </svg>
    ),
    subItems: [
      { name: 'Ajout d\'utilisateurs', href: '/dashboard_user/configuration/user-management', adminOnly: true },
    { name: 'Liste d\'utilisateurs', href: '/dashboard_user/configuration/user-management/list', adminOnly: true }
    ]
  },
  {
    name: 'Document & Impression',
icon: (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18h12v4H6v-4zm12-3H6a2 2 0 00-2 2v3h16v-3a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 14h12v-5H6v5z" />
  </svg>
),
subItems: [
  { name: 'Zjour', href: '/dashboard_user/impression/Zjour', roles: ['ADMIN'] },
  
  { name: 'Facturation', href: '/dashboard_user/facturation', roles: ['ADMIN'] },
  // { name: 'Voir vos factures', href: '/dashboard_user/facturation/add', roles: ['ADMIN'] },
],

  },
  {
  name: 'Gestion des Magasins',
icon: (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}  d="M4 7L5.5 3.5a1 1 0 01.9-.5h11.2a1 1 0 01.9.5L20 7M4 7h16M4 7v10a2 2 0 002 2h2a2 2 0 002-2V7m4 0v10a2 2 0 002 2h2a2 2 0 002-2V7"/>
  </svg>
),
subItems: [
  { name: 'Ajout de Magasins', href: '/dashboard_user/StoreManagement/store', roles: ['ADMIN'] },
  { name: 'Ajout de Responsables', href: '/dashboard_user/StoreManagement/responsible', roles: ['ADMIN'] },
]

  },
  {
    name: 'Client / Fournisseur',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h6v6H4V7M12 7h6v6h-6V7M4 13h14v6H4v-6M4 7v12M20 7v12" />
      </svg>
      ),
    subItems: [
      { name: 'Liste de Client', href: '/dashboard_user/client/add-client/list' },
      { name: 'Liste de Fournisseur', href: '/dashboard_user/provider/list' },
    ] 
    }
  ];

// Sous-items détaillés pour chaque section
const detailedSubItems: Record<string, { name: string; href: string; permission?: string; adminOnly?: boolean; roles?: string[] }[]> = {
  'Catégories': [
    { name: 'Nouvelle Catégorie', href: '/dashboard_user/categories/new', permission: 'Gestion des catégories' },
    { name: 'Liste Des Catégories', href: '/dashboard_user/categories/list', permission: 'Gestion des catégories' },
  ],
  'Produits': [
    { name: 'Nouveau Produit', href: '/dashboard_user/products/new', permission: 'Gestion des produits' },
    { name: 'Liste des Produits', href: '/dashboard_user/products/list', permission: 'Gestion des produits' },
  ],
  'Variantes': [
  { name: 'Nouvelle Famille', href: '/dashboard_user/variant/families/new', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
  { name: 'Liste des Familles', href: '/dashboard_user/variant/families/list', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
  { name: 'Nouvelle Valeur', href: '/dashboard_user/variant/values/new', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
  { name: 'Liste des Valeurs', href: '/dashboard_user/variant/values/list', roles: ['ADMIN', 'CAISSIER', 'CHEF_RAYON'] },
],
  'Control & Mouvement de stock': [
    { name: "Fiche D'inventaire", href: '/dashboard_user/stock/inventory-form', permission: 'Gestion de l\'inventaire' },
    { name: 'Fiche ACC', href: '/dashboard_user/stock/acc-form', permission: 'Gestion des acc' },
    { name: 'État des écarts', href: '/dashboard_user/stock/discrepancies', adminOnly: true },
  ],
  'Charges': [
    { name: 'Ajouter Type de Charge', href: '/dashboard_user/loadManagment/loadType', permission: 'Gestion des charges' },
    { name: 'Ajouter une Charge', href: '/dashboard_user/loadManagment/loadForm', permission: 'Gestion des charges' },
    { name: 'Liste des Charges', href: '/dashboard_user/loadManagment/loadForm/list', permission: 'Gestion des charges' },
  ],
  'Gestion des factures': [
    { name: 'Ajout Factures', href: '/dashboard_user/purchasesProvider/add-invoice', permission: 'Gestion des achats fournisseurs' },
    { name: 'Liste des Factures D\'Achats', href: '/dashboard_user/purchasesProvider/payments', permission: 'Gestion des achats fournisseurs' },
  ],
  'Ticket Resto': [
    { name: 'Ajouter Ticket Resto', href: '/dashboard_user/TicketResto/add', permission: 'Gestion des tickets resto' },
    { name: 'Liste des Ticket Resto', href: '/dashboard_user/TicketResto/list', permission: 'Gestion des tickets resto' },
  ],
  'Utilisateur & Magasin': [
    { name: 'Ajout d\'utilisateurs', href: '/dashboard_user/configuration/user-management', adminOnly: true },
    { name: 'Liste d\'utilisateurs', href: '/dashboard_user/configuration/user-management/list', adminOnly: true }
  ],
  'Document & Impression': [
    { name: 'Zjour', href: '/dashboard_user/impression/Zjour', roles: ['ADMIN', 'CAISSIER'] },
   
  ],
  'Facturation': [
    { name: 'Factures', href: '/dashboard_user/provider-Invoice/invoice', adminOnly: true }
  ],
};

export function NavigationBar() {
  const { user, loading: authLoading } = useAuth();
  const router = useNavigate();
  const {pathname} = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.isActive) {
      router('/banned');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user || !user.isActive) {
    return null; // Redirect handled in useEffect
  }

  const toggleDropdown = (itemName: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const toggleNestedDropdown = (parent: string, itemName: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [`${parent}-${itemName}`]: !prev[`${parent}-${itemName}`],
    }));
  };

  // Helper function to check if a sub-item is visible based on permissions and roles
  const isSubItemVisible = (subItem: NavigationSubItem, userRole: string, userPermissions: string[]): boolean => {
    if (subItem.adminOnly && userRole !== 'ADMIN') return false;
    if (subItem.roles && !subItem.roles.includes(userRole)) return false;
    if (subItem.permission && !userPermissions.includes(subItem.permission) && userRole !== 'ADMIN') return false;
    if (subItem.subItems) {
      // Check if any nested sub-items are visible
      return subItem.subItems.some((nestedItem) => isSubItemVisible(nestedItem, userRole, userPermissions));
    }
    return true;
  };

  // Filter navigation items based on user role and permissions
  const filteredNavigationItems = navigationItems
    .map((item) => {
      if (item.adminOnly && user.role !== 'ADMIN') return null;
      if (item.permission && !user.permissions.includes(item.permission) && user.role !== 'ADMIN') return null;
      if (item.subItems) {
        // Filter subItems and their nested subItems
        const filteredSubItems = item.subItems
          .filter((subItem) => isSubItemVisible(subItem, user.role, user.permissions))
          .map((subItem) => ({
            ...subItem,
            subItems: subItem.subItems ? subItem.subItems.filter((nestedItem) => isSubItemVisible(nestedItem, user.role, user.permissions)) : undefined,
          }))
          .filter((subItem) => !subItem.subItems || subItem.subItems.length > 0); // Only keep sub-items with visible nested sub-items
        if (filteredSubItems.length === 0) return null;
        return { ...item, subItems: filteredSubItems };
      }
      return item;
    })
    .filter((item): item is NavigationItem => item !== null);

  // Filter detailedSubItems based on permissions and roles
  const filteredDetailedSubItems = Object.fromEntries(
    Object.entries(detailedSubItems).map(([key, items]) => [
      key,
      items.filter((item) => {
        if (item.adminOnly && user.role !== 'ADMIN') return false;
        if (item.roles && !item.roles.includes(user.role)) return false;
        if (item.permission && !user.permissions.includes(item.permission) && user.role !== 'ADMIN') return false;
        return true;
      }),
    ])
  );

  return (
    <nav className="px-4 py-6">
      <ul className="space-y-1">
        {filteredNavigationItems.map((item) => (
          <li key={`${item.name}-${item.href || 'group'}`}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname.startsWith(item.href || `/${item.name.toLowerCase()}`)
                      ? 'bg-blue-600/20 text-white border-l-4 border-blue-500'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-3 opacity-80">{item.icon}</span>
                  <span className="flex-1 text-left">{item.name}</span>
                  <svg
                    className={`h-4 w-4 transform transition-transform ${
                      openDropdowns[item.name] ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {openDropdowns[item.name] && (
                  <div className="ml-2 mt-1 pl-6 space-y-1 border-l border-white/10">
                    {item.subItems.map((subItem) => {
                      const hasNestedItems = filteredDetailedSubItems[subItem.name]?.length > 0;

                      return (
                        <div key={subItem.name}>
                          {hasNestedItems ? (
                            <>
                              <button
                                onClick={() => toggleNestedDropdown(item.name, subItem.name)}
                                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                                  pathname.startsWith(subItem.href)
                                    ? 'bg-blue-600/10 text-white'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <span className="flex-1 text-left">{subItem.name}</span>
                                <svg
                                  className={`h-4 w-4 transform transition-transform ${
                                    openDropdowns[`${item.name}-${subItem.name}`] ? 'rotate-90' : ''
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>

                              {openDropdowns[`${item.name}-${subItem.name}`] && (
                                <div className="ml-2 mt-1 pl-3 space-y-1 border-l border-white/10">
                                  {filteredDetailedSubItems[subItem.name]?.map((nestedItem) => (
                                    <Link
                                      key={nestedItem.name}
                                      to={nestedItem.href}
                                      className={`block px-3 py-2 text-xs rounded-md transition-all duration-200 ${
                                        pathname === nestedItem.href
                                          ? 'bg-blue-600/10 text-white font-medium'
                                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                                      }`}
                                    >
                                      {nestedItem.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <Link
                              to={subItem.href}
                              className={`block px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                                pathname === subItem.href
                                  ? 'bg-blue-600/10 text-white'
                                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : item.href ? (
              <Link
                to={item.href}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-600/20 text-white border-l-4 border-blue-500'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="mr-3 opacity-80">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}