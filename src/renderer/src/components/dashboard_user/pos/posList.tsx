"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, FileText, Eye, Filter, CreditCard } from "lucide-react"
import { useAuth } from "../../auth/auth-context"
import { toast } from "react-toastify"
import { getCommandes } from "@renderer/api/commande"
import type { SearchCommandeDto, Commande } from "@renderer/types/commande"
import { useDeviceType } from "@renderer/hooks/useDeviceType"
import { useNavigate } from "react-router-dom"

interface SearchFilters {
  dateDebut: string
  dateFin: string
  caissier: string
  ticketNumber: string
  heureDebut: string
  heureFin: string
}

interface POSData {
  id: string
  ticketNumber: string
  date: string
  total: number
  caissier: string
  methodePaiement: string
}

export function POSList() {
  const { entreprise } = useAuth()
  const [posData, setPosData] = useState<POSData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    dateDebut: "",
    dateFin: "",
    caissier: "",
    ticketNumber: "",
    heureDebut: "",
    heureFin: "",
  })
  const router = useNavigate()
  const { isMobile, isTablet, isIPadMini, isIPadPro, isSUNMITablet, isDesktop, isSurfaceDuo, sunMy } = useDeviceType()

  const fetchPOSData = async () => {
    if (!entreprise?.id) {
      setError("Utilisateur non authentifié.")
      toast.error("Utilisateur non authentifié.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Combine date and time for dateDebut and dateFin in dd-mm-yyyy hh:mm format
      const formatDateTime = (date: string, time: string) => {
        if (!date || !time) return undefined
        const [year, month, day] = date.split('-')
        return `${day}-${month}-${year} ${time}`
      }

      const params: SearchCommandeDto = {
        dateDebut: formatDateTime(searchFilters.dateDebut, searchFilters.heureDebut),
        dateFin: formatDateTime(searchFilters.dateFin, searchFilters.heureFin),
        ticketNumber: searchFilters.ticketNumber || undefined,
      }

      const commandes: Commande[] = await getCommandes(entreprise.id, params)

      let formattedData: POSData[] = commandes
        .map((commande) => {
          const paymentMethods: string[] = []
          if (commande.tpeAmount && commande.tpeAmount > 0) paymentMethods.push("TPE")
          if (commande.especeAmount && commande.especeAmount > 0) paymentMethods.push("Espèce")
          if (commande.ticketAmount && commande.ticketAmount > 0) paymentMethods.push("Ticket")

          const methodePaiement = paymentMethods.length > 0 ? paymentMethods.join(" + ") : "N/A"

          return {
            id: commande.id,
            ticketNumber: commande.ticketNumber || "N/A",
            date: new Date(commande.createdAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            total: commande.total || 0,
            caissier: commande.user ? `${commande.user.prenom} ${commande.user.nom}` : "N/A",
            methodePaiement,
          }
        })
        .sort((a, b) => {
          return (
            new Date(b.date.split("/").reverse().join("-")).getTime() -
            new Date(a.date.split("/").reverse().join("-")).getTime()
          )
        })

      // Filter by caissier name (frontend, case-insensitive, matches either part)
      if (searchFilters.caissier.trim() !== "") {
        const caissierFilter = searchFilters.caissier.trim().toLowerCase()
        formattedData = formattedData.filter((pos) =>
          pos.caissier.toLowerCase().includes(caissierFilter)
        )
      }

      setPosData(formattedData)
      setSelectedIds((prev) => prev.filter((id) => formattedData.some((p) => p.id === id)))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la récupération des commandes."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSearch = async () => {
    await fetchPOSData()
  }

  const clearFilters = () => {
    setSearchFilters({
      dateDebut: "",
      dateFin: "",
      caissier: "",
      ticketNumber: "",
      heureDebut: "",
      heureFin: "",
    })
    setSelectedIds([])
  }

  const handleViewVentes = (commandeId: string) => {
    router(`/dashboard_user/sales/pos-list/${commandeId}`)
  }

  useEffect(() => {
    fetchPOSData()
  }, [entreprise])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const areAllVisibleSelected = posData.length > 0 && posData.every((p) => selectedIds.includes(p.id))
  const toggleSelectAllVisible = () => {
    if (areAllVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !posData.some((p) => p.id === id)))
    } else {
      const visibleIds = posData.map((p) => p.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
    }
  }

  const handleManageInInvoice = () => {
    const selected = posData.filter((p) => selectedIds.includes(p.id))
    if (selected.length === 0) return
    const payload = selected.map(({ id, ticketNumber, date, total, caissier, methodePaiement }) => ({ id, ticketNumber, date, total, caissier, methodePaiement }))
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("invoiceSelectedTickets", JSON.stringify(payload))
      }
    } catch {}
    const idsParam = selected.map((s) => s.id).join(",")
    const query = idsParam ? `?ticketIds=${encodeURIComponent(idsParam)}` : ""
    router(`/dashboard_user/provider-Invoice/invoice${query}`)
  }

  const getFilterGridCols = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "grid-cols-1"
    if (isTablet || isIPadMini) return "grid-cols-2"
    if (isIPadPro || isSUNMITablet || isDesktop) return "grid-cols-4"
    return "grid-cols-4"
  }

  // const getFontSizeClass = () => {
  //   if (isMobile || isSurfaceDuo || sunMy) return "text-[10px]"
  //   if (isTablet || isIPadMini) return "text-xs"
  //   return "text-xs"
  // }

  const useCardLayout = isMobile || isSurfaceDuo || sunMy || isTablet || isIPadMini

  return (
    <div className="min-h-screen bg-white/5 p-3">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1
              className={`text-xl font-bold text-white/90 mb-0.5 ${isMobile || isSurfaceDuo || sunMy ? "text-base" : "text-xl"}`}
            >
              Liste des Commandes
            </h1>
            <p className={`text-white/60 ${isMobile || isSurfaceDuo || sunMy ? "text-xs" : "text-sm"}`}>
              Gérez vos commandes POS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAllVisible}
              className="px-2 py-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-xs border border-white/10"
            >
              {areAllVisibleSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
            <button
              onClick={handleManageInInvoice}
              disabled={selectedIds.length === 0}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md shadow-blue-500/25 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gérer en facture {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 text-red-300 p-2 rounded-lg text-xs">{error}</div>}

        <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 shadow-xl">
          <div className="px-3 py-2 border-b border-white/10">
            <div className="flex items-center space-x-1.5">
              <Filter className="h-4 w-4 text-white/80" />
              <h2 className="text-base font-semibold text-white/90">Filtres de recherche</h2>
            </div>
          </div>

          <div className="p-3">
            <div className={`grid ${getFilterGridCols()} gap-3 mb-3`}>
              <div className="space-y-1.5">
                <label htmlFor="dateDebut" className="block text-xs font-medium text-white/80">
                  Date de début
                </label>
                <input
                  type="date"
                  id="dateDebut"
                  name="dateDebut"
                  value={searchFilters.dateDebut}
                  onChange={handleSearchChange}
                  className="w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="heureDebut" className="block text-xs font-medium text-white/80">
                  time début
                </label>
                <input
                  type="time"
                  id="heureDebut"
                  name="heureDebut"
                  value={searchFilters.heureDebut}
                  onChange={handleSearchChange}
                  className="w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="dateFin" className="block text-xs font-medium text-white/80">
                  Date de fin
                </label>
                <input
                  type="date"
                  id="dateFin"
                  name="dateFin"
                  value={searchFilters.dateFin}
                  onChange={handleSearchChange}
                  className="w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="heureFin" className="block text-xs font-medium text-white/80">
                  time fin
                </label>
                <input
                  type="time"
                  id="heureFin"
                  name="heureFin"
                  value={searchFilters.heureFin}
                  onChange={handleSearchChange}
                  className="w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="caissier" className="block text-xs font-medium text-white/80">
                  Caissier (nom ou prénom)
                </label>
                <input
                  type="text"
                  id="caissier"
                  name="caissier"
                  value={searchFilters.caissier}
                  onChange={handleSearchChange}
                  placeholder="Nom ou prénom du caissier"
                  className="w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ticketNumber" className="block text-xs font-medium text-white/80">
                  Numéro de ticket
                </label>
                <input
                  type="text"
                  id="ticketNumber"
                  name="ticketNumber"
                  value={searchFilters.ticketNumber}
                  onChange={handleSearchChange}
                  placeholder="Numéro de ticket"
                  className="w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-xs"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center space-x-1 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    <span>Recherche...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3 w-3" />
                    <span>Rechercher</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-white/10 to-white/5 px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2
                    className={`font-semibold text-white ${isMobile || isSurfaceDuo || sunMy ? "text-base" : "text-lg"}`}
                  >
                    Résultats de recherche
                  </h2>
                  <p className="text-white/60 text-xs">
                    {posData.length} commande{posData.length !== 1 ? "s" : ""} trouvée{posData.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/20 border-t-blue-500"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
                </div>
                <span className="text-white/70 mt-3 font-medium text-sm">Chargement des données...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400 font-medium text-sm">{error}</div>
            ) : posData.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <FileText className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">Aucune commande trouvée</h3>
                <p className="text-white/60 mb-4 max-w-md mx-auto text-sm">
                  Aucune commande ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold text-sm shadow-lg shadow-blue-500/25"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : useCardLayout ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                {posData.map((pos) => (
                  <div
                    key={pos.id}
                    className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-lg hover:shadow-xl hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(pos.id)}
                            onChange={() => toggleSelect(pos.id)}
                            className="h-3 w-3 rounded border-white/20 bg-black/20"
                          />
                          <CreditCard className="h-3 w-3 text-blue-400" />
                          <span className="text-white/60 text-xs font-medium">Commande</span>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 font-mono text-xs">
                          {pos.ticketNumber}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-white/60 text-[10px] font-medium uppercase tracking-wide">Date</span>
                          <div className="text-white/90 font-semibold mt-0.5 text-sm">{pos.date}</div>
                        </div>
                        <div>
                          <span className="text-white/60 text-[10px] font-medium uppercase tracking-wide">Total</span>
                          <div className="text-white font-bold text-base mt-0.5">
                            {pos.total.toLocaleString()} <span className="text-white/70 text-xs">DT</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="text-white/60 text-[10px] font-medium uppercase tracking-wide">Caissier</span>
                          <div className="text-white/90 font-semibold mt-0.5 text-sm">{pos.caissier}</div>
                        </div>
                        <div>
                          <span className="text-white/60 text-[10px] font-medium uppercase tracking-wide">Paiement</span>
                          <div className="text-white/80 font-medium mt-0.5 text-sm">{pos.methodePaiement}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <button
                          onClick={() => handleViewVentes(pos.id)}
                          className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold flex items-center justify-center gap-1.5 text-sm shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Voir les détails</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                        Sél.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                        Caissier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                        Paiement
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                        Ticket
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-white/90 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {posData.map((pos, index) => (
                      <tr
                        key={pos.id}
                        className={`group hover:bg-white/5 transition-all duration-300 ${
                          index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(pos.id)}
                            onChange={() => toggleSelect(pos.id)}
                            className="h-3 w-3 rounded border-white/20 bg-black/20"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white/90 font-semibold text-sm">{pos.date}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white font-bold text-base">
                            {pos.total.toLocaleString()} <span className="text-white/70 text-xs font-medium">DT</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white/90 font-semibold text-sm">{pos.caissier}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white/80 font-medium text-sm">{pos.methodePaiement}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 font-mono text-xs">
                            {pos.ticketNumber}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleViewVentes(pos.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold flex items-center gap-1.5 text-xs ml-auto shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Voir</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}