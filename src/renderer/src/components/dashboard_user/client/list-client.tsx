"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, User, FileText, MapPin, Plus, Search, DollarSign, Loader2, Trash2, Check, X, Pencil } from "lucide-react";
import {Link} from "react-router-dom";
import { Client, deleteClient, getClientsByParams, updateClient } from "@renderer/api/client";
import { toast } from "react-toastify";
import { useAuth } from "@renderer/components/auth/auth-context";

export default function ListClient() {
  const [clients,setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const {entreprise} =useAuth()
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedClient, setEditedClient] = useState<Partial<Client> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const fetchClients = async () => {
    if(!entreprise)return
    try {
      const fetchedClients = await getClientsByParams(entreprise.id,{search})

      if(fetchedClients)setClients(fetchedClients)
    } catch (error) {
      toast.error("impossible de recuperer les clients :"+error)
    }
  }

  useEffect(()=>{
    fetchClients()
  },[search])

  const handleEdit = (Client: Client) => {
      setEditingId(Client.id);
      setEditedClient({ ...Client });
    };
  
    const handleSave = async () => {
      if (!editedClient || editingId === null) return;
  
      setIsSaving(true);
      await updateClient(editingId,editedClient)
  
      await fetchClients()
  
      toast.success("Client mis à jour avec succès !");
      setEditingId(null);
      setEditedClient(null);
      setIsSaving(false);
    };
  
    const handleDelete = async (id: string) => {
      setIsDeleting(true);
  
      await deleteClient(id)
  
      await fetchClients()
      
      toast.success("Client supprimé avec succès !");
      setIsDeleting(false);
      setEditingId(null);
    };
  
    const handleCancel = () => {
      setEditingId(null);
      setEditedClient(null);
    };
  
    const isEditing = (id: string) => editingId === id;
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl border border-purple-700/30 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Liste des Clients</h1>
              <p className="text-purple-200/80 text-sm">Gérez vos clients en toute simplicité</p>
            </div>
            <Link
              to="/dashboard_user/client/add-client"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-md shadow-blue-500/25 font-semibold border border-blue-400/30 hover:scale-105 transform"
            >
              <Plus className="w-4 h-4" />
              Ajouter un client
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-xl shadow-xl border border-purple-700/30 p-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
            <input
              type="text"
              placeholder="Rechercher par dénomination ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-xl shadow-xl border border-purple-700/30 p-6">
          {!clients  ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Aucun client trouvé</h3>
              <p className="text-purple-200/70 text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((client, idx) => {
                const isEditMode = isEditing(client.id);
                const current = isEditMode ? editedClient : client;
                return(
                  <div
                  key={idx}
                  className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-purple-400/20 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/40 p-4"
                >
                  {/* Edit Button (Visible on Hover) */}
                    {!isEditMode && (
                      <button
                        onClick={() => handleEdit(client)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4 text-purple-200" />
                      </button>
                    )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-100/90">
                      <Mail className="w-4 h-4 text-purple-300 flex-shrink-0" />
                      {isEditMode ? (
                            <input
                              type="email"
                              value={current?.email || ""}
                              onChange={(e) =>
                                setEditedClient({ ...current, email: e.target.value })
                              }
                              className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white w-28 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-sm">{client.email}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-purple-100/90">
                      <Phone className="w-4 h-4 text-purple-300 flex-shrink-0" />
                      {isEditMode ? (
                            <input
                              type="tel"
                              value={current?.tel || ""}
                              onChange={(e) =>
                                setEditedClient({ ...current, tel: e.target.value })
                              }
                              className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white w-28 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-sm">{client.tel}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-purple-100/90">
                      <User className="w-4 h-4 text-purple-300 flex-shrink-0" />
                      {isEditMode ? (
                            <input
                              type="prenom"
                              value={current?.prenom || ""}
                              onChange={(e) =>
                                setEditedClient({ ...current, prenom: e.target.value })
                              }
                              className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white w-28 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-sm">{client.prenom}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-purple-100/90">
                      <User className="w-4 h-4 text-purple-300 flex-shrink-0" />
                      {isEditMode ? (
                            <input
                              type="nom"
                              value={current?.nom || ""}
                              onChange={(e) =>
                                setEditedClient({ ...current, nom: e.target.value })
                              }
                              className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white w-28 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-sm">{client.nom}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-purple-100/90">
                      <FileText className="w-4 h-4 text-purple-300 flex-shrink-0" />
                      {isEditMode ? (
                            <input
                              type="cin"
                              value={current?.cin || 0}
                              onChange={(e) =>
                                setEditedClient({ ...current, cin: Number(e.target.value) })
                              }
                              className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white w-28 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-sm">{client.cin}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-purple-100/90">
                      <DollarSign className="w-4 h-4 text-purple-300 flex-shrink-0" />
                      {isEditMode ? (
                            <input
                              type="credit"
                              value={current?.credit || ""}
                              onChange={(e) =>
                                setEditedClient({ ...current, credit: Number(e.target.value) })
                              }
                              className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white w-28 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-sm">{client.credit}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-purple-100/90">
                      <MapPin className="w-4 h-4 text-purple-300 flex-shrink-0" />
                      {isEditMode ? (
                            <input
                              type="address"
                              value={current?.address || ""}
                              onChange={(e) =>
                                setEditedClient({ ...current, address: e.target.value })
                              }
                              className="text-sm bg-white/10 border border-purple-400/30 rounded px-2 py-0.5 text-white w-28 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-sm">{client.address}</span>
                      )}
                    </div>

                    {isEditMode && (
                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-purple-400/20">
                        <button
                          onClick={() => handleDelete(client.id)}
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
                </div>
                )
            })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}