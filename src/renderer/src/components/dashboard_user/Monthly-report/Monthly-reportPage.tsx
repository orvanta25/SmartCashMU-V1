"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "../../auth/auth-context"
import { getCommandes } from "@renderer/api/commande"
import { getAchatFournisseurs } from "@renderer/api/achat-fournisseur"
import { findAllCharge } from "@renderer/api/charge"
import type { Commande } from "@renderer/types/commande"
import type { AchatFournisseur } from "@renderer/types/achat-entree"
import jsPDF from "jspdf"
import html2canvas from "html2canvas-pro"

export default function MonthlyReportPage() {
  const { entreprise } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [totalSales, setTotalSales] = useState<number>(0)
  const [totalPurchases, setTotalPurchases] = useState<number>(0)
  const [totalCharges, setTotalCharges] = useState<number>(0)
  const [chargesByType, setChargesByType] = useState<{ type: string; total: number }[]>([])

  const reportRef = useRef<HTMLDivElement>(null)

  const { monthStartStr, monthEndStr, monthLabel } = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const pad = (n: number) => String(n).padStart(2, "0")
    const fmt = (d: Date) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
    const label = `${pad(start.getMonth() + 1)}/${start.getFullYear()}`
    return { monthStartStr: fmt(start), monthEndStr: fmt(end), monthLabel: label }
  }, [])

  const overallTotal = useMemo(() => {
    return (Number(totalSales) || 0) + (Number(totalPurchases) || 0) + (Number(totalCharges) || 0)
  }, [totalSales, totalPurchases, totalCharges])

  const netResult = useMemo(() => {
    return (Number(totalSales) || 0) - (Number(totalPurchases) || 0) - (Number(totalCharges) || 0)
  }, [totalSales, totalPurchases, totalCharges])

  useEffect(() => {
    const fetchData = async () => {
      if (!entreprise?.id) return
      setLoading(true)
      setError(null)
      try {
        // Sales (ventes) within current month
        const commandes: Commande[] = await getCommandes(entreprise.id, {
          dateDebut: `${monthStartStr} 00:00`,
          dateFin: `${monthEndStr} 23:59`,
        })
        const salesSum = Array.isArray(commandes) ? commandes.reduce((sum, c) => sum + Number(c.total || 0), 0) : 0
        setTotalSales(salesSum)

        // Purchases (achats fournisseurs) — filter by createdAt in current month if present
        const achats: AchatFournisseur[] = await getAchatFournisseurs(entreprise.id)
        const purchasesSum = Array.isArray(achats)
          ? achats
              .filter((a: any) => {
                const createdAt = a?.createdAt ? new Date(a.createdAt) : null
                if (!createdAt) return false
                const startParts = monthStartStr.split("-")
                const endParts = monthEndStr.split("-")
                const startDate = new Date(Number(startParts[2]), Number(startParts[1]) - 1, Number(startParts[0]), 0, 0, 0)
                const endDate = new Date(Number(endParts[2]), Number(endParts[1]) - 1, Number(endParts[0]), 23, 59, 59)
                return createdAt >= startDate && createdAt <= endDate
              })
              .reduce((sum: number, f: any) => {
                const parseCurrency = (v: any) => {
                  if (v === undefined || v === null) return 0
                  if (typeof v === "number") return v
                  if (typeof v === "string") return Number(v.replace(/,/g, "")) || 0
                  return 0
                }
                // Prefer montantTotal if present; fallback to montantComptant + reste if those exist
                const total = parseCurrency(f.montantTotal ?? (parseCurrency(f.montantComptant) + parseCurrency(f.reste)))
                return sum + total
              }, 0)
          : 0
        setTotalPurchases(purchasesSum)

        // Charges within current month
        const chargesRes: any = await findAllCharge(entreprise.id, {
          // dateDebut: monthStartStr,
          // dateFin: monthEndStr,
        })
        console.log(chargesRes,"charge in monthly report ")
        const chargesData = chargesRes || []
        if (Array.isArray(chargesData)) {
          const byType: Record<string, number> = {}
          for (const c of chargesData) {
            const typeName = c?.typeCharge?.nom || "Autres"
            const amount = Number(c?.montant || 0)
            byType[typeName] = (byType[typeName] || 0) + amount
          }
          const grouped = Object.entries(byType).map(([type, total]) => ({ type, total }))
          setChargesByType(grouped.sort((a, b) => b.total - a.total))
          const chargesSum = grouped.reduce((s, g) => s + g.total, 0)
          setTotalCharges(chargesSum)
        } else {
          setChargesByType([])
          setTotalCharges(0)
        }
      } catch (e: any) {
        setError(e || "Erreur lors du chargement du rapport mensuel")
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [entreprise?.id, monthStartStr, monthEndStr])

  const generatePDF = async () => {
    if (!reportRef.current) return
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#ffffff" })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20))
    pdf.save(`declaration-mensuelle-${monthLabel}.pdf`)
  }

  const formatCurrency = (n: number) => `${(Number(n) || 0).toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND`

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3">
      <div className="max-w-4xl mx-auto mb-4 flex justify-end gap-2">
        <button
          onClick={generatePDF}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Télécharger PDF
        </button>
      </div>

      <div
        ref={reportRef}
        className="max-w-4xl mx-auto bg-white shadow-xl border border-slate-200 rounded-md"
        style={{ width: "794px" }}
      >
        {/* Professional Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="text-xl font-bold text-slate-900 leading-tight truncate">
              {entreprise?.nom || "Votre Entreprise"}
            </div>
            <div className="text-right text-sm text-slate-600 leading-tight">
              {entreprise?.region || entreprise?.ville || "Votre Localisation"}
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-2xl font-extrabold text-slate-900 tracking-wide">Déclaration Mensuelle</div>
            <div className="text-xs uppercase tracking-wider text-slate-500 mt-1">Période: {monthLabel}</div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Key Figures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-md border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Ventes</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalSales)}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Achats</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalPurchases)}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Charges</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalCharges)}</div>
            </div>
          </div>

          {/* Charges breakdown by type (table style) */}
          <div className="mb-6 rounded-md border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">Détail des charges (automatique)</div>
            {chargesByType.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-500">Aucune charge pour la période.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white">
                    <th className="text-left px-4 py-2 text-slate-600 font-semibold border-b border-slate-200">Type</th>
                    <th className="text-right px-4 py-2 text-slate-600 font-semibold border-b border-slate-200">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {chargesByType.map((c, idx) => (
                    <tr key={c.type} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-4 py-2 text-slate-800">{c.type}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">{formatCurrency(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="px-4 py-2 text-right text-slate-700 font-semibold border-t border-slate-200">Total charges</td>
                    <td className="px-4 py-2 text-right text-slate-900 font-bold border-t border-slate-200">{formatCurrency(totalCharges)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Balanced layout: summary and notes */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Synthèse */}
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">Synthèse mensuelle</div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="bg-white">
                    <td className="px-4 py-2 text-slate-600">Total Ventes</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">{formatCurrency(totalSales)}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-2 text-slate-600">Total Achats</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">{formatCurrency(totalPurchases)}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2 text-slate-600">Total Charges</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">{formatCurrency(totalCharges)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="px-4 py-2 text-slate-700 font-semibold border-t border-slate-200">Résultat net</td>
                    <td className="px-4 py-2 text-right text-slate-900 font-bold border-t border-slate-200">{formatCurrency(netResult)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observations */}
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">Observations & Notes</div>
              <div className="p-4">
                <div className="h-8 border-b border-dashed border-slate-300"></div>
                <div className="h-8 border-b border-dashed border-slate-300"></div>
                <div className="h-8 border-b border-dashed border-slate-300"></div>
                <div className="h-8 border-b border-dashed border-slate-300"></div>
              </div>
            </div>
          </div>

          {/* Overall total */}
          <div className="mt-8 rounded-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <div className="text-sm font-semibold tracking-wide">Total général</div>
              <div className="text-2xl font-extrabold">{formatCurrency(overallTotal)}</div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Signature du responsable</div>
              <div className="h-24 border-2 border-dashed border-slate-300 rounded-md"></div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Cachet & signature de l'entreprise</div>
              <div className="h-24 border-2 border-dashed border-slate-300 rounded-md"></div>
            </div>
          </div>

          {/* Footer status */}
          {loading && <div className="mt-4 text-xs text-slate-500">Chargement...</div>}
          {error && <div className="mt-4 text-xs text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  )
}


