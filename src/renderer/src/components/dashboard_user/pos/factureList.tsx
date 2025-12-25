// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { Search, FileText, Eye, Filter } from "lucide-react"
// import { useAuth } from "../../auth/auth-context"
// import { toast } from "react-toastify"
// import { getFactures, getFacturesByType, Facture, SearchFactureDto, FactureType } from "../../../app/api/facture"
// import { useDeviceType } from "../../../src/hooks/useDeviceType"
// import { useRouter } from "next/navigation"

// interface SearchFilters {
//   denominationClient: string
//   num: string
//   dateDebut: string
//   dateFin: string
//   dateEcheanceDebut: string
//   dateEcheanceFin: string
//   type: FactureType | ""
// }

// interface FactureData {
//   id: string
//   num: string
//   type: FactureType
//   dateEmission: string
//   dateEcheance: string
//   totalNet: number
//   denominationClient: string
// }

// export function FactureList() {
//   const { entreprise, user, loading: authLoading } = useAuth()
//   const [factureData, setFactureData] = useState<FactureData[]>([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [searchFilters, setSearchFilters] = useState<SearchFilters>({
//     denominationClient: "",
//     num: "",
//     dateDebut: "",
//     dateFin: "",
//     dateEcheanceDebut: "",
//     dateEcheanceFin: "",
//     type: "",
//   })
//   const router = useRouter()
//   const { isMobile, isTablet, isIPadMini, isIPadPro, isSUNMITablet, isDesktop, isSurfaceDuo, sunMy } = useDeviceType()

//   // Redirect if unauthorized
//   if (!authLoading && (!user || !user.isActive)) {
//     router.push("/banned")
//     return null
//   }
//   if (!authLoading && user && user.role !== "ADMIN" && !user.permissions.includes("Gestion des factures")) {
//     router.push("/unauthorized")
//     return null
//   }

//   const fetchFactureData = async () => {
//     if (!entreprise?.id) {
//       setError("Utilisateur non authentifié.")
//       toast.error("Utilisateur non authentifié.")
//       return
//     }

//     setIsLoading(true)
//     setError(null)

//     try {
//       let factures: Facture[] = []

//       // Use getFacturesByType if type is selected, otherwise use getFactures
//       if (searchFilters.type) {
//         factures = await getFacturesByType(entreprise.id, searchFilters.type as FactureType)
//       } else {
//         const params: SearchFactureDto = {
//           denominationClient: searchFilters.denominationClient.trim() || undefined,
//           num: searchFilters.num.trim() || undefined,
//           dateDebut: searchFilters.dateDebut || undefined,
//           dateFin: searchFilters.dateFin || undefined,
//           dateEcheanceDebut: searchFilters.dateEcheanceDebut || undefined,
//           dateEcheanceFin: searchFilters.dateEcheanceFin || undefined,
//           type: searchFilters.type || undefined,
//         }
//         factures = await getFactures(entreprise.id, params)
//       }

//       const formattedData: FactureData[] = factures
//         .map((facture) => ({
//           id: facture.id,
//           num: facture.num || "N/A",
//           type: facture.type,
//           dateEmission: new Date(facture.dateEmission).toLocaleDateString("fr-FR", {
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit",
//           }),
//           dateEcheance: new Date(facture.dateEcheance).toLocaleDateString("fr-FR", {
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit",
//           }),
//           totalNet: facture.totalNet || 0,
//           denominationClient: facture.denominationClient || "N/A",
//         }))
//         .sort((a, b) => {
//           return (
//             new Date(b.dateEmission.split("/").reverse().join("-")).getTime() -
//             new Date(a.dateEmission.split("/").reverse().join("-")).getTime()
//           )
//         })

//       setFactureData(formattedData)
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.message || "Erreur lors du chargement des factures."
//       setError(errorMessage)
//       toast.error(errorMessage)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchFactureData()
//   }, [entreprise?.id, authLoading])

//   const handleSearch = () => {
//     fetchFactureData()
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target
//     setSearchFilters((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleViewFacture = (id: string) => {
//     router.push(`/dashboard_user/sales/facture-list/${id}`)
//   }

//   return (
//     <div className={`min-h-screen bg-orvanta ${isMobile ? "p-2" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "p-3" : "p-4"}`}>
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-4">
//           <div className={`bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 ${isMobile ? "p-2.5" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "p-3" : "p-4"}`}>
//             <div className={`flex items-center gap-2 ${isMobile ? "flex-col text-center gap-1.5" : "flex-row"}`}>
//               <div className={`bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md ${isMobile ? "w-8 h-8" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "w-9 h-9" : "w-10 h-10"}`}>
//                 <FileText className={`text-white ${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
//               </div>
//               <div>
//                 <h1 className={`font-bold text-white tracking-tight ${isMobile ? "text-lg" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "text-xl" : "text-xl"}`}>Liste des Factures</h1>
//                 <p className={`text-purple-200/80 ${isMobile ? "text-xs" : "text-sm"}`}>Gérez et consultez vos factures</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search Filters */}
//         <div className="bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 p-4 mb-4">
//           <div className="flex items-center gap-2 mb-4">
//             <Filter className="w-4 h-4 text-purple-300" />
//             <h2 className="text-sm font-semibold text-purple-200">Filtres de recherche</h2>
//           </div>
//           <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-3"}`}>
//             <div className="group">
//               <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
//                 Dénomination Client
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="denominationClient"
//                   value={searchFilters.denominationClient}
//                   onChange={handleInputChange}
//                   className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//                   placeholder="Rechercher par client..."
//                 />
//                 <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
//               </div>
//             </div>
//             <div className="group">
//               <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
//                 Numéro de Facture
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="num"
//                   value={searchFilters.num}
//                   onChange={handleInputChange}
//                   className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//                   placeholder="Rechercher par numéro..."
//                 />
//                 <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
//               </div>
//             </div>
//             <div className="group">
//               <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
//                 Type de Facture
//               </label>
//               <select
//                 name="type"
//                 value={searchFilters.type}
//                 onChange={handleInputChange}
//                 className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//               >
//                 <option value="" className="text-black">Tous les types</option>
//                 <option value="FACTURE" className="text-black">Facture</option>
//                 <option value="BDC" className="text-black">Bon de Commande</option>
//                 <option value="DEV" className="text-black">Devis</option>
//               </select>
//             </div>
//             {/* Title: Date Émission */}
//             <div className="col-span-1 sm:col-span-2 lg:col-span-3">
//               <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wide mt-1">Date Émission</h3>
//             </div>
//             <div className="group">
              
//               <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
//                 Date Émission Début
//               </label>
//               <input
//                 type="date"
//                 name="dateDebut"
//                 value={searchFilters.dateDebut}
//                 onChange={handleInputChange}
//                 className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//               />
//             </div>
//             <div className="group">
//               <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
//                 Date Émission Fin
//               </label>
//               <input
//                 type="date"
//                 name="dateFin"
//                 value={searchFilters.dateFin}
//                 onChange={handleInputChange}
//                 className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//               />
//             </div>
//             {/* Title: Date Échéance */}
//             <div className="col-span-1 sm:col-span-2 lg:col-span-3">
//               <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wide mt-1">Date Échéance</h3>
//             </div>
//             <div className="group">
//               <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
//                 Date Échéance Début
//               </label>
//               <input
//                 type="date"
//                 name="dateEcheanceDebut"
//                 value={searchFilters.dateEcheanceDebut}
//                 onChange={handleInputChange}
//                 className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//               />
//             </div>
//             <div className="group">
//               <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
//                 Date Échéance Fin
//               </label>
//               <input
//                 type="date"
//                 name="dateEcheanceFin"
//                 value={searchFilters.dateEcheanceFin}
//                 onChange={handleInputChange}
//                 className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//               />
//             </div>
//           </div>
//           <div className="flex justify-end mt-4">
//             <button
//               onClick={handleSearch}
//               className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm flex items-center gap-2"
//               disabled={isLoading}
//             >
//               <Search className="w-4 h-4" />
//               Rechercher
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
//           {isLoading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
//               <span className="ml-2 text-white text-sm">Chargement...</span>
//             </div>
//           ) : error ? (
//             <div className="p-4 text-center text-red-400 text-sm">{error}</div>
//           ) : factureData.length === 0 ? (
//             <div className="p-4 text-center text-purple-200/80 text-sm">Aucune facture trouvée.</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
//                     <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
//                       Date Émission
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
//                       Numéro
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
//                       Type
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
//                       Total
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
//                       Date Échéance
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
//                       Client
//                     </th>
//                     <th className="px-4 py-3 text-right text-xs font-bold text-white/90 uppercase tracking-wide">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-white/5">
//                   {factureData.map((facture, index) => (
//                     <tr
//                       key={facture.id}
//                       className={`group hover:bg-white/5 transition-all duration-300 ${
//                         index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
//                       }`}
//                     >
//                       <td className="px-4 py-4">
//                         <div className="text-white/90 font-semibold text-sm">{facture.dateEmission}</div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 font-mono text-xs">
//                           {facture.num}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="text-white/90 font-semibold text-sm">
//                           {facture.type === "FACTURE" ? "Facture" : facture.type === "BDC" ? "Bon de Commande" : "Devis"}
//                         </div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="text-white font-bold text-base">
//                           {facture.totalNet.toLocaleString()} <span className="text-white/70 text-xs font-medium">DT</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="text-white/90 font-semibold text-sm">{facture.dateEcheance}</div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="text-white/90 font-semibold text-sm">{facture.denominationClient}</div>
//                       </td>
//                       <td className="px-4 py-4 text-right">
//                         <button
//                           onClick={() => handleViewFacture(facture.id)}
//                           className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold flex items-center gap-1.5 text-xs ml-auto shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
//                         >
//                           <Eye className="h-3 w-3" />
//                           <span>Voir</span>
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, FileText, Eye, Filter, RotateCcw } from "lucide-react"
import { useAuth } from "../../auth/auth-context"
import { toast } from "react-toastify"
import { getFactures, getFacturesByType, Facture, SearchFactureDto, FactureType } from "@renderer/api/facture"
import { useDeviceType } from "@renderer/hooks/useDeviceType"
import { useNavigate } from "react-router-dom"

interface SearchFilters {
  denominationClient: string
  num: string
  dateDebut: string
  dateFin: string
  dateEcheanceDebut: string
  dateEcheanceFin: string
  type: FactureType | ""
}

interface FactureData {
  id: string
  num: string
  type: FactureType
  dateEmission: string
  dateEcheance: string
  totalNet: number
  denominationClient: string
}

export function FactureList() {
  const { entreprise, user, loading: authLoading } = useAuth()
  const [factureData, setFactureData] = useState<FactureData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    denominationClient: "",
    num: "",
    dateDebut: "",
    dateFin: "",
    dateEcheanceDebut: "",
    dateEcheanceFin: "",
    type: "",
  })
  const router = useNavigate()
  const { isMobile, isTablet, isIPadMini, isIPadPro, isSUNMITablet } = useDeviceType()

  // Redirect if unauthorized
  if (!authLoading && (!user || !user.isActive)) {
    router("/banned")
    return null
  }
  if (!authLoading && user && user.role !== "ADMIN" && !user.permissions.includes("Gestion des factures")) {
    router("/unauthorized")
    return null
  }

  const fetchFactureData = async () => {
    if (!entreprise?.id) {
      setError("Utilisateur non authentifié.")
      toast.error("Utilisateur non authentifié.")
      return
    }

    setIsLoading(false)
    setError(null)

    try {
      let factures: Facture[] = []

      // Use getFacturesByType if type is selected, otherwise use getFactures
      if (searchFilters.type) {
        factures = await getFacturesByType(entreprise.id, searchFilters.type as FactureType)
      } else {
        const params: SearchFactureDto = {
          denominationClient: searchFilters.denominationClient.trim() || undefined,
          num: searchFilters.num.trim() || undefined,
          dateDebut: searchFilters.dateDebut || undefined,
          dateFin: searchFilters.dateFin || undefined,
          dateEcheanceDebut: searchFilters.dateEcheanceDebut || undefined,
          dateEcheanceFin: searchFilters.dateEcheanceFin || undefined,
          type: searchFilters.type || undefined,
        }
        factures = await getFactures(entreprise.id, params)
      }

      const formattedData: FactureData[] = factures
        .map((facture) => ({
          id: facture.id,
          num: facture.num || "N/A",
          type: facture.type,
          dateEmission: new Date(facture.dateEmission).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          dateEcheance: new Date(facture.dateEcheance).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          totalNet: facture.totalNet || 0,
          denominationClient: facture.denominationClient || "N/A",
        }))
        .sort((a, b) => {
          return (
            new Date(b.dateEmission.split("/").reverse().join("-")).getTime() -
            new Date(a.dateEmission.split("/").reverse().join("-")).getTime()
          )
        })

      setFactureData(formattedData)
      setIsLoading(false)
    } catch (err: unknown) {
      const errorMessage = err || "Erreur lors du chargement des factures."
      setError(String(errorMessage))
      toast.error(String(errorMessage))
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFactureData()
  }, [entreprise?.id, authLoading])

  const handleSearch = () => {
    fetchFactureData()
  }

  const handleReset = () => {
    setSearchFilters({
      denominationClient: "",
      num: "",
      dateDebut: "",
      dateFin: "",
      dateEcheanceDebut: "",
      dateEcheanceFin: "",
      type: "",
    })
    fetchFactureData() // Refresh the table with all factures
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSearchFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleViewFacture = (id: string) => {
    router(`/dashboard_user/sales/facture-list/${id}`)
  }

  return (
    <div className={`min-h-screen bg-orvanta ${isMobile ? "p-2" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "p-3" : "p-4"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className={`bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 ${isMobile ? "p-2.5" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "p-3" : "p-4"}`}>
            <div className={`flex items-center gap-2 ${isMobile ? "flex-col text-center gap-1.5" : "flex-row"}`}>
              <div className={`bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md ${isMobile ? "w-8 h-8" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "w-9 h-9" : "w-10 h-10"}`}>
                <FileText className={`text-white ${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
              </div>
              <div>
                <h1 className={`font-bold text-white tracking-tight ${isMobile ? "text-lg" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "text-xl" : "text-xl"}`}>Liste des Factures</h1>
                <p className={`text-purple-200/80 ${isMobile ? "text-xs" : "text-sm"}`}>Gérez et consultez vos factures</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-purple-300" />
            <h2 className="text-sm font-semibold text-purple-200">Filtres de recherche</h2>
          </div>
          <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-3"}`}>
            <div className="group">
              <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
                Dénomination Client
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="denominationClient"
                  value={searchFilters.denominationClient}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
                  placeholder="Rechercher par client..."
                />
                <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
                Numéro de Facture
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="num"
                  value={searchFilters.num}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
                  placeholder="Rechercher par numéro..."
                />
                <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
                Type de Facture
              </label>
              <select
                name="type"
                value={searchFilters.type}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
              >
                <option value="" className="text-black">Tous les types</option>
                <option value="FACTURE" className="text-black">Facture</option>
                <option value="BDC" className="text-black">Bon de Commande</option>
                <option value="DEV" className="text-black">Devis</option>
              </select>
            </div>
            {/* Title: Date Émission */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
              <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wide mt-1">Date Émission</h3>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
                Date Émission Début
              </label>
              <input
                type="date"
                name="dateDebut"
                value={searchFilters.dateDebut}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
                Date Émission Fin
              </label>
              <input
                type="date"
                name="dateFin"
                value={searchFilters.dateFin}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
              />
            </div>
            {/* Title: Date Échéance */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
              <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wide mt-1">Date Échéance</h3>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
                Date Échéance Début
              </label>
              <input
                type="date"
                name="dateEcheanceDebut"
                value={searchFilters.dateEcheanceDebut}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-purple-200 mb-1 group-focus-within:text-purple-300 transition-colors">
                Date Échéance Fin
              </label>
              <input
                type="date"
                name="dateEcheanceFin"
                value={searchFilters.dateEcheanceFin}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm flex items-center gap-2"
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm flex items-center gap-2"
              disabled={isLoading}
            >
              <Search className="w-4 h-4" />
              Rechercher
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <span className="ml-2 text-white text-sm">Chargement...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400 text-sm">{error}</div>
          ) : factureData.length === 0 ? (
            <div className="p-4 text-center text-purple-200/80 text-sm">Aucune facture trouvée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
                    <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                      Date Émission
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                      Numéro
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                      Date Échéance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wide">
                      Client
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-white/90 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {factureData.map((facture, index) => (
                    <tr
                      key={facture.id}
                      className={`group hover:bg-white/5 transition-all duration-300 ${
                        index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="text-white/90 font-semibold text-sm">{facture.dateEmission}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 font-mono text-xs">
                          {facture.num}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-white/90 font-semibold text-sm">
                          {facture.type === "FACTURE" ? "Facture" : facture.type === "BDC" ? "Bon de Commande" : "Devis"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-white font-bold text-base">
                          {facture.totalNet.toLocaleString()} <span className="text-white/70 text-xs font-medium">DT</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-white/90 font-semibold text-sm">{facture.dateEcheance}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-white/90 font-semibold text-sm">{facture.denominationClient}</div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleViewFacture(facture.id)}
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
  )
}