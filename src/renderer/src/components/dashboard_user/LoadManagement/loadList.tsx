"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "../../auth/auth-context"
import { toast } from "react-toastify"
import { Edit, Link, Save, Trash2, X } from "lucide-react"
import { List, Plus, Filter, FileText, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { getAllChargeType } from "@renderer/api/charge-type"
import { deleteChargeById, findAllCharge, updateChargeById } from "@renderer/api/charge"

interface Charge {
  id: string
  typeCharge: { nom: string }
  montant: number
  typeChargeId:string;
  dateEcheance: string
  datePaiement: string | null
  dateDebutRepartition: string
  dateFinRepartition: string
}

interface TypeCharge {
  id: string
  nom: string
}

const LoadList = () => {
  const { entreprise } = useAuth()
  const [charges, setCharges] = useState<Charge[]>([])
  const [types, setTypes] = useState<TypeCharge[]>([])
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState<string | null>(null); // store the ID of the row being edited
  const [editedValues, setEditedValues] = useState<{ [key: string]: any }>({});
  const [filters, setFilters] = useState({
    typeChargeId: "",
    statut: "",
  })
  const [sort, setSort] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "dateEcheance",
    direction: "desc",
  })
  const fetchTypes = async () => {
      try {
         if (entreprise?.id) {
      const types = await getAllChargeType(entreprise.id)

      if(types)setTypes(types)
        
      fetchCharges()
    }
      } catch (error) {
        console.error("error de recuperATION DE TYPES: ",error)
      }
  }
  useEffect(() => {
   fetchTypes()
  }, [entreprise?.id])

  const fetchCharges = async() => {
    if (!entreprise?.id) return
    setLoading(true)
    const params: any = {}
    if (filters.typeChargeId) params.typeChargeId = filters.typeChargeId
    if (filters.statut) params.statut = filters.statut === "paye" ? "paye" : "non_paye"
    // Add sorting parameters
    if (sort.field) {
      params.orderBy = sort.field
      params.orderDirection = sort.direction
    }
      try{
        const charges = await findAllCharge(entreprise.id,params)
        setCharges(charges)
        
        setLoading(false)
      }catch(err) {
        console.error(err)
        toast.error("Erreur lors du chargement des charges: " + err|| "Erreur inconnue")
        setLoading(false)
      }
  }

  const handleEditClick = (id: string, charge: Charge) => {
    setEditForm(id);
    setEditedValues({
      montant: charge.montant,
      dateEcheance: charge.dateEcheance,
      datePaiement: charge.datePaiement,
      dateFinRepartition:charge.dateFinRepartition,
      dateDebutRepartition:charge.dateDebutRepartition,
      typeChargeId:charge.typeChargeId
    });
  };

  const handleSave = async (id: string) => {
    console.log("Saving edited values for", id, editedValues);
    try {
      
    await updateChargeById(entreprise?.id!,id,editedValues)
    toast.success("Charge cree avec succes")
    } catch (error) {
      toast.error("imossible d'ajouter charge: "+String(error))
    }
    fetchCharges()
    setEditForm(null);
  };

  const handleDelete = async(id: string) => {
    console.log("Deleting charge", id);
    try {
       await deleteChargeById(entreprise?.id!,id)
      fetchCharges()
      toast.success("Charge supprime avec succes")
    } catch (error) {
      toast.error("impossible de supprimer charge: "+String(error))
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSort = (field: string) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  useEffect(() => {
    fetchCharges()
  }, [filters, sort])

  if (!entreprise) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <List className="w-6 h-6 sm:w-8 sm:h-8 text-white/40 mx-auto mb-3" />
          <p className="text-white text-sm text-center">Veuillez vous connecter.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 px-3 sm:px-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <List className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">Liste des Charges</h1>
            <p className="text-white/60 text-xs">Gérer et consulter vos charges d'entreprise</p>
          </div>
        </div>
        <Link
          href="/dashboard_user/loadManagment/loadForm"
          className="px-2 py-1 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all duration-200 flex items-center gap-1"
        >
          <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
          Nouvelle Charge
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-3 sm:p-4 shadow-2xl">
        <h2 className="text-sm sm:text-base font-semibold text-white/90 mb-3 flex items-center gap-2">
          <Filter className="w-3 sm:w-4 h-3 sm:h-4" />
          Filtres
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-medium text-white/90">Type de charge</label>
            <div className="relative">
              <select
                name="typeChargeId"
                value={filters.typeChargeId}
                onChange={handleFilterChange}
                className="w-full px-2 sm:px-3 py-1 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer transition-all duration-200 text-xs"
              >
                <option value="" className="bg-purple-800">
                  Tous les types
                </option>
                {types.map((t) => (
                  <option key={t.id} value={t.id} className="bg-purple-800">
                    {t.nom}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-3 sm:w-4 h-3 sm:h-4 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-medium text-white/90">Statut de paiement</label>
            <div className="relative">
              <select
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
                className="w-full px-2 sm:px-3 py-1 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer transition-all duration-200 text-xs"
              >
                <option value="" className="bg-purple-800">
                  Tous les statuts
                </option>
                <option value="paye" className="bg-purple-800">
                  Payé
                </option>
                <option value="non_paye" className="bg-purple-800">
                  Non payé
                </option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-3 sm:w-4 h-3 sm:h-4 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charges List */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-white/10">
          <h2 className="text-sm sm:text-base font-semibold text-white/90 flex items-center gap-2">
            <FileText className="w-3 sm:w-4 h-3 sm:h-4" />
            Charges ({charges.length})
          </h2>
        </div>

        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 sm:w-6 h-5 sm:h-6 animate-spin text-white/60" />
              <span className="ml-2 text-white/60 text-xs sm:text-sm">Chargement des charges...</span>
            </div>
          ) : charges.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-8 sm:w-12 h-8 sm:h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-white/40" />
              </div>
              <p className="text-white/60 text-sm sm:text-base mb-2">Aucune charge trouvée</p>
              <p className="text-white/40 text-xs sm:text-sm">Ajoutez votre première charge pour commencer</p>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-center bg-white/10 p-2 rounded-lg">
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Type</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Montant</p>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSort("dateEcheance")}
                    className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide flex items-center gap-1 hover:text-white/70 transition-colors"
                  >
                    Échéance
                    {sort.field === "dateEcheance" ? (
                      sort.direction === "asc" ? (
                        <ChevronUp className="w-2 sm:w-3 h-2 sm:h-3 text-purple-400" />
                      ) : (
                        <ChevronDown className="w-2 sm:w-3 h-2 sm:h-3 text-purple-400" />
                      )
                    ) : (
                      <ChevronDown className="w-2 sm:w-3 h-2 sm:h-3" />
                    )}
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSort("datePaiement")}
                    className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide flex items-center gap-1 hover:text-white/70 transition-colors"
                  >
                    Paiement
                    {sort.field === "datePaiement" ? (
                      sort.direction === "asc" ? (
                        <ChevronUp className="w-2 sm:w-3 h-2 sm:h-3 text-purple-400" />
                      ) : (
                        <ChevronDown className="w-2 sm:w-3 h-2 sm:h-3 text-purple-400" />
                      )
                    ) : (
                      <ChevronDown className="w-2 sm:w-3 h-2 sm:h-3" />
                    )}
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Début Répartition</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Fin Répartition</p>
                </div>
              </div>
              {charges.map((charge) => (
        <div
          key={charge.id}
          className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-center">
            {/* Type */}
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Type</p>
              <p className="text-white/90 font-medium text-xs sm:text-sm">{charge.typeCharge.nom}</p>
            </div>

            {/* Montant (editable) */}
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Montant</p>
              {editForm === charge.id ? (
                <input
                  type="number"
                  value={editedValues.montant}
                  onChange={(e) => setEditedValues({ ...editedValues, montant: Number(e.target.value) })}
                  className="bg-white/10 text-white/90 px-2 py-1 rounded w-full text-sm sm:text-base"
                />
              ) : (
                <p className="text-white/90 font-semibold text-sm sm:text-base">
                  {charge.montant.toLocaleString()} DT
                </p>
              )}
            </div>

            {/* Échéance (editable) */}
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Échéance</p>
              {editForm === charge.id ? (
                <input
                  type="date"
                  value={editedValues.dateEcheance.split("T")[0]}
                  onChange={(e) => setEditedValues({ ...editedValues, dateEcheance: e.target.value })}
                  className="bg-white/10 text-white/90 px-2 py-1 rounded w-full text-xs sm:text-sm"
                />
              ) : (
                <p className="text-white/90 text-xs sm:text-sm">
                  {new Date(charge.dateEcheance).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>

            {/* Paiement */}
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Paiement</p>
              <div className="flex items-center gap-2">
                {editForm === charge.id ? (
                <input
                  type="date"
                  value={editedValues.datePaiement?.split("T")[0]}
                  onChange={(e) => setEditedValues({ ...editedValues, datePaiement: e.target.value })}
                  className="bg-white/10 text-white/90 px-2 py-1 rounded w-full text-xs sm:text-sm"
                />
              ) : (
                <p className="text-white/90 text-xs sm:text-sm">
                  {charge.datePaiement ? new Date(charge.datePaiement).toLocaleDateString("fr-FR"): "non paye"}
                </p>
              )}
              </div>
            </div>

            {/* Début Répartition */}
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Début Répartition</p>
              <p className="text-white/90 text-xs sm:text-sm">
                {new Date(charge.dateDebutRepartition).toLocaleDateString("fr-FR")}
              </p>
            </div>

            {/* Fin Répartition */}
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">Fin Répartition</p>
              <p className="text-white/90 text-xs sm:text-sm">
                {new Date(charge.dateFinRepartition).toLocaleDateString("fr-FR")}
              </p>
            </div>

            {/* Action icons */}
            <div className="flex items-center gap-2 justify-start col-span-full sm:col-auto mt-2 sm:mt-0">
              {editForm === charge.id ? (
                <>
                <Save
                  className="text-green-400 cursor-pointer"
                  size={18}
                  onClick={() => handleSave(charge.id)}
                />
                <Trash2
                className="text-red-400 cursor-pointer"
                size={18}
                onClick={() => handleDelete(charge.id)}
              />
              <X
                className="text-gray-400 cursor-pointer"
                size={18}
                onClick={() => setEditForm(null)}
              />
              </>
              ) : (
                <Edit
                  className="text-white/50 cursor-pointer hover:text-white"
                  size={18}
                  onClick={() => handleEditClick(charge.id, charge)}
                />
              )}
              
            </div>
          </div>
        </div>
      ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoadList