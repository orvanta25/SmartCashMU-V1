"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../../auth/auth-context"
import { getAchatFournisseurs } from "@renderer/api/achat-fournisseur"
import { findAllCharge } from "@renderer/api/charge"
import type { AchatFournisseur } from "@renderer/types/achat-entree"

import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  Loader2,
  AlertCircle,
  TrendingUp,
  CreditCard,
} from "lucide-react"

interface Charge {
  id: string
  typeCharge: { nom: string }
  montant: number
  dateEcheance: string
  datePaiement: string | null
  dateDebutRepartition: string
  dateFinRepartition: string
}

export default function HistoryDeadlines() {
  const { entreprise } = useAuth()
  const [achatFournisseurs, setAchatFournisseurs] = useState<AchatFournisseur[]>([])
  const [charges, setCharges] = useState<Charge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<
    | "all"
    | "achats_en_attente"
    | "charges_en_attente"
    | "achats_en_retard"
    | "charges_en_retard"
  >("all")

  console.log("Current entrepriseId:", entreprise?.id)

  useEffect(() => {
    const fetchData = async () => {
      if (!entreprise?.id) {
        setError("Entreprise non trouvée.")
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const [fournisseurs, chargesRes] = await Promise.all([
          getAchatFournisseurs(entreprise.id),
          findAllCharge(entreprise.id, {}),
        ])
        setAchatFournisseurs(fournisseurs)
        setCharges(chargesRes)
      } catch (err: any) {
        setError(err || "Erreur lors du chargement des échéances.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [entreprise?.id])

  // useEffect(() => {
  //   if (!entreprise?.id) return
  //   setLoading(true)
  //   setError(null)
  //   // Fetch charges using axios, as in loadList.tsx
  //   axios
  //     .get(`http://localhost:4000/charge/${entreprise.id}`, { withCredentials: true })
  //     .then((res) => {
  //       setCharges(res.data)
  //       setLoading(false)
  //     })
  //     .catch((err) => {
  //       setError("Erreur lors du chargement des charges: " + (err || "Erreur inconnue"))
  //       setLoading(false)
  //     })
  // }, [entreprise?.id])

  // Defensive: always use arrays
  const safeAchatFournisseurs = Array.isArray(achatFournisseurs) ? achatFournisseurs : []
  const safeCharges = Array.isArray(charges) ? charges : []

  // Remove dayjs and use plain JS for date comparison
  function isPast(dateString: string) {
    return new Date(dateString) < new Date()
  }

  function getAchatStatus(af: AchatFournisseur) {
    if (!af.datePaiement) {
      // Not paid
      if (isPast(af.dateEcheance)) return "en retard"
      if (af.montantRestant && af.montantRestant > 0 && af.montantRestant < af.montantTotal) return "partiel"
      return "en attente"
    }
    if (af.montantRestant && af.montantRestant > 0 && af.montantRestant < af.montantTotal) return "partiel"
    return "payé"
  }

  const filteredAchatFournisseurs = safeAchatFournisseurs.filter((af) => {
    const status = getAchatStatus(af)
    return status === "en attente" || status === "partiel" || status === "en retard"
  })

  const filteredCharges = safeCharges.filter((charge) => !charge.datePaiement)

  // Filtered by status
  const achatsEnAttente = filteredAchatFournisseurs.filter((af) => getAchatStatus(af) === "en attente" || getAchatStatus(af) === "partiel")
  const achatsEnRetard = filteredAchatFournisseurs.filter((af) => getAchatStatus(af) === "en retard")
  const chargesEnAttente = filteredCharges.filter((charge) => !isPast(charge.dateEcheance))
  const chargesEnRetard = filteredCharges.filter((charge) => isPast(charge.dateEcheance))

  // Calculate statistics
  const totalAchatAmount = filteredAchatFournisseurs.reduce((sum, af) => {
    const amount = Number(af.montantTotal) || 0
    return sum + amount
  }, 0)

  const totalChargeAmount = filteredCharges.reduce((sum, charge) => {
    const amount = Number(charge.montant) || 0
    return sum + amount
  }, 0)

  const overdueAchats = achatsEnRetard.length
  const overdueCharges = chargesEnRetard.length

  // Determine which data to show based on filter
  let achatsToShow = filteredAchatFournisseurs
  let chargesToShow = filteredCharges
  if (activeFilter === "achats_en_attente") {
    achatsToShow = achatsEnAttente
    chargesToShow = []
  } else if (activeFilter === "achats_en_retard") {
    achatsToShow = achatsEnRetard
    chargesToShow = []
  } else if (activeFilter === "charges_en_attente") {
    achatsToShow = []
    chargesToShow = chargesEnAttente
  } else if (activeFilter === "charges_en_retard") {
    achatsToShow = []
    chargesToShow = chargesEnRetard
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en retard":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            En retard
          </span>
        )
      case "partiel":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Partiel
          </span>
        )
      case "en attente":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Payé
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white/5 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-purple-200">Chargement des échéances...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white/5 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-200 text-lg">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Historique des Échéances</h1>
              <p className="text-purple-300">Suivi des paiements et échéances en cours</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl text-left transition-all duration-200 focus:outline-none ${activeFilter === "achats_en_attente" ? "ring-2 ring-blue-400" : "hover:ring-1 hover:ring-blue-300"}`}
            onClick={() => setActiveFilter(activeFilter === "achats_en_attente" ? "all" : "achats_en_attente")}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Achats en attente</p>
                <p className="text-2xl font-bold text-white">{achatsEnAttente.length}</p>
                <p className="text-purple-300 text-xs">{(totalAchatAmount || 0).toFixed(2)} DT</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </button>

          <button
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl text-left transition-all duration-200 focus:outline-none ${activeFilter === "charges_en_attente" ? "ring-2 ring-green-400" : "hover:ring-1 hover:ring-green-300"}`}
            onClick={() => setActiveFilter(activeFilter === "charges_en_attente" ? "all" : "charges_en_attente")}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Charges en attente</p>
                <p className="text-2xl font-bold text-white">{chargesEnAttente.length}</p>
                <p className="text-purple-300 text-xs">{(totalChargeAmount || 0).toFixed(2)} DT</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CreditCard className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </button>

          <button
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl text-left transition-all duration-200 focus:outline-none ${activeFilter === "achats_en_retard" ? "ring-2 ring-red-400" : "hover:ring-1 hover:ring-red-300"}`}
            onClick={() => setActiveFilter(activeFilter === "achats_en_retard" ? "all" : "achats_en_retard")}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Achats en retard</p>
                <p className="text-2xl font-bold text-white">{overdueAchats}</p>
                <p className="text-red-300 text-xs">Nécessite attention</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </button>

          <button
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl text-left transition-all duration-200 focus:outline-none ${activeFilter === "charges_en_retard" ? "ring-2 ring-orange-400" : "hover:ring-1 hover:ring-orange-300"}`}
            onClick={() => setActiveFilter(activeFilter === "charges_en_retard" ? "all" : "charges_en_retard")}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Charges en retard</p>
                <p className="text-2xl font-bold text-white">{overdueCharges}</p>
                <p className="text-red-300 text-xs">Action requise</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </button>
        </div>

        {/* Supplier Purchases Section */}
        {achatsToShow.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-purple-500/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">Échéances des Achats Fournisseurs</h2>
                  <span className="ml-auto px-3 py-1 bg-purple-500/20 rounded-full text-purple-200 text-sm">
                    {achatsToShow.length} échéance(s)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {achatsToShow.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
                    <p className="text-purple-200 text-lg">Aucune échéance d'achat en cours</p>
                    <p className="text-purple-300 text-sm mt-1">Tous les paiements sont à jour</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-purple-800/40 border-b border-purple-500/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Facture</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Fournisseur</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Date Échéance</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Montant Total</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {achatsToShow.map((af) => (
                        <tr
                          key={af.id}
                          className="border-b border-purple-500/10 hover:bg-purple-700/10 transition-all duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-400" />
                              <span className="text-white font-medium">{af.numeroFacture}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-purple-400" />
                              <span className="text-white">{af.fournisseur}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <span className={`${isPast(af.dateEcheance) ? "text-red-300" : "text-white"}`}>
                                {new Date(af.dateEcheance).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-medium">{Number(af.montantTotal) || 0} DT</span>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(getAchatStatus(af))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Charges Section */}
        {chargesToShow.length > 0 && (
          <div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-purple-500/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">Échéances des Charges</h2>
                  <span className="ml-auto px-3 py-1 bg-purple-500/20 rounded-full text-purple-200 text-sm">
                    {chargesToShow.length} échéance(s)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {chargesToShow.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
                    <p className="text-purple-200 text-lg">Aucune échéance de charge en cours</p>
                    <p className="text-purple-300 text-sm mt-1">Toutes les charges sont payées</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-purple-800/40 border-b border-purple-500/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Type</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Montant</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Date Échéance</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Statut</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Début Répartition</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">Fin Répartition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chargesToShow.map((charge) => (
                        <tr
                          key={charge.id}
                          className="border-b border-purple-500/10 hover:bg-purple-700/10 transition-all duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-purple-400" />
                              <span className="text-white font-medium">{charge.typeCharge?.nom || ""}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-medium">{Number(charge.montant) || 0} DT</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <span className={`${isPast(charge.dateEcheance) ? "text-red-300" : "text-white"}`}>
                                {new Date(charge.dateEcheance).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Non payé
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-purple-200">
                              {new Date(charge.dateDebutRepartition).toLocaleDateString("fr-FR")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-purple-200">
                              {new Date(charge.dateFinRepartition).toLocaleDateString("fr-FR")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}