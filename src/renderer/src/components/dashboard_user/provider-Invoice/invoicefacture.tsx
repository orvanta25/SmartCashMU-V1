// "use client"

// import { useState, useEffect, useRef } from "react"
// import { ArrowLeft, Download, Printer } from "lucide-react"
// import { useDeviceType } from "../../../src/hooks/useDeviceType"
// import jsPDF from "jspdf"
// import { getFactureById, getVentesByFactureId, FactureType } from "@renderer/api/facture"
// import { getMyFacture } from "@renderer/api/my-facture"
// import { useAuth } from "../../auth/auth-context"
// import { toast } from "react-toastify"
// import { useParams, useRouter } from "next/navigation"
// import { API_URL } from "@renderer/api/index"

// export default function InvoiceFacture() {
//   const { entreprise } = useAuth()
//   const params = useParams()
//   const router = useRouter()
//   const factureId = params.factureId as string
//   const { isMobile, isTablet, isIPadMini, isIPadPro, isSUNMITablet, isDesktop } = useDeviceType()
//   const invoiceRef = useRef<HTMLDivElement>(null)
//   const [facture, setFacture] = useState<{
//     num: string
//     type: FactureType
//     dateEmission: string
//     dateEcheance: string
//     denomination: string
//     matriculeFiscale: string
//     banque: string
//     rib: string
//     logo?: string
//     denominationClient: string
//     matriculeFiscaleClient?: string
//     adresseClient: string
//     clientTelephone?: string
//     totalHT: number
//     totalTVA: number
//     totalNet: number
//     timbreFiscal?: number
//     remise?: number
//   } | null>(null)
//   const [ventes, setVentes] = useState<{
//     codeBarre: string
//     designation: string
//     puht: number
//     tva: number
//     puttc: number
//     quantite: number
//     totalHT: number
//   }[]>([])
//   const [myFacture, setMyFacture] = useState<{
//     adresses: string[]
//     emails: string[]
//     telephones: string[]
//     mobiles: string[]
//   } | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   // Color customization states
//   const [rowColor, setRowColor] = useState("#eff6ff")
//   const [colColor, setColColor] = useState("#1e40af")
//   const [headerFromColor, setHeaderFromColor] = useState("#2563eb")
//   const [headerViaColor, setHeaderViaColor] = useState("#3b82f6")
//   const [headerToColor, setHeaderToColor] = useState("#2563eb")

//   const colorThemes = [
//     {
//       name: "Blue",
//       headerFrom: "#2563eb",
//       headerVia: "#3b82f6",
//       headerTo: "#2563eb",
//       row: "#eff6ff",
//       col: "#1e40af",
//     },
//     {
//       name: "Green",
//       headerFrom: "#16a34a",
//       headerVia: "#22d3ee",
//       headerTo: "#16a34a",
//       row: "#f0fdf4",
//       col: "#166534",
//     },
//     {
//       name: "Purple",
//       headerFrom: "#7c3aed",
//       headerVia: "#a78bfa",
//       headerTo: "#7c3aed",
//       row: "#f5f3ff",
//       col: "#6d28d9",
//     },
//     {
//       name: "Orange",
//       headerFrom: "#f59e42",
//       headerVia: "#fbbf24",
//       headerTo: "#f59e42",
//       row: "#fff7ed",
//       col: "#c2410c",
//     },
//     {
//       name: "Gray",
//       headerFrom: "#6b7280",
//       headerVia: "#9ca3af",
//       headerTo: "#6b7280",
//       row: "#f3f4f6",
//       col: "#374151",
//     },
//   ]

//   const handleThemeChange = (theme: typeof colorThemes[0]) => {
//     setHeaderFromColor(theme.headerFrom)
//     setHeaderViaColor(theme.headerVia)
//     setHeaderToColor(theme.headerTo)
//     setRowColor(theme.row)
//     setColColor(theme.col)
//   }

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!entreprise?.id || !factureId) {
//         setError("Utilisateur non authentifié ou facture non spécifiée.")
//         toast.error("Utilisateur non authentifié ou facture non spécifiée.")
//         setIsLoading(false)
//         return
//       }

//       setIsLoading(true)
//       setError(null)

//       try {
//         // Fetch facture details
//         const factureResponse = await getFactureById(entreprise.id, factureId)
//         setFacture({
//           num: factureResponse.facture.num,
//           type: factureResponse.facture.type,
//           dateEmission: factureResponse.facture.dateEmission,
//           dateEcheance: factureResponse.facture.dateEcheance,
//           denomination: factureResponse.facture.denomination,
//           matriculeFiscale: factureResponse.facture.matriculeFiscale,
//           banque: factureResponse.facture.banque,
//           rib: factureResponse.facture.rib,
//           logo: factureResponse.facture.logo,
//           denominationClient: factureResponse.facture.denominationClient,
//           matriculeFiscaleClient: factureResponse.facture.matriculeFiscaleClient,
//           adresseClient: factureResponse.facture.adresseClient,
//           clientTelephone: factureResponse.facture.clientTelephone,
//           totalHT: Number(factureResponse.facture.totalHT) || 0,
//           totalTVA: Number(factureResponse.facture.totalTVA) || 0,
//           totalNet: Number(factureResponse.facture.totalNet) || 0,
//           timbreFiscal: factureResponse.facture.timbreFiscal ? Number(factureResponse.facture.timbreFiscal) : undefined,
//           remise: factureResponse.facture.remise ? Number(factureResponse.facture.remise) : undefined,
//         })

//         // Fetch ventes
//         const ventesResponse = await getVentesByFactureId(entreprise.id, factureId)
//         const formattedVentes = ventesResponse.map((vente) => ({
//           codeBarre: vente.codeBarre || "N/A",
//           designation: vente.designation || "Sans nom",
//           puht: Number(vente.puht) || 0,
//           tva: Number(vente.tva) || 0,
//           puttc: Number(vente.puttc) || 0,
//           quantite: Number(vente.quantite) || 0,
//           totalHT: Number(vente.totalHT) || 0,
//         }))
//         setVentes(formattedVentes)

//         // Fetch myFacture for additional contact info
//         const myFactureData = await getMyFacture(entreprise.id)
//         setMyFacture({
//           adresses: myFactureData.adresses.map(a => a.adresse),
//           emails: myFactureData.emails.map(e => e.email),
//           telephones: myFactureData.telephones.map(t => t.numTel),
//           mobiles: myFactureData.mobiles.map(m => m.numMobile),
//         })
//       } catch (err: any) {
//         const errorMessage = err.response?.data?.message || "Erreur lors du chargement des données."
//         setError(errorMessage)
//         toast.error(errorMessage)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchData()
//   }, [entreprise?.id, factureId])

//   const generatePDF = async () => {
//     if (!invoiceRef.current) return

//     try {
//       const invoiceClone = invoiceRef.current.cloneNode(true) as HTMLElement
//       const noPrintElements = invoiceClone.querySelectorAll('.no-print')
//       noPrintElements.forEach(el => el.remove())

//       const tempContainer = document.createElement('div')
//       tempContainer.style.position = 'absolute'
//       tempContainer.style.left = '-9999px'
//       tempContainer.style.top = '0'
//       tempContainer.style.width = '800px'
//       tempContainer.style.backgroundColor = 'white'
//       tempContainer.style.padding = '20px'
//       tempContainer.style.fontFamily = 'Arial, sans-serif'
//       tempContainer.style.fontSize = '12px'
//       tempContainer.style.lineHeight = '1.4'

//       tempContainer.appendChild(invoiceClone)
//       document.body.appendChild(tempContainer)

//       const html2canvas = (await import('html2canvas')).default
//       const canvas = await html2canvas(tempContainer, {
//         scale: 2,
//         useCORS: true,
//         allowTaint: true,
//         backgroundColor: '#ffffff',
//         width: 800,
//         height: tempContainer.scrollHeight,
//         scrollX: 0,
//         scrollY: 0,
//         windowWidth: 800,
//         windowHeight: tempContainer.scrollHeight,
//       })

//       document.body.removeChild(tempContainer)

//       const imgData = canvas.toDataURL('image/png')
//       const pdf = new jsPDF({
//         orientation: 'portrait',
//         unit: 'mm',
//         format: 'a4',
//       })

//       const pageWidth = pdf.internal.pageSize.getWidth()
//       const imgWidth = pageWidth - 20
//       const imgHeight = (canvas.height * imgWidth) / canvas.width

//       pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
//       pdf.save(`facture-${facture?.num || 'unknown'}.pdf`)
//     } catch (error) {
//       console.error('Error generating PDF:', error)
//       toast.error('Erreur lors de la génération du PDF. Veuillez réessayer.')
//     }
//   }

//   const handlePrint = () => {
//     window.print()
//   }

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//         <span className="ml-2 text-blue-500">Chargement...</span>
//       </div>
//     )
//   }

//   if (error || !facture || !myFacture) {
//     return (
//       <div className="flex justify-center items-center min-h-screen text-red-500">
//         {error || "Données non disponibles."}
//       </div>
//     )
//   }

//   const documentTitle = facture.type === FactureType.FACTURE ? "FACTURE" : facture.type === FactureType.BDC ? "BON DE COMMANDE" : "DEVIS"

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-2 sm:px-4 md:px-6 lg:px-8">
//       <style jsx global>{`
//         @media print {
//           body * {
//             visibility: hidden;
//           }
//           .invoice-container,
//           .invoice-container * {
//             visibility: visible;
//           }
//           .invoice-container {
//             position: absolute;
//             left: 0;
//             top: 0;
//             width: 100%;
//           }
//           .no-print {
//             display: none !important;
//           }
//           .print-break {
//             page-break-inside: avoid;
//           }
//           .mobile-hidden {
//             display: table-cell !important;
//           }
//         }
//         @media (max-width: 540px) {
//           .mobile-hidden {
//             display: none;
//           }
//           .mobile-shrink {
//             width: 50px !important;
//             min-width: 50px !important;
//           }
//           table {
//             font-size: 10px;
//             table-layout: fixed;
//             width: 100%;
//           }
//           th,
//           td {
//             padding: 6px 4px !important;
//             word-break: break-word;
//           }
//           .table-container {
//             overflow-x: hidden;
//           }
//         }
//         @media (min-width: 541px) and (max-width: 1024px) {
//           table {
//             font-size: 12px;
//             table-layout: fixed;
//             width: 100%;
//           }
//           th,
//           td {
//             padding: 8px 6px !important;
//           }
//           .mobile-hidden {
//             display: table-cell;
//           }
//           .mobile-shrink {
//             width: 60px !important;
//           }
//           .table-container {
//             overflow-x: hidden;
//           }
//         }
//         @media (min-width: 1025px) and (max-width: 1280px) {
//           table {
//             font-size: 14px;
//             table-layout: fixed;
//             width: 100%;
//           }
//           th,
//           td {
//             padding: 10px 8px !important;
//           }
//           .table-container {
//             overflow-x: hidden;
//           }
//         }
//       `}</style>

//       <div className="no-print mb-6 max-w-4xl mx-auto">
//         <div className="flex justify-between items-center mb-4">
//           <div>
//             <h1 className={`text-xl font-bold text-slate-800 ${isMobile ? "text-base" : "text-xl"}`}>
//               Détails de la Facture
//             </h1>
//             <p className={`text-slate-600 ${isMobile ? "text-xs" : "text-sm"}`}>
//               Détails pour la facture #{facture.num}
//             </p>
//           </div>
//           <button
//             onClick={() => router.push("/dashboard_user/sales/pos-list")}
//             className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-xs flex items-center space-x-1"
//           >
//             <ArrowLeft className="h-2.5 w-2.5" />
//             <span>Retour</span>
//           </button>
//         </div>
//         <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4">
//           <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-center justify-between">
//             <div className="flex flex-wrap gap-3 justify-center">
//               {colorThemes.map((theme) => (
//                 <button
//                   key={theme.name}
//                   type="button"
//                   aria-label={`${theme.name} color theme`}
//                   onClick={() => handleThemeChange(theme)}
//                   className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center shadow transition-all duration-200 ${
//                     headerFromColor === theme.headerFrom &&
//                     headerViaColor === theme.headerVia &&
//                     headerToColor === theme.headerTo
//                       ? "ring-3 ring-blue-400 border-blue-400"
//                       : "border-slate-200 hover:ring-2 hover:ring-blue-200"
//                   }`}
//                   style={{
//                     background: `linear-gradient(135deg, ${theme.headerFrom}, ${theme.headerVia}, ${theme.headerTo})`,
//                   }}
//                 >
//                   <div className="w-6 h-1.5 rounded mb-1" style={{ background: theme.row }} />
//                   <div className="w-6 h-1.5 rounded" style={{ background: theme.col }} />
//                 </button>
//               ))}
//             </div>
//             <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
//               <button
//                 type="button"
//                 onClick={generatePDF}
//                 className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
//               >
//                 <Download className="h-3 w-3 mr-1" />
//                 Télécharger PDF
//               </button>
//               <button
//                 type="button"
//                 onClick={handlePrint}
//                 className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//               >
//                 <Printer className="h-3 w-3 mr-1" />
//                 Imprimer
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div ref={invoiceRef} className="invoice-container max-w-4xl mx-auto">
//         <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
//           <div
//             className="relative text-white p-4 sm:p-6 md:p-8 flex items-center"
//             style={{
//               background: `linear-gradient(to right, ${headerFromColor}, ${headerViaColor}, ${headerToColor})`,
//             }}
//           >
//             {facture.logo && (
//               <div className="flex items-center mb-2">
//                 <img
//                   src={`${API_URL}${facture.logo}`}
//                   alt="Logo"
//                   className="object-contain bg-white rounded-lg p-1 shadow-md w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mr-2"
//                   style={{ maxHeight: '110px', maxWidth: '110px' }}
//                 />
//               </div>
//             )}
//             <div className="flex-1 flex items-center justify-end" style={{ minHeight: '110px' }}>
//               <h1
//                 className="font-bold tracking-wider mb-0 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl"
//                 style={{ alignSelf: 'center' }}
//               >
//                 {documentTitle}
//               </h1>
//             </div>
//           </div>

//           <div className="p-4 sm:p-6 md:p-8">
//             <div className="grid gap-3 mb-6 bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//               <div>
//                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
//                   Numéro de facture
//                 </label>
//                 <span className="font-mono font-bold text-slate-800 text-base sm:text-lg">{facture.num}</span>
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
//                   Date d'émission
//                 </label>
//                 <span className="font-semibold text-slate-800 text-sm sm:text-base">
//                   {new Date(facture.dateEmission).toLocaleDateString("fr-FR")}
//                 </span>
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
//                   Date d'échéance
//                 </label>
//                 <span className="font-semibold text-slate-800 text-sm sm:text-base">
//                   {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
//                 </span>
//               </div>
//             </div>

//             <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
//               <div className={`space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200 ${isMobile ? 'p-3' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'p-4' : 'p-4'}`}>
//                 <h3 className={`font-bold text-slate-800 border-b-2 border-blue-600 pb-2 flex items-center ${isMobile ? 'text-sm' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-base' : 'text-base sm:text-lg'}`}>
//                   <div className={`bg-blue-600 rounded-full mr-2 ${isMobile ? 'w-1.5 h-1.5' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'w-2 h-2' : 'w-2 h-2'}`}></div>
//                   ÉMETTEUR
//                 </h3>
//                 <div className="space-y-2">
//                   <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                     Dénomination: <span className="font-semibold text-slate-800">{facture.denomination || 'N/A'}</span>
//                   </div>
//                   <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                     Matricule Fiscale: <span className="font-semibold text-slate-800">{facture.matriculeFiscale || 'N/A'}</span>
//                   </div>
//                   <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                     Adresse: <span className="font-semibold text-slate-800">{myFacture.adresses[0] || 'N/A'}</span>
//                   </div>
//                   <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                     Téléphone: <span className="font-semibold text-slate-800">{myFacture.telephones[0] || myFacture.mobiles[0] || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className={`space-y-3 p-4 bg-green-50 rounded-lg border border-green-200 ${isMobile ? 'p-3' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'p-4' : 'p-4'}`}>
//                 <h3 className={`font-bold text-slate-800 border-b-2 border-green-600 pb-2 flex items-center ${isMobile ? 'text-sm' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-base' : 'text-base sm:text-lg'}`}>
//                   <div className={`bg-green-600 rounded-full mr-2 ${isMobile ? 'w-1.5 h-1.5' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'w-2 h-2' : 'w-2 h-2'}`}></div>
//                   DESTINATAIRE
//                 </h3>
//                 <div className="space-y-2">
//                   <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                     Dénomination: <span className="font-semibold text-slate-800">{facture.denominationClient}</span>
//                   </div>
//                   {facture.matriculeFiscaleClient && (
//                     <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                       Matricule Fiscale: <span className="font-semibold text-slate-800">{facture.matriculeFiscaleClient}</span>
//                     </div>
//                   )}
//                   <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                     Adresse: <span className="font-semibold text-slate-800">{facture.adresseClient}</span>
//                   </div>
//                   {facture.clientTelephone && (
//                     <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                       Téléphone: <span className="font-semibold text-slate-800">{facture.clientTelephone}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="mb-6 print-break">
//               <div className="table-container rounded-lg border border-slate-200 shadow-md">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr style={{ backgroundColor: colColor }}>
//                       <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">Réference</th>
//                       <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">Designation</th>
//                       <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">P.U.HT</th>
//                       <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">TVA (%)</th>
//                       <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">P.U.TTC</th>
//                       <th className="text-left py-2 px-2 font-bold text-white mobile-shrink text-xs sm:text-sm">Qté</th>
//                       <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">Total HT</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {ventes.map((item, idx) => (
//                       <tr
//                         key={idx}
//                         style={{ backgroundColor: idx % 2 === 0 ? rowColor : "white" }}
//                         className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
//                       >
//                         <td className="py-2 px-2 mobile-hidden text-xs sm:text-sm font-semibold text-slate-800">{item.codeBarre}</td>
//                         <td className="py-2 px-2 text-xs sm:text-sm font-semibold text-slate-800" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
//                           {item.designation}
//                         </td>
//                         <td className="py-2 px-2 font-mono font-bold text-slate-700 text-xs sm:text-sm">{item.puht.toFixed(3)}</td>
//                         <td className="py-2 px-2 mobile-hidden font-mono font-bold text-slate-700 text-xs sm:text-sm">{item.tva.toFixed(2)}</td>
//                         <td className="py-2 px-2 font-mono font-bold text-slate-700 text-xs sm:text-sm">{item.puttc.toFixed(3)}</td>
//                         <td className="py-2 px-2 mobile-shrink font-mono font-bold text-slate-700 text-xs sm:text-sm">{item.quantite.toFixed(3)}</td>
//                         <td className="py-2 px-2 font-mono font-bold text-slate-900 text-xs sm:text-sm">{item.totalHT.toFixed(3)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
//               <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
//                 <h3 className="text-base sm:text-lg font-bold text-slate-800 border-b-2 border-orange-600 pb-2 flex items-center">
//                   <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
//                   MODALITÉS DE RÈGLEMENT
//                 </h3>
//                 <div className="space-y-2">
//                   <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                     Par virement bancaire :
//                   </div>
//                   <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                     Banque: <span className="font-semibold text-slate-800">{facture.banque || 'N/A'}</span>
//                   </div>
//                   <div className="text-xs sm:text-sm text-slate-600 font-medium">
//                     RIB: <span className="font-semibold text-slate-800">{facture.rib || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-orange-200">
//                 <h3 className="text-base sm:text-lg font-bold text-slate-800 border-b-2 border-purple-600 pb-2 flex items-center">
//                   <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
//                   RÉCAPITULATIF
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center py-1">
//                     <span className="font-semibold text-slate-700 text-xs sm:text-sm">Total HT :</span>
//                     <span className="font-mono font-bold text-slate-800 text-base sm:text-lg">{facture.totalHT.toFixed(3)}</span>
//                   </div>
//                   <div className="flex justify-between items-center py-1">
//                     <span className="font-semibold text-slate-700 text-xs sm:text-sm">TVA :</span>
//                     <span className="font-mono font-bold text-slate-800 text-base sm:text-lg">{facture.totalTVA.toFixed(3)}</span>
//                   </div>
//                   {facture.remise !== undefined && facture.remise > 0 && (
//                     <div className="flex justify-between items-center py-1">
//                       <span className="font-semibold text-slate-700 text-xs sm:text-sm">Remise ({facture.remise.toFixed(2)}%) :</span>
//                       <span className="font-mono font-bold text-slate-800 text-base sm:text-lg">
//                         {((facture.totalHT + facture.totalTVA) * (facture.remise / 100)).toFixed(3)}
//                       </span>
//                     </div>
//                   )}
//                   {facture.timbreFiscal !== undefined && facture.timbreFiscal > 0 && (
//                     <div className="flex justify-between items-center py-1">
//                       <span className="font-semibold text-slate-700 text-xs sm:text-sm">Timbre fiscal :</span>
//                       <span className="font-mono font-bold text-slate-800 text-base sm:text-lg">{facture.timbreFiscal.toFixed(3)}</span>
//                     </div>
//                   )}
//                   <div className="h-px bg-slate-300 my-2"></div>
//                   <div className="flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900 text-white p-3 rounded-lg shadow-md">
//                     <span className="font-bold text-base sm:text-lg">TOTAL TTC :</span>
//                     <span className="font-mono font-bold text-xl sm:text-2xl">{facture.totalNet.toFixed(3)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4 text-xs sm:text-sm text-slate-600 border-t-2 border-slate-200 pt-6">
//               <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
//                 <h3 className="text-base sm:text-lg font-bold text-yellow-800 border-b-2 border-yellow-600 pb-2 flex items-center">
//                   <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
//                   INFORMATIONS DE CONTACT
//                 </h3>
//                 <div className="space-y-2">
//                   {myFacture.adresses.map((adresse, index) => (
//                     <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
//                       Adresse: <span className="font-semibold text-slate-800">{adresse}</span>
//                     </div>
//                   ))}
//                   {myFacture.telephones.map((tel, index) => (
//                     <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
//                       Téléphone: <span className="font-semibold text-slate-800">{tel}</span>
//                     </div>
//                   ))}
//                   {myFacture.mobiles.map((mobile, index) => (
//                     <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
//                       Mobile: <span className="font-semibold text-slate-800">{mobile}</span>
//                     </div>
//                   ))}
//                   {myFacture.emails.map((email, index) => (
//                     <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
//                       Email: <span className="font-semibold text-slate-800">{email}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="grid gap-6 mt-12 pt-6 border-t-2 border-slate-200 grid-cols-1 sm:grid-cols-2">
//                 <div className="text-center space-y-4">
//                   <div className="font-bold text-slate-800 text-sm sm:text-base">Signature du client</div>
//                   <div className="h-20 border-b-2 border-slate-400 mx-3 sm:mx-6 relative">
//                     <div className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 text-center pb-1">Signature</div>
//                   </div>
//                   <div className="text-xs text-slate-500 font-medium">Bon pour accord</div>
//                 </div>
//                 <div className="text-center space-y-4">
//                   <div className="font-bold text-slate-800 text-sm sm:text-base">Signature & cachet de l'entreprise</div>
//                   <div className="h-20 border-b-2 border-slate-400 mx-3 sm:mx-6 relative">
//                     <div className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 text-center pb-1">Cachet et signature</div>
//                   </div>
//                   <div className="text-xs text-slate-500 font-medium">Cachet et signature</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { useDeviceType } from "@renderer/hooks/useDeviceType"
import jsPDF from "jspdf"
import { getFactureById, getVentesByFactureId, FactureType } from "@renderer/api/facture"
import { getMyFacture } from "@renderer/api/my-facture"
import { useAuth } from "../../auth/auth-context"
import { toast } from "react-toastify"
import { useParams, useNavigate} from "react-router-dom"
import  html2canvas from "html2canvas-pro"
const API_URL=""

export default function InvoiceFacture() {
  const { entreprise } = useAuth()
  const params = useParams()
  const router = useNavigate()
  const factureId = params.factureId as string
  const { isMobile, isTablet, isIPadMini, isIPadPro, isSUNMITablet } = useDeviceType()
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [facture, setFacture] = useState<{
    num: string
    type: FactureType
    dateEmission: string
    dateEcheance: string
    denomination: string
    matriculeFiscale: string
    banque: string
    rib: string
    logo?: string
    denominationClient: string
    matriculeFiscaleClient?: string
    adresseClient: string
    clientTelephone?: string
    totalHT: number
    totalTVA: number
    totalNet: number
    timbreFiscal?: number
    remise?: number
  } | null>(null)
  const [ventes, setVentes] = useState<{
    codeBarre: string
    designation: string
    puht: number
    tva: number
    puttc: number
    quantite: number
    totalHT: number
  }[]>([])
  const [myFacture, setMyFacture] = useState<{
    adresses: string[]
    emails: string[]
    telephones: string[]
    mobiles: string[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Color customization states
  const [rowColor, setRowColor] = useState("#eff6ff")
  const [colColor, setColColor] = useState("#1e40af")
  const [headerFromColor, setHeaderFromColor] = useState("#2563eb")
  const [headerViaColor, setHeaderViaColor] = useState("#3b82f6")
  const [headerToColor, setHeaderToColor] = useState("#2563eb")

  const colorThemes = [
    {
      name: "Blue",
      headerFrom: "#2563eb",
      headerVia: "#3b82f6",
      headerTo: "#2563eb",
      row: "#eff6ff",
      col: "#1e40af",
    },
    {
      name: "Green",
      headerFrom: "#16a34a",
      headerVia: "#22d3ee",
      headerTo: "#16a34a",
      row: "#f0fdf4",
      col: "#166534",
    },
    {
      name: "Purple",
      headerFrom: "#7c3aed",
      headerVia: "#a78bfa",
      headerTo: "#7c3aed",
      row: "#f5f3ff",
      col: "#6d28d9",
    },
    {
      name: "Orange",
      headerFrom: "#f59e42",
      headerVia: "#fbbf24",
      headerTo: "#f59e42",
      row: "#fff7ed",
      col: "#c2410c",
    },
    {
      name: "Gray",
      headerFrom: "#6b7280",
      headerVia: "#9ca3af",
      headerTo: "#6b7280",
      row: "#f3f4f6",
      col: "#374151",
    },
  ]

  const handleThemeChange = (theme: typeof colorThemes[0]) => {
    setHeaderFromColor(theme.headerFrom)
    setHeaderViaColor(theme.headerVia)
    setHeaderToColor(theme.headerTo)
    setRowColor(theme.row)
    setColColor(theme.col)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!entreprise?.id || !factureId) {
        setError("Utilisateur non authentifié ou facture non spécifiée.")
        toast.error("Utilisateur non authentifié ou facture non spécifiée.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch facture details
        const factureResponse = await getFactureById(entreprise.id, factureId)
        setFacture({
          num: factureResponse.facture.num,
          type: factureResponse.facture.type,
          dateEmission: factureResponse.facture.dateEmission,
          dateEcheance: factureResponse.facture.dateEcheance,
          denomination: factureResponse.facture.denomination,
          matriculeFiscale: factureResponse.facture.matriculeFiscale,
          banque: factureResponse.facture.banque,
          rib: factureResponse.facture.rib,
          logo: factureResponse.facture.logo,
          denominationClient: factureResponse.facture.denominationClient,
          matriculeFiscaleClient: factureResponse.facture.matriculeFiscaleClient,
          adresseClient: factureResponse.facture.adresseClient,
          clientTelephone: factureResponse.facture.clientTelephone,
          totalHT: Number(factureResponse.facture.totalHT) || 0,
          totalTVA: Number(factureResponse.facture.totalTVA) || 0,
          totalNet: Number(factureResponse.facture.totalNet) || 0,
          timbreFiscal: factureResponse.facture.timbreFiscal ? Number(factureResponse.facture.timbreFiscal) : undefined,
          remise: factureResponse.facture.remise ? Number(factureResponse.facture.remise) : undefined,
        })

        // Fetch ventes
        const ventesResponse = await getVentesByFactureId(entreprise.id, factureId)
        const formattedVentes = ventesResponse.map((vente) => ({
          codeBarre: vente.codeBarre || "N/A",
          designation: vente.designation || "Sans nom",
          puht: Number(vente.puht) || 0,
          tva: Number(vente.tva) || 0,
          puttc: Number(vente.puttc) || 0,
          quantite: Number(vente.quantite) || 0,
          totalHT: Number(vente.totalHT) || 0,
        }))
        setVentes(formattedVentes)

        // Fetch myFacture for additional contact info
        const myFactureData = await getMyFacture(entreprise.id)
        setMyFacture({
          adresses: myFactureData.adresses.map(a => a.adresse),
          emails: myFactureData.emails.map(e => e.email),
          telephones: myFactureData.telephones.map(t => t.numTel),
          mobiles: myFactureData.mobiles.map(m => m.numMobile),
        })
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Erreur lors du chargement des données."
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [entreprise?.id, factureId])

  const generatePDF = async () => {
    if (!invoiceRef.current) return

    try {
      const invoiceClone = invoiceRef.current.cloneNode(true) as HTMLElement
      const noPrintElements = invoiceClone.querySelectorAll('.no-print')
      noPrintElements.forEach(el => el.remove())

      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = '800px'
      tempContainer.style.backgroundColor = 'white'
      tempContainer.style.padding = '20px'
      tempContainer.style.fontFamily = 'Arial, sans-serif'
      tempContainer.style.fontSize = '12px'
      tempContainer.style.lineHeight = '1.4'

      tempContainer.appendChild(invoiceClone)
      document.body.appendChild(tempContainer)

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: tempContainer.scrollHeight,
      })

      document.body.removeChild(tempContainer)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      pdf.save(`facture-${facture?.num || 'unknown'}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Erreur lors de la génération du PDF. Veuillez réessayer.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-blue-500">Chargement...</span>
      </div>
    )
  }

  if (error || !facture || !myFacture) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error || "Données non disponibles."}
      </div>
    )
  }

  const documentTitle = facture.type === FactureType.FACTURE ? "FACTURE" : facture.type === FactureType.BDC ? "BON DE COMMANDE" : "DEVIS"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-2 sm:px-4 md:px-6 lg:px-8">
      <style >{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container,
          .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-inside: avoid;
          }
          .mobile-hidden {
            display: table-cell !important;
          }
        }
        @media (max-width: 540px) {
          .mobile-hidden {
            display: none;
          }
          .mobile-shrink {
            width: 50px !important;
            min-width: 50px !important;
          }
          table {
            font-size: 10px;
            table-layout: fixed;
            width: 100%;
          }
          th,
          td {
            padding: 6px 4px !important;
            word-break: break-word;
          }
          .table-container {
            overflow-x: hidden;
          }
        }
        @media (min-width: 541px) and (max-width: 1024px) {
          table {
            font-size: 12px;
            table-layout: fixed;
            width: 100%;
          }
          th,
          td {
            padding: 8px 6px !important;
          }
          .mobile-hidden {
            display: table-cell;
          }
          .mobile-shrink {
            width: 60px !important;
          }
          .table-container {
            overflow-x: hidden;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          table {
            font-size: 14px;
            table-layout: fixed;
            width: 100%;
          }
          th,
          td {
            padding: 10px 8px !important;
          }
          .table-container {
            overflow-x: hidden;
          }
        }
      `}</style>

      <div className="no-print mb-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-xl font-bold text-slate-800 ${isMobile ? "text-base" : "text-xl"}`}>
              Détails de la Facture
            </h1>
            <p className={`text-slate-600 ${isMobile ? "text-xs" : "text-sm"}`}>
              Détails pour la facture #{facture.num}
            </p>
          </div>
          <button
            onClick={() => router("/dashboard_user/sales/pos-list")}
            className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-xs flex items-center space-x-1"
          >
            <ArrowLeft className="h-2.5 w-2.5" />
            <span>Retour</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 justify-center">
              {colorThemes.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  aria-label={`${theme.name} color theme`}
                  onClick={() => handleThemeChange(theme)}
                  className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center shadow transition-all duration-200 ${
                    headerFromColor === theme.headerFrom &&
                    headerViaColor === theme.headerVia &&
                    headerToColor === theme.headerTo
                      ? "ring-3 ring-blue-400 border-blue-400"
                      : "border-slate-200 hover:ring-2 hover:ring-blue-200"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.headerFrom}, ${theme.headerVia}, ${theme.headerTo})`,
                  }}
                >
                  <div className="w-6 h-1.5 rounded mb-1" style={{ background: theme.row }} />
                  <div className="w-6 h-1.5 rounded" style={{ background: theme.col }} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <button
                type="button"
                onClick={generatePDF}
                className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Download className="h-3 w-3 mr-1" />
                Télécharger PDF
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Printer className="h-3 w-3 mr-1" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={invoiceRef} className="invoice-container max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300">
          <div
            className="relative text-white p-4 sm:p-6 md:p-8 flex items-center"
            style={{
              background: `linear-gradient(to right, ${headerFromColor}, ${headerViaColor}, ${headerToColor})`,
            }}
          >
            {facture.logo && (
              <div className="flex items-center mb-2">
                <img
                  src={`${API_URL}${facture.logo}`}
                  alt="Logo"
                  className="object-contain bg-white rounded-lg p-1 shadow-md w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mr-2"
                  style={{ maxHeight: '110px', maxWidth: '110px' }}
                />
              </div>
            )}
            <div className="flex-1 flex items-center justify-end" style={{ minHeight: '110px' }}>
              <h1
                className="font-bold tracking-wider mb-0 text-3xl sm:text-4xl md:text-5xl text-white"
                style={{ alignSelf: 'center' }}
              >
                {documentTitle}
              </h1>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-300 grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">N° de facture</label>
                <span className="font-mono font-bold text-gray-900">{facture.num}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <span className="font-semibold text-gray-900">
                  {new Date(facture.dateEmission).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Client</label>
                <span className="font-semibold text-gray-900">{facture.denominationClient}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Modalités</label>
                <span className="font-semibold text-gray-900">
                  {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>

            <div className="grid gap-4 mb-6 grid-cols-2">
            // Update the ÉMETTEUR section in InvoiceFacture component
              <div className={`space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200 ${isMobile ? 'p-3' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'p-4' : 'p-4'}`}>
                <h3 className={`font-bold text-slate-800 border-b-2 border-blue-600 pb-2 flex items-center ${isMobile ? 'text-sm' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-base' : 'text-base sm:text-lg'}`}>
                  <div className={`bg-blue-600 rounded-full mr-2 ${isMobile ? 'w-1.5 h-1.5' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'w-2 h-2' : 'w-2 h-2'}`}></div>
                  ÉMETTEUR
                </h3>
                <div className="space-y-2">
    {facture && (
      <>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Dénomination: <span className="font-semibold text-slate-800">{facture.denomination || 'Non spécifié'}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Matricule Fiscale: <span className="font-semibold text-slate-800">{facture.matriculeFiscale || 'Non spécifié'}</span>
                  </div>
      </>
    )}
    {myFacture && (
      <>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Adresse: <span className="font-semibold text-slate-800">{myFacture.adresses[0] || 'Non spécifié'}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Téléphone: <span className="font-semibold text-slate-800">{myFacture.telephones[0] || myFacture.mobiles[0] || 'Non spécifié'}</span>
                  </div>
      </>
    )}
                </div>
              </div>

              <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 border-b-2 border-green-600 pb-2">DESTINATAIRE :</h3>
                <div className="text-sm text-gray-600 font-medium">
                  Dénomination: <span className="font-semibold text-gray-900">{facture.denominationClient}</span>
                  </div>
                  {facture.matriculeFiscaleClient && (
                  <div className="text-sm text-gray-600 font-medium">
                    Matricule Fiscale: <span className="font-semibold text-gray-900">{facture.matriculeFiscaleClient}</span>
                    </div>
                  )}
                <div className="text-sm text-gray-600 font-medium">
                  Adresse: <span className="font-semibold text-gray-900">{facture.adresseClient}</span>
                  </div>
                  {facture.clientTelephone && (
                  <div className="text-sm text-gray-600 font-medium">
                    Téléphone: <span className="font-semibold text-gray-900">{facture.clientTelephone}</span>
                    </div>
                  )}
              </div>
            </div>

            <div className="mb-6 print-break">
              <div className="table-container rounded-lg border border-gray-300 shadow-md">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: colColor }}>
                      <th className="text-left py-2 px-2 font-bold text-white">Réference</th>
                      <th className="text-left py-2 px-2 font-bold text-white">Designation</th>
                      <th className="text-left py-2 px-2 font-bold text-white">P.U.HT</th>
                      <th className="text-left py-2 px-2 font-bold text-white">TVA (%)</th>
                      <th className="text-left py-2 px-2 font-bold text-white">P.U.TTC</th>
                      <th className="text-left py-2 px-2 font-bold text-white mobile-shrink">Qté</th>
                      <th className="text-left py-2 px-2 font-bold text-white">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventes.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{ backgroundColor: idx % 2 === 0 ? rowColor : "white" }}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-2 text-sm font-semibold text-gray-800">{item.codeBarre}</td>
                        <td className="py-2 px-2 text-sm font-semibold text-gray-800" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {item.designation}
                        </td>
                        <td className="py-2 px-2 font-mono font-bold text-gray-700">{item.puht.toFixed(3)}</td>
                        <td className="py-2 px-2 font-mono font-bold text-gray-700">{item.tva.toFixed(2)}</td>
                        <td className="py-2 px-2 font-mono font-bold text-gray-700">{item.puttc.toFixed(3)}</td>
                        <td className="py-2 px-2 font-mono font-bold text-gray-700">{item.quantite.toFixed(3)}</td>
                        <td className="py-2 px-2 font-mono font-bold text-gray-900">{item.totalHT.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 mb-6 grid-cols-2">
              <div className="space-y-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-bold text-orange-800 border-b-2 border-orange-600 pb-2">MODALITÉS DE RÈGLEMENT :</h3>
                <div className="text-sm text-gray-600 font-medium">
                    Par virement bancaire :
                  </div>
                <div className="text-sm text-gray-600 font-medium">
                  Banque: <span className="font-semibold text-gray-900">{facture.banque || 'N/A'}</span>
                  </div>
                <div className="text-sm text-gray-600 font-medium">
                  RIB: <span className="font-semibold text-gray-900">{facture.rib || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-800 border-b-2 border-purple-600 pb-2">RÉCAPITULATIF :</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Total HT :</span>
                    <span className="font-mono font-bold text-gray-900">{facture.totalHT.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">TVA :</span>
                    <span className="font-mono font-bold text-gray-900">{facture.totalTVA.toFixed(3)}</span>
                  </div>
                  {facture.remise !== undefined && facture.remise > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Remise ({facture.remise.toFixed(2)}%) :</span>
                      <span className="font-mono font-bold text-gray-900">
                        {((facture.totalHT + facture.totalTVA) * (facture.remise / 100)).toFixed(3)}
                      </span>
                    </div>
                  )}
                  {facture.timbreFiscal !== undefined && facture.timbreFiscal > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Timbre fiscal :</span>
                      <span className="font-mono font-bold text-gray-900">{facture.timbreFiscal.toFixed(3)}</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-300 my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL TTC :</span>
                    <span className="font-mono">{facture.totalNet.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 border-t-2 border-slate-200 pt-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
                <h3 className="text-base sm:text-lg font-bold text-yellow-800 border-b-2 border-yellow-600 pb-2 flex items-center">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
                  INFORMATIONS DE CONTACT
                </h3>
                <div className="space-y-2">
      {myFacture?.adresses.length > 0 ? (
        myFacture.adresses.map((adresse, index) => (
                    <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
            Adresse: <span className="font-semibold text-slate-800">{adresse || 'Non spécifié'}</span>
                    </div>
        ))
      ) : (
        <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Adresse: <span className="font-semibold text-slate-800">Non spécifié</span>
        </div>
      )}
      {myFacture?.telephones.length > 0 ? (
        myFacture.telephones.map((tel, index) => (
                    <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
            Téléphone: <span className="font-semibold text-slate-800">{tel || 'Non spécifié'}</span>
                    </div>
        ))
      ) : (
        <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Téléphone: <span className="font-semibold text-slate-800">Non spécifié</span>
        </div>
      )}
      {myFacture?.mobiles.length > 0 ? (
        myFacture.mobiles.map((mobile, index) => (
                    <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
            Mobile: <span className="font-semibold text-slate-800">{mobile || 'Non spécifié'}</span>
                    </div>
        ))
      ) : (
        <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Mobile: <span className="font-semibold text-slate-800">Non spécifié</span>
        </div>
      )}
      {myFacture?.emails.length > 0 ? (
        myFacture.emails.map((email, index) => (
                    <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
            Email: <span className="font-semibold text-slate-800">{email || 'Non spécifié'}</span>
                    </div>
        ))
      ) : (
        <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Email: <span className="font-semibold text-slate-800">Non spécifié</span>
        </div>
      )}
                </div>
              </div>

              <div className="grid gap-6 mt-12 pt-6 border-t-2 border-slate-200 grid-cols-1 sm:grid-cols-2">
                <div className="text-center space-y-4">
                  <div className="font-bold text-slate-800 text-sm sm:text-base">Signature du client</div>
                  <div className="h-20 border-b-2 border-slate-400 mx-3 sm:mx-6 relative">
                    <div className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 text-center pb-1">Signature</div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Bon pour accord</div>
                </div>
                <div className="text-center space-y-4">
                  <div className="font-bold text-slate-800 text-sm sm:text-base">Signature & cachet de l'entreprise</div>
                  <div className="h-20 border-b-2 border-slate-400 mx-3 sm:mx-6 relative">
                    <div className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 text-center pb-1">Cachet et signature</div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Cachet et signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
