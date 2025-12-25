'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../../components/auth/auth-context';
import { useNavigate } from 'react-router-dom';
import { updateEntrepriseType } from '@renderer/api/entreprise';
import { EntrepriseType, UpdateTypeDto } from '@renderer/types/auth';

export default function BusinessTypePage() {
  const router = useNavigate();
  const { entreprise, setEntreprise, loading } = useAuth();
  const [type, setType] = useState<EntrepriseType>(entreprise?.type as EntrepriseType ?? EntrepriseType.COMMERCANT);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (type === entreprise?.type) {
      router('/dashboard_user/profile');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: UpdateTypeDto = { type };
      const updatedEntreprise = await updateEntrepriseType(payload);
      setEntreprise(updatedEntreprise);
      router('/dashboard_user/profile');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour du type');
      console.error('Type update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center max-w-md mx-auto">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-purple-600/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-white/90 mb-3">Chargement en cours</h3>
          <p className="text-white/60">Préparation de votre espace professionnel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl">
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-purple-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Type d'Entreprise</h1>
                  <p className="text-white/60 mt-1">Définissez votre modèle d'activité commercial</p>
                </div>
              </div>
              <button
                onClick={() => router('/dashboard_user/profile')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour au Profil
              </button>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 p-6 border-b border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-2">Important à savoir</h3>
                <p className="text-white/60 leading-relaxed">
                  Le choix de votre type d'entreprise détermine les fonctionnalités disponibles, les packs d'abonnement
                  accessibles et l'interface de votre tableau de bord.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 justify-center">
                <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 12h-12m0 0l-4 4m4-4l-4-4"
                    />
                  </svg>
                </div>
                Choisissez votre Type d'Entreprise
              </h2>
              <p className="text-white/60 mt-2">
                Sélectionnez le modèle qui correspond le mieux à votre activité commerciale
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-red-300 font-semibold mb-1">Erreur de mise à jour</h4>
                    <p className="text-red-200/80 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fournisseur Option */}
                <label
                  className={`relative block p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                    type === EntrepriseType.FOURNISSEUR
                      ? 'bg-white/10 border border-purple-500/50 shadow-2xl shadow-purple-500/20'
                      : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={EntrepriseType.FOURNISSEUR}
                    checked={type === EntrepriseType.FOURNISSEUR}
                    onChange={(e) => setType(e.target.value as EntrepriseType)}
                    className="sr-only"
                  />
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          type === EntrepriseType.FOURNISSEUR
                            ? 'bg-purple-500/20 border border-purple-500/50'
                            : 'bg-white/10 border border-white/20'
                        }`}
                      >
                        <svg
                          className={`w-8 h-8 ${
                            type === EntrepriseType.FOURNISSEUR ? 'text-purple-300' : 'text-white/60'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      {type === EntrepriseType.FOURNISSEUR && (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">Fournisseur</h3>
                      <p className="text-white/60 text-sm leading-relaxed mb-4">
                        Vendez vos produits aux commerçants et gérez votre catalogue de produits avec des outils
                        professionnels.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Fonctionnalités incluses :
                      </p>
                      <ul className="space-y-2">
                        {[
                          'Gestion complète du catalogue produits',
                          'Suivi des commandes clients en temps réel',
                          'Rapports de vente détaillés et analytics',
                          'Gestion des stocks et approvisionnements',
                          'Interface de communication avec les commerçants',
                        ].map((feature, index) => (
                          <li key={`fournisseur-${index}`} className="flex items-start gap-3 text-sm text-white/60">
                            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </label>

                {/* Commerçant Option */}
                <label
                  className={`relative block p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                    type === EntrepriseType.COMMERCANT
                      ? 'bg-white/10 border border-blue-500/50 shadow-2xl shadow-blue-500/20'
                      : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={EntrepriseType.COMMERCANT}
                    checked={type === EntrepriseType.COMMERCANT}
                    onChange={(e) => setType(e.target.value as EntrepriseType)}
                    className="sr-only"
                  />
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          type === EntrepriseType.COMMERCANT
                            ? 'bg-blue-500/20 border border-blue-500/50'
                            : 'bg-white/10 border border-white/20'
                        }`}
                      >
                        <svg
                          className={`w-8 h-8 ${
                            type === EntrepriseType.COMMERCANT ? 'text-blue-300' : 'text-white/60'
                          }`}
                          fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8"
                          />
                        </svg>
                      </div>
                      {type === EntrepriseType.COMMERCANT && (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">Commerçant</h3>
                      <p className="text-white/60 text-sm leading-relaxed mb-4">
                        Achetez des produits auprès des fournisseurs et gérez efficacement votre inventaire et vos ventes.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Fonctionnalités incluses :
                      </p>
                      <ul className="space-y-2">
                        {[
                          'Gestion intelligente des stocks',
                          'Commandes simplifiées auprès des fournisseurs',
                          'Suivi détaillé des achats et dépenses',
                          'Alertes de stock et réapprovisionnement',
                          'Tableau de bord commercial optimisé',
                        ].map((feature, index) => (
                          <li key={`commercant-${index}`} className="flex items-start gap-3 text-sm text-white/60">
                            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </label>

                {/* Franchise Option */}
                <label
                  className={`relative block p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                    type === EntrepriseType.FRANCHISE
                      ? 'bg-white/10 border border-emerald-500/50 shadow-2xl shadow-emerald-500/20'
                      : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={EntrepriseType.FRANCHISE}
                    checked={type === EntrepriseType.FRANCHISE}
                    onChange={(e) => setType(e.target.value as EntrepriseType)}
                    className="sr-only"
                  />
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          type === EntrepriseType.FRANCHISE
                            ? 'bg-emerald-500/20 border border-emerald-500/50'
                            : 'bg-white/10 border border-white/20'
                        }`}
                      >
                        <svg
                          className={`w-8 h-8 ${
                            type === EntrepriseType.FRANCHISE ? 'text-emerald-300' : 'text-white/60'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 13.34V6a2 2 0 00-2-2H5a2 2 0 00-2 2v7.34m18 0A2 2 0 0119 15H5a2 2 0 01-2-1.66m18 0l-1.5 5.32A2 2 0 0117.5 21h-11A2 2 0 014.5 19.66L3 13.34"
                          />
                        </svg>
                      </div>
                      {type === EntrepriseType.FRANCHISE && (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">Franchise</h3>
                      <p className="text-white/60 text-sm leading-relaxed mb-4">
                        Gérez votre franchise avec des outils pour standardiser les opérations et superviser les ventes.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Fonctionnalités incluses :
                      </p>
                      <ul className="space-y-2">
                        {[
                          'Gestion multi-succursales',
                          'Standardisation des produits',
                          'Suivi des performances globales',
                          'Outils de formation pour franchisees',
                          'Tableau de bord centralisé',
                        ].map((feature, index) => (
                          <li key={`franchise-${index}`} className="flex items-start gap-3 text-sm text-white/60">
                            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => router('/dashboard_user/profile')}
                  className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <svg
                    className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler les modifications
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || type === entreprise?.type}
                  className="flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:bg-gray-300/50 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {type === entreprise?.type ? 'Aucun changement' : 'Confirmer et Appliquer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}