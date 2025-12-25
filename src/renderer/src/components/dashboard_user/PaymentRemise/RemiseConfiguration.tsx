"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Settings, Save, QrCode, BarChart } from "lucide-react";
import { useAuth } from "../../auth/auth-context";
import { toast } from "react-toastify";
import qrRemiseAPI from "@renderer/api/qr-remise.api";

interface RemiseSettingsForm {
  pourcentage: string;
  joursValidite: string;
  message: string;
}

export function RemiseConfiguration() {
  const { entreprise, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [formData, setFormData] = useState<RemiseSettingsForm>({
    pourcentage: "",
    joursValidite: "7",
    message: "Revenez prochainement pour bénéficier d'une remise!"
  });

  // Charger la config active et les stats
  useEffect(() => {
    if (entreprise?.id) {
      loadConfigAndStats();
    }
  }, [entreprise?.id]);

  const loadConfigAndStats = async () => {
    try {
      // Charger la config active
      const configResponse = await qrRemiseAPI.getActiveConfig(entreprise!.id);
      if (configResponse.success && configResponse.config) {
        setCurrentConfig(configResponse.config);
        setFormData({
          pourcentage: configResponse.config.pourcentage.toString(),
          joursValidite: configResponse.config.joursValidite.toString(),
          message: configResponse.config.message
        });
      }

      // Charger les statistiques
      const statsResponse = await qrRemiseAPI.getStats(entreprise!.id);
      if (statsResponse.success) {
        setStats(statsResponse);
      }
    } catch (error) {
      console.error('Erreur chargement config/stats:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('🚀 [1] handleSubmit - Début de la soumission');
  
  if (!entreprise?.id) {
    console.error('❌ [2] handleSubmit - entreprise.id est undefined/null');
    setError("Utilisateur non authentifié.");
    toast.error("Utilisateur non authentifié.");
    return;
  }

  console.log('✅ [3] handleSubmit - entreprise.id trouvé:', entreprise.id);
  setIsSubmitting(true);
  setError(null);

  try {
    const dto = {
      pourcentage: parseFloat(formData.pourcentage),
      joursValidite: parseInt(formData.joursValidite),
      message: formData.message
    };

    console.log('📤 [4] handleSubmit - Données préparées:', dto);
    console.log('📤 [5] handleSubmit - Envoi à qrRemiseAPI.createOrUpdateConfig...');

    // Vérifiez que l'API est bien disponible
    if (!qrRemiseAPI || typeof qrRemiseAPI.createOrUpdateConfig !== 'function') {
      console.error('❌ [6] handleSubmit - qrRemiseAPI non disponible');
      throw new Error('Service QR Remise non disponible');
    }

    const response = await qrRemiseAPI.createOrUpdateConfig(entreprise.id, dto);
    
    console.log('✅ [7] handleSubmit - Réponse reçue:', response);
    
    if (response.success) {
      console.log('🎉 [8] handleSubmit - Succès!');
      toast.success(response.message || "Configuration remise enregistrée !");
      loadConfigAndStats(); // Recharger les données
    } else {
      console.error('❌ [9] handleSubmit - Réponse avec erreur:', response.error);
      throw new Error(response.error || "Erreur lors de l'enregistrement.");
    }
  } catch (err: any) {
    console.error('💥 [10] handleSubmit - Erreur attrapée:', err);
    console.error('💥 [11] handleSubmit - Message d\'erreur:', err.message);
    console.error('💥 [12] handleSubmit - Stack trace:', err.stack);
    
    const errorMessage = err.message || "Erreur lors de l'enregistrement.";
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    console.log('🏁 [13] handleSubmit - Fin (finally)');
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-orvanta p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center p-3">
              <Settings className="w-3 h-3 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Paramètres Remise QR</h1>
              <p className="text-purple-200 text-sm">
                Configurez les remises automatiques via QR code
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart className="w-4 h-4 text-purple-300" />
              <h3 className="text-white font-medium">Statistiques</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalTickets || 0}</div>
                <div className="text-xs text-purple-200">Total QR générés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.ticketsUtilises || 0}</div>
                <div className="text-xs text-purple-200">QR utilisés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.ticketsDisponibles || 0}</div>
                <div className="text-xs text-purple-200">QR disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.ticketsExpires || 0}</div>
                <div className="text-xs text-purple-200">QR expirés</div>
              </div>
            </div>
            {stats.config && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-sm text-purple-200">
                  Configuration active: <span className="text-white">{stats.config.pourcentage}%</span> de remise 
                  valable <span className="text-white">{stats.config.joursValidite}</span> jours
                </p>
              </div>
            )}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-900/40 backdrop-blur-xl border border-red-700/50 rounded-lg p-3 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl">
          <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-purple-700/30 to-purple-600/30">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-600/40 rounded-lg">
                <QrCode className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Configuration QR Remise</h2>
                <p className="text-purple-200 text-xs">
                  Les QR codes seront générés automatiquement après chaque vente
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Paramètres de remise</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="pourcentage" className="flex items-center space-x-1 text-xs font-medium text-purple-200">
                      <Settings className="h-3 w-3 text-purple-400" />
                      <span>Pourcentage Remise (%)</span>
                    </label>
                    <input
                      type="number"
                      id="pourcentage"
                      name="pourcentage"
                      value={formData.pourcentage}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200"
                      placeholder="Ex: 10"
                      min={0}
                      max={100}
                      step={0.01}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="joursValidite" className="flex items-center space-x-1 text-xs font-medium text-purple-200">
                      <Settings className="h-3 w-3 text-purple-400" />
                      <span>Validité (jours)</span>
                    </label>
                    <input
                      type="number"
                      id="joursValidite"
                      name="joursValidite"
                      value={formData.joursValidite}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200"
                      min={1}
                      max={365}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="message" className="flex items-center space-x-1 text-xs font-medium text-purple-200">
                      <Settings className="h-3 w-3 text-purple-400" />
                      <span>Message sur le ticket</span>
                    </label>
                    <input
                      type="text"
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-200"
                      placeholder="Message affiché sur le ticket"
                    />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-200">
                  <strong>Fonctionnement:</strong> Après chaque vente, un QR code unique sera généré sur le ticket. 
                  Le client peut scanner ce code lors de sa prochaine visite pour bénéficier de la remise configurée.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    <span>{currentConfig ? 'Mettre à jour' : 'Activer la remise QR'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <h3 className="text-white font-medium mb-2">Comment utiliser les remises QR?</h3>
          <ol className="text-sm text-purple-200 space-y-1 ml-4 list-decimal">
            <li>Configurez le pourcentage et la durée de validité ci-dessus</li>
            <li>Les QR codes seront automatiquement générés sur les tickets de caisse</li>
            <li>Les clients présentent le QR code lors de leur prochaine visite</li>
            <li>Le caissier scanne le code via le POS pour appliquer la remise</li>
            <li>Chaque code ne peut être utilisé qu'une seule fois</li>
          </ol>
        </div>
      </div>
    </div>
  );
}