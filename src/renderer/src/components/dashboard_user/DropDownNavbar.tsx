'use client'

import { Link } from "react-router-dom"

interface DropDownNavbarProps {
  userInitial: string
  userName: string
  userType: string
  userEmail?: string
  onClose: () => void
  onLogout: () => void
}

export default function DropDownNavbar({
  userInitial,
  userName,
  userType,
  userEmail,
  onClose,
  onLogout
}: DropDownNavbarProps) {
  return (
    <>
      {/* Overlay avec effet cyber */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
        onClick={onClose} 
      />
      
      {/* Dropdown content cyber */}
      <div 
        className="fixed right-4 top-16 w-72 bg-gradient-to-br from-[#0a0e17] to-[#050811] backdrop-blur-xl rounded-xl shadow-2xl shadow-[#00ffea]/10 border border-[#00ffea]/30 py-2 animate-cyber-dropdown z-[9999]"
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform, opacity'
        }}
      >
        {/* User Info Header cyber */}
        <div className="px-4 py-4 border-b border-[#00ffea]/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00ffea] to-[#0099ff] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#00ffea]/30">
              {userInitial}
            </div>
            <div className="flex-1">
              <div className="text-white font-orbitron tracking-wider text-sm">{userName}</div>
              <div className="text-[#00ffea] text-xs font-mono mt-1">{userType}</div>
              <div className="text-[#00ffea]/70 text-xs font-mono mt-1 truncate max-w-[180px]">{userEmail}</div>
            </div>
          </div>
          
          {/* Indicateur de statut */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 bg-gradient-to-r from-[#00ff88] to-[#00ccaa] rounded-full animate-pulse shadow-lg shadow-[#00ff88]/30"></div>
            <span className="text-xs text-[#00ffea]/50 font-orbitron tracking-wider">SESSION ACTIVE</span>
          </div>
        </div>

        {/* Menu Items cyber */}
        <div className="py-2">
          <Link
            to="/dashboard_user/profile"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#00ffea]/5 transition-all duration-200 group"
            onClick={onClose}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffea]/10 to-[#0099ff]/10 border border-[#00ffea]/20 group-hover:from-[#00ffea]/20 group-hover:to-[#0099ff]/20 group-hover:border-[#00ffea]/40 flex items-center justify-center transition-all duration-300">
              <svg className="w-4 h-4 text-[#00ffea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium font-orbitron tracking-wide">MON PROFIL</div>
              <div className="text-xs text-[#00ffea]/70">Gérer vos informations</div>
            </div>
            <div className="text-[#00ffea]/30 group-hover:text-[#00ffea] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/dashboard_user/settings"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#00ffea]/5 transition-all duration-200 group"
            onClick={onClose}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffea]/10 to-[#0099ff]/10 border border-[#00ffea]/20 group-hover:from-[#00ffea]/20 group-hover:to-[#0099ff]/20 group-hover:border-[#00ffea]/40 flex items-center justify-center transition-all duration-300">
              <svg className="w-4 h-4 text-[#00ffea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium font-orbitron tracking-wide">PARAMÈTRES</div>
              <div className="text-xs text-[#00ffea]/70">Configuration du compte</div>
            </div>
            <div className="text-[#00ffea]/30 group-hover:text-[#00ffea] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <div className="border-t border-[#00ffea]/10 mt-2 pt-2">
            <button
              onClick={() => {
                onClose()
                onLogout()
              }}
              className="flex items-center gap-3 px-4 py-3 text-[#ff416c] hover:bg-[#ff416c]/10 transition-all duration-200 group w-full"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff416c]/10 to-[#ff6b9d]/10 border border-[#ff416c]/20 group-hover:from-[#ff416c]/20 group-hover:to-[#ff6b9d]/20 group-hover:border-[#ff416c]/40 flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4 text-[#ff416c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium font-orbitron tracking-wide">SE DÉCONNECTER</div>
                <div className="text-xs text-[#ff416c]/70">Fermer la session</div>
              </div>
              <div className="text-[#ff416c]/30 group-hover:text-[#ff416c] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cyber-dropdown {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-cyber-dropdown {
          animation: cyber-dropdown 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </>
  )
}