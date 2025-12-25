"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Plus, Upload, Download, Printer } from "lucide-react"
// import { useDeviceType } from "@renderer/hooks/useDeviceType"
import jsPDF from "jspdf"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../../auth/auth-context"
import { getVentesByCommandeId } from "@renderer/api/vente"
import html2canvas from "html2canvas-pro"
import { getMyFacture, MyFacture } from "@renderer/api/my-facture"
import { toast } from "react-toastify"
import { Client, getClientsByParams } from "@renderer/api/client"
import { createFacture, FactureType } from "@renderer/api/facture"

// --- Add type for InvoiceItem that allows string or number for numeric fields ---
type InvoiceItem = {
  barcode: string;
  description: string;
  unitPrice: number | string;
  quantity: number | string;
  tva: number | string;
};

interface InvoiceProps {
  items?: InvoiceItem[];
  title?: string;
}

const defaultItems: InvoiceItem[] = [
  { barcode: "", description: "", unitPrice: "", quantity: "", tva: "20" }
];

export default function Invoice({ items: itemsProp, title }: InvoiceProps) {
  // const {
  //   isMobile,
  //   isTablet,
  //   isIPadMini,
  // } = useDeviceType()

  const invoiceRef = useRef<HTMLDivElement>(null)
  const [searchParams] = useSearchParams()
  const { entreprise } = useAuth()
  const [myFacture,setMyFacture] = useState<MyFacture>()
  const [clients,setClients] = useState<Client[]>()
  const [clientName,setClientName] = useState("")

    // Invoice data state
  const [issuer, setIssuer] = useState({
    phone: [""],
    email: [""],
    address: [""],
    mobile: [""],
  })

  const [recipient, setRecipient] = useState({
    name: "",
    email: [""],
    address: [""],
    mobile: [""],
    phone: [""], // Added to match new design
  })

  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>(itemsProp && itemsProp.length > 0 ? itemsProp : defaultItems)
  // TVA is now calculated automatically from individual item TVA rates
  const [remise, _setRemise] = useState<string>("")
  const [timbreFiscal, _setTimbreFiscal] = useState<string>("")
  // const [showTimbreFiscal, _setShowTimbreFiscal] = useState<boolean>(false)
  // const [bank, setBank] = useState("")
  // const [account, setAccount] = useState("")
  const [logo, setLogo] = useState<string | null>(null)

  // Color customization states
  const [rowColor, _setRowColor] = useState("#f8fafc")
  const [colColor, _setColColor] = useState("#1e293b")
  const [_headerFromColor, _setHeaderFromColor] = useState("#0f172a")
  const [_headerViaColor, _setHeaderViaColor] = useState("#1e293b")
  const [_headerToColor, _setHeaderToColor] = useState("#0f172a")
  const [isFocused,setIsFocused] = useState(false)


  const fetchMyFacture =async ()=>{
    try {
      if(!entreprise)return

      const fetchedMyFacture = await getMyFacture(entreprise.id)

      if(!fetchedMyFacture)return

      setMyFacture(fetchedMyFacture)
    } catch (error) {
      toast.error("impossible de recuperer my facture"+error)
    }
  }

  useEffect(()=>{
    fetchMyFacture()
  },[])

  useEffect(()=>{
    if(myFacture?.emails)setIssuer(prev=>({...prev,email:myFacture?.emails.map(email=>(email.email))}))
    
    if(myFacture?.telephones)setIssuer(prev=>({...prev,phone:myFacture?.telephones.map(telephone=>(telephone.numTel))}))

    if(myFacture?.adresses)setIssuer(prev=>({...prev,address:myFacture?.adresses.map(address=>(address.adresse))}))
    
  },[myFacture])

  const fetchClients = async ()=>{
    try {
      if(!entreprise)return

      const fetchedClients = await getClientsByParams(entreprise?.id,{search:clientName})
      
      if(fetchedClients)setClients(fetchedClients)

    } catch (error) {
      toast.error("impossible de trouver le client : "+error)
    }
  }

  useEffect(()=>{
    fetchClients()
    console.log(clientName)
  },[clientName])

  const handleClientClick = (client:Client)=>{
    setRecipient(prev=>({...prev,
      name:client.nom + " " + client.prenom,
      address:client.address ? [client.address]:[""],
      email:client.email ? [client.email] :[""],
      phone:client.tel ? [client.tel] : [""]
    }))
    setClientName(client.nom + " " + client.prenom)
    setIsFocused(false)
  }
  // Define 5 principal color themes
  // const colorThemes = [
  //   {
  //     name: "Blue",
  //     headerFrom: "#2563eb",
  //     headerVia: "#3b82f6",
  //     headerTo: "#2563eb",
  //     row: "#eff6ff",
  //     col: "#1e40af",
  //   },
  //   {
  //     name: "Green",
  //     headerFrom: "#16a34a",
  //     headerVia: "#22d3ee",
  //     headerTo: "#16a34a",
  //     row: "#f0fdf4",
  //     col: "#166534",
  //   },
  //   {
  //     name: "Purple",
  //     headerFrom: "#7c3aed",
  //     headerVia: "#a78bfa",
  //     headerTo: "#7c3aed",
  //     row: "#f5f3ff",
  //     col: "#6d28d9",
  //   },
  //   {
  //     name: "Orange",
  //     headerFrom: "#f59e42",
  //     headerVia: "#fbbf24",
  //     headerTo: "#f59e42",
  //     row: "#fff7ed",
  //     col: "#c2410c",
  //   },
  //   {
  //     name: "Gray",
  //     headerFrom: "#6b7280",
  //     headerVia: "#9ca3af",
  //     headerTo: "#6b7280",
  //     row: "#f3f4f6",
  //     col: "#374151",
  //   },
  // ]

  // Theme change handler
  // const handleThemeChange = (theme: typeof colorThemes[0]) => {
  //   setHeaderFromColor(theme.headerFrom)
  //   setHeaderViaColor(theme.headerVia)
  //   setHeaderToColor(theme.headerTo)
  //   setRowColor(theme.row)
  //   setColColor(theme.col)
  // }

  // PDF Generation function - HTML to PDF with exact design
  const generatePDF = async () => {
    if (!invoiceRef.current) return

    try {
      // Clone invoice DOM
      const invoiceClone = invoiceRef.current.cloneNode(true) as HTMLElement

      // Remove any no-print elements from the clone
      const noPrintElements = invoiceClone.querySelectorAll('.no-print')
      noPrintElements.forEach(el => el.remove())

      // Replace form controls with plain text to avoid html2canvas truncation
      const toStaticText = (root: HTMLElement) => {
        const controls = root.querySelectorAll('input, textarea, select')
        controls.forEach((el) => {
          const element = el as HTMLElement
          const style = window.getComputedStyle(element)
          const span = document.createElement('div')
          let value = ''
          if ((el as HTMLInputElement).value !== undefined) value = (el as HTMLInputElement).value
          if (!value) value = element.textContent || ''
          span.textContent = value
          span.style.whiteSpace = 'pre-wrap'
          span.style.font = style.font
          span.style.color = style.color
          span.style.padding = style.padding
          span.style.margin = style.margin
          span.style.borderBottom = style.borderBottomWidth && style.borderBottomWidth !== '0px'
            ? `${style.borderBottomWidth} solid ${style.borderBottomColor}`
            : '0'
          span.style.minHeight = style.minHeight
          span.style.lineHeight = style.lineHeight
          element.parentNode?.replaceChild(span, element)
        })
      }
      toStaticText(invoiceClone)

      // Ensure images are loaded
      const images = Array.from(invoiceClone.querySelectorAll('img'))
      await Promise.all(
        images.map(img => new Promise<void>(resolve => {
          if ((img as HTMLImageElement).complete) return resolve()
          ;(img as HTMLImageElement).onload = () => resolve()
          ;(img as HTMLImageElement).onerror = () => resolve()
        }))
      )

      // Temporary container for consistent render size
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
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= (pageHeight - 20)

      while (heightLeft > 0) {
        position = position - (pageHeight - 20)
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= (pageHeight - 20)
      }

      pdf.save(`${title ? title.toLowerCase().replace(/\s+/g, '-') : 'facture'}-${invoiceNumber}.pdf`)

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    }
  }

  // Print function
  const handlePrint = () => {
    window.print()
  }
  
  // Handlers
  // const handleItemChange = (idx: number, field: keyof InvoiceItem, value: string) => {
  //   setItems((prev) =>
  //     prev.map((item, i) =>
  //       i === idx
  //         ? {
  //             ...item,
  //             [field]:
  //               field === "description" || field === "barcode"
  //                 ? value
  //                 : value === ""
  //                 ? ""
  //                 : Number(value),
  //           }
  //         : item,
  //     ),
  //   )
  // }

  const handleAddItem = () =>
    setItems([
      ...items,
      { barcode: "", description: "", unitPrice: "", quantity: "", tva: "20" },
    ])
  // const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogo(ev.target?.result as string)
      reader.readAsDataURL(e.target.files[0])
    }
  }

  // Prefill from selected ticket IDs (commande IDs)
  useEffect(() => {
    const loadFromSelection = async () => {
      try {
        const idsParam = searchParams?.get("ticketIds") || ""
        let ids: string[] = []
        if (idsParam) {
          ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean)
        } else if (typeof window !== "undefined") {
          const stored = sessionStorage.getItem("invoiceSelectedTickets")
          if (stored) {
            const arr = JSON.parse(stored) as { id: string }[]
            ids = Array.from(new Set(arr.map((x) => x.id))).filter(Boolean)
          }
        }

        if (!entreprise?.id || ids.length === 0) return

        const allVentesArrays = await Promise.all(
          ids.map((id) => getVentesByCommandeId(entreprise.id, id).catch(() => []))
        )
        const allVentes = allVentesArrays.flat()
        if (allVentes.length === 0) return

        const mapped: InvoiceItem[] = allVentes.map((v) => ({
          barcode: v.codeBarre || "",
          description: v.designation || "",
          unitPrice: v.puht ?? "",
          quantity: v.quantite ?? "",
          tva: v.tva ?? "",
        }))
        setItems(mapped)
      } catch (e) {
        // ignore prefill errors; user can still fill manually
      }
    }
    loadFromSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entreprise?.id])

  // --- CALCULATIONS ---
  // Parse TVA and Remise as numbers, fallback to 0 if empty or invalid
  const remisePercent = remise === "" ? 0 : Number(remise) || 0
  const timbreFiscalAmount = timbreFiscal === "" ? 0 : Number(timbreFiscal) || 0
  
  // Calculate total HT
  const totalHT = items.reduce(
    (sum, item) =>
      sum + ((item.unitPrice === "" ? 0 : Number(item.unitPrice) || 0) * (item.quantity === "" ? 0 : Number(item.quantity) || 0)),
    0,
  )
  
  // Calculate TVA amount automatically from individual item TVA rates
  const tvaAmount = items.reduce(
    (sum, item) => {
      const puht = item.unitPrice === "" ? 0 : Number(item.unitPrice) || 0
      const quantity = item.quantity === "" ? 0 : Number(item.quantity) || 0
      const tvaRate = item.tva === "" ? 0 : Number(item.tva) || 0
      const itemTva = puht * quantity * tvaRate / 100
      console.log(`Item TVA calculation: PUHT=${puht}, Qty=${quantity}, TVA Rate=${tvaRate}%, Item TVA=${itemTva}`)
      return sum + itemTva
    },
    0,
  )
  
  const remiseAmount = (totalHT * remisePercent) / 100
  const totalAfterRemise = totalHT - remiseAmount
  const totalTTC = totalAfterRemise + tvaAmount + timbreFiscalAmount

  // Responsive logo placement
  // const logoStyle = isMobile
  //   ? "absolute top-2 left-2 w-12 h-12"
  //   : isTablet || isIPadMini
  //   ? "absolute top-4 left-4 w-16 h-16"
  //   : "absolute top-6 left-6 w-20 h-20"

  // // Handlers for adding/removing issuer contact details
  // const addIssuerPhone = () => setIssuer(prev => ({ ...prev, phone: [...prev.phone, ""] }));
  // const removeIssuerPhone = (index: number) => setIssuer(prev => ({ ...prev, phone: prev.phone.filter((_, i) => i !== index) }));
  const updateIssuerPhone = (index: number, value: string) => setIssuer(prev => ({ ...prev, phone: prev.phone.map((p, i) => i === index ? value : p) }));

  // const addIssuerMobile = () => setIssuer(prev => ({ ...prev, mobile: [...prev.mobile, ""] }));
  // const removeIssuerMobile = (index: number) => setIssuer(prev => ({ ...prev, mobile: prev.mobile.filter((_, i) => i !== index) }));
  // const updateIssuerMobile = (index: number, value: string) => setIssuer(prev => ({ ...prev, mobile: prev.mobile.map((m, i) => i === index ? value : m) }));

  // const addIssuerEmail = () => setIssuer(prev => ({ ...prev, email: [...prev.email, ""] }));
  // const removeIssuerEmail = (index: number) => setIssuer(prev => ({ ...prev, email: prev.email.filter((_, i) => i !== index) }));
  const updateIssuerEmail = (index: number, value: string) => setIssuer(prev => ({ ...prev, email: prev.email.map((e, i) => i === index ? value : e) }));

  // const addIssuerAddress = () => setIssuer(prev => ({ ...prev, address: [...prev.address, ""] }));
  // const removeIssuerAddress = (index: number) => setIssuer(prev => ({ ...prev, address: prev.address.filter((_, i) => i !== index) }));
  const updateIssuerAddress = (index: number, value: string) => setIssuer(prev => ({ ...prev, address: prev.address.map((a, i) => i === index ? value : a) }));

  // Handlers for adding/removing recipient contact details
  // const addRecipientPhone = () => setRecipient(prev => ({ ...prev, phone: [...prev.phone, ""] }));
  // const removeRecipientPhone = (index: number) => setRecipient(prev => ({ ...prev, phone: prev.phone.filter((_, i) => i !== index) }));
  const updateRecipientPhone = (index: number, value: string) => setRecipient(prev => ({ ...prev, phone: prev.phone.map((p, i) => i === index ? value : p) }));

  // const addRecipientEmail = () => setRecipient(prev => ({ ...prev, email: [...prev.email, ""] }));
  // const removeRecipientEmail = (index: number) => setRecipient(prev => ({ ...prev, email: prev.email.filter((_, i) => i !== index) }));
  const updateRecipientEmail = (index: number, value: string) => setRecipient(prev => ({ ...prev, email: prev.email.map((e, i) => i === index ? value : e) }));

  // const addRecipientAddress = () => setRecipient(prev => ({ ...prev, address: [...prev.address, ""] }));
  // const removeRecipientAddress = (index: number) => setRecipient(prev => ({ ...prev, address: prev.address.filter((_, i) => i !== index) }));
  const updateRecipientAddress = (index: number, value: string) => setRecipient(prev => ({ ...prev, address: prev.address.map((a, i) => i === index ? value : a) }));

  // const addRecipientMobile = () => setRecipient(prev => ({ ...prev, mobile: [...prev.mobile, ""] }));
  // const removeRecipientMobile = (index: number) => setRecipient(prev => ({ ...prev, mobile: prev.mobile.filter((_, i) => i !== index) }));
  // const updateRecipientMobile = (index: number, value: string) => setRecipient(prev => ({ ...prev, mobile: prev.mobile.map((m, i) => i === index ? value : m) }));

  const handleCreateFacture = async()=>{
    console.log("clicked facture handle")
    try {
      if(!entreprise) {
        toast.error("Entreprise introuvable !")
        return}
      const createdFacture = await createFacture(entreprise?.id,{
        type:FactureType.FACTURE,
        dateEmission:new Date().toISOString(),
        dateEcheance:new Date().toISOString(),
        num:invoiceNumber,
        denominationClient:recipient.name,
        adresseClient:recipient.address.join(","),
        clientTelephone:recipient.phone.join(","),
        rib:myFacture?.rib!,
        denomination:myFacture?.denomination!,
        banque:myFacture?.banque!,
        matriculeFiscale:myFacture?.matriculeFiscale!,
        ventes:items.map(item=>({codeBarre:String(item.barcode),quantite:Number(item.quantity)})),
        totalHT:totalHT,
        remise:Number(remise),
        totalTVA:tvaAmount,
        totalNet:totalAfterRemise,
        timbreFiscal:timbreFiscalAmount,
        logo:myFacture?.logo,
        matriculeFiscaleClient:""
      })
      toast.success("Fature num : "+createdFacture.facture?.id +" est creer avec succes")
    } catch (error) {
      toast.error("impossible de creer une facture veuillez verifier vos informations: "+error)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Print Styles */}
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
        /* Prevent clipping of party cards */
        .avoid-clip {
          overflow: visible !important;
          contain: none;
        }
        .party-card {
          overflow: visible !important;
          min-height: 180px;
        }
        /* Mobile (≤540px) */
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
          input {
            font-size: 10px !important;
          }
          .table-container {
            overflow-x: hidden;
          }
        }
        /* Tablets and iPads (541px - 1024px) */
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
          input {
            font-size: 12px !important;
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
        /* 1280x800 resolution */
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
          input {
            font-size: 14px !important;
          }
          .table-container {
            overflow-x: hidden;
          }
        }
        /* Remove number input spinners */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Controls - Hidden on print */}
      <div className="no-print mb-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-center justify-end">
            {/* Logo and PDF Controls */}
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <label htmlFor="logo-upload" className="text-xs font-medium text-blue-700">
                Logo:
              </label>
              <div className="relative">
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                  className="inline-flex items-center px-2 py-1 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </button>
              </div>
              
                             {/* PDF Download Button */}
               <button
                 type="button"
                 onClick={()=>{handleCreateFacture();generatePDF();}}
                 className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
               >
                 <Download className="h-3 w-3 mr-1" />
                 Télécharger PDF
               </button>
               
               {/* Print Button */}
               <button
                 type="button"
                 onClick={()=>{handleCreateFacture();handlePrint()}}
                 className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
               >
                 <Printer className="h-3 w-3 mr-1" />
                 Imprimer
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice */}
      <div ref={invoiceRef} className="invoice-container max-w-4xl mx-auto avoid-clip">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-visible avoid-clip">
          {/* Header Section */}
          <div
            className="relative p-0 sm:p-0 md:p-1 bg-white"
          >
            {/* Logo */}
            {logo && (
              <div className="absolute top-2 left-2 flex items-center">
                <img
                  src={logo}
                  alt="Logo"
                  className="object-contain bg-white rounded-md p-0.5 shadow-md w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mr-2"
                  style={{ maxHeight: '96px', maxWidth: '96px' }}
                />
              </div>
            )}

            <div className="w-full flex items-center justify-end pr-4 sm:pr-6 md:pr-8 min-h-[64px] sm:min-h-[72px] md:min-h-[84px]">
              <h1 className="text-right font-bold tracking-wide leading-none mb-0 text-2xl sm:text-2xl md:text-3xl text-slate-800">
                FACTURE
              </h1>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Invoice Info */}
            <div className="grid gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-300 grid-cols-2 overflow-visible avoid-clip">
              <div>
                <label className="block text-sm font-medium text-gray-700">N° de facture</label>
                <p className="text-black">
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full border-0 bg-transparent p-0 focus:outline-none text-gray-900"
                />
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="text-black">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border-0 bg-transparent p-0 focus:outline-none text-gray-900"
                />
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom Client</label>
                <p className="text-black">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  onFocus={()=>setIsFocused(true)}
                  className="w-full border-0 bg-transparent p-0 focus:outline-none text-gray-900"
                />
                </p>
                <div className={`border-2 border-purple-800 w-30 flex flex-col gap-1 p-1 ${isFocused ? "" : "hidden"}`}>
                  {clients && clients.map(client=>(
                    <div key={client.id} onClick={()=>handleClientClick(client)} className="text-black border-b bg-purple-300 p-1">{client.prenom + " " +  client.nom}</div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Modalités</label>
                <p className="text-black">
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border-0 bg-transparent p-0 focus:outline-none text-gray-900"
                  placeholder="Net 30 jours"
                />
                </p>
              </div>
            </div>

            {/* Parties */}
            <div className="grid gap-4 mb-6 grid-cols-2 overflow-visible avoid-clip">
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200 party-card">
                <h3 className="font-bold text-blue-800 border-b-2 border-blue-600 pb-2">Facture émetteur :</h3>
                {issuer.address.map((a, index) => (
                  <div key={index}>
                    <p className="text-black">
                      <input
                      type="text"
                      value={a}
                      onChange={(e) => updateIssuerAddress(index, e.target.value)}
                      className="w-full border-0 border-b-2 border-blue-200 bg-transparent px-0 py-1 focus:outline-none text-gray-900"
                      placeholder="Adresse"
                    />
                    </p>
                  </div>
                ))}
                {issuer.phone.map((p, index) => (
                  <div key={index}>
                    <p className="text-black">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => updateIssuerPhone(index, e.target.value)}
                      className="w-full border-0 border-b-2 border-blue-200 bg-transparent px-0 py-1 focus:outline-none text-gray-900"
                      placeholder="Téléphone"
                    />
                    </p>
                  </div>
                ))}
                {issuer.email.map((e, index) => (
                  <div key={index}>
                    <p className="text-black">
                    <input
                      type="email"
                      value={e}
                      onChange={(e) => updateIssuerEmail(index, e.target.value)}
                      className="w-full border-0 border-b-2 border-blue-200 bg-transparent px-0 py-1 focus:outline-none text-gray-900"
                      placeholder="Email"
                    />
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200 party-card">
                <h3 className="font-bold text-green-800 border-b-2 border-green-600 pb-2">Attention à :</h3>
                <p className="text-black">
                <input
                  type="text"
                  value={recipient.name}
                  onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                  className="w-full border-0 border-b-2 border-green-200 bg-transparent px-0 py-1 focus:outline-none text-gray-900"
                  placeholder="Nom"
                />
                </p>
                {recipient.address.map((a, index) => (
                  <div key={index}>
                    <p className="text-black">
                    <input
                      type="text"
                      value={a}
                      onChange={(e) => updateRecipientAddress(index, e.target.value)}
                      className="w-full border-0 border-b-2 border-green-200 bg-transparent px-0 py-1 focus:outline-none text-gray-900"
                      placeholder="Adresse"
                    />
                    </p>
                  </div>
                ))}
                {recipient.phone.map((p, index) => (
                  <div key={index}>
                    <p className="text-black">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => updateRecipientPhone(index, e.target.value)}
                      className="w-full border-0 border-b-2 border-green-200 bg-transparent px-0 py-1 focus:outline-none text-gray-900"
                      placeholder="Téléphone"
                    />
                    </p>
                  </div>
                ))}
                {recipient.email.map((e, index) => (
                  <div key={index}>
                    <p className="text-black">
                    <input
                      type="email"
                      value={e}
                      onChange={(e) => updateRecipientEmail(index, e.target.value)}
                      className="w-full border-0 border-b-2 border-green-200 bg-transparent px-0 py-1 focus:outline-none text-gray-900"
                      placeholder="Email"
                    />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 print-break">
            <div className="mb-6 print-break">
  <div className="table-container rounded-lg border border-slate-200 shadow-md">
    <table className="w-full border-collapse">
      <thead>
        <tr style={{ backgroundColor: colColor }}>
          <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">Designation</th>
          <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">P.U.HT</th>
          <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">TVA (%)</th>
          <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">P.U.TTC</th>
          <th className="text-left py-2 px-2 font-bold text-white mobile-shrink text-xs sm:text-sm">Qté</th>
          <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">Total HT</th>
        </tr>
      </thead>
      <tbody>
        {items.length > 0 ? (
          items.map((item, idx) => (
            <tr
              key={idx}
              style={{ backgroundColor: idx % 2 === 0 ? rowColor : "white" }}
              className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <td className="py-2 px-2 text-xs sm:text-sm font-semibold text-slate-800" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                {item.description}
              </td>
              <td className="py-2 px-2 font-mono font-bold text-slate-700 text-xs sm:text-sm">{Number(item.unitPrice).toFixed(3)}</td>
              <td className="py-2 px-2 mobile-hidden font-mono font-bold text-slate-700 text-xs sm:text-sm">{Number(item.tva).toFixed(2)}</td>
              <td className="py-2 px-2 font-mono font-bold text-slate-700 text-xs sm:text-sm">{Number(item.unitPrice).toFixed(3)}</td>
              <td className="py-2 px-2 mobile-shrink font-mono font-bold text-slate-700 text-xs sm:text-sm">{Number(item.quantity).toFixed(3)}</td>
              <td className="py-2 px-2 font-mono font-bold text-slate-900 text-xs sm:text-sm">{Number(item.unitPrice).toFixed(3)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="py-4 text-center text-slate-600 text-sm">
              Aucune vente associée à cette facture.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

              <div className="no-print mt-4">
                <button
                  onClick={handleAddItem}
                  className="border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 bg-transparent py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-sm w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une ligne
                </button>
              </div>
            </div>

            {/* Payment & Totals */}
            <div className="grid gap-4 mb-6 grid-cols-2 overflow-visible">
              <div className="space-y-2 p-4 bg-orange-50 rounded-lg border border-orange-200 overflow-visible">
                <h3 className="font-bold text-orange-800 border-b-2 border-orange-600 pb-2">Remarques/Instructions :</h3>
                <p className="text-black">
                <textarea
                  value=""
                  onChange={() => {}}
                  className="w-full border-0 bg-transparent p-0 focus:outline-none text-gray-900 resize-none h-20"
                  placeholder=""
                />
                </p>
              </div>

              <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-800 border-b-2 border-purple-600 pb-2">Récapitulatif</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Sous-total</span>
                    <span className="font-mono font-bold text-gray-900">{totalHT.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Taxe</span>
                    <span className="font-mono font-bold text-gray-900">{tvaAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Expédition/Gestion</span>
                    <span className="font-mono font-bold text-gray-900">{timbreFiscalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Remises</span>
                    <span className="font-mono font-bold text-gray-900">{remiseAmount.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-300 my-2"></div>
                  <div className="flex justify-between font-bold text-lg text-black">
                    <span>TOTAL :</span>
                    <span className="font-mono">{totalTTC.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="text-center text-gray-600 text-sm">
                En cas de questions concernant ce facture, veuillez contacter :
                <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-gray-900">
                  {issuer.address.map((a, index) => (
                    <span key={`addr-${index}`} className="inline-block">{a}</span>
                  ))}
                  {issuer.phone.map((p, index) => (
                    <span key={`phone-${index}`} className="inline-block">{p}</span>
                  ))}
                  {issuer.email.map((e, index) => (
                    <span key={`email-${index}`} className="inline-block">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}