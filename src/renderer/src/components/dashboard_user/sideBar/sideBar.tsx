'use client';

import { useState } from 'react';
import { useAuth } from '../../../components/auth/auth-context';
import { NavigationBar } from '../navigation/NavigationBar';
import { SidebarBanner } from './sideBarBanner';
import { Link } from "react-router-dom";
import { Menu, X, Home, User, Settings } from 'lucide-react';

export function SideBar() {
  const { entreprise } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Bouton menu hamburger - Positionné en haut à gauche */}
      <button
  onClick={toggleSidebar}
  className="
    fixed
    left-4
    top-1/2
    -translate-y-1/2
    z-50
    p-3
    rounded-lg
    bg-gradient-to-br from-[#00ffea] to-[#0099ff]
    text-black
    backdrop-blur-xl
    border border-[#00ffea]/60
    shadow-lg shadow-[#00ffea]/30
    flex
    flex-col
    items-center
    justify-center
    hover:from-[#00ffea] hover:to-[#0099ff]
    hover:shadow-[#00ffea]/50
    hover:scale-105
    transition-all duration-300
    w-16 h-16
    cursor-pointer
    font-orbitron
  "
  aria-label={isOpen ? "Fermer la sidebar" : "Ouvrir la sidebar"}
>
  {isOpen ? (
    <X className="w-5 h-5 text-black" />
  ) : (
    <>
      <Menu className="w-4 h-4 mb-1" />
      <div className="text-center leading-tight text-xs font-bold tracking-tight">
        <div>BARRE</div>
        <div>LATÉRALE</div>
      </div>
    </>
  )}
</button>

      {/* Logo cyber lorsque la sidebar est fermée */}
      

      {/* Overlay pour fermer la sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar cyber - TOUJOURS masquée par défaut */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64
          bg-gradient-to-br from-[#0a0e17] to-[#050811] 
          backdrop-blur-xl border-r border-[#00ffea]/20 
          shadow-2xl shadow-[#00ffea]/5 z-50 
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Bouton fermer dans la sidebar */}
        {isOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 p-1 text-[#00ffea] hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-5 space-y-6 flex-shrink-0 border-b border-[#00ffea]/10">
          {/* Logo cyber */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffea] to-[#0099ff] blur-xl opacity-20 rounded-full"></div>
              <Link to="/pos" className="relative block">
                <h1 className="text-2xl font-orbitron font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00ffea] to-[#0099ff] tracking-widest animate-pulse-slow">
                  SMART CASH
                </h1>
                <div className="h-1 w-full mt-1 bg-gradient-to-r from-[#00ffea] to-[#0099ff] rounded-full"></div>
              </Link>
            </div>
          </div>

          {/* Informations utilisateur */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 border border-[#00ffea]/30 flex items-center justify-center">
                <User className="w-5 h-5 text-[#00ffea]" />
              </div>
              <div>
                <h2 className="text-sm font-orbitron tracking-wider text-white">MON ESPACE</h2>
                {entreprise && (
                  <div className="text-xs text-[#00ffea]/70 mt-1">
                    <p className="text-white">{entreprise.prenom} {entreprise.nom}</p>
                    <p className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                      entreprise.type === 'FOURNISSEUR' 
                        ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' 
                        : 'bg-[#00ffea]/10 text-[#00ffea] border border-[#00ffea]/20'
                    }`}>
                      {entreprise.type === 'FOURNISSEUR' ? 'FOURNISSEUR' : 'COMMERÇANT'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Indicateur de connexion */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-[#00ff88] to-[#00ccaa] rounded-full animate-pulse shadow-lg shadow-[#00ff88]/30"></div>
              <span className="text-xs text-[#00ffea]/50 font-orbitron tracking-wider">SYSTÈME CONNECTÉ</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00ffea]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#00ffea]/30 py-4">
          <NavigationBar />
        </div>

        {/* Bannière cyber */}
        <div className="p-4 border-t border-[#00ffea]/10">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#0a0e17] to-[#050811] border border-[#00ffea]/20 p-3">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ffea]/5 to-transparent"></div>
            <div className="relative">
              <SidebarBanner />
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link 
              to="/settings" 
              className="p-2 bg-[#0a0e17]/50 rounded-lg border border-[#00ffea]/10 hover:border-[#00ffea]/30 hover:bg-[#00ffea]/5 transition-all duration-200 flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 text-[#00ffea]" />
            </Link>
            <Link 
              to="/pos" 
              className="p-2 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 rounded-lg border border-[#00ffea]/20 hover:border-[#00ffea] hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 transition-all duration-200 flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <Home className="w-4 h-4 text-[#00ffea]" />
            </Link>
          </div>

          {/* Footer cyber */}
          <div className="mt-4 text-center">
            <div className="text-[10px] text-[#00ffea]/30 font-orbitron tracking-widest">
              SMART CASH POS v1.0
            </div>
            <div className="h-px w-full my-2 bg-gradient-to-r from-transparent via-[#00ffea]/30 to-transparent"></div>
            <div className="text-[8px] text-white/20">
              © {new Date().getFullYear()} SMART CASH
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}