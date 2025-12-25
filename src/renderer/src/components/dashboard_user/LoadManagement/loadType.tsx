
import { useState, useEffect, type FormEvent } from "react"

import { useAuth } from "../../auth/auth-context"
import { toast } from "react-toastify"
import { Tag, Plus, List, Edit2, Trash2, Check, X, Loader2, AlertCircle } from "lucide-react"
import { createChargeType, deleteChargeType, getAllChargeType, updateChargeType } from "@renderer/api/charge-type"

interface TypeCharge {
  id: string
  nom: string
}

const LoadType = () => {
  const { entreprise } = useAuth()
  const [nom, setNom] = useState("")
  const [types, setTypes] = useState<TypeCharge[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // New state for inline editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNom, setEditingNom] = useState("")
  const [editingError, setEditingError] = useState<string | null>(null)

  useEffect(() => {
    if (entreprise?.id) {
      fetchTypes()
    }
  }, [entreprise?.id])

  const fetchTypes = async () => {
    try {
      setFetchLoading(true)
      const res = await getAllChargeType(entreprise?.id!)
      setTypes(res)
    } catch (err: any) {
      toast.error("Erreur lors du chargement des types")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!entreprise?.id) {
      setError("Utilisateur non authentifié.")
      return
    }

    if (!nom.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await createChargeType(entreprise.id,{nom:nom})
      toast.success("Type de charge ajouté avec succès")
      setNom("")
      setTypes((prev) => [...prev, res])
    } catch (err: unknown) {
      const msg = err || "Erreur lors de l'ajout."
      setError(String(msg))
      toast.error(String(msg))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce type de charge ?")) return

    try {
      await deleteChargeType(entreprise?.id!,id)
      toast.success("Type de charge supprimé avec succès")
      fetchTypes()
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur lors de la suppression"
      toast.error(msg)
    }
  }

  const startEditing = (id: string, nom: string) => {
    setEditingId(id)
    setEditingNom(nom)
    setEditingError(null)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingNom("")
    setEditingError(null)
  }

  const handleUpdate = async (e: FormEvent, id: string) => {
    e.preventDefault()
    if (!entreprise?.id || !editingNom.trim()) {
      setEditingError("Le nom ne peut pas être vide.")
      return
    }

    try {
      await updateChargeType(entreprise.id,id,
        { nom: editingNom })
      toast.success("Type de charge modifié avec succès")
      fetchTypes()
      cancelEditing()
    } catch (err: unknown) {
      const msg = err || "Erreur lors de la modification."
      setEditingError(String(msg))
      toast.error(String(msg))
    }
  }

  if (!entreprise) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-white/40 mx-auto mb-3" />
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
            <Tag className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">Types de Charge</h1>
            <p className="text-white/60 text-xs">Créer et gérer les catégories de charges</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Form Section */}
        <div className="space-y-3">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-2 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Type Form */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-3 sm:p-4 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-white/90 flex items-center gap-2">
                <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
                Ajouter un Type
              </h2>
              <p className="text-white/60 text-xs mt-1">Créer une nouvelle catégorie de charge</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="nom" className="block text-[10px] font-medium text-white/90">
                  Nom du type de charge <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-2 py-1 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-xs"
                  placeholder="Ex: Loyer, Salaire, Assurance..."
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-white/10 space-y-2 sm:space-y-0">
                <div></div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setNom("")}
                    className="px-3 py-1 sm:px-4 sm:py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium text-xs"
                    disabled={loading}
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 sm:px-6 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-2 h-2 sm:w-3 sm:h-3 animate-spin" />
                        <span>Ajout en cours...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-2 h-2 sm:w-3 sm:h-3" />
                        <span>Ajouter le Type</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Types List Section */}
        <div className="space-y-3">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-white/10">
              <h2 className="text-sm sm:text-base font-semibold text-white/90 flex items-center gap-2">
                <List className="w-3 sm:w-4 h-3 sm:h-4" />
                Types Existants ({types.length})
              </h2>
              <p className="text-white/60 text-xs mt-1">Liste de vos catégories de charges</p>
            </div>

            <div className="p-3 sm:p-4">
              {fetchLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin text-white/60" />
                  <span className="ml-2 text-white/60 text-xs sm:text-sm">Chargement...</span>
                </div>
              ) : types.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Tag className="w-4 sm:w-5 h-4 sm:h-5 text-white/40" />
                  </div>
                  <p className="text-white/60 text-sm sm:text-base mb-1">Aucun type de charge</p>
                  <p className="text-white/40 text-xs sm:text-sm">Ajoutez votre premier type pour commencer</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {types.map((type) => (
                    <div
                      key={type.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-3 hover:bg-white/10 transition-all duration-200 group"
                    >
                      {editingId === type.id ? (
                        <form onSubmit={(e) => handleUpdate(e, type.id)} className="space-y-2">
                          {editingError && (
                            <p className="text-red-300 text-xs font-medium flex items-center gap-2">
                              <AlertCircle className="w-3 h-3" />
                              {editingError}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingNom}
                              onChange={(e) => setEditingNom(e.target.value)}
                              className="flex-1 px-2 py-1 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-xs"
                              placeholder="Nouveau nom..."
                              required
                            />
                            <button
                              type="submit"
                              className="p-1.5 sm:p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 transition-all duration-200"
                              title="Enregistrer"
                            >
                              <Check className="w-3 sm:w-4 h-3 sm:h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="p-1.5 sm:p-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-400 transition-all duration-200"
                              title="Annuler"
                            >
                              <X className="w-3 sm:w-4 h-3 sm:h-4" />
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 sm:w-6 h-5 sm:h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <Tag className="w-3 sm:w-4 h-3 sm:h-4 text-purple-400" />
                            </div>
                            <span className="text-white/90 font-medium text-xs sm:text-sm">{type.nom}</span>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => startEditing(type.id, type.nom)}
                              className="p-1.5 sm:p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 transition-all duration-200"
                              title="Modifier ce type"
                            >
                              <Edit2 className="w-3 sm:w-4 h-3 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
                              className="p-1.5 sm:p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-all duration-200"
                              title="Supprimer ce type"
                            >
                              <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadType