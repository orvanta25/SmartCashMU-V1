"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  FileText,
  Briefcase,
  MapPin,
  Plus,
  Search,
  PhoneCall,
  Pencil,
  Trash2,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { deleteFournisseur, Fournisseur, getFournisseursByParams, updateFournisseur } from "@renderer/api/fournisseur";
import { toast } from "react-toastify";
import { useAuth } from "@renderer/components/auth/auth-context";

export default function ListProvider() {
  const [providers, setProviders] = useState<Fournisseur[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedProvider, setEditedProvider] = useState<Partial<Fournisseur> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { entreprise } = useAuth();

  const filteredProviders = providers.filter((p) =>
    p.denomination.toLowerCase().includes(search.toLowerCase())
  );

  const fetchFournisseur = async () => {
    try {
      if (!entreprise) return;
      const fournisseurs = await getFournisseursByParams(entreprise.id, { denomination: search });
      if (fournisseurs) setProviders(fournisseurs);
    } catch (error) {
      toast.error("Impossible de récupérer les fournisseurs: " + error);
    }
  };

  useEffect(() => {
    fetchFournisseur();
  }, []);

  // Watch search changes with debounce effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchFournisseur();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleEdit = (provider: Fournisseur) => {
    setEditingId(provider.id);
    setEditedProvider({ ...provider });
  };

  const handleSave = async () => {
    if (!editedProvider || editingId === null) return;

    setIsSaving(true);
    await updateFournisseur(editingId,editedProvider)

    await fetchFournisseur()

    toast.success("Fournisseur mis à jour avec succès !");
    setEditingId(null);
    setEditedProvider(null);
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);

    await deleteFournisseur(id)

    await fetchFournisseur()
    
    toast.success("Fournisseur supprimé avec succès !");
    setIsDeleting(false);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedProvider(null);
  };

  const isEditing = (id: string) => editingId === id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl border border-purple-700/30 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
                Liste des Fournisseurs
              </h1>
              <p className="text-purple-200/80 text-sm">Gérez vos fournisseurs en toute simplicité</p>
            </div>
            <Link
              to="/dashboard_user/provider"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-md shadow-blue-500/25 font-semibold border border-blue-400/30 hover:scale-105 transform"
            >
              <Plus className="w-4 h-4" />
              Ajouter un fournisseur
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-xl shadow-xl border border-purple-700/30 p-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
            <input
              type="text"
              placeholder="Rechercher par dénomination"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Provider List */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-xl shadow-xl border border-purple-700/30 p-6">
          {filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Aucun fournisseur trouvé</h3>
              <p className="text-purple-200/70 text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProviders.map((provider) => {
                const isEditMode = isEditing(provider.id);
                const current = isEditMode ? editedProvider : provider;

                return (
                  <div
                    key={provider.id}
                    className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-purple-400/20 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/40 p-4 relative"
                  >
                    {/* Edit Button (Visible on Hover) */}
                    {!isEditMode && (
                      <button
                        onClick={() => handleEdit(provider)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4 text-purple-200" />
                      </button>
                    )}

                    <div className="space-y-3 pr-10">
                      {/* Emails */}
                      <div className="flex flex-wrap gap-2 text-purple-100/90">
                        {current?.mails?.map((mail, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-purple-300 flex-shrink-0" />
                            {isEditMode ? (
                              <input
                                type="email"
                                value={mail}
                                onChange={(e) => {
                                  const newMails = [...(current.mails || [])];
                                  newMails[i] = e.target.value;
                                  setEditedProvider({ ...current, mails: newMails });
                                }}
                                className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                              />
                            ) : (
                              <span className="text-sm">{mail}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Phones */}
                      <div className="flex items-center gap-4 text-purple-100/90 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          {isEditMode ? (
                            <input
                              type="tel"
                              value={current?.mobileTel || ""}
                              onChange={(e) =>
                                setEditedProvider({ ...current, mobileTel: e.target.value })
                              }
                              className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white w-28 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-sm">{provider.mobileTel}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PhoneCall className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          {isEditMode ? (
                            <input
                              type="tel"
                              value={current?.fixedTel || ""}
                              onChange={(e) =>
                                setEditedProvider({ ...current, fixedTel: e.target.value })
                              }
                              className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white w-28 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-sm">{provider.fixedTel}</span>
                          )}
                        </div>
                      </div>

                      {/* Denomination */}
                      <div className="flex items-center gap-1.5 text-purple-100/90">
                        <FileText className="w-4 h-4 text-purple-300 flex-shrink-0" />
                        {isEditMode ? (
                          <input
                            type="text"
                            value={current?.denomination || ""}
                            onChange={(e) =>
                              setEditedProvider({ ...current, denomination: e.target.value })
                            }
                            className="text-sm font-medium bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                          />
                        ) : (
                          <span className="text-sm font-medium">{provider.denomination}</span>
                        )}
                      </div>

                      {/* Matricule */}
                      <div className="flex items-center gap-1.5 text-purple-100/90">
                        <FileText className="w-4 h-4 text-purple-300 flex-shrink-0" />
                        {isEditMode ? (
                          <input
                            type="text"
                            value={current?.matricule || ""}
                            onChange={(e) =>
                              setEditedProvider({ ...current, matricule: e.target.value })
                            }
                            className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                          />
                        ) : (
                          <span className="text-sm">{provider.matricule}</span>
                        )}
                      </div>

                      {/* Secteur */}
                      <div className="flex items-center gap-1.5 text-purple-100/90">
                        <Briefcase className="w-4 h-4 text-purple-300 flex-shrink-0" />
                        {isEditMode ? (
                          <input
                            type="text"
                            value={current?.secteur || ""}
                            onChange={(e) =>
                              setEditedProvider({ ...current, secteur: e.target.value })
                            }
                            className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                          />
                        ) : (
                          <span className="text-sm">{provider.secteur}</span>
                        )}
                      </div>

                      {/* Addresses */}
                      <div className="flex flex-wrap gap-2 text-purple-100/90">
                        {current?.addresses?.map((addr, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-purple-300 flex-shrink-0" />
                            {isEditMode ? (
                              <input
                                type="text"
                                value={addr}
                                onChange={(e) => {
                                  const newAddresses = [...(current.addresses || [])];
                                  newAddresses[i] = e.target.value;
                                  setEditedProvider({ ...current, addresses: newAddresses });
                                }}
                                className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                              />
                            ) : (
                              <span className="text-sm">{addr}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons in Edit Mode */}
                    {isEditMode && (
                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-purple-400/20">
                        <button
                          onClick={() => handleDelete(provider.id)}
                          disabled={isDeleting}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors disabled:opacity-50"
                          title="Sauvegarder"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors"
                          title="Annuler"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}