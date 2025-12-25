// // 'use client';

// // import { useState } from 'react';
// // import { useAuth } from '../../../components/auth/auth-context';

// // export default function SettingsPage() {
// //   const { logout } = useAuth();
// //   const [settings, setSettings] = useState({
// //     notifications: {
// //       email: true,
// //       sms: false,
// //       orders: true,
// //       updates: false
// //     },
// //     preferences: {
// //       language: 'fr',
// //       theme: 'dark'
// //     }
// //   });

// //   const handleNotificationChange = (key: keyof typeof settings.notifications) => {
// //     setSettings(prev => ({
// //       ...prev,
// //       notifications: {
// //         ...prev.notifications,
// //         [key]: !prev.notifications[key]
// //       }
// //     }));
// //   };

// //   return (
// //     <div className="space-y-6">
// //       <h1 className="text-2xl font-bold text-white">Paramètres</h1>
      
// //       <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
// //         <div className="space-y-8">
// //           <div>
// //             <h3 className="text-lg font-medium text-white mb-4">Préférences</h3>
// //             <div className="space-y-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-white/80 mb-2">
// //                   Langue
// //                 </label>
// //                 <select 
// //                   className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
// //                   value={settings.preferences.language}
// //                   onChange={(e) => setSettings(prev => ({
// //                     ...prev,
// //                     preferences: { ...prev.preferences, language: e.target.value }
// //                   }))}
// //                 >
// //                   <option value="fr">Français</option>
// //                   <option value="en">English</option>
// //                   <option value="ar">العربية</option>
// //                 </select>
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-white/80 mb-2">
// //                   Thème
// //                 </label>
// //                 <select 
// //                   className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
// //                   value={settings.preferences.theme}
// //                   onChange={(e) => setSettings(prev => ({
// //                     ...prev,
// //                     preferences: { ...prev.preferences, theme: e.target.value }
// //                   }))}
// //                 >
// //                   <option value="dark">Sombre</option>
// //                   <option value="light">Clair</option>
// //                 </select>
// //               </div>
// //             </div>
// //           </div>
          
// //           <div>
// //             <h3 className="text-lg font-medium text-white mb-4">Notifications</h3>
// //             <div className="space-y-4">
// //               <label className="flex items-center space-x-3">
// //                 <input
// //                   type="checkbox"
// //                   checked={settings.notifications.email}
// //                   onChange={() => handleNotificationChange('email')}
// //                   className="w-4 h-4 text-indigo-600 border-white/20 rounded focus:ring-indigo-500"
// //                 />
// //                 <span className="text-white">Notifications par email</span>
// //               </label>

// //               <label className="flex items-center space-x-3">
// //                 <input
// //                   type="checkbox"
// //                   checked={settings.notifications.sms}
// //                   onChange={() => handleNotificationChange('sms')}
// //                   className="w-4 h-4 text-indigo-600 border-white/20 rounded focus:ring-indigo-500"
// //                 />
// //                 <span className="text-white">Notifications SMS</span>
// //               </label>

// //               <label className="flex items-center space-x-3">
// //                 <input
// //                   type="checkbox"
// //                   checked={settings.notifications.orders}
// //                   onChange={() => handleNotificationChange('orders')}
// //                   className="w-4 h-4 text-indigo-600 border-white/20 rounded focus:ring-indigo-500"
// //                 />
// //                 <span className="text-white">Mises à jour des commandes</span>
// //               </label>

// //               <label className="flex items-center space-x-3">
// //                 <input
// //                   type="checkbox"
// //                   checked={settings.notifications.updates}
// //                   onChange={() => handleNotificationChange('updates')}
// //                   className="w-4 h-4 text-indigo-600 border-white/20 rounded focus:ring-indigo-500"
// //                 />
// //                 <span className="text-white">Actualités et mises à jour</span>
// //               </label>
// //             </div>
// //           </div>

// //           <div className="pt-4 border-t border-white/10">
// //             <button
// //               onClick={logout}
// //               className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
// //             >
// //               Déconnexion
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client"

// import { useState } from "react"
// import { useAuth } from "../../../components/auth/auth-context"

// export default function SettingsPage() {
//   const { logout } = useAuth()
//   const [settings, setSettings] = useState({
//     notifications: {
//       email: true,
//       sms: false,
//       orders: true,
//       updates: false,
//     },
//     preferences: {
//       language: "fr",
//       theme: "dark",
//     },
//   })

//   const handleNotificationChange = (key: keyof typeof settings.notifications) => {
//     setSettings((prev) => ({
//       ...prev,
//       notifications: {
//         ...prev.notifications,
//         [key]: !prev.notifications[key],
//       },
//     }))
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#111827] via-[#1B1A42] to-[#111827] p-4">
//       <div className="max-w-4xl mx-auto py-8 space-y-6">
//         {/* Header */}
//         <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-r from-purple-500/80 to-purple-600/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-purple-400/20">
//               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//                 />
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-white">Paramètres</h1>
//               <p className="text-white/60">Gérer vos préférences et notifications</p>
//             </div>
//           </div>
//         </div>

//         {/* Main Settings */}
//         <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
//           <div className="p-8 space-y-8">
//             {/* Preferences Section */}
//             <div>
//               <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"
//                   />
//                 </svg>
//                 Préférences
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-white/80">Langue de l'interface</label>
//                   <div className="relative">
//                     <select
//                       className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
//                       value={settings.preferences.language}
//                       onChange={(e) =>
//                         setSettings((prev) => ({
//                           ...prev,
//                           preferences: { ...prev.preferences, language: e.target.value },
//                         }))
//                       }
//                     >
//                       <option value="fr" className="bg-slate-800">
//                         Français
//                       </option>
//                       <option value="en" className="bg-slate-800">
//                         English
//                       </option>
//                       <option value="ar" className="bg-slate-800">
//                         العربية
//                       </option>
//                     </select>
//                     <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                       <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-white/80">Thème d'affichage</label>
//                   <div className="relative">
//                     <select
//                       className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
//                       value={settings.preferences.theme}
//                       onChange={(e) =>
//                         setSettings((prev) => ({
//                           ...prev,
//                           preferences: { ...prev.preferences, theme: e.target.value },
//                         }))
//                       }
//                     >
//                       <option value="dark" className="bg-slate-800">
//                         Sombre
//                       </option>
//                       <option value="light" className="bg-slate-800">
//                         Clair
//                       </option>
//                     </select>
//                     <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                       <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Notifications Section */}
//             <div className="border-t border-white/10 pt-8">
//               <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 17h5l-5 5v-5zM4.868 19.718A8.966 8.966 0 003 12a9 9 0 0118 0 8.966 8.966 0 00-1.868 7.718M12 9v4"
//                   />
//                 </svg>
//                 Notifications
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <label className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
//                   <div className="relative">
//                     <input
//                       type="checkbox"
//                       checked={settings.notifications.email}
//                       onChange={() => handleNotificationChange("email")}
//                       className="sr-only"
//                     />
//                     <div
//                       className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
//                         settings.notifications.email
//                           ? "bg-purple-500 border-purple-500"
//                           : "border-white/30 group-hover:border-purple-400"
//                       }`}
//                     >
//                       {settings.notifications.email && (
//                         <svg
//                           className="w-3 h-3 text-white absolute top-0.5 left-0.5"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                       />
//                     </svg>
//                     <span className="text-white font-medium">Notifications par email</span>
//                   </div>
//                 </label>

//                 <label className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
//                   <div className="relative">
//                     <input
//                       type="checkbox"
//                       checked={settings.notifications.sms}
//                       onChange={() => handleNotificationChange("sms")}
//                       className="sr-only"
//                     />
//                     <div
//                       className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
//                         settings.notifications.sms
//                           ? "bg-purple-500 border-purple-500"
//                           : "border-white/30 group-hover:border-purple-400"
//                       }`}
//                     >
//                       {settings.notifications.sms && (
//                         <svg
//                           className="w-3 h-3 text-white absolute top-0.5 left-0.5"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
//                       />
//                     </svg>
//                     <span className="text-white font-medium">Notifications SMS</span>
//                   </div>
//                 </label>

//                 <label className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
//                   <div className="relative">
//                     <input
//                       type="checkbox"
//                       checked={settings.notifications.orders}
//                       onChange={() => handleNotificationChange("orders")}
//                       className="sr-only"
//                     />
//                     <div
//                       className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
//                         settings.notifications.orders
//                           ? "bg-purple-500 border-purple-500"
//                           : "border-white/30 group-hover:border-purple-400"
//                       }`}
//                     >
//                       {settings.notifications.orders && (
//                         <svg
//                           className="w-3 h-3 text-white absolute top-0.5 left-0.5"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8"
//                       />
//                     </svg>
//                     <span className="text-white font-medium">Mises à jour des commandes</span>
//                   </div>
//                 </label>

//                 <label className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
//                   <div className="relative">
//                     <input
//                       type="checkbox"
//                       checked={settings.notifications.updates}
//                       onChange={() => handleNotificationChange("updates")}
//                       className="sr-only"
//                     />
//                     <div
//                       className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
//                         settings.notifications.updates
//                           ? "bg-purple-500 border-purple-500"
//                           : "border-white/30 group-hover:border-purple-400"
//                       }`}
//                     >
//                       {settings.notifications.updates && (
//                         <svg
//                           className="w-3 h-3 text-white absolute top-0.5 left-0.5"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                     <span className="text-white font-medium">Actualités et mises à jour</span>
//                   </div>
//                 </label>
//               </div>
//             </div>

          
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { useAuth } from "../../../components/auth/auth-context"
import { useDeviceType } from "@renderer/hooks/useDeviceType"

export default function SettingsPage() {
  const { logout } = useAuth()
  const { isMobile, isTablet, isIPadMini, isIPadPro, isSUNMITablet } = useDeviceType()

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      orders: true,
      updates: false,
    },
    preferences: {
      language: "fr",
      theme: "dark",
    },
  })

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }))
  }

  return (
    <div className="min-h-screen rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-purple-600/10"></div>
          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Paramètres</h1>
                <p className="text-white/70">Personnalisez votre expérience et gérez vos préférences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Settings Container */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            {/* Preferences Section */}
            <div>
              <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Préférences Générales</h3>
              </div>

              <div
                className={`grid grid-cols-1 ${isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "md:grid-cols-2" : ""} gap-6 mt-6`}
              >
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/80">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      Langue de l'interface
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
                      value={settings.preferences.language}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, language: e.target.value },
                        }))
                      }
                    >
                      <option value="fr" className="bg-slate-800 text-white">
                        🇫🇷 Français
                      </option>
                      <option value="en" className="bg-slate-800 text-white">
                        🇺🇸 English
                      </option>
                      <option value="ar" className="bg-slate-800 text-white">
                        🇹🇳 العربية
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/80">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                      Thème d'affichage
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
                      value={settings.preferences.theme}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, theme: e.target.value },
                        }))
                      }
                    >
                      <option value="dark" className="bg-slate-800 text-white">
                        🌙 Mode Sombre
                      </option>
                      <option value="light" className="bg-slate-800 text-white">
                        ☀️ Mode Clair
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM4.868 19.718A8.966 8.966 0 003 12a9 9 0 0118 0 8.966 8.966 0 00-1.868 7.718M12 9v4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Notifications</h3>
              </div>

              <div className={`grid grid-cols-1 ${isMobile ? "" : "sm:grid-cols-2"} gap-4 mt-6`}>
                {/* Email Notifications */}
                <label className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                  <div className="relative flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={() => handleNotificationChange("email")}
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        settings.notifications.email
                          ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/25"
                          : "border-white/30 group-hover:border-purple-400"
                      }`}
                    >
                      {settings.notifications.email && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-white font-semibold">Notifications Email</span>
                    </div>
                    <p className="text-white/60 text-sm">Recevez les notifications importantes par email</p>
                  </div>
                </label>

                {/* SMS Notifications */}
                <label className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                  <div className="relative flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={() => handleNotificationChange("sms")}
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        settings.notifications.sms
                          ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/25"
                          : "border-white/30 group-hover:border-purple-400"
                      }`}
                    >
                      {settings.notifications.sms && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-white font-semibold">Notifications SMS</span>
                    </div>
                    <p className="text-white/60 text-sm">Recevez des alertes urgentes par SMS</p>
                  </div>
                </label>

                {/* Order Updates */}
                <label className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                  <div className="relative flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={settings.notifications.orders}
                      onChange={() => handleNotificationChange("orders")}
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        settings.notifications.orders
                          ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/25"
                          : "border-white/30 group-hover:border-purple-400"
                      }`}
                    >
                      {settings.notifications.orders && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8"
                          />
                        </svg>
                      </div>
                      <span className="text-white font-semibold">Mises à jour Commandes</span>
                    </div>
                    <p className="text-white/60 text-sm">Suivez l'état de vos commandes en temps réel</p>
                  </div>
                </label>

                {/* General Updates */}
                <label className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                  <div className="relative flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={settings.notifications.updates}
                      onChange={() => handleNotificationChange("updates")}
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        settings.notifications.updates
                          ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/25"
                          : "border-white/30 group-hover:border-purple-400"
                      }`}
                    >
                      {settings.notifications.updates && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-white font-semibold">Actualités & Mises à jour</span>
                    </div>
                    <p className="text-white/60 text-sm">Restez informé des nouvelles fonctionnalités</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Account Actions */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Sécurité du Compte</h3>
              </div>

              <div className="mt-6">
                <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">Déconnexion</h4>
                      <p className="text-white/70 mb-4">
                        Vous serez déconnecté de votre compte et redirigé vers la page de connexion.
                      </p>
                      <button
                        onClick={logout}
                        className="group px-6 py-3 bg-red-500/80 hover:bg-red-500/90 border border-red-500/30 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:shadow-red-500/20"
                      >
                        <svg
                          className="w-5 h-5 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Se Déconnecter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
