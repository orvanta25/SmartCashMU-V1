"use client";

import { useState, useEffect } from "react";
import { X, Shield, Zap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { firstLogin } from "../api/auth";
import { redirectRole } from "@renderer/hooks/roleHelper";
import LogoDev from "@renderer/assets/LogoDev.png";
import LogoSM from "@renderer/assets/logoSM.png";

import QRGenerator from './qrCodeGenerator'


export default function LoginScreen() {
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleNumberClick = (num: string) => {
    setError("");
    const firstEmptyIndex = pin.findIndex((digit) => digit === "");
    if (firstEmptyIndex !== -1) {
      const newPin = [...pin];
      newPin[firstEmptyIndex] = num;
      setPin(newPin);
    }
  };

  const handleDelete = () => {
    setError("");
    const lastFilledIndex = pin
      .slice()
      .reverse()
      .findIndex((digit) => digit !== "");
    if (lastFilledIndex !== -1) {
      const newPin = [...pin];
      newPin[pin.length - 1 - lastFilledIndex] = "";
      setPin(newPin);
    }
  };

  const handleSubmit = async () => {
    const enteredPin = pin.join("");
    if (enteredPin.length !== 4) return;

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await firstLogin({ pin: enteredPin });
      console.log(response);

      if (response.user) {
        setSuccess(true);
        setTimeout(() => {
          redirectRole(response.user.role, navigate);
        }, 1500);
      } else {
        // Affiche toujours une erreur si pas de user
        setError(response.error || "PIN incorrect");
      }
    } catch (err: any) {
      setError(err?.message || "PIN incorrect");
    } finally {
      setIsLoading(false);
      setPin(["", "", "", ""]);
    }
  };

  // 🔹 Vérification automatique dès que 4 chiffres sont saisis
  useEffect(() => {
    if (pin.every((d) => d !== "")) {
      handleSubmit();
    }
  }, [pin]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-white overflow-hidden relative"
     style={{
       background: 'radial-gradient(circle at center, #0a0e17 0%, #050811 100%)',
       position: 'relative'
     }}>
  
  {/* Effets cyber futuristes */}
  <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
    {/* Grille cyber */}
    <div className="absolute top-0 left-0 w-full h-full"
         style={{
           backgroundImage: `
             linear-gradient(rgba(0, 255, 234, 0.1) 1px, transparent 1px),
             linear-gradient(90deg, rgba(0, 255, 234, 0.1) 1px, transparent 1px)
           `,
           backgroundSize: '50px 50px',
           animation: 'gridMove 20s linear infinite'
         }}></div>
    
    {/* Scan laser */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ffea] to-transparent shadow-[0_0_10px_#00ffea]"
         style={{ animation: 'scan 4s linear infinite' }}></div>
    
    {/* Effet hologramme */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.03]"
         style={{
           background: 'conic-gradient(from 0deg, #00ffea, #7c3aed, #00ffea)',
           animation: 'rotate 30s linear infinite'
         }}></div>

    {/* Cercles colorés existants adaptés au thème cyber */}
    <div className="absolute -top-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
  </div>

  {/* Styles d'animation */}
  <style>{`
    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }
    @keyframes scan {
      0% { top: 0%; }
      100% { top: 100%; }
    }
    @keyframes rotate {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
  `}</style>

  {/* Bandeau défilant en haut */}
  <div className="absolute top-2 left-0 w-full z-30 bg-transparent text-white py-2 overflow-hidden shadow-lg">
    <div className="flex animate-marquee-left whitespace-nowrap">
      {/* DUPLICATION pour un défilement continu */}
      <div className="flex items-center space-x-8 px-4">
        <span className="font-medium text-sm sm:text-base">
          Adresse : Immeuble La Golf Center 2, 2ème étage, Bureau N°6 – La
          Soukra, Ariana
        </span>
        <span className="font-medium text-sm sm:text-base">|</span>
        <span className="font-medium text-sm sm:text-base">
          Nouveauté : Découvrez notre logiciel <strong>SmartCash</strong>{" "}
          pour commerçants
        </span>
        <span className="font-medium text-sm sm:text-base">|</span>
        <span className="font-medium text-sm sm:text-base">
          Contact : contact@growthtech.tech | Service Client WhatsApp : +216
          92 538 638
        </span>
      </div>

      {/* DUPLICATION EXACTE pour boucle continue */}
      <div className="flex items-center space-x-8 px-4">
        <span className="font-medium text-sm sm:text-base">
          Adresse : Immeuble La Golf Center 2, 2ème étage, Bureau N°6 – La
          Soukra, Ariana
        </span>
        <span className="font-medium text-sm sm:text-base">|</span>
        <span className="font-medium text-sm sm:text-base">
          Nouveauté : Découvrez notre logiciel <strong>SmartCash</strong>{" "}
          pour commerçants
        </span>
        <span className="font-medium text-sm sm:text-base">|</span>
        <span className="font-medium text-sm sm:text-base">
          Contact : contact@growthtech.tech | Service Client WhatsApp : +216
          92 538 638
        </span>
      </div>
    </div>
  </div>

  {/* En-tête avec logo DevFlow */}
  <div className="absolute top-7 left-0 z-20 p-4 sm:p-6 flex items-center">
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-transparent flex items-center justify-center shadow-lg overflow-hidden">
        <img
          src={LogoDev}
          width={40}
          height={40}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  </div>

  {/* Pied de page */}
  <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-center text-xs sm:text-sm text-cyan-400">
    © {new Date().getFullYear()} Développé par{" "}
    <a
      href="https://devflow.software/"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-white transition-colors"
    >
      DevFlow
    </a>
    . Tous droits réservés.
  </div>

  {/* Partie gauche - Branding */}
  <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10 pt-16 pb-20 lg:pt-12 lg:pb-12">
    <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
        <div className="relative mb-8">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-pulse-slow">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-white to-gray-200 flex items-center justify-center shadow-inner overflow-hidden">
              <img
                src={LogoSM}
                alt="DevFlow Logo"
                width={64}
                height={64}
                className="w-5/6 h-5/6 object-cover"
              />
            </div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 text-cyan-400 w-6 h-6 sm:w-8 sm:h-8 animate-ping" />
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
          Smart Cash
        </h1>
        <p className="text-lg text-cyan-200 mb-8 max-w-md">
          La caisse intelligente : rapidité, contrôle, simplicité
        </p>
      </div>
    </div>
  </div>

  {/* Partie droite - Formulaire PIN */}
  <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10 pt-10 pb-20 lg:pt-12 lg:pb-12">
    <div className="w-full max-w-md">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/10 p-6 sm:p-8 flex flex-col gap-4">
        <div className="flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-cyan-400 mr-2" />
          <h2 className="text-2xl font-semibold">Accès Sécurisé</h2>
        </div>
        <p className="text-sm text-cyan-200 text-center mb-8">
          Veuillez saisir votre code PIN
        </p>

        {/* PIN display */}
        <div className="flex justify-center gap-3 sm:gap-5 mb-8 relative">
          {pin.map((digit, index) => (
            <div
              key={index}
              className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-400/10 to-cyan-600/5 border border-cyan-400/30 flex items-center justify-center relative overflow-hidden group transition-all duration-300"
              style={{
                transform: digit ? "scale(1.08)" : "none",
                boxShadow: digit
                  ? "0 0 15px rgba(0, 255, 234, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.1)"
                  : "inset 0 1px 3px rgba(255, 255, 255, 0.05)",
              }}
            >
              {digit && (
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-md shadow-cyan-400/40"></div>
              )}
              {pin.join("").length === index && (
                <div className="absolute inset-0 border border-cyan-400 rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>

        {/* Message d'état */}
        {error && (
          <div className="text-center text-sm text-red-400 mb-4 bg-red-400/10 py-2 px-4 rounded-xl border border-red-400/20">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"></div>
              <span className="text-sm">Vérification...</span>
            </div>
          </div>
        )}
        {success && (
          <div className="text-center text-sm text-green-400 mb-4 bg-green-400/10 py-2 px-4 rounded-xl border border-green-400/20 animate-pulse">
            Connexion réussie!
          </div>
        )}

        {/* Pavé numérique */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-14 sm:h-16 rounded-xl bg-gradient-to-b from-cyan-400 to-cyan-600 border border-cyan-300/30 shadow-lg active:scale-95 text-lg font-bold text-white transition-all duration-150 hover:from-cyan-500 hover:to-cyan-700 hover:translate-y-0.5 hover:shadow-xl relative group overflow-hidden"
            >
              {num}
            </button>
          ))}
          <div className="h-14 sm:h-16 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-cyan-400 opacity-70" />
          </div>
          <button
            onClick={() => handleNumberClick("0")}
            className="h-14 sm:h-16 rounded-xl bg-gradient-to-b from-cyan-400 to-cyan-600 border border-cyan-300/30 shadow-lg active:scale-95 text-lg font-bold text-white transition-all duration-150 hover:from-cyan-500 hover:to-cyan-700 hover:translate-y-0.5 hover:shadow-xl relative group overflow-hidden"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 sm:h-16 rounded-xl bg-gradient-to-b from-red-500 to-red-700 shadow-lg active:scale-95 flex items-center justify-center text-white transition-all duration-150 hover:from-red-600 hover:to-red-800 hover:translate-y-0.5 hover:shadow-xl relative group overflow-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
  <QRGenerator />
</div>
  );
}
