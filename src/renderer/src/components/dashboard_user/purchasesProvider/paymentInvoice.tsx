"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Eye, Edit, Trash2, Calendar, Users, AlertTriangle } from "lucide-react"
import { useAuth } from "../../auth/auth-context"
import { toast } from "react-toastify"
import {
  getAchatFournisseurs,
  deleteAchatFournisseur,
} from "@renderer/api/achat-fournisseur"
import type { AchatFournisseur } from "@renderer/types/achat-entree"
import { useDeviceType } from "@renderer/hooks/useDeviceType"

// Set app element for react-modal only on client-side
// if (typeof window !== "undefined") {
//   const appElement = document.getElementById("__next")
//   if (appElement) {
//     Modal.setAppElement(appElement)
//   }
// }

export default function PaiementsFournisseurs() {
  const { entreprise } = useAuth()
  const { isMobile, isTablet, isIPadMini,  isSUNMITablet } = useDeviceType()
  const router = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [payments, setPayments] = useState<AchatFournisseur[]>([])
  const [loading, setLoading] = useState(true)
  const [_isModalOpen, _setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!entreprise?.id) {
      toast.error("Utilisateur non authentifié.")
      setLoading(false)
      return
    }

    const fetchPayments = async () => {
      try {
        setLoading(true)
        const data = await getAchatFournisseurs(entreprise.id)
        console.log("Fetched payments:", JSON.stringify(data, null, 2)) // Enhanced logging
        setPayments(data)
      } catch (err) {
        toast.error("Erreur lors du chargement des factures")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [entreprise?.id])

  const parseCurrency = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0
    if (typeof value === "number") return value
    // Remove commas and convert to number (e.g., "50,000" -> 50000)
    return Number(value.replace(/,/g, "")) || 0
  }

  const getStatus = (payment: AchatFournisseur) => {
    const today = new Date()
    const echeance = new Date(payment.dateEcheance)
    const montantComptant = parseCurrency(payment.montantComptant)
    const montantTotal = parseCurrency(payment.montantTotal)

    // Debug logging
    console.log(
      `Invoice ${payment.numeroFacture}: montantComptant=${montantComptant}, montantTotal=${montantTotal}, dateEcheance=${payment.dateEcheance}, status=${montantComptant >= montantTotal ? "Payé" : montantComptant > 0 && montantComptant < montantTotal ? "Partiel" : montantComptant === 0 && echeance < today ? "En retard" : "En attente"}`,
    )

    // Handle edge cases
    if (montantTotal <= 0 || montantComptant < 0 || isNaN(echeance.getTime())) {
      return "Invalide"
    }

    // Use epsilon for floating-point comparison
    const epsilon = 0.01
    if (Math.abs(montantComptant - montantTotal) < epsilon || montantComptant >= montantTotal) {
      return "Payé"
    }

    if (montantComptant > 0 && montantComptant < montantTotal) {
      return "Partiel"
    }

    if (montantComptant === 0 && echeance < today) {
      return "En retard"
    }

    return "En attente"
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || getStatus(payment) === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Payé":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "En attente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "En retard":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Partiel":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Invalide":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime())
      ? "Date invalide"
      : date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
  }

  const totalAmount = payments.reduce((sum, payment) => sum + parseCurrency(payment.montantTotal), 0)
  const totalPaid = payments.reduce(
    (sum, payment) => sum + (getStatus(payment) === "Payé" ? parseCurrency(payment.montantTotal) : 0),
    0,
  )

  const handleView = (id: string) => {
    router(`/dashboard_user/purchasesProvider/details/${id}`);
  }

  const handleEdit = (id: string) => {
    router(`/dashboard_user/purchasesProvider/edit/${id}`)
  }

  // const handleEditFromModal = () => {
  //   if (selectedInvoice) {
  //     setIsModalOpen(false)
  //     router(`/dashboard_user/purchasesProvider/edit/${selectedInvoice.id}`)
  //   }
  // }

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!entreprise?.id || !invoiceToDelete) {
      toast.error("Utilisateur non authentifié.")
      return
    }

    setIsDeleting(true)

    try {
      await deleteAchatFournisseur(entreprise.id, invoiceToDelete)
      setPayments(payments.filter((p) => p.id !== invoiceToDelete))
      toast.success("Facture supprimée avec succès")
      setIsDeleteModalOpen(false)
      setInvoiceToDelete(null)
    } catch (err) {
      toast.error("Erreur lors de la suppression de la facture")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setInvoiceToDelete(null)
  }

  // const closeModal = () => {
  //   setIsModalOpen(false)
  // }

  // const isImage = (url?: string) => {
  //   if (!url) return false
  //   const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"]
  //   return imageExtensions.some((ext) => url.toLowerCase().endsWith(`.${ext}`))
  // }

  // const isPdf = (url?: string) => {
  //   if (!url) return false
  //   return url.toLowerCase().endsWith(".pdf")
  // }

  // const getFileUrl = (url?: string) => {
  //   if (!url) return ""
  //   if (url.startsWith("/uploads")) {
  //     return `http://localhost:4000${url}`
  //   }
  //   return url
  // }

  if (loading) {
    return <div className="text-white text-center p-3">Chargement...</div>
  }

  if (!entreprise) {
    return <div className="text-white text-center p-3">Veuillez vous connecter.</div>
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white/5 to-white/[0.02] ${isMobile ? 'p-0.5' : isTablet || isIPadMini ? 'p-1.5' : isSUNMITablet ? 'p-3' : 'p-4'}`}>
      <div className={`mx-auto ${isMobile ? 'max-w-full p-0.5' : isTablet || isIPadMini ? 'max-w-2xl p-1.5' : isSUNMITablet ? 'max-w-4xl p-3' : 'container p-4'}`}>
        {/* Header */}
        <div className="mb-3">
          <h1 className={`${isMobile ? 'text-sm' : isTablet || isIPadMini ? 'text-base' : 'text-lg'} font-bold text-white`}>Paiements Fournisseurs</h1>
          <p className={`text-white/60 ${isMobile ? 'text-[10px]' : isTablet || isIPadMini ? 'text-xs' : 'text-sm'}`}>Gestion et suivi des paiements</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className={`bg-black/20 backdrop-blur-sm border border-white/10 ${isMobile ? 'p-0.5' : isTablet || isIPadMini ? 'p-1.5' : 'p-2'} rounded-lg`}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-0.5 md:pb-1">
              <h3 className="text-[10px] md:text-xs font-medium text-white/80">Montant Total</h3>
            </div>
            <div className="text-xs md:text-base font-bold text-white">{formatCurrency(totalAmount)}</div>
          </div>
          <div className={`bg-black/20 backdrop-blur-sm border border-white/10 ${isMobile ? 'p-0.5' : isTablet || isIPadMini ? 'p-1.5' : 'p-2'} rounded-lg`}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-0.5 md:pb-1">
              <h3 className="text-[10px] md:text-xs font-medium text-white/80">Montant Payé</h3>
            </div>
            <div className="text-xs md:text-base font-bold text-white">{formatCurrency(totalPaid)}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 mb-3 p-1.5 md:p-2 rounded-lg">
          <div className={`flex flex-col ${isMobile ? '' : 'lg:flex-row'} gap-1.5 ${isTablet || isIPadMini ? 'md:gap-2' : 'md:gap-2'} items-center justify-between`}>
            <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 flex-1">
              <div className="relative flex-1 max-w-xs md:max-w-md">
                <Search className={`absolute left-1.5 ${isMobile ? '' : 'md:left-2'} top-1/2 transform -translate-y-1/2 text-white/40 ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                <input
                  type="text"
                  placeholder="Rechercher par fournisseur ou numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-7 ${isMobile ? '' : 'md:pl-8'} w-full px-1.5 ${isMobile ? '' : 'md:px-2'} py-0.5 ${isMobile ? '' : 'md:py-1'} bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 rounded-md text-[10px] md:text-xs`}
                />
              </div>
              <div className="w-full sm:w-32 md:w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full px-1.5 ${isMobile ? '' : 'md:px-2'} py-0.5 ${isMobile ? '' : 'md:py-1'} bg-black/20 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 text-[10px] md:text-xs`}
                >
                  <option value="all">Tous</option>
                  <option value="En attente">En attente</option>
                  <option value="Payé">Payé</option>
                  <option value="En retard">En retard</option>
                  <option value="Partiel">Partiel</option>
                  <option value="Invalide">Invalide</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => router("/dashboard_user/purchasesProvider/add-invoice")}
              className={`px-1.5 ${isMobile ? '' : 'md:px-3'} py-0.5 ${isMobile ? '' : 'md:py-1'} bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-md text-[10px] md:text-xs`}
            >
              <Plus className="h-2.5 md:h-3 w-2.5 md:w-3 mr-1 md:mr-1.5 inline" /> Nouveau
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg">
          <div className="overflow-x-auto">
            {isMobile ? (
              <div className="space-y-1.5">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="bg-white/5 border border-white/10 rounded-lg p-2 text-white flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Facture:</span>
                      <span className="text-xs">{payment.numeroFacture}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Fournisseur:</span>
                      <span className="flex items-center gap-1 text-xs">
                        <span className="rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center w-4 h-4"><Users className="h-2.5 w-2.5 text-white" /></span>
                        {payment.fournisseur}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Échéance:</span>
                      <span className="flex items-center gap-1 text-xs"><Calendar className="h-2.5 w-2.5 text-white/40" />{formatDate(payment.dateEcheance)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Montant:</span>
                      <span className="text-xs">{formatCurrency(parseCurrency(payment.montantTotal))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Statut:</span>
                      <span className={`${getStatusColor(getStatus(payment))} border px-1 py-0.5 text-[10px] rounded`}>{getStatus(payment)}</span>
                    </div>
                    <div className="flex gap-1.5 pt-1.5">
                      <button onClick={() => handleView(payment.id)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-0.5" title="Voir détails"><Eye className="h-3 w-3" /></button>
                      <button onClick={() => handleEdit(payment.id)} className="text-white/70 hover:text-white hover:bg-white/10 rounded p-0.5"><Edit className="h-2.5 w-2.5" /></button>
                      <button onClick={() => handleDeleteClick(payment.id)} className="text-white/70 hover:text-red-400 hover:bg-red-500/20 rounded p-0.5"><Trash2 className="h-2.5 w-2.5" /></button>
                    </div>
                  </div>
                ))}
                {filteredPayments.length === 0 && (
                  <div className="text-center p-1.5">
                    <div className="text-white/60 text-[10px] mb-0.5">Aucun paiement trouvé</div>
                    <div className="text-white/40 text-[10px]">Modifiez vos critères</div>
                  </div>
                )}
              </div>
            ) : (
              <table className={`w-full ${isTablet || isIPadMini ? 'text-xs' : 'text-sm'}`}>
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-1.5 md:p-2 text-[10px] md:text-xs font-semibold text-white/80">Facture</th>
                    <th className="text-left p-1.5 md:p-2 text-[10px] md:text-xs font-semibold text-white/80">Fournisseur</th>
                    <th className="text-left p-1.5 md:p-2 text-[10px] md:text-xs font-semibold text-white/80">Échéance</th>
                    <th className="text-left p-1.5 md:p-2 text-[10px] md:text-xs font-semibold text-white/80">Montant</th>
                    <th className="text-left p-1.5 md:p-2 text-[10px] md:text-xs font-semibold text-white/80">Statut</th>
                    <th className="text-left p-1.5 md:p-2 text-[10px] md:text-xs font-semibold text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-1.5 md:p-2">
                        <div className={`font-medium text-white text-xs md:text-xs`}>{payment.numeroFacture}</div>
                        <div className={`text-white/60 text-xs md:text-xs`}>Créé le {formatDate(payment.createdAt)}</div>
                      </td>
                      <td className="p-1.5 md:p-2">
                        <div className="flex items-center">
                          <div className={`rounded-full flex items-center justify-center w-5 md:w-6 h-5 md:h-6 mr-1.5 bg-gradient-to-br from-purple-600 to-purple-500`}>
                            <Users className={`h-3 w-3 text-white`} />
                          </div>
                          <div className={`font-medium text-white text-xs md:text-xs`}>{payment.fournisseur}</div>
                        </div>
                      </td>
                      <td className="p-1.5 md:p-2">
                        <div className={`flex items-center text-white text-xs md:text-xs`}>
                          <Calendar className={`h-3 w-3 mr-1.5 text-white/40`} />
                          {formatDate(payment.dateEcheance)}
                        </div>
                      </td>
                      <td className="p-1.5 md:p-2 font-semibold text-white text-xs md:text-xs">
                        <span>{formatCurrency(parseCurrency(payment.montantTotal))}</span>
                      </td>
                      <td className="p-1.5 md:p-2">
                        <span className={`${getStatusColor(getStatus(payment))} border px-1.5 py-0.5 text-xs md:text-xs rounded`}>
                          {getStatus(payment)}
                        </span>
                      </td>
                      <td className="p-1.5 md:p-2">
                        <div className="flex gap-1.5">
                          <button onClick={() => handleView(payment.id)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5" title="Voir détails"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => handleEdit(payment.id)} className="text-white/70 hover:text-white hover:bg-white/10 rounded p-1.5"><Edit className="h-3 w-3" /></button>
                          <button onClick={() => handleDeleteClick(payment.id)} className="text-white/70 hover:text-red-400 hover:bg-red-500/20 rounded p-1.5"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#18122B] bg-gradient-to-br from-[#18122B]/95 to-white/5 backdrop-blur-xl rounded-lg p-3 md:p-4 max-w-sm w-full mx-auto shadow-xl border border-red-500/20 transition-all duration-200">
              <div className="text-white space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Confirmer la suppression</h2>
                    <p className="text-red-200/70 text-xs">Cette action est irréversible</p>
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  <p className="text-white/90 text-xs">
                    Êtes-vous sûr de vouloir supprimer cette facture ?
                    <br />
                    <span className="text-red-300 font-medium text-xs">Cette action ne peut pas être annulée.</span>
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-1.5">
                  <button
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="px-3 py-1.5 bg-gray-600/20 hover:bg-gray-600/30 text-white rounded text-xs border border-gray-500/30 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs border border-red-500/30 transition-colors disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}