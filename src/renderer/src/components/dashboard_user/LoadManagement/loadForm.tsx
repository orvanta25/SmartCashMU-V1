"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { useAuth } from "../../auth/auth-context"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import { Plus, List, Info, Calendar, CreditCard, Check, Loader2 } from "lucide-react"
import {  getAllChargeType } from "@renderer/api/charge-type"
import { createCharge, CreateChargeDto } from "@renderer/api/charge"

interface TypeCharge {
  id: string
  nom: string
}

const ChargeForm = () => {
  const { entreprise } = useAuth()
  const [types, setTypes] = useState<TypeCharge[]>([])
  const [form, setForm] = useState({
    typeChargeId: "",
    montant: "",
    dateEcheance: "",
    dateDebutRepartition: "",
    dateFinRepartition: "",
    datePaiement: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchTypes = async () => {
    try {
      if (entreprise?.id) {
         const chargeTypes = await 
      getAllChargeType(entreprise.id)

      if (chargeTypes) setTypes(chargeTypes)
    }
    } catch (error:unknown) {
      setError("error de recuperer les types: "+String(error))
    }
   
  }
  useEffect(() => {
    fetchTypes()
  }, [entreprise?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'montant' ? (value === '' ? '' : value) : value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!entreprise?.id)  toast.error("Utilisateur non authentifié.")

    setLoading(true)
    setError(null)
    try {
      if(entreprise?.id){
        const payload :CreateChargeDto = {
        ...form,
        montant: Number.parseFloat(form.montant),
        datePaiement: form.datePaiement || null, 
      }
      await createCharge(entreprise.id,payload)
      toast.success("Charge enregistrée avec succès")
      setForm({
        typeChargeId: "",
        montant: "",
        dateEcheance: "",
        dateDebutRepartition: "",
        dateFinRepartition: "",
        datePaiement: "",
      })
      }
    } catch (err: unknown) {
      const errorMessage = err || "Erreur lors de l'enregistrement"
      setError(String(errorMessage))
      toast.error(String(errorMessage))
    } finally {
      setLoading(false)
    }
  }

  if (!entreprise) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white/40 mx-auto mb-3" />
          <p className="text-white text-sm text-center">Veuillez vous connecter.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 px-3 sm:px-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <Plus className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">Nouvelle Charge</h1>
            <p className="text-white/60 text-xs">Enregistrer une nouvelle charge d'entreprise</p>
          </div>
        </div>
        <Link
          to="/dashboard_user/loadManagment/loadForm/list"
          className="px-2 py-1 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all duration-200 flex items-center gap-1"
        >
          <List className="w-2 h-2 sm:w-3 sm:h-3" />
          Voir Liste
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-2 rounded-xl text-xs">{error}</div>
      )}

      {/* Form */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-3 sm:p-4 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Informations de la Charge
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-white/90">
                  Type de charge <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <select
                    name="typeChargeId"
                    value={form.typeChargeId}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer transition-all duration-200 text-xs"
                  >
                    <option value="" disabled className="bg-purple-800">
                      Sélectionner un type
                    </option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id} className="bg-purple-800">
                        {t.nom}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-white/90">
                  Montant <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="montant"
                    value={form.montant === '' || form.montant === '0' ? '' : form.montant}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-2 py-1 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-xs no-spinner"
                    placeholder="0.00"
                    style={{ MozAppearance: 'textfield', appearance: 'textfield' }}
                    onWheel={e => e.currentTarget.blur()}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 text-[10px] font-medium">
                    DT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Planification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-white/90">
                  Date d'échéance <span className="text-pink-400">*</span>
                </label>
                <input
                  type="date"
                  name="dateEcheance"
                  value={form.dateEcheance}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-white/90">
                  Date début <span className="text-pink-400">*</span>
                </label>
                <input
                  type="date"
                  name="dateDebutRepartition"
                  value={form.dateDebutRepartition}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-white/90">
                  Date fin <span className="text-pink-400">*</span>
                </label>
                <input
                  type="date"
                  name="dateFinRepartition"
                  value={form.dateFinRepartition}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Optional Payment Date */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Paiement (Optionnel)
            </h2>
            <div className="max-w-sm">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-white/90">Date de paiement</label>
                <input
                  type="date"
                  name="datePaiement"
                  value={form.datePaiement}
                  onChange={handleChange}
                  className="w-full px-2 py-1 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-xs"
                />
                <p className="text-[10px] text-white/50">Laissez vide si la charge n'est pas encore payée</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-3 border-t border-white/10 space-y-2 sm:space-y-0">
            <div></div>
            <div className="flex space-x-2">
              <Link
                to="/dashboard_user/loadManagment/loadForm/list"
                className="px-3 py-1 sm:px-4 sm:py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium text-xs"
              >
                Annuler
              </Link>
              <button
                type="submit"
                className="px-3 py-1 sm:px-6 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-2 h-2 sm:w-3 sm:h-3 animate-spin" />
                    <span>Ajout en cours...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span>Ajouter la Charge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChargeForm