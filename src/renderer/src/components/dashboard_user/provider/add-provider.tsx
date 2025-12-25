"use client";

import { useState } from "react";
import { Mail, Phone, FileText, Briefcase, MapPin, CheckCircle, ArrowLeft, Plus } from "lucide-react";
import {Link} from "react-router-dom";
import { addFournisseur, Fournisseur } from "@renderer/api/fournisseur";
import { useAuth } from "@renderer/components/auth/auth-context";

export default function AddProvider() {
  const [form, setForm] = useState<Omit<Fournisseur,"id">>({
    mails: [""],
    fixedTel: "",
    mobileTel: "",
    denomination: "",
    matricule: "",
    secteur: "",
    rib: "",
    addresses: [""],
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {entreprise} =useAuth()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "mails" || name === "addresses") {
      const index = parseInt(e.target.dataset.index || "0");
      const newArray = [...(name === "mails" ? form.mails : form.addresses)];
      newArray[index] = value;
      setForm((prev) => ({ ...prev, [name]: newArray }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const addField = (field: "mails" | "addresses") => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!form.denomination || !form.matricule || !form.secteur || !form.mails.some(m => m) || !form.addresses.some(a => a) || !form.fixedTel || !form.mobileTel || !form.rib) {
      setError("Veuillez remplir tous les champs.");
      setIsLoading(false);
      return;
    }
    if(!entreprise ||!entreprise.id) return
    // Simulate API call
    await addFournisseur(entreprise?.id,form)

    setError(null);
    setIsLoading(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm({
      mails: [""],
      fixedTel: "",
      mobileTel: "",
      denomination: "",
      matricule: "",
      secteur: "",
      rib: "",
      addresses: [""],
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
            to="/dashboard_user/provider/list"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-3 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la liste
          </Link>
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl border border-purple-700/30 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Nouveau Fournisseur</h1>
                <p className="text-purple-200/80 text-sm">Ajoutez un nouveau fournisseur à votre réseau</p>
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
              <h2 className="text-2xl font-bold text-white mb-3">Fournisseur créé avec succès !</h2>
              <p className="text-purple-200/80 text-sm mb-6 max-w-md mx-auto">
                Le fournisseur "{form.denomination}" a été ajouté à votre réseau.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-md shadow-blue-500/25 font-semibold transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un autre fournisseur
                </button>
                <Link
                  to="/dashboard_user/provider/list"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold border border-white/20"
                >
                  Voir tous les fournisseurs
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
                {/* Provider Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-300" />
                    Informations du Fournisseur
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="denomination" className="block text-sm font-medium text-purple-200 mb-1">
                        Dénomination *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="denomination"
                          name="denomination"
                          value={form.denomination}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Nom du fournisseur"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="matricule" className="block text-sm font-medium text-purple-200 mb-1">
                        Matricule Fiscale *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="matricule"
                          name="matricule"
                          value={form.matricule}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Matricule Fiscale"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="secteur" className="block text-sm font-medium text-purple-200 mb-1">
                        Secteur d'Activité *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Briefcase className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="secteur"
                          name="secteur"
                          value={form.secteur}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Ex: Commerce, Électronique..."
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="rib" className="block text-sm font-medium text-purple-200 mb-1">
                        RIB Bancaire *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="rib"
                          name="rib"
                          value={form.rib}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="RIB Bancaire"
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
                    {form.mails.map((mail, index) => (
                      <div key={index} className="relative">
                        <label htmlFor={`mail-${index}`} className="block text-sm font-medium text-purple-200 mb-1">
                          Adresse Email {index + 1} *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                          </div>
                          <input
                            type="email"
                            id={`mail-${index}`}
                            name="mails"
                            data-index={index}
                            value={mail}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                            placeholder="exemple@email.com"
                            required
                          />
                        </div>
                        {index === form.mails.length - 1 && (
                          <button
                            type="button"
                            onClick={() => addField("mails")}
                            className="mt-1 text-purple-200 hover:text-white transition-colors flex items-center gap-1 text-sm"
                          >
                            <Plus className="w-3 h-3" /> Ajouter un email
                          </button>
                        )}
                      </div>
                    ))}
                    <div>
                      <label htmlFor="fixedTel" className="block text-sm font-medium text-purple-200 mb-1">
                        Numéro Fixe *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="tel"
                          id="fixedTel"
                          name="fixedTel"
                          value={form.fixedTel}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="+216 XX XXX XXX"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="mobileTel" className="block text-sm font-medium text-purple-200 mb-1">
                        Numéro Mobile *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="tel"
                          id="mobileTel"
                          name="mobileTel"
                          value={form.mobileTel}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="+216 XX XXX XXX"
                          required
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
                    {form.addresses.map((address, index) => (
                      <div key={index} className="relative">
                        <label htmlFor={`address-${index}`} className="block text-sm font-medium text-purple-200 mb-1">
                          Adresse {index + 1} *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="w-4 h-4 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                          </div>
                          <input
                            type="text"
                            id={`address-${index}`}
                            name="addresses"
                            data-index={index}
                            value={address}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                            placeholder="Adresse du fournisseur"
                            required
                          />
                        </div>
                        {index === form.addresses.length - 1 && (
                          <button
                            type="button"
                            onClick={() => addField("addresses")}
                            className="mt-1 text-purple-200 hover:text-white transition-colors flex items-center gap-1 text-sm"
                          >
                            <Plus className="w-3 h-3" /> Ajouter une adresse
                          </button>
                        )}
                      </div>
                    ))}
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
                      Ajouter le fournisseur
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