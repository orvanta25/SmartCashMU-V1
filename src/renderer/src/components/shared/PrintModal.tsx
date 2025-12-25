// renderer/src/components/shared/PrintModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>; // Nouvelle prop
  title: string;
  type: 'pdf' | 'a4' | '80mm';
  dateDebut: string;
  heureDebut: string;
  dateFin: string;
  heureFin: string;
  caissier?: string;
  isClotureJour: boolean;
  isGenerating: boolean; // Nouvelle prop
  reportData?: any; // Optionnelle maintenant
  isLoading?: boolean;
  error?: string;
}

const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  onConfirm, // Nouvelle prop
  title,
  type,
  dateDebut,
  heureDebut,
  dateFin,
  heureFin,
  caissier = 'Caissier',
  isClotureJour,
  isGenerating, // Nouvelle prop
  reportData = null,
  isLoading = false,
  error = null
}) => {
  const [printStatus, setPrintStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setPrintStatus({ type: null, message: '' });
      await onConfirm();
      setPrintStatus({
        type: 'success',
        message: `Rapport ${type === '80mm' ? 'imprimé' : 'généré'} avec succès!`
      });
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        onClose();
        setPrintStatus({ type: null, message: '' });
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la génération:', err);
      setPrintStatus({
        type: 'error',
        message: 'Erreur lors de la génération du rapport'
      });
    }
  };

  const getTypeInfo = () => {
    switch (type) {
      case '80mm':
        return {
          label: 'Format 80mm (Ticket)',
          description: 'Impression directe sur imprimante ticket',
          icon: <Printer className="w-5 h-5 text-green-400" />,
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-700'
        };
      case 'a4':
        return {
          label: 'Format A4 (PDF détaillé)',
          description: 'PDF détaillé pour archivage',
          icon: <Download className="w-5 h-5 text-blue-400" />,
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-700'
        };
      case 'pdf':
        return {
          label: 'Format PDF (Téléchargement)',
          description: 'Document numérique à télécharger',
          icon: <Download className="w-5 h-5 text-red-400" />,
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-700'
        };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-300 text-center">Chargement des données du rapport...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-400 text-center font-semibold mb-2">Erreur</p>
              <p className="text-gray-300 text-center">{error}</p>
            </div>
          ) : (
            <>
              {/* Informations de période */}
              <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  {isClotureJour ? 'Période de clôture' : 'Période du rapport'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Date début</p>
                    <p className="text-white font-medium">{dateDebut}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Heure début</p>
                    <p className="text-white font-medium">{heureDebut}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date fin</p>
                    <p className="text-white font-medium">{dateFin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Heure fin</p>
                    <p className="text-white font-medium">{heureFin}</p>
                  </div>
                </div>
                
                {/* Informations du caissier */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Caissier</p>
                  <p className="text-white font-medium">{caissier}</p>
                </div>
                
                {/* Type de rapport */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Type de rapport</p>
                  <p className="text-white font-medium">
                    {isClotureJour ? 'Clôture de jour (Rapport Z)' : 'Rapport de caisse (Rapport X)'}
                  </p>
                </div>
              </div>

              {/* Format sélectionné */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Format sélectionné</h3>
                <div className={`p-4 rounded-xl border ${typeInfo.borderColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{typeInfo.label}</p>
                      <p className="text-gray-400 text-sm">{typeInfo.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statut de l'impression */}
              {printStatus.type && (
                <div className={`mb-4 p-3 rounded-xl border ${
                  printStatus.type === 'success' 
                    ? 'bg-green-900/30 border-green-700/50' 
                    : 'bg-red-900/30 border-red-700/50'
                }`}>
                  <div className="flex items-center gap-2">
                    {printStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`text-sm ${
                      printStatus.type === 'success' 
                        ? 'text-green-300' 
                        : 'text-red-300'
                    }`}>
                      {printStatus.message}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pied de page avec bouton de confirmation */}
        <div className="p-6 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={isGenerating}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                isGenerating 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : type === '80mm' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : type === 'a4' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Génération...
                </>
              ) : (
                <>
                  {type === '80mm' ? (
                    <Printer className="w-5 h-5" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  Générer le rapport
                </>
              )}
            </button>
          </div>
          
          <p className="text-gray-500 text-xs mt-3 text-center">
            {isGenerating 
              ? 'La génération du rapport peut prendre quelques secondes...' 
              : 'Cliquez sur "Générer le rapport" pour lancer la création du document.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;