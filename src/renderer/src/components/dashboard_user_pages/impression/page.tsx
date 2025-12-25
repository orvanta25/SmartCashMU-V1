"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Download,
  Users,
  Archive,
  FileCheck,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import PrintModal from '../../shared/PrintModal';
import { useZReportData } from '@renderer/hooks/useZReportData';
import { generateZReportFromDashboardData, downloadZReportPDF, print80mmZReport } from '@renderer/components/dashboard_user_pages/impression/zjour/generateZReport';
import { createDefaultFicheControleData, downloadFicheControleCloture } from '@renderer/components/dashboard_user_pages/impression/zjour/generateFicheControleCloture';

export default function ImpressionPage() {
  const { entreprise, user } = useAuth();
  const { data: dashboardData, loading: isLoadingData, fetchReportData } = useZReportData();
  
  // États pour la Clôture de Jour
  const [clotureDateDebut, setClotureDateDebut] = useState('');
  const [clotureHeureDebut, setClotureHeureDebut] = useState('');
  const [clotureDateFin, setClotureDateFin] = useState('');
  const [clotureHeureFin, setClotureHeureFin] = useState('');
  const [clotureModal, setClotureModal] = useState<{isOpen: boolean; type: 'pdf' | 'a4' | '80mm'}>({
    isOpen: false,
    type: 'pdf'
  });

  // États pour le Rapport de Caisse
  const [rapportDateDebut, setRapportDateDebut] = useState('');
  const [rapportHeureDebut, setRapportHeureDebut] = useState('');
  const [rapportDateFin, setRapportDateFin] = useState('');
  const [rapportHeureFin, setRapportHeureFin] = useState('');
  const [selectedCaissier, setSelectedCaissier] = useState('');
  const [selectedCaissierId, setSelectedCaissierId] = useState('');
  const [rapportModal, setRapportModal] = useState<{isOpen: boolean; type: 'pdf' | 'a4' | '80mm'}>({
    isOpen: false,
    type: 'pdf'
  });

  // États pour la Fiche de Contrôle
  const [ficheControleDateDebut, setFicheControleDateDebut] = useState('');
  const [ficheControleHeureDebut, setFicheControleHeureDebut] = useState('');
  const [ficheControleDateFin, setFicheControleDateFin] = useState('');
  const [ficheControleHeureFin, setFicheControleHeureFin] = useState('');

  // État pour stocker les données converties pour le PDF
  const [zReportProps, setZReportProps] = useState<any>(null);
  // État pour l'impression en cours
  const [printing, setPrinting] = useState(false);

  // Récupérer les caissiers depuis les données du dashboard
  const caissiers = useMemo(() => {
    if (!dashboardData?.caissiersDetails) return [];
    
    return dashboardData.caissiersDetails.map(caissier => ({
      id: caissier.userId,
      prenom: caissier.nom.split(' ')[0] || '',
      nom: caissier.nom.split(' ').slice(1).join(' ') || '',
      fullName: caissier.nom
    }));
  }, [dashboardData?.caissiersDetails]);

  // Initialiser les dates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const heure = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');

    // Clôture de jour
    setClotureDateDebut(today);
    setClotureHeureDebut('00:00');
    setClotureDateFin(today);
    setClotureHeureFin(`${heure}:${minute}`);

    // Rapport de caisse
    setRapportDateDebut(today);
    setRapportHeureDebut('00:00');
    setRapportDateFin(today);
    setRapportHeureFin(`${heure}:${minute}`);

    // Fiche de contrôle
    setFicheControleDateDebut(today);
    setFicheControleHeureDebut('00:00');
    setFicheControleDateFin(today);
    setFicheControleHeureFin(`${heure}:${minute}`);
  }, []);

  // Charger les données au montage pour avoir la liste des caissiers
  useEffect(() => {
    const loadInitialData = async () => {
      if (entreprise?.id && user?.id && !dashboardData && !isLoadingData) {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const heure = now.getHours().toString().padStart(2, '0');
        const minute = now.getMinutes().toString().padStart(2, '0');
        
        try {
          console.log("Chargement des données initiales...");
          await fetchReportData(
            entreprise.id,
            user.id,
            today,
            '00:00',
            today,
            `${heure}:${minute}`,
            entreprise.denomination || 'Votre Restaurant',
            entreprise.region || entreprise.adresse || 'Votre Adresse',
            `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Caissier'
          );
        } catch (error) {
          console.error("Erreur lors du chargement initial:", error);
        }
      }
    };

    loadInitialData();
  }, [entreprise, user, dashboardData, isLoadingData, fetchReportData]);

  // Fonction pour convertir les données et générer le rapport
  const handleGenerateReport = async (type: 'pdf' | 'a4' | '80mm', isClotureJour: boolean = true) => {
    if (!dashboardData) {
      alert('Aucune donnée disponible. Veuillez d\'abord charger les données.');
      return;
    }

    setPrinting(true);
    try {
      const { data: zReportData } = await generateZReportFromDashboardData(dashboardData);
      setZReportProps(zReportData);
      
      switch (type) {
        case 'pdf':
        case 'a4':
          downloadZReportPDF(zReportData, 'a4');
          break;
        case '80mm':
          await print80mmZReport(zReportData);
          break;
      }
      
      alert('Rapport généré avec succès!');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport. Veuillez réessayer.');
    } finally {
      setPrinting(false);
    }
  };

  // Fonction pour charger les données réelles du rapport Z (Clôture de jour)
  const loadClotureJourData = async () => {
    try {
      if (!entreprise?.id || !user?.id) {
        alert('Entreprise ou utilisateur non connecté');
        return;
      }

      console.log('Chargement clôture jour - Période:', {
        dateDebut: clotureDateDebut,
        heureDebut: clotureHeureDebut,
        dateFin: clotureDateFin,
        heureFin: clotureHeureFin,
        caissier: 'Tous les caissiers'
      });

      await fetchReportData(
        entreprise.id,
        user.id,
        clotureDateDebut,
        clotureHeureDebut,
        clotureDateFin,
        clotureHeureFin,
        entreprise.denomination || 'Votre Restaurant',
        entreprise.region || entreprise.adresse || 'Votre Adresse',
        `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Caissier'
      );
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      alert('Erreur lors du chargement des données');
    }
  };

  // Fonction pour charger les données du rapport de caisse (un seul caissier)
  const loadRapportCaisseData = async () => {
    try {
      if (!entreprise?.id) {
        alert('Entreprise non connectée');
        return;
      }

      let caissierId = null;
      let caissierName = selectedCaissier;

      if (selectedCaissierId === "all") {
        caissierId = null; // null signifie tous les caissiers
        caissierName = "Tous les caissiers";
      } else if (selectedCaissierId === user?.id || selectedCaissierId === "") {
        caissierId = user?.id;
        caissierName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Caissier';
      } else {
        caissierId = selectedCaissierId;
        // Trouver le nom du caissier sélectionné
        const selected = caissiers.find(c => c.id === selectedCaissierId);
        if (selected) {
          caissierName = selected.fullName;
        }
      }

      console.log('Chargement rapport caisse - Période:', {
        dateDebut: rapportDateDebut,
        heureDebut: rapportHeureDebut,
        dateFin: rapportDateFin,
        heureFin: rapportHeureFin,
        caissierId,
        caissierName
      });

      await fetchReportData(
        entreprise.id,
        caissierId || user?.id || '', // Peut être null pour tous les caissiers
        rapportDateDebut,
        rapportHeureDebut,
        rapportDateFin,
        rapportHeureFin,
        entreprise.denomination || 'Votre Restaurant',
        entreprise.region || entreprise.adresse || 'Votre Adresse',
        caissierName,
        caissierId
      );
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      alert('Erreur lors du chargement des données');
    }
  };

  // Fonction pour charger les données pour la fiche de contrôle
  const loadFicheControleData = async () => {
    try {
      if (!entreprise?.id || !user?.id) {
        alert('Entreprise ou utilisateur non connecté');
        return;
      }

      console.log('Chargement fiche contrôle - Période:', {
        dateDebut: ficheControleDateDebut,
        heureDebut: ficheControleHeureDebut,
        dateFin: ficheControleDateFin,
        heureFin: ficheControleHeureFin
      });

      await fetchReportData(
        entreprise.id,
        user.id,
        ficheControleDateDebut,
        ficheControleHeureDebut,
        ficheControleDateFin,
        ficheControleHeureFin,
        entreprise.denomination || 'Votre Restaurant',
        entreprise.region || entreprise.adresse || 'Votre Adresse',
        `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Caissier'
      );
    } catch (error) {
      console.error('Erreur lors du chargement des données pour la fiche de contrôle:', error);
      alert('Erreur lors du chargement des données pour la fiche de contrôle');
    }
  };

  // Fonctions pour la Clôture de Jour
  const openClotureModal = async (type: 'pdf' | 'a4' | '80mm') => {
    console.log('Ouverture modal clôture avec type:', type);
    await loadClotureJourData();
    setClotureModal({ isOpen: true, type });
  };

  const handleClotureGenerate = async () => {
    await handleGenerateReport(clotureModal.type, true);
    setClotureModal({ isOpen: false, type: 'pdf' });
  };

  // Fonctions pour le Rapport de Caisse
  const openRapportModal = async (type: 'pdf' | 'a4' | '80mm') => {
    console.log('Ouverture modal rapport avec type:', type, 'caissier:', selectedCaissierId);
    await loadRapportCaisseData();
    setRapportModal({ isOpen: true, type });
  };

  const handleRapportGenerate = async () => {
    await handleGenerateReport(rapportModal.type, false);
    setRapportModal({ isOpen: false, type: 'pdf' });
  };

  // Fonction pour générer directement la fiche de contrôle
  const handleGenerateFicheControle = async () => {
    // D'abord charger les données avec les dates spécifiées
    await loadFicheControleData();
    
    if (!dashboardData) {
      alert('Aucune donnée disponible. Veuillez d\'abord charger les données du rapport Z.');
      return;
    }

    setPrinting(true);
    try {
      // Convertir les données du dashboard en format pour le PDF
      const { data: zReportData } = await generateZReportFromDashboardData(dashboardData);
      
      // Créer les données par défaut pour la fiche de contrôle
      const defaultFicheData = createDefaultFicheControleData(zReportData);
      
      // Générer et télécharger directement la fiche de contrôle
      downloadFicheControleCloture(defaultFicheData);
      
      alert('Fiche de contrôle générée avec succès!');
    } catch (error) {
      console.error('Erreur lors de la génération de la fiche de contrôle:', error);
      alert('Erreur lors de la génération de la fiche de contrôle.');
    } finally {
      setPrinting(false);
    }
  };

  // Rendu du composant
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Impression des Rapports</h1>
          <p className="text-gray-400">
            {entreprise?.denomination || 'Votre Entreprise'} - Générez vos rapports quotidiens
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SECTION 1 : CLÔTURE DE JOUR */}
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Générer une clôture de jour</h2>
                <p className="text-gray-400 text-sm">Rapport Z complet de la journée (tous les caissiers)</p>
              </div>
            </div>

            {/* Formulaire */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Début
                    </div>
                  </label>
                  <input
                    type="date"
                    value={clotureDateDebut}
                    onChange={(e) => setClotureDateDebut(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Heure Début
                    </div>
                  </label>
                  <input
                    type="time"
                    value={clotureHeureDebut}
                    onChange={(e) => setClotureHeureDebut(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Fin
                    </div>
                  </label>
                  <input
                    type="date"
                    value={clotureDateFin}
                    onChange={(e) => setClotureDateFin(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Heure Fin
                    </div>
                  </label>
                  <input
                    type="time"
                    value={clotureHeureFin}
                    onChange={(e) => setClotureHeureFin(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'impression */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => openClotureModal('pdf')}
                disabled={isLoadingData || printing}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-600/20 hover:to-red-700/20 border border-red-500/30 rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-3 bg-red-500/20 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                  {isLoadingData || printing ? (
                    <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Download className="w-8 h-8 text-red-400" />
                  )}
                </div>
                <span className="font-bold text-white text-lg mb-1">PDF</span>
                <p className="text-gray-400 text-sm text-center">Document numérique</p>
              </button>

              <button
                onClick={() => openClotureModal('a4')}
                disabled={isLoadingData || printing}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-600/20 hover:to-blue-700/20 border border-blue-500/30 rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-3 bg-blue-500/20 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                  {isLoadingData || printing ? (
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FileSpreadsheet className="w-8 h-8 text-blue-400" />
                  )}
                </div>
                <span className="font-bold text-white text-lg mb-1">A4</span>
                <p className="text-gray-400 text-sm text-center">Format standard</p>
              </button>

              <button
                onClick={() => openClotureModal('80mm')}
                disabled={isLoadingData || printing}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 hover:from-green-600/20 hover:to-green-700/20 border border-green-500/30 rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-3 bg-green-500/20 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                  {isLoadingData || printing ? (
                    <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Printer className="w-8 h-8 text-green-400" />
                  )}
                </div>
                <span className="font-bold text-white text-lg mb-1">80mm</span>
                <p className="text-gray-400 text-sm text-center">Ticket caisse POS</p>
              </button>
            </div>
          </div>

          {/* SECTION 2 : RAPPORT DE CAISSE DÉTAILLÉ */}
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Générer un rapport de caisse détaillé</h2>
                <p className="text-gray-400 text-sm">Par caissier et période</p>
              </div>
            </div>

            {/* Formulaire */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Début
                    </div>
                  </label>
                  <input
                    type="date"
                    value={rapportDateDebut}
                    onChange={(e) => setRapportDateDebut(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Heure Début
                    </div>
                  </label>
                  <input
                    type="time"
                    value={rapportHeureDebut}
                    onChange={(e) => setRapportHeureDebut(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Fin
                    </div>
                  </label>
                  <input
                    type="date"
                    value={rapportDateFin}
                    onChange={(e) => setRapportDateFin(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Heure Fin
                    </div>
                  </label>
                  <input
                    type="time"
                    value={rapportHeureFin}
                    onChange={(e) => setRapportHeureFin(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Sélection du caissier */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Caissier
                  </div>
                </label>
                <select
                  value={selectedCaissierId}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setSelectedCaissierId(selected);
                    
                    if (selected === "all") {
                      setSelectedCaissier("Tous les caissiers");
                    } else if (selected === user?.id) {
                      setSelectedCaissier(`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Moi-même');
                    } else {
                      const caissier = caissiers.find(c => c.id === selected);
                      setSelectedCaissier(caissier ? caissier.fullName : '');
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="">Sélectionner un caissier</option>
                  <option value="all">Tous les caissiers</option>
                  <option value={user?.id}>
                    {`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Moi-même'}
                  </option>
                  {caissiers
                    .filter(caissier => caissier.id !== user?.id)
                    .map(caissier => (
                      <option key={caissier.id} value={caissier.id}>
                        {caissier.fullName}
                      </option>
                    ))}
                </select>
                <p className="text-gray-400 text-xs mt-1">
                  {selectedCaissier ? `Sélectionné: ${selectedCaissier}` : 'Sélectionnez un caissier'}
                </p>
              </div>
            </div>

            {/* Boutons d'impression */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => openRapportModal('pdf')}
                disabled={isLoadingData || printing}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-600/20 hover:to-red-700/20 border border-red-500/30 rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-3 bg-red-500/20 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                  {isLoadingData || printing ? (
                    <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Download className="w-8 h-8 text-red-400" />
                  )}
                </div>
                <span className="font-bold text-white text-lg mb-1">PDF</span>
                <p className="text-gray-400 text-sm text-center">Document numérique</p>
              </button>

              <button
                onClick={() => openRapportModal('a4')}
                disabled={isLoadingData || printing}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-600/20 hover:to-blue-700/20 border border-blue-500/30 rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-3 bg-blue-500/20 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                  {isLoadingData || printing ? (
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FileSpreadsheet className="w-8 h-8 text-blue-400" />
                  )}
                </div>
                <span className="font-bold text-white text-lg mb-1">A4</span>
                <p className="text-gray-400 text-sm text-center">Format standard</p>
              </button>

              <button
                onClick={() => openRapportModal('80mm')}
                disabled={isLoadingData || printing}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 hover:from-green-600/20 hover:to-green-700/20 border border-green-500/30 rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-3 bg-green-500/20 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                  {isLoadingData || printing ? (
                    <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Printer className="w-8 h-8 text-green-400" />
                  )}
                </div>
                <span className="font-bold text-white text-lg mb-1">80mm</span>
                <p className="text-gray-400 text-sm text-center">Ticket caisse POS</p>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3 : FICHE DE CONTRÔLE DE CLÔTURE */}
        <div className="mt-8 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Fiche de contrôle de clôture</h2>
              <p className="text-gray-400 text-sm">Formulaire pour vérifier les encaissements réels vs. le rapport Z, avec comptage détaillé des espèces</p>
            </div>
          </div>

          {/* Formulaire pour la fiche de contrôle */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Début
                  </div>
                </label>
                <input
                  type="date"
                  value={ficheControleDateDebut}
                  onChange={(e) => setFicheControleDateDebut(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Heure Début
                  </div>
                </label>
                <input
                  type="time"
                  value={ficheControleHeureDebut}
                  onChange={(e) => setFicheControleHeureDebut(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Fin
                  </div>
                </label>
                <input
                  type="date"
                  value={ficheControleDateFin}
                  onChange={(e) => setFicheControleDateFin(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Heure Fin
                  </div>
                </label>
                <input
                  type="time"
                  value={ficheControleHeureFin}
                  onChange={(e) => setFicheControleHeureFin(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center mb-8">
              <p className="text-gray-300 mb-4">
                Générez une fiche de contrôle pour comparer les montants théoriques du rapport Z avec les sommes réellement trouvées en caisse.
              </p>
              <p className="text-gray-400 text-sm">
                Cette fiche inclut le détail par fournisseur de tickets restaurant, le comptage des espèces par dénomination, et les zones de signature.
              </p>
            </div>
            
            <button
              onClick={handleGenerateFicheControle}
              disabled={isLoadingData || printing}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingData || printing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FileCheck className="w-6 h-6" />
              )}
              <span className="text-lg">Générer la fiche de contrôle PDF</span>
            </button>
            
            <div className="mt-6 text-gray-400 text-sm text-center">
              <p>La fiche sera pré-remplie avec les données du rapport Z pour la période spécifiée et téléchargée directement.</p>
            </div>
          </div>
        </div>

        {/* Modal pour clôture de jour */}
        {dashboardData && (
          <PrintModal
            isOpen={clotureModal.isOpen}
            onClose={() => setClotureModal({ isOpen: false, type: 'pdf' })}
            onConfirm={handleClotureGenerate}
            title="Générer la clôture de jour"
            type={clotureModal.type}
            dateDebut={clotureDateDebut}
            heureDebut={clotureHeureDebut}
            dateFin={clotureDateFin}
            heureFin={clotureHeureFin}
            caissier={`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Caissier'}
            isClotureJour={true}
            isGenerating={printing}
          />
        )}

        {/* Modal pour rapport de caisse */}
        {dashboardData && (
          <PrintModal
            isOpen={rapportModal.isOpen}
            onClose={() => setRapportModal({ isOpen: false, type: 'pdf' })}
            onConfirm={handleRapportGenerate}
            title="Générer un rapport de caisse détaillé"
            type={rapportModal.type}
            dateDebut={rapportDateDebut}
            heureDebut={rapportHeureDebut}
            dateFin={rapportDateFin}
            heureFin={rapportHeureFin}
            caissier={selectedCaissier || `${user?.prenom || ''} ${user?.nom || ''}`.trim()}
            isClotureJour={false}
            isGenerating={printing}
          />
        )}
      </div>
    </div>
  );
}