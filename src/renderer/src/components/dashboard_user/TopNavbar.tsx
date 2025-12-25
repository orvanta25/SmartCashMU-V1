"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth/auth-context";
import DropDownNavbar from "./DropDownNavbar";
import { Shield, Clock, User, ChevronDown, Activity } from "lucide-react";

export default function TopNavbar() {
  const { user, entreprise, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [licenseInfo, setLicenseInfo] = useState<{
    type: string;
    activatedAt?: string;
    expiresAt?: string;
  } | null>(null);

  // ---------------------------
  // Close dropdown on outside click
  // ---------------------------
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ---------------------------
  // Fetch license info
  // ---------------------------
  useEffect(() => {
    async function fetchLicense() {
      try {
        const info = await window.electron.ipc.invoke(
          "activation:get-license-info"
        );
        setLicenseInfo(info);
      } catch (err) {
        console.error("Erreur récupération licence :", err);
      }
    }
    fetchLicense();
  }, []);

  // ---------------------------
  // License display helpers
  // ---------------------------
  function licenseColor() {
    if (!licenseInfo) 
      return "bg-gradient-to-r from-[#666666]/80 to-[#999999]/80 border-[#666666]/60";

    return licenseInfo.type === "lifetime"
      ? "bg-gradient-to-r from-[#00ff88]/80 to-[#00ccaa]/80 border-[#00ff88]/60"
      : "bg-gradient-to-r from-[#ffa500]/80 to-[#ff6b6b]/80 border-[#ffa500]/60";
  }

  const licenseMessage = !licenseInfo
    ? "LICENCE INCONNUE"
    : licenseInfo.type === "lifetime"
      ? "LICENCE À VIE"
      : "LICENCE ANNUELLE";

  // ---------------------------
  // User infos
  // ---------------------------
  const userInitial =
    user?.prenom?.[0]?.toUpperCase() || user?.nom?.[0]?.toUpperCase() || "U";

  const userName = user?.prenom || user?.nom || "Utilisateur";
  const userType =
    entreprise?.type === "FOURNISSEUR" ? "FOURNISSEUR" : "COMMERÇANT";

  return (
    <header className="sticky top-0 left-0 right-0 px-6 py-3 flex items-center justify-between bg-gradient-to-r from-[#0a0e17]/95 to-[#050811]/95 shadow-2xl shadow-[#00ffea]/5 border-b border-[#00ffea]/20 backdrop-blur-xl z-20">
      {/* ---------------------------------------------------
          PARTIE GAUCHE : Dashboard + Type utilisateur
      --------------------------------------------------- */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#00ffea] to-[#0099ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#00ffea]/30">
          <Activity className="w-5 h-5 text-white" />
        </div>

        <div>
          <div className="text-lg font-bold font-orbitron tracking-wider text-white">
            DASHBOARD 
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-gradient-to-r from-[#00ff88] to-[#00ccaa] rounded-full animate-pulse shadow-lg shadow-[#00ff88]/30"></div>
            <div className="text-xs text-[#00ffea]/70 font-orbitron tracking-wider">{userType}</div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------
          PARTIE DROITE : LICENCE + USER DROPDOWN
      --------------------------------------------------- */}
      <div className="flex items-center gap-4">
        {/* ---------------------------------------------------
            Badge Licence Cyber
        --------------------------------------------------- */}
        <div
          className={`px-4 py-2 rounded-lg border shadow-lg flex items-center gap-3 ${licenseColor()}`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-md flex items-center justify-center border border-white/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-orbitron tracking-wider">
              {licenseMessage}
            </span>

            {/* Date d'activation */}
            {licenseInfo?.activatedAt && (
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Clock className="w-3 h-3" />
                <span>
                  Activé le {new Date(licenseInfo.activatedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* date expiration si annuelle */}
            {licenseInfo?.type === "yearly" && licenseInfo?.expiresAt && (
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <div className="w-3 h-3 text-white/80">⏳</div>
                <span>
                  Expire le {new Date(licenseInfo.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          {/* Indicateur de statut */}
          {licenseInfo && (
            <div className="ml-2">
              <div className={`w-3 h-3 rounded-full border border-white/30 ${
                licenseInfo.type === "lifetime" 
                  ? "bg-gradient-to-r from-[#00ff88] to-[#00ccaa] animate-pulse" 
                  : "bg-gradient-to-r from-[#ffa500] to-[#ff6b6b]"
              }`}></div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------
            Dropdown utilisateur Cyber
        --------------------------------------------------- */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-3 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 transition-all duration-300 rounded-lg px-4 py-2 shadow-lg border border-[#00ffea]/30 hover:border-[#00ffea] backdrop-blur-sm group"
            onClick={() => setOpen((v) => !v)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ffea] to-[#0099ff] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#00ffea]/30 group-hover:scale-105 transition-transform duration-300">
              {userInitial}
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-white font-orbitron tracking-wider text-sm">
                {userName}
              </div>
              <div className="text-[#00ffea]/70 text-xs font-orbitron tracking-wider">{userType}</div>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-[#00ffea] transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <DropDownNavbar
              userInitial={userInitial}
              userName={userName}
              userType={userType}
              userEmail={user?.email}
              onClose={() => setOpen(false)}
              onLogout={logout}
            />
          )}
        </div>
      </div>
    </header>
  );
}