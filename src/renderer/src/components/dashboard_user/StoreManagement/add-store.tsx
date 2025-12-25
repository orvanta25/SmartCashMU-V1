// "use client"
// import { useState } from "react"
// import type React from "react"

// import { Mail, Phone, User, Briefcase, MapPin, CheckCircle, Lock, Store, ArrowLeft, Plus } from "lucide-react"
// import Link from "next/link"

// export default function AddStore() {
//   const [form, setForm] = useState({
//     nom: "",
//     nomResponsable: "",
//     prenom: "",
//     email: "",
//     tel: "",
//     secteur: "",
//     region: "",
//     ville: "",
//     pays: "",
//     password: "",
//     confirmPassword: "",
//   })

//   const [submitted, setSubmitted] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(false)

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setForm((prev) => ({ ...prev, [name]: value }))
//     // Clear error when user starts typing
//     if (error) setError(null)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     // Validation
//     if (
//       !form.nom ||
//       !form.nomResponsable ||
//       !form.prenom ||
//       !form.email ||
//       !form.tel ||
//       !form.secteur ||
//       !form.region ||
//       !form.ville ||
//       !form.pays ||
//       !form.password ||
//       !form.confirmPassword
//     ) {
//       setError("Veuillez remplir tous les champs.")
//       setIsLoading(false)
//       return
//     }

//     if (form.password !== form.confirmPassword) {
//       setError("Les mots de passe ne correspondent pas.")
//       setIsLoading(false)
//       return
//     }

//     if (form.password.length < 6) {
//       setError("Le mot de passe doit contenir au moins 6 caractères.")
//       setIsLoading(false)
//       return
//     }

//     // Simulate API call
//     await new Promise((resolve) => setTimeout(resolve, 1500))

//     setError(null)
//     setIsLoading(false)
//     setSubmitted(true)
//   }

//   const resetForm = () => {
//     setForm({
//       nom: "",
//       nomResponsable: "",
//       prenom: "",
//       email: "",
//       tel: "",
//       secteur: "",
//       region: "",
//       ville: "",
//       pays: "",
//       password: "",
//       confirmPassword: "",
//     })
//     setSubmitted(false)
//     setError(null)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             href="/dashboard_user/store/list-store"
//             className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-4 group"
//           >
//             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
//             Retour à la liste
//           </Link>
//           <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-700/30 p-8">
//             <div className="flex items-center gap-4 mb-2">
//               <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
//                 <Store className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-4xl font-bold text-white tracking-tight">Nouveau Magasin</h1>
//                 <p className="text-purple-200/80 text-lg">Ajoutez un nouveau magasin à votre réseau</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-700/30 overflow-hidden">
//           {submitted ? (
//             /* Success State */
//             <div className="p-12 text-center">
//               <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
//                 <CheckCircle className="w-12 h-12 text-green-400" />
//               </div>
//               <h2 className="text-3xl font-bold text-white mb-4">Magasin créé avec succès !</h2>
//               <p className="text-purple-200/80 text-lg mb-8 max-w-md mx-auto">
//                 Le magasin "{form.nom}" a été ajouté à votre réseau et est maintenant opérationnel.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <button
//                   onClick={resetForm}
//                   className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 font-semibold transform hover:scale-105"
//                 >
//                   <Plus className="w-5 h-5" />
//                   Ajouter un autre magasin
//                 </button>
//                 <Link
//                   href="/dashboard_user/store/list-store"
//                   className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 font-semibold border border-white/20"
//                 >
//                   Voir tous les magasins
//                 </Link>
//               </div>
//             </div>
//           ) : (
//             /* Form */
//             <form onSubmit={handleSubmit} className="p-8">
//               {/* Error Message */}
//               {error && (
//                 <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 flex items-center gap-3">
//                   <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
//                     <span className="text-white text-xs font-bold">!</span>
//                   </div>
//                   {error}
//                 </div>
//               )}

//               {/* Form Sections */}
//               <div className="space-y-8">
//                 {/* Store Information */}
//                 <div>
//                   <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
//                     <Store className="w-5 h-5 text-purple-300" />
//                     Informations du Magasin
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="md:col-span-2">
//                       <label htmlFor="nom" className="block text-sm font-medium text-purple-200 mb-2">
//                         Nom du Magasin *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <Store className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="text"
//                           id="nom"
//                           name="nom"
//                           value={form.nom}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="Ex: Magasin Central Tunis"
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Manager Information */}
//                 <div>
//                   <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
//                     <User className="w-5 h-5 text-purple-300" />
//                     Responsable du Magasin
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label htmlFor="nomResponsable" className="block text-sm font-medium text-purple-200 mb-2">
//                         Nom du Responsable *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <User className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="text"
//                           id="nomResponsable"
//                           name="nomResponsable"
//                           value={form.nomResponsable}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="Nom de famille"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label htmlFor="prenom" className="block text-sm font-medium text-purple-200 mb-2">
//                         Prénom du Responsable *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <User className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="text"
//                           id="prenom"
//                           name="prenom"
//                           value={form.prenom}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="Prénom"
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Contact Information */}
//                 <div>
//                   <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
//                     <Mail className="w-5 h-5 text-purple-300" />
//                     Informations de Contact
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
//                         Adresse Email *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <Mail className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="email"
//                           id="email"
//                           name="email"
//                           value={form.email}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="exemple@email.com"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label htmlFor="tel" className="block text-sm font-medium text-purple-200 mb-2">
//                         Numéro de Téléphone *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <Phone className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="tel"
//                           id="tel"
//                           name="tel"
//                           value={form.tel}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="+216 XX XXX XXX"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div className="md:col-span-2">
//                       <label htmlFor="secteur" className="block text-sm font-medium text-purple-200 mb-2">
//                         Secteur d'Activité *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <Briefcase className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="text"
//                           id="secteur"
//                           name="secteur"
//                           value={form.secteur}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="Ex: Commerce de détail, Électronique..."
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Location Information */}
//                 <div>
//                   <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
//                     <MapPin className="w-5 h-5 text-purple-300" />
//                     Localisation
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div>
//                       <label htmlFor="pays" className="block text-sm font-medium text-purple-200 mb-2">
//                         Pays *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <MapPin className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="text"
//                           id="pays"
//                           name="pays"
//                           value={form.pays}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="Tunisie"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label htmlFor="region" className="block text-sm font-medium text-purple-200 mb-2">
//                         Région *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <MapPin className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="text"
//                           id="region"
//                           name="region"
//                           value={form.region}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="Tunis"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label htmlFor="ville" className="block text-sm font-medium text-purple-200 mb-2">
//                         Ville *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <MapPin className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="text"
//                           id="ville"
//                           name="ville"
//                           value={form.ville}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="Tunis"
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Security Information */}
//                 <div>
//                   <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
//                     <Lock className="w-5 h-5 text-purple-300" />
//                     Sécurité
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
//                         Mot de Passe *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <Lock className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="password"
//                           id="password"
//                           name="password"
//                           value={form.password}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="Minimum 6 caractères"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
//                         Confirmer le Mot de Passe *
//                       </label>
//                       <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                           <Lock className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
//                         </div>
//                         <input
//                           type="password"
//                           id="confirmPassword"
//                           name="confirmPassword"
//                           value={form.confirmPassword}
//                           onChange={handleChange}
//                           className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                           placeholder="Répétez le mot de passe"
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div className="mt-8 pt-6 border-t border-purple-400/20">
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 font-semibold text-lg tracking-wide border border-blue-400/30 hover:scale-[1.02] transform disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                       Création en cours...
//                     </>
//                   ) : (
//                     <>
//                       <Plus className="w-5 h-5" />
//                       Créer le magasin
//                     </>
//                   )}
//                 </button>
//                 <p className="text-purple-200/60 text-sm text-center mt-3">
//                   Tous les champs marqués d'un * sont obligatoires
//                 </p>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"
import { useState } from "react"
import type React from "react"

import { Briefcase, MapPin, Store, CheckCircle, User, ArrowLeft, Plus } from "lucide-react"
import {Link} from "react-router-dom"

export default function AddStore() {
  const [form, setForm] = useState({
    nom: "",
    nomResponsable: "",
    secteur: "",
    region: "",
    ville: "",
    pays: "",
    adresse: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (
      !form.nom ||
      !form.nomResponsable ||
      !form.secteur ||
      !form.region ||
      !form.ville ||
      !form.pays
    ) {
      setError("Veuillez remplir tous les champs obligatoires.")
      setIsLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setError(null)
    setIsLoading(false)
    setSubmitted(true)
  }

  const resetForm = () => {
    setForm({
      nom: "",
      nomResponsable: "",
      secteur: "",
      region: "",
      ville: "",
      pays: "",
      adresse: "",
    })
    setSubmitted(false)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/dashboard_user/StoreManagement/store/list"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la liste
          </Link>
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-700/30 p-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Nouveau Magasin</h1>
                <p className="text-purple-200/80 text-lg">Ajoutez un nouveau magasin à votre réseau</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-700/30 overflow-hidden">
          {submitted ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Magasin créé avec succès !</h2>
              <p className="text-purple-200/80 text-lg mb-8 max-w-md mx-auto">
                Le magasin "{form.nom}" a été ajouté à votre réseau et est maintenant opérationnel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 font-semibold transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un autre magasin
                </button>
                <Link
                  to="/dashboard_user/store/list-store"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 font-semibold border border-white/20"
                >
                  Voir tous les magasins
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Store className="w-5 h-5 text-purple-300" />
                    Informations du Magasin
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="nom" className="block text-sm font-medium text-purple-200 mb-2">
                        Nom du Magasin *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Store className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="nom"
                          name="nom"
                          value={form.nom}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Ex: Magasin Central Tunis"
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="secteur" className="block text-sm font-medium text-purple-200 mb-2">
                        Secteur d'Activité *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Briefcase className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="secteur"
                          name="secteur"
                          value={form.secteur}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Ex: Commerce de détail, Électronique..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-300" />
                    Responsable du Magasin
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nomResponsable" className="block text-sm font-medium text-purple-200 mb-2">
                        Nom du Responsable *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="nomResponsable"
                          name="nomResponsable"
                          value={form.nomResponsable}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Nom de famille"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-300" />
                    Localisation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="pays" className="block text-sm font-medium text-purple-200 mb-2">
                        Pays *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="pays"
                          name="pays"
                          value={form.pays}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Tunisie"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-purple-200 mb-2">
                        Région *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="region"
                          name="region"
                          value={form.region}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Tunis"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="ville" className="block text-sm font-medium text-purple-200 mb-2">
                        Ville *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="ville"
                          name="ville"
                          value={form.ville}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Tunis"
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <label htmlFor="adresse" className="block text-sm font-medium text-purple-200 mb-2">
                        Adresse
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="w-5 h-5 text-purple-300 group-focus-within:text-blue-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="adresse"
                          name="adresse"
                          value={form.adresse}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder="Adresse complète (optionnel)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-purple-400/20">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 font-semibold text-lg tracking-wide border border-blue-400/30 hover:scale-[1.02] transform disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Créer le magasin
                    </>
                  )}
                </button>
                <p className="text-purple-200/60 text-sm text-center mt-3">
                  Tous les champs marqués d'un * sont obligatoires
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
