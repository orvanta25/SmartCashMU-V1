"use client"
import { useState } from "react"
import type React from "react"

import { Mail, Phone, User, CheckCircle, Lock, ArrowLeft, Plus } from "lucide-react"
import {Link} from "react-router-dom"

export default function AddResponsible() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    password: "",
    confirmPassword: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (
      !form.nom ||
      !form.prenom ||
      !form.email ||
      !form.tel ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Veuillez remplir tous les champs obligatoires.")
      setIsLoading(false)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      setIsLoading(false)
      return
    }

    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      setIsLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setError(null)
    setIsLoading(false)
    setSubmitted(true)
  }

  const resetForm = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      tel: "",
      password: "",
      confirmPassword: "",
    })
    setSubmitted(false)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/dashboard_user/StoreManagement/responsible/list"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la liste
          </Link>
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-700/30 p-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Nouveau Responsable</h1>
                <p className="text-purple-200/80 text-lg">Ajoutez un nouveau responsable à votre réseau</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-700/30 overflow-hidden">
          {submitted ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Responsable créé avec succès !</h2>
              <p className="text-purple-200/80 text-lg mb-8 max-w-md mx-auto">
                Le responsable "{form.prenom} {form.nom}" a été ajouté à votre réseau.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 font-semibold transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un autre responsable
                </button>
                <Link
                  to="/dashboard_user/responsible/list-responsible"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 font-semibold border border-white/20"
                >
                  Voir tous les responsables
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-300" />
                    Informations du Responsable
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-purple-200 mb-2">
                        Nom *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="nom"
                          name="nom"
                          value={form.nom}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Nom de famille"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="prenom" className="block text-sm font-medium text-purple-200 mb-2">
                        Prénom *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="prenom"
                          name="prenom"
                          value={form.prenom}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Prénom"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-300" />
                    Informations de Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                        Adresse Email *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="exemple@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="tel" className="block text-sm font-medium text-purple-200 mb-2">
                        Numéro de Téléphone *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="tel"
                          id="tel"
                          name="tel"
                          value={form.tel}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="+216 XX XXX XXX"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-300" />
                    Sécurité
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                        Mot de Passe *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Minimum 6 caractères"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
                        Confirmer le Mot de Passe *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Répétez le mot de passe"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-purple-400/20">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 font-semibold text-lg tracking-wide border border-blue-400/30 hover:scale-[1.02] transform disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Créer le responsable
                    </>
                  )}
                </button>
                <p className="text-purple-200/60 text-sm text-center mt-3">
                  Tous les champs marqués d'un * sont obligatoires
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}