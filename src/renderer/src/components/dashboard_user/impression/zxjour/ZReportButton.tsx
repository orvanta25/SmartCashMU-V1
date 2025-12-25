"use client";

import React from 'react';
import { generateZReport, ZReportProps } from './generateZReport';

interface ZReportButtonProps {
  disabled?: boolean;
  reportData: ZReportProps;
}

export const ZReportButton: React.FC<ZReportButtonProps> = ({ disabled, reportData }) => {
  const handlePrint = async () => {
    try {
      console.log('Données du Rapport Z:', reportData);

      // Validation moins stricte
      if (!reportData.totalsByPaymentType?.length) {
        alert('Aucune donnée à imprimer pour cette période.');
        return;
      }

      // Générer le PDF
      const zReportPdf = generateZReport(reportData);
      
      // Nom du fichier avec timestamp
      const timestamp = new Date().getTime();
      const fileName = `zrapport-${timestamp}.pdf`;

      // Sauvegarde directe
      zReportPdf.save(fileName);
      console.log('Impression du Rapport Z réussie');
    } catch (error) {
      console.error("Erreur lors de l'impression du Rapport Z:", error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={disabled}
      style={{
        padding: '10px 20px',
        backgroundColor: disabled ? '#000' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      Imprimer Rapport Z
    </button>
  );
};

export default ZReportButton;