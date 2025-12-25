"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useAuth } from "../../auth/auth-context"
import { getTicketRestos, updateTicketResto, deleteTicketResto } from "@renderer/api/ticket-resto"
import type { TicketResto, UpdateTicketRestoDto } from "@renderer/types/ticket-resto"
import { Edit, Trash2, Save, X, Search, Filter, Building2, Hash, Percent, Loader2, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function TicketRestoList() {
  const router = useNavigate()
  const { entreprise } = useAuth()
  const [tickets, setTickets] = useState<TicketResto[]>([])
  const [filteredTickets, setFilteredTickets] = useState<TicketResto[]>([])
  const [editingTicket, setEditingTicket] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState<{ fournisseur: string; codeInterne: string; pourcentage: string }>({
    fournisseur: "",
    codeInterne: "",
    pourcentage: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Filter tickets based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets)
    } else {
      const filtered = tickets.filter(
        (ticket) =>
          ticket.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.codeInterne.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredTickets(filtered)
    }
  }, [tickets, searchTerm])

  const fetchTickets = async () => {
    if (!entreprise?.id) {
      toast.error("Utilisateur non authentifié.")
      return
    }

    setIsLoading(true)
    try {
      const ticketRestos = await getTicketRestos(entreprise.id)
      setTickets(ticketRestos)
    } catch (err: any) {
      const message = err?.response?.data?.message || "Erreur lors de la récupération des tickets restos."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [entreprise])

  const handleEdit = (ticket: TicketResto) => {
    setForm({
      fournisseur: ticket.fournisseur,
      codeInterne: ticket.codeInterne,
      pourcentage: ticket.pourcentage !== undefined ? ticket.pourcentage.toString() : "",
    })
    setEditingTicket(ticket.id)
  }

  const handleCancelEdit = () => {
    setEditingTicket(null)
    setForm({ fournisseur: "", codeInterne: "", pourcentage: "" })
  }

  const handleSave = async (id: string) => {
    if (!entreprise?.id) {
      toast.error("Utilisateur non authentifié.")
      return
    }

    if (!form.fournisseur.trim()) {
      toast.error("Veuillez remplir le champ fournisseur.")
      return
    }

    if (!form.codeInterne.trim()) {
      toast.error("Veuillez remplir le champ code interne.")
      return
    }

    let pourcentage: number | undefined
    if (form.pourcentage.trim()) {
      pourcentage = Number.parseFloat(form.pourcentage.replace(",", "."))
      if (isNaN(pourcentage)) {
        toast.error("Veuillez entrer un pourcentage valide.")
        return
      }
    }

    try {
      setIsLoading(true)
      const dto: UpdateTicketRestoDto = {
        fournisseur: form.fournisseur,
        codeInterne: form.codeInterne,
        pourcentage,
      }

      await updateTicketResto(entreprise.id, id, dto)
      toast.success("Ticket Resto modifié avec succès !")
      setEditingTicket(null)
      setForm({ fournisseur: "", codeInterne: "", pourcentage: "" })
      await fetchTickets()
    } catch (err: any) {
      const message = err?.response?.data?.message || "Erreur lors de la mise à jour du Ticket Resto."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!entreprise?.id) {
      toast.error("Utilisateur non authentifié.")
      return
    }

    if (confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) {
      try {
        setIsLoading(true)
        await deleteTicketResto(entreprise.id, id)
        toast.success("Fournisseur supprimé.")
        await fetchTickets()
      } catch (err: any) {
        const message = err?.response?.data?.message || "Erreur lors de la suppression du Ticket Resto."
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-orvanta py-3 px-4">
      <div className="max-w-5xl mx-auto space-y-3">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold text-white">Fournisseurs Tickets Resto</h1>
              <p className="text-white/60 text-xs">Gérez vos fournisseurs de tickets restaurant</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-2">
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 min-w-[96px]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <div>
                  <p className="text-white/60 text-[11px] leading-3">Total</p>
                  <p className="text-white font-semibold text-sm leading-4">{tickets.length}</p> 
                </div>
                
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => router("/dashboard_user/TicketResto/add")} className="text-purple-300 hover:text-white inline-flex items-center gap-1 text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all duration-200 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter nouveau ticket
                  </button>
        {/* Search and Filter Section */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/40 h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Rechercher par fournisseur ou code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <Filter className="h-3.5 w-3.5" />
              <span>
                {filteredTickets.length} résultat{filteredTickets.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-blue-500"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
                </div>
                <span className="text-white/70 text-sm">Chargement des données...</span>
              </div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <Building2 className="h-8 w-8 text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1.5">
                {searchTerm ? "Aucun résultat trouvé" : "Aucun fournisseur"}
              </h3>
              <p className="text-white/60 mb-4 max-w-md mx-auto text-sm">
                {searchTerm
                  ? "Aucun fournisseur ne correspond à votre recherche. Essayez avec d'autres termes."
                  : "Aucun fournisseur de tickets resto n'a été ajouté pour l'instant."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg shadow-blue-500/25 text-sm"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {isMobile ? (
                // Mobile Card Layout
                <div className="p-3 space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-lg border border-white/10 p-4 shadow-lg hover:shadow-xl hover:border-white/20 transition-all duration-300"
                    >
                      {editingTicket === ticket.id ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-blue-500/20 rounded-md flex items-center justify-center">
                              <Edit className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                            <h3 className="text-white font-semibold text-sm">Modification</h3>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="flex items-center gap-2 text-xs font-medium text-white/80 mb-1.5">
                                <Building2 className="h-3.5 w-3.5 text-white/60" />
                                Fournisseur
                              </label>
                              <input
                                type="text"
                                name="fournisseur"
                                value={form.fournisseur}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-md bg-black/20 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="flex items-center gap-2 text-xs font-medium text-white/80 mb-1.5">
                                <Hash className="h-3.5 w-3.5 text-white/60" />
                                Code Interne
                              </label>
                              <input
                                type="text"
                                name="codeInterne"
                                value={form.codeInterne}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-md bg-black/20 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="flex items-center gap-2 text-xs font-medium text-white/80 mb-1.5">
                                <Percent className="h-3.5 w-3.5 text-white/60" />
                                Pourcentage
                              </label>
                              <input
                                type="text"
                                name="pourcentage"
                                value={form.pourcentage}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-md bg-black/20 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-sm"
                                placeholder="Ex: 10"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2.5 pt-3 border-t border-white/10">
                            <button
                              onClick={() => handleSave(ticket.id)}
                              disabled={isLoading}
                              className="flex-1 px-3.5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md hover:from-green-700 hover:to-green-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25 text-sm"
                            >
                              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                              Enregistrer
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 px-3.5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-md hover:from-gray-700 hover:to-gray-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg shadow-gray-500/25 text-sm"
                            >
                              <X className="h-3.5 w-3.5" />
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Building2 className="h-4.5 w-4.5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold text-sm">{ticket.fournisseur}</h3>
                                <p className="text-white/60 text-xs">Code: {ticket.codeInterne}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <Percent className="h-3.5 w-3.5 text-white/60" />
                                <span className="text-white font-medium text-sm">
                                  {ticket.pourcentage !== undefined ? `${ticket.pourcentage}%` : "-"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2.5 pt-3 border-t border-white/10">
                            <button
                              onClick={() => handleEdit(ticket)}
                              className="flex-1 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-sm"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(ticket.id)}
                              className="flex-1 px-3.5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-md hover:from-red-700 hover:to-red-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 text-sm"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop Table Layout
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-white/60" />
                          Fournisseur
                        </div>
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 text-white/60" />
                          Code Interne
                        </div>
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                        <div className="flex items-center gap-2">
                          <Percent className="h-3.5 w-3.5 text-white/60" />
                          Pourcentage
                        </div>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-white/90 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        className={`group hover:bg-white/5 transition-all duration-300 ${
                          index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                        }`}
                      >
                        {editingTicket === ticket.id ? (
                          <>
                            <td className="px-4 py-2.5">
                              <input
                                type="text"
                                name="fournisseur"
                                value={form.fournisseur}
                                onChange={handleChange}
                                className="w-full px-2.5 py-1.5 rounded-md bg-black/20 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-sm"
                                required
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <input
                                type="text"
                                name="codeInterne"
                                value={form.codeInterne}
                                onChange={handleChange}
                                className="w-full px-2.5 py-1.5 rounded-md bg-black/20 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-sm"
                                required
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <input
                                type="text"
                                name="pourcentage"
                                value={form.pourcentage}
                                onChange={handleChange}
                                className="w-full px-2.5 py-1.5 rounded-md bg-black/20 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-sm"
                                placeholder="Ex: 10"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-center gap-2.5">
                                <button
                                  onClick={() => handleSave(ticket.id)}
                                  disabled={isLoading}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md hover:from-green-700 hover:to-green-600 transition-all duration-200 font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25 text-xs"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Save className="h-3.5 w-3.5" />
                                  )}
                                  Enregistrer
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-md hover:from-gray-700 hover:to-gray-600 transition-all duration-200 font-medium flex items-center gap-1.5 shadow-lg shadow-gray-500/25 text-xs"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Annuler
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                  <Building2 className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-white font-semibold text-sm">{ticket.fournisseur}</div>
                                  <div className="text-white/60 text-xs">Fournisseur</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-md text-blue-300 font-mono text-xs">
                                  {ticket.codeInterne}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {ticket.pourcentage !== undefined ? (
                                  <span className="inline-flex items-center px-2.5 py-1 bg-green-500/20 border border-green-500/30 rounded-md text-green-300 font-medium text-xs">
                                    {ticket.pourcentage}%
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 bg-gray-500/20 border border-gray-500/30 rounded-md text-gray-400 text-xs">
                                    Non défini
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2.5">
                                <button
                                  onClick={() => handleEdit(ticket)}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-medium flex items-center gap-1.5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 text-xs"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleDelete(ticket.id)}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-md hover:from-red-700 hover:to-red-600 transition-all duration-300 font-medium flex items-center gap-1.5 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 text-xs"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
