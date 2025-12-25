"use client"

import { useAuth } from "../../auth/auth-context"
import { POSList } from "./posList"
import { FactureList } from "./factureList"

export function SalesList() {
  const { entreprise, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-2">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* {entreprise?.type === "FOURNISSEUR" ? <POSList /> : <FactureList />} */}
      <POSList/>
    </div>
  )
}
