"use client"
import { useState } from "react"
import { Mail, Phone, User, Plus, Search, Edit, XCircle, Grid, List } from "lucide-react"
import {Link} from "react-router-dom"

interface Responsible {
  id: string
  nom: string
  prenom: string
  email: string
  tel: string
  isActive: boolean
}

export default function ListResponsible() {
  const [responsibles, setResponsibles] = useState<Responsible[]>([
    {
      id: "1",
      nom: "Ben Ali",
      prenom: "Ahmed",
      email: "ahmed@magasin.com",
      tel: "+21612345678",
      isActive: true,
    },
    {
      id: "2",
      nom: "Trabelsi",
      prenom: "Fatima",
      email: "fatima@magasin.com",
      tel: "+21698765432",
      isActive: true,
    },
  ])

  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredResponsibles = responsibles.filter(
    (r) =>
      r.nom.toLowerCase().includes(search.toLowerCase()) ||
      r.prenom.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDeactivate = (id: string) => {
    setResponsibles((prev) =>
      prev.map((responsible) => (responsible.id === id ? { ...responsible, isActive: !responsible.isActive } : responsible)),
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-700/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Gestion des Responsables</h1>
              <p className="text-purple-200/80 text-lg">Gérez vos responsables en toute simplicité</p>
            </div>
            <Link
              to="/dashboard_user/StoreManagement/responsible"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 font-semibold border border-blue-400/30 hover:scale-105 transform"
            >
              <Plus className="w-5 h-5" />
              Nouveau Responsable
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl border border-purple-700/30 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-sm font-medium">Vue:</span>
              <div className="flex bg-white/10 rounded-lg p-1 border border-purple-400/30">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-purple-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-purple-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible List */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-xl border border-purple-700/30 p-8">
          {filteredResponsibles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun responsable trouvé</h3>
              <p className="text-purple-200/70">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredResponsibles.map((responsible) => (
                <div
                  key={responsible.id}
                  className={`group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-purple-400/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/40 ${
                    viewMode === "list" ? "p-6" : "p-6"
                  }`}
                >
                  <div className={viewMode === "list" ? "flex items-center gap-6" : "space-y-4"}>
                    {/* Responsible Header */}
                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                              {responsible.prenom} {responsible.nom}
                            </h3>
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                responsible.isActive
                                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                  : "bg-red-500/20 text-red-300 border border-red-500/30"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  responsible.isActive ? "bg-green-400" : "bg-red-400"
                                }`}
                              />
                              {responsible.isActive ? "Actif" : "Inactif"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Responsible Details */}
                      <div className={`space-y-3 ${viewMode === "list" ? "grid grid-cols-2 gap-4 space-y-0" : ""}`}>
                        <div className="flex items-center gap-3 text-purple-100/90">
                          <User className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <span className="text-sm">{responsible.prenom}</span>
                        </div>
                        <div className="flex items-center gap-3 text-purple-100/90">
                          <User className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <span className="text-sm">{responsible.nom}</span>
                        </div>
                        <div className="flex items-center gap-3 text-purple-100/90">
                          <Mail className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <span className="text-sm">{responsible.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-purple-100/90">
                          <Phone className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <span className="text-sm">{responsible.tel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex gap-2 ${viewMode === "list" ? "flex-col" : "flex-wrap"}`}>
                      <Link
                        to={`/dashboard_user/responsible/edit-responsible/${responsible.id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl backdrop-blur-sm border border-blue-400/30"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDeactivate(responsible.id)}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 ${
                          responsible.isActive
                            ? "bg-red-500/80 hover:bg-red-500 border-red-400/30"
                            : "bg-green-500/80 hover:bg-green-500 border-green-400/30"
                        } text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl backdrop-blur-sm border`}
                      >
                        <XCircle className="w-4 h-4" />
                        {responsible.isActive ? "Désactiver" : "Activer"}
                      </button>
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