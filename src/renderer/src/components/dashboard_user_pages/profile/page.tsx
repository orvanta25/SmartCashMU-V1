"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../../components/auth/auth-context"
import { useNavigate } from "react-router-dom"
import { updateUserProfile } from "@renderer/api/user"
import type { UpdateProfileDto } from "@renderer/types/auth"
import { useDeviceType } from "@renderer/hooks/useDeviceType"

// Countries and regions (governorates) options
const paysOptions: string[] = [
  "Tunisie",
  "Algérie",
  "Maroc",
  "Libye",
  "France",
  "Espagne",
  "Italie",
  "Allemagne",
  "Canada",
  "Autre",
]

const regionsByPays: Record<string, string[]> = {
  Tunisie: [
    "Tunis",
    "Ariana",
    "Ben Arous",
    "Manouba",
    "Nabeul",
    "Zaghouan",
    "Bizerte",
    "Béja",
    "Jendouba",
    "Kef",
    "Siliana",
    "Sousse",
    "Monastir",
    "Mahdia",
    "Sfax",
    "Kairouan",
    "Kasserine",
    "Sidi Bouzid",
    "Gabès",
    "Medenine",
    "Tataouine",
    "Gafsa",
    "Tozeur",
    "Kébili",
  ],
}

export default function ProfilePage() {
  const { user, entreprise, setUser, setEntreprise, loading } = useAuth()
  const router = useNavigate()
  const { isMobile } = useDeviceType()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // État pour les informations modifiables
  const [editedInfo, setEditedInfo] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    role: "",
  })

  const [formData, setFormData] = useState<UpdateProfileDto>({
    id: user ? user?.id : "",
    prenom: user?.prenom ?? "",
    nom: user?.nom ?? "",
    telephone: user?.telephone ?? "",
    denomination: entreprise?.denomination ?? "",
    matriculeFiscale: entreprise?.matriculeFiscale ?? "",
    secteurActivite: entreprise?.secteurActivite ?? "",
    region: entreprise?.region ?? "",
    ville: entreprise?.ville ?? "",
    pays: entreprise?.pays ?? "",
    codePin: "",
  })

  const regionOptions = useMemo<string[]>(() => {
    const selectedPays = (formData.pays || "").trim()
    return regionsByPays[selectedPays] || []
  }, [formData.pays])

  // Initialiser les données modifiables
  useEffect(() => {
    if (user && entreprise) {
      setEditedInfo({
        prenom: user.role === "ADMIN" ? entreprise?.prenom || "" : user.prenom || "",
        nom: user.role === "ADMIN" ? entreprise?.nom || "" : user.nom || "",
        email: user.role === "ADMIN" ? entreprise?.email || "" : user.email || "",
        telephone: user.role === "ADMIN" ? entreprise?.telephone || "" : user.telephone || "",
        role: user.role || "",
      })
    }
  }, [user, entreprise])

  useEffect(() => {
    if (!loading && !user) {
      router("/")
    }
    if (entreprise && user && user.role === "ADMIN") {
      setFormData({
        id: user ? user?.id : "",
        prenom: user.prenom ?? "",
        nom: user.nom ?? "",
        telephone: user.telephone ?? "",
        denomination: entreprise.denomination ?? "",
        matriculeFiscale: entreprise.matriculeFiscale ?? "",
        secteurActivite: entreprise.secteurActivite ?? "",
        region: entreprise.region ?? "",
        ville: entreprise.ville ?? "",
        pays: entreprise.pays ?? "",
        codePin: "",
      })
    }
  }, [user, entreprise, loading, router])

  // Gérer la modification des informations
  const handleInfoChange = (field: string, value: string) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    if (formData.codePin && formData.codePin.length !== 4) {
      setError("Le Code Pin doit être 4 chiffres")
      return
    }

    // Préparer le payload avec les informations modifiées
    const payload: UpdateProfileDto = { 
      id: user?.id || "",
      ...editedInfo
    }

    // Ajouter les autres champs uniquement s'ils ont été modifiés
    for (const [key, value] of Object.entries(formData)) {
      if (key === "codePin") {
        if (value && value.trim() !== "") {
          payload[key as keyof UpdateProfileDto] = value
        }
      } else if (value && value.trim() !== "" && key !== "id") {
        payload[key as keyof UpdateProfileDto] = value
      }
    }

    try {
      const response = await updateUserProfile(payload)
      setUser(response.user)
      setEntreprise(response.entreprise || null)
      setIsEditing(false)
      setSuccess("Profil mis à jour avec succès")
    } catch (error: any) {
      setError(error.response?.data?.message || "Erreur lors de la mise à jour du profil")
      console.error("Update error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 p-6 text-center max-w-sm mx-auto">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ffea]/30 to-[#0099ff]/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 border-2 border-[#00ffea]/30 border-t-[#00ffea] rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-orbitron tracking-wider text-white/90 mb-2">CHARGEMENT...</h3>
          <p className="text-[#00ffea]/60 text-sm">Préparation de votre espace</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#050811] py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header cyber */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ffea]/5 via-transparent to-[#0099ff]/5"></div>
          <div className="relative p-4 md:p-6">
            <div className={`flex ${isMobile ? "flex-col gap-4" : "items-center justify-between"}`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#00ffea] to-[#0099ff] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00ffea]/30">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#00ff88] to-[#00ccaa] rounded-full border-2 border-[#0a0e17] flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold font-orbitron tracking-wider text-white mb-1">
                    PROFIL <span className="text-[#00ffea]">QUANTUM</span>
                  </h1>
                  <div className="flex items-center gap-2 text-[#00ffea]/70 text-sm">
                    <div className="w-1.5 h-1.5 bg-[#00ffea] rounded-full animate-pulse"></div>
                    <span>Système de gestion de profil avancé</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`group px-4 py-2 rounded-lg bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-[#00ffea]/20 ${isMobile ? "w-full justify-center" : ""}`}
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-12 text-[#00ffea]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {isEditing ? "ANNULER" : "MODIFIER PROFIL"}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information cyber */}
        <div className="bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 overflow-hidden">
          <div className="bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 p-4 md:p-6 border-b border-[#00ffea]/20">
            <h2 className="text-lg md:text-xl font-bold font-orbitron tracking-wider text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#00ffea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              INFORMATIONS DU PROFIL
            </h2>
            <p className="text-[#00ffea]/60 mt-1 text-sm">Gérez vos informations personnelles et professionnelles</p>
          </div>
          <div className="p-4 md:p-6">
            {/* Alert Messages cyber */}
            {error && (
              <div className="mb-4 bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#ff416c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[#ff416c] font-orbitron tracking-wider mb-1 text-sm">ERREUR DE VALIDATION</h4>
                    <p className="text-[#ff416c]/80 text-xs">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="mb-4 bg-gradient-to-br from-[#00ff88]/10 to-transparent backdrop-blur-xl border border-[#00ff88]/30 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#00ff88]/20 to-[#00ccaa]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[#00ff88] font-orbitron tracking-wider mb-1 text-sm">SUCCÈS</h4>
                    <p className="text-[#00ff88]/80 text-xs">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Form/Display */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Personal Information Section cyber */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#00ffea]/20">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#00ffea]/10 to-[#0099ff]/10 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#00ffea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold font-orbitron tracking-wider text-white">INFORMATIONS PERSONNELLES</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#00ffea]/70">Prénom</label>
                        <input
                          type="text"
                          value={editedInfo.prenom}
                          onChange={(e) => handleInfoChange("prenom", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                          placeholder="Votre prénom"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#00ffea]/70">Nom</label>
                        <input
                          type="text"
                          value={editedInfo.nom}
                          onChange={(e) => handleInfoChange("nom", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#00ffea]/70">Email</label>
                      <input
                        type="email"
                        value={editedInfo.email}
                        onChange={(e) => handleInfoChange("email", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#00ffea]/70">Numéro de Téléphone</label>
                      <input
                        type="tel"
                        value={editedInfo.telephone}
                        onChange={(e) => handleInfoChange("telephone", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                        placeholder="+216 XX XXX XXX"
                        required
                      />
                    </div>

                    {user.role !== "ADMIN" && (
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#00ffea]/70">Rôle</label>
                        <input
                          type="text"
                          value={editedInfo.role}
                          onChange={(e) => handleInfoChange("role", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                          placeholder="Votre rôle"
                        />
                      </div>
                    )}

                    <div className="space-y-3 pt-3 border-t border-[#00ffea]/20">
                      <h4 className="text-xs font-medium text-[#00ffea]/70 flex items-center gap-2">
                        <svg className="w-3 h-3 text-[#00ffea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        SÉCURITÉ DU COMPTE
                      </h4>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#00ffea]/70">Code PIN</label>
                        <input
                          type="text"
                          value={formData.codePin || ""}
                          onChange={(e) => setFormData({ ...formData, codePin: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                          placeholder="Entrez un code PIN à 4 chiffres"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Information Section cyber (uniquement pour ADMIN) */}
                  {user.role === "ADMIN" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-[#00ffea]/20">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#00ff88]/10 to-[#00ccaa]/10 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <h3 className="text-base font-semibold font-orbitron tracking-wider text-white">INFORMATIONS ENTREPRISE</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#00ffea]/70">Dénomination</label>
                          <input
                            type="text"
                            value={formData.denomination || ""}
                            onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                            placeholder="Nom de l'entreprise"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#00ffea]/70">Matricule Fiscale</label>
                          <input
                            type="text"
                            value={formData.matriculeFiscale || ""}
                            onChange={(e) => setFormData({ ...formData, matriculeFiscale: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                            placeholder="Matricule fiscal"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#00ffea]/70">Secteur d'Activité</label>
                        <input
                          type="text"
                          value={formData.secteurActivite}
                          onChange={(e) => setFormData({ ...formData, secteurActivite: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                          placeholder="Votre secteur d'activité"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#00ffea]/70">Région</label>
                          <select
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300 appearance-none"
                            required
                          >
                            <option value="" className="bg-[#0a0e17] text-white">Sélectionnez une région</option>
                            {regionOptions.map((region) => (
                              <option key={region} value={region} className="bg-[#0a0e17] text-white">
                                {region}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#00ffea]/70">Ville</label>
                          <input
                            type="text"
                            value={formData.ville}
                            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300"
                            placeholder="Votre ville"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#00ffea]/70">Pays</label>
                        <select
                          value={formData.pays}
                          onChange={(e) => setFormData({ ...formData, pays: e.target.value, region: "" })}
                          className="w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300 appearance-none"
                          required
                        >
                          <option value="" className="bg-[#0a0e17] text-white">Sélectionnez un pays</option>
                          {paysOptions.map((p) => (
                            <option key={p} value={p} className="bg-[#0a0e17] text-white">
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Action Buttons cyber */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#00ffea]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      // Réinitialiser les données modifiées
                      if (user && entreprise) {
                        setEditedInfo({
                          prenom: user.role === "ADMIN" ? entreprise?.prenom || "" : user.prenom || "",
                          nom: user.role === "ADMIN" ? entreprise?.nom || "" : user.nom || "",
                          email: user.role === "ADMIN" ? entreprise?.email || "" : user.email || "",
                          telephone: user.role === "ADMIN" ? entreprise?.telephone || "" : user.telephone || "",
                          role: user.role || "",
                        })
                      }
                    }}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-gradient-to-r from-[#ff416c]/10 to-[#ff6b9d]/10 hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 border border-[#ff416c]/30 hover:border-[#ff416c] text-white font-orbitron tracking-wider transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <svg
                      className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#ff416c]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    ANNULER
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00ffea] to-[#0099ff] hover:from-[#00ffea] hover:to-[#0099ff] text-white font-orbitron tracking-wider shadow-lg shadow-[#00ffea]/25 hover:shadow-[#00ffea]/40 transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <svg
                      className="w-4 h-4 transition-transform group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ENREGISTRER
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Personal Information Display cyber */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#00ffea]/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#00ffea]/10 to-[#0099ff]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#00ffea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold font-orbitron tracking-wider text-white">INFORMATIONS PERSONNELLES</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Prénom", value: user.role === "ADMIN" ? entreprise?.prenom : user.prenom },
                      { label: "Nom", value: user.role === "ADMIN" ? entreprise?.nom : user.nom },
                      { label: "Email", value: user.role === "ADMIN" ? entreprise?.email : user.email },
                      { label: "Téléphone", value: user.role === "ADMIN" ? entreprise?.telephone : user.telephone },
                      ...(user.role !== "ADMIN" ? [{ label: "Rôle", value: user.role }] : []),
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-[#0a0e17]/50 rounded-lg border border-[#00ffea]/10 hover:border-[#00ffea]/30 transition-all duration-300"
                      >
                        <span className="text-[#00ffea]/70 font-medium text-xs font-orbitron tracking-wider">{item.label}</span>
                        <span className="text-white font-medium text-sm truncate max-w-[150px]">{item.value || "Non renseigné"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Information Display cyber (uniquement pour ADMIN) */}
                {user.role === "ADMIN" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#00ffea]/20">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#00ff88]/10 to-[#00ccaa]/10 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold font-orbitron tracking-wider text-white">INFORMATIONS ENTREPRISE</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Dénomination", value: entreprise?.denomination },
                        { label: "Matricule Fiscale", value: entreprise?.matriculeFiscale },
                        { label: "Secteur d'Activité", value: entreprise?.secteurActivite },
                        { label: "Région", value: entreprise?.region },
                        { label: "Ville", value: entreprise?.ville },
                        { label: "Pays", value: entreprise?.pays },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 bg-[#0a0e17]/50 rounded-lg border border-[#00ffea]/10 hover:border-[#00ffea]/30 transition-all duration-300"
                        >
                          <span className="text-[#00ffea]/70 font-medium text-xs font-orbitron tracking-wider">{item.label}</span>
                          <span className="text-white font-medium text-sm truncate max-w-[150px]">{item.value || "Non renseigné"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section for Non-Admin Users cyber */}
        {user.role !== "ADMIN" && (
          <div className="bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 p-4 md:p-6 border-b border-[#00ffea]/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold font-orbitron tracking-wider text-white flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#00ffea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    PERMISSIONS
                  </h2>
                  <p className="text-[#00ffea]/60 mt-1 text-sm">Vos autorisations dans le système</p>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-3">
                {user.permissions?.length > 0 ? (
                  user.permissions.map((permission, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-[#0a0e17]/50 rounded-lg border border-[#00ffea]/10 hover:border-[#00ffea]/30 transition-all duration-300"
                    >
                      <span className="text-[#00ffea]/70 font-medium text-xs font-orbitron tracking-wider">Permission</span>
                      <span className="text-white font-medium text-sm">{permission}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between py-2 px-3 bg-[#0a0e17]/50 rounded-lg border border-[#00ffea]/10">
                    <span className="text-[#00ffea]/70 font-medium text-xs font-orbitron tracking-wider">Permission</span>
                    <span className="text-white font-medium text-sm">Aucune</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}