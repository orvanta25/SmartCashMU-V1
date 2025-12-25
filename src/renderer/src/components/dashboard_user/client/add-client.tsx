"use client";

import { useState } from "react";
import { Mail, Phone, User,  MapPin, CheckCircle, ArrowLeft, Plus, Code, DollarSign } from "lucide-react";
import {Link} from "react-router-dom";
import { createClient } from "@renderer/api/client";
import { useAuth } from "@renderer/components/auth/auth-context";

export default function AddClient() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    credit: 0,
    address: "",
    cin : 0
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {entreprise} =useAuth()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
      if(name === "cin" || name === "credit")setForm((prev) => ({ ...prev, [name]: Number(value) }));
      else setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!form.nom || !form.prenom || !form.tel || !form.address || !form.cin || !form.credit) {
      setError("Veuillez remplir tous les champs.");
      setIsLoading(false);
      return;
    }
    if(!entreprise)return
    await createClient(entreprise?.id,form)

    setError(null);
    setIsLoading(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      tel: "",
      credit: 0,
      address: "",
      cin : 0
    });
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard_user/client/add-client/list"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-3 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la liste
          </Link>
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl border border-purple-700/30 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Nouveau Client</h1>
                <p className="text-purple-200/80 text-sm">Ajoutez un nouveau client à votre réseau</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl border border-purple-700/30 overflow-hidden">
          {submitted ? (
            /* Success State */
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Client créé avec succès !</h2>
              <p className="text-purple-200/80 text-sm mb-6 max-w-md mx-auto">
                Le client "{form.nom +" "+ form.prenom}" a été ajouté à votre réseau.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-md shadow-blue-500/25 font-semibold transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un autre client
                </button>
                <Link
                  to="/dashboard_user/client/add-client/list"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold border border-white/20"
                >
                  Voir tous les clients
                </Link>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              {/* Form Sections */}
              <div className="space-y-6">
                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-300" />
                    Informations du Client
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="nom" className="block text-sm font-medium text-purple-200 mb-1">
                        Nom *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="nom"
                          name="nom"
                          value={form.nom}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Nom du client"
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="prenom" className="block text-sm font-medium text-purple-200 mb-1">
                        Prenom *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="prenom"
                          name="prenom"
                          value={form.prenom}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Prenom du client"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="cin" className="block text-sm font-medium text-purple-200 mb-1">
                        CIN *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Code className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="number"
                          id="cin"
                          name="cin"
                          value={form.cin}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Carte d'Identite"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="tel" className="block text-sm font-medium text-purple-200 mb-1">
                        Numero de Telephone *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="tel"
                          name="tel"
                          value={form.tel}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="+21699000111..."
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="credit" className="block text-sm font-medium text-purple-200 mb-1">
                        credit *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="number"
                          id="credit"
                          name="credit"
                          value={form.credit}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="30.300 DT..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-300" />
                    Informations de Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                      <div className="relative">
                        <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1">
                          Adresse Email 
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                            placeholder="exemple@email.com"
                          />
                        </div>
                      </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-300" />
                    Localisation
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    
                      <div className="relative">
                        <label htmlFor="address"className="block text-sm font-medium text-purple-200 mb-1">
                          Adresse *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                          </div>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                            placeholder="Adresse du client"
                            required
                          />
                        </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-4 border-t border-purple-400/20">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl transition-all duration-300 shadow-md shadow-blue-500/25 font-semibold text-base tracking-wide border border-blue-400/30 hover:scale-[1.02] transform disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Ajouter le client
                    </>
                  )}
                </button>
                <p className="text-purple-200/60 text-xs text-center mt-2">
                  Tous les champs marqués d'un * sont obligatoires
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}