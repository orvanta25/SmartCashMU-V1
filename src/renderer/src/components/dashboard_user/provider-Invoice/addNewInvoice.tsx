// // Updated frontend component: orvanta-frontend\components\dashboard_user\provider-Invoice\addNewInvoice.tsx
// 'use client'

// import { useState, FormEvent, ChangeEvent, useCallback, memo, useRef } from 'react';
// import Link from 'next/link';
// import { ArrowLeft, Briefcase, CheckCircle, Plus, X, Upload, Loader2, Mail, Phone, MapPin, Smartphone } from 'lucide-react';
// import { useDeviceType } from '../../../src/hooks/useDeviceType';
// import { useAuth } from '../../auth/auth-context';
// import { toast } from 'react-toastify';
// import { createMyFacture, prepareMyFactureFormData, CreateMyFactureDto } from 'app/api/my-facture';
// import { useRouter } from 'next/navigation';
// import { v4 as uuidv4 } from 'uuid'; // Add uuid for stable IDs

// type ContactItem = { id: string; value: string };

// type ContactFieldSectionProps = {
//   title: string;
//   fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles';
//   values: ContactItem[];
//   placeholder: string;
//   icon: any;
//   inputType?: string;
//   isTextarea?: boolean;
//   onAdd: (fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles') => void;
//   onRemove: (
//     fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles',
//     itemId: string
//   ) => void;
//   onUpdate: (
//     fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles',
//     itemId: string,
//     value: string
//   ) => void;
//   registerRef: (key: string, el: HTMLInputElement | HTMLTextAreaElement | null) => void;
// };

// const ContactFieldSection = memo(function ContactFieldSection({
//   title,
//   fieldName,
//   values,
//   placeholder,
//   icon: Icon,
//   inputType = 'text',
//   isTextarea = false,
//   onAdd,
//   onRemove,
//   onUpdate,
//   registerRef,
// }: ContactFieldSectionProps) {
//   return (
//     <div className="group">
//       <div className="flex items-center gap-2 mb-2">
//         <Icon className="w-4 h-4 text-purple-300" />
//         <label className="block font-semibold text-purple-200 group-focus-within:text-purple-300 transition-colors text-sm">
//           {title}
//         </label>
//         <button
//           type="button"
//           onClick={() => onAdd(fieldName)}
//           className="ml-auto p-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-md transition-colors"
//           title={`Ajouter ${title.toLowerCase()}`}
//         >
//           <Plus className="w-3 h-3 text-purple-300" />
//         </button>
//       </div>
//       <div className="space-y-2">
//         {values.map((item) => (
//           <div key={item.id} className="flex gap-2">
//             {isTextarea ? (
//               <textarea
//                 value={item.value}
//                 onChange={(e) => onUpdate(fieldName, item.id, e.target.value)}
//                 rows={2}
//                 className="flex-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 resize-none px-2.5 py-1.5 text-sm"
//                 placeholder={placeholder}
//                 autoComplete="off"
//                 ref={(el) => registerRef(item.id, el)}
//               />
//             ) : (
//               <input
//                 type={inputType}
//                 value={item.value}
//                 onChange={(e) => onUpdate(fieldName, item.id, e.target.value)}
//                 className="flex-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//                 placeholder={placeholder}
//                 autoComplete="off"
//                 ref={(el) => registerRef(item.id, el)}
//               />
//             )}
//             {values.length > 1 && (
//               <button
//                 type="button"
//                 onClick={() => onRemove(fieldName, item.id)}
//                 className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors"
//                 title="Supprimer"
//               >
//                 <X className="w-3 h-3 text-red-300" />
//               </button>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// });

// export default function AddNewInvoice() {
//   const {
//     isMobile,
//     isTablet,
//     isIPadMini,
//     isIPadPro,
//     isSUNMITablet,
//     isDesktop,
//   } = useDeviceType();
//   const { entreprise, user, loading: authLoading } = useAuth();
//   const router = useRouter();

//   const [submitted, setSubmitted] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
//   const lastEditedIdRef = useRef<string | null>(null);
//   const [form, setForm] = useState({
//     rib: '',
//     banque: '',
//     denomination: '',
//     matriculeFiscale: '',
//     adresses: [{ id: uuidv4(), value: '' }] as ContactItem[],
//     emails: [{ id: uuidv4(), value: '' }] as ContactItem[],
//     telephones: [{ id: uuidv4(), value: '' }] as ContactItem[],
//     mobiles: [{ id: uuidv4(), value: '' }] as ContactItem[],
//     logo: null as File | null,
//   });

//   // Redirect if unauthorized
//   if (!authLoading && (!user || !user.isActive)) {
//     router('/banned');
//     return null;
//   }
//   if (
//     !authLoading &&
//     user &&
//     user.role !== 'ADMIN' &&
//     !user.permissions.includes('Gestion des factures')
//   ) {
//     router('/unauthorized');
//     return null;
//   }

//   if (authLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen text-white">
//         Chargement...
//       </div>
//     );
//   }

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value, files } = e.target;
//     if (name === 'logo' && files && files[0]) {
//       setForm((prev) => ({ ...prev, logo: files[0] }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   // Generic handlers for contact arrays (memoized)
//   const addContactField = useCallback((fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles') => {
//     setForm((prev) => ({
//       ...prev,
//       [fieldName]: [...prev[fieldName], { id: uuidv4(), value: '' }],
//     }));
//   }, []);

//   const removeContactField = useCallback((fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles', itemId: string) => {
//     setForm((prev) => ({
//       ...prev,
//       [fieldName]: prev[fieldName].filter((item) => item.id !== itemId),
//     }));
//   }, []);

//   const updateContactField = useCallback((
//     fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles',
//     itemId: string,
//     value: string
//   ) => {
//     lastEditedIdRef.current = itemId;
//     setForm((prev) => ({
//       ...prev,
//       [fieldName]: prev[fieldName].map((item) =>
//         item.id === itemId ? { ...item, value } : item
//       ),
//     }));
//     // Restore focus on the same element after state update
//     setTimeout(() => {
//       const el = inputRefs.current[itemId];
//       if (el && document.activeElement !== el) {
//         const pos = value.length;
//         el.focus();
//         if ('selectionStart' in el && 'selectionEnd' in el && typeof pos === 'number') {
//           try {
//             (el as HTMLInputElement).setSelectionRange?.(pos, pos);
//           } catch {}
//         }
//       }
//     }, 0);
//   }, []);

//   const registerRef = useCallback((key: string, el: HTMLInputElement | HTMLTextAreaElement | null) => {
//     inputRefs.current[key] = el;
//   }, []);

//   // Validation functions
//   const isValidEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const isValidPhone = (phone: string): boolean => {
//     const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
//     return phoneRegex.test(phone);
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!entreprise?.id) {
//       setError('Utilisateur non authentifié.');
//       toast.error('Utilisateur non authentifié.');
//       return;
//     }

//     // Validate required fields
//     if (!form.denomination || !form.matriculeFiscale) {
//       setError('Dénomination et Matricule Fiscale sont requis.');
//       toast.error('Dénomination et Matricule Fiscale sont requis.');
//       return;
//     }

//     // Validate emails
//     const invalidEmails = form.emails.map(item => item.value).filter(email => email.trim() && !isValidEmail(email.trim()));
//     if (invalidEmails.length > 0) {
//       setError('Certaines adresses email ne sont pas valides.');
//       toast.error('Certaines adresses email ne sont pas valides.');
//       return;
//     }

//     // Validate phone numbers
//     const invalidPhones = [...form.telephones.map(item => item.value), ...form.mobiles.map(item => item.value)].filter(phone => phone.trim() && !isValidPhone(phone.trim()));
//     if (invalidPhones.length > 0) {
//       setError('Certains numéros de téléphone ne sont pas valides.');
//       toast.error('Certains numéros de téléphone ne sont pas valides.');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // Filter out empty values and prepare data
//       const dataToSend: CreateMyFactureDto = {
//         denomination: form.denomination,
//         matriculeFiscale: form.matriculeFiscale,
//         banque: form.banque,
//         rib: form.rib,
//         logo: form.logo || undefined,
//         adresses: form.adresses.map(item => item.value).filter(addr => addr.trim()).length > 0 ? form.adresses.map(item => item.value).filter(addr => addr.trim()) : undefined,
//         emails: form.emails.map(item => item.value).filter(email => email.trim()).length > 0 ? form.emails.map(item => item.value).filter(email => email.trim()) : undefined,
//         telephones: form.telephones.map(item => item.value).filter(tel => tel.trim()).length > 0 ? form.telephones.map(item => item.value).filter(tel => tel.trim()) : undefined,
//         mobiles: form.mobiles.map(item => item.value).filter(mobile => mobile.trim()).length > 0 ? form.mobiles.map(item => item.value).filter(mobile => mobile.trim()) : undefined,
//       };

//       const formDataToSend = prepareMyFactureFormData(dataToSend);

//       await createMyFacture(entreprise.id, formDataToSend);
//       toast.success('Facture créée avec succès !');
//       setSubmitted(true);
//     } catch (err: any) {
//       const errorMessage =
//         err.response?.data?.message || 'Erreur lors de la création de la facture.';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       rib: '',
//       banque: '',
//       denomination: '',
//       matriculeFiscale: '',
//       adresses: [{ id: uuidv4(), value: '' }],
//       emails: [{ id: uuidv4(), value: '' }],
//       telephones: [{ id: uuidv4(), value: '' }],
//       mobiles: [{ id: uuidv4(), value: '' }],
//       logo: null,
//     });
//     setSubmitted(false);
//     setError(null);
//   };

//   // (old inline ContactFieldSection removed; using memoized version at top)

//   return (
//     <div
//       className={`min-h-screen bg-orvanta ${
//         isMobile
//           ? 'py-2 px-2'
//           : isTablet || isIPadMini || isIPadPro || isSUNMITablet
//           ? 'py-3 px-3'
//           : 'py-4 px-4'
//       }`}
//     >
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className={`${isMobile ? 'mb-2' : 'mb-3'}`}>
//           <Link
//             href="/dashboard_user/provider-Invoice/invoice"
//             className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-2 group text-sm"
//           >
//             <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
//             Retour à la facture
//           </Link>
//           <div
//             className={`bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 ${
//               isMobile
//                 ? 'p-2.5'
//                 : isTablet || isIPadMini || isIPadPro || isSUNMITablet
//                 ? 'p-3'
//                 : 'p-4'
//             }`}
//           >
//             <div
//               className={`flex items-center gap-2 mb-1 ${
//                 isMobile ? 'flex-col text-center gap-1.5' : 'flex-row'
//               }`}
//             >
//               <div
//                 className={`bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md ${
//                   isMobile
//                     ? 'w-8 h-8'
//                     : isTablet || isIPadMini || isIPadPro || isSUNMITablet
//                     ? 'w-9 h-9'
//                     : 'w-10 h-10'
//                 }`}
//               >
//                 <Briefcase className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
//               </div>
//               <div>
//                 <h1
//                   className={`font-bold text-white tracking-tight ${
//                     isMobile ? 'text-lg' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-xl' : 'text-xl'
//                   }`}
//                 >
//                   Nouvelle Facture
//                 </h1>
//                 <p
//                   className={`text-purple-200/80 ${isMobile ? 'text-xs' : 'text-sm'}`}
//                 >
//                   Créez une nouvelle facture personnalisée
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 overflow-hidden">
//           {submitted ? (
//             /* Success State */
//             <div className={`text-center ${isMobile ? 'p-4' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'p-5' : 'p-6'}`}>
//               <div
//                 className={`mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}`}
//               >
//                 <CheckCircle className={`text-green-400 ${isMobile ? 'w-6 h-6' : 'w-7 h-7'}`} />
//               </div>
//               <h2 className={`font-bold text-white mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
//                 Facture créée avec succès !
//               </h2>
//               <p className={`text-purple-200/80 mb-4 max-w-md mx-auto text-sm`}>
//                 La facture "{form.denomination}" a été créée avec succès.
//               </p>
//               <div className={`flex gap-2 justify-center ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
//                 <button
//                   onClick={resetForm}
//                   className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg text-sm"
//                 >
//                   Créer une autre facture
//                 </button>
//                 <Link
//                   href="/dashboard_user/provider-Invoice"
//                   className="px-4 py-2 bg-white/10 backdrop-blur-xl text-white font-medium rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20 text-sm"
//                 >
//                   Voir toutes les factures
//                 </Link>
//               </div>
//             </div>
//           ) : (
//             /* Form State */
//             <form
//               onSubmit={handleSubmit}
//               className={`${isMobile ? 'p-3' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'p-4' : 'p-5'}`}
//             >
//               {error && (
//                 <div className="bg-red-500/20 text-red-300 p-2 rounded-lg text-sm mb-4">
//                   {error}
//                 </div>
//               )}
              
//               <div className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
//                 {/* Basic Information Section */}
//                 <div className="bg-white/5 p-3 rounded-lg border border-purple-500/20">
//                   <h3 className="text-purple-200 font-semibold mb-3 text-sm">Informations de base</h3>
//                   <div
//                     className={`grid gap-3 ${isMobile ? 'grid-cols-1' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2'}`}
//                   >
//                     {/* Dénomination */}
//                     <div className="group">
//                       <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
//                         Dénomination *
//                       </label>
//                       <input
//                         type="text"
//                         name="denomination"
//                         value={form.denomination}
//                         onChange={handleChange}
//                         required
//                         className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//                         placeholder="Nom de l'entreprise"
//                       />
//                     </div>

//                     {/* Matricule Fiscale */}
//                     <div className="group">
//                       <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
//                         Matricule Fiscale *
//                       </label>
//                       <input
//                         type="text"
//                         name="matriculeFiscale"
//                         value={form.matriculeFiscale}
//                         onChange={handleChange}
//                         required
//                         className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//                         placeholder="Numéro de matricule fiscale"
//                       />
//                     </div>

//                     {/* RIB */}
//                     <div className="group">
//                       <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
//                         RIB
//                       </label>
//                       <input
//                         type="text"
//                         name="rib"
//                         value={form.rib}
//                         onChange={handleChange}
//                         className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//                         placeholder="Numéro RIB"
//                       />
//                     </div>

//                     {/* Banque */}
//                     <div className="group">
//                       <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
//                         Banque
//                       </label>
//                       <input
//                         type="text"
//                         name="banque"
//                         value={form.banque}
//                         onChange={handleChange}
//                         className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
//                         placeholder="Nom de la banque"
//                       />
//                     </div>
//                   </div>

//                   {/* Logo Upload */}
//                   <div className="group mt-3">
//                     <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
//                       Logo (optionnel)
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="file"
//                         name="logo"
//                         onChange={handleChange}
//                         accept="image/*"
//                         className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-500/20 file:text-purple-200 hover:file:bg-purple-500/30 transition-all duration-200 px-2.5 py-1.5 text-sm"
//                       />
//                       <Upload className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300 pointer-events-none" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Contact Information Section */}
//                 <div className="bg-white/5 p-3 rounded-lg border border-purple-500/20">
//                   <h3 className="text-purple-200 font-semibold mb-3 text-sm">Informations de contact</h3>
//                   <div
//                     className={`grid gap-4 ${isMobile ? 'grid-cols-1' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2'}`}
//                   >
//                     {/* Addresses */}
//                     <ContactFieldSection
//                       title="Adresses"
//                       fieldName="adresses"
//                       values={form.adresses}
//                       placeholder="Adresse complète"
//                       icon={MapPin}
//                       isTextarea={true}
//                       onAdd={addContactField}
//                       onRemove={removeContactField}
//                       onUpdate={updateContactField}
//                       registerRef={registerRef}
//                     />

//                     {/* Emails */}
//                     <ContactFieldSection
//                       title="Emails"
//                       fieldName="emails"
//                       values={form.emails}
//                       placeholder="email@exemple.com"
//                       icon={Mail}
//                       inputType="email"
//                       onAdd={addContactField}
//                       onRemove={removeContactField}
//                       onUpdate={updateContactField}
//                       registerRef={registerRef}
//                     />

//                     {/* Telephones */}
//                     <ContactFieldSection
//                       title="Téléphones"
//                       fieldName="telephones"
//                       values={form.telephones}
//                       placeholder="+216 12 345 678"
//                       icon={Phone}
//                       inputType="tel"
//                       onAdd={addContactField}
//                       onRemove={removeContactField}
//                       onUpdate={updateContactField}
//                       registerRef={registerRef}
//                     />

//                     {/* Mobiles */}
//                     <ContactFieldSection
//                       title="Mobiles"
//                       fieldName="mobiles"
//                       values={form.mobiles}
//                       placeholder="+216 98 765 432"
//                       icon={Smartphone}
//                       inputType="tel"
//                       onAdd={addContactField}
//                       onRemove={removeContactField}
//                       onUpdate={updateContactField}
//                       registerRef={registerRef}
//                     />
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-end pt-2">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm flex items-center gap-2"
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="w-4 h-4 animate-spin" />
//                         Création...
//                       </>
//                     ) : (
//                       'Créer la facture'
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';
import { useState, FormEvent, ChangeEvent, useCallback, memo, useRef } from 'react';

import { ArrowLeft, Briefcase, CheckCircle, Plus, X, Upload, Loader2, Mail, Phone, MapPin, Smartphone } from 'lucide-react';
import { useDeviceType } from '@renderer/hooks/useDeviceType';
import { useAuth } from '../../auth/auth-context';
import { toast } from 'react-toastify';
import { createMyFacture,CreateMyFactureDto } from '@renderer/api/my-facture';
import { useNavigate,Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // Add uuid for stable IDs

type ContactItem = { id: string; value: string };

type ContactFieldSectionProps = {
  title: string;
  fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles';
  values: ContactItem[];
  placeholder: string;
  icon: any;
  inputType?: string;
  isTextarea?: boolean;
  onAdd: (fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles') => void;
  onRemove: (
    fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles',
    itemId: string
  ) => void;
  onUpdate: (
    fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles',
    itemId: string,
    value: string
  ) => void;
  registerRef: (key: string, el: HTMLInputElement | HTMLTextAreaElement | null) => void;
};

const ContactFieldSection = memo(function ContactFieldSection({
  title,
  fieldName,
  values,
  placeholder,
  icon: Icon,
  inputType = 'text',
  isTextarea = false,
  onAdd,
  onRemove,
  onUpdate,
  registerRef,
}: ContactFieldSectionProps) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-purple-300" />
        <label className="block font-semibold text-purple-200 group-focus-within:text-purple-300 transition-colors text-sm">
          {title}
        </label>
        <button
          type="button"
          onClick={() => onAdd(fieldName)}
          className="ml-auto p-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-md transition-colors"
          title={`Ajouter ${title.toLowerCase()}`}
        >
          <Plus className="w-3 h-3 text-purple-300" />
        </button>
      </div>
      <div className="space-y-2">
        {values.map((item) => (
          <div key={item.id} className="flex gap-2">
            {isTextarea ? (
              <textarea
                value={item.value}
                onChange={(e) => onUpdate(fieldName, item.id, e.target.value)}
                rows={2}
                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 resize-none px-2.5 py-1.5 text-sm"
                placeholder={placeholder}
                autoComplete="off"
                ref={(el) => registerRef(item.id, el)}
              />
            ) : (
              <input
                type={inputType}
                value={item.value}
                onChange={(e) => onUpdate(fieldName, item.id, e.target.value)}
                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
                placeholder={placeholder}
                autoComplete="off"
                ref={(el) => registerRef(item.id, el)}
              />
            )}
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(fieldName, item.id)}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors"
                title="Supprimer"
              >
                <X className="w-3 h-3 text-red-300" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default function AddNewInvoice() {
  const {
    isMobile,
    isTablet,
    isIPadMini,
    isIPadPro,
    isSUNMITablet
  } = useDeviceType();
  const { entreprise, user, loading: authLoading } = useAuth();
  const router = useNavigate();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const lastEditedIdRef = useRef<string | null>(null);
  const [form, setForm] = useState({
    rib: '',
    banque: '',
    denomination: '',
    matriculeFiscale: '',
    adresses: [{ id: uuidv4(), value: '' }] as ContactItem[],
    emails: [{ id: uuidv4(), value: '' }] as ContactItem[],
    telephones: [{ id: uuidv4(), value: '' }] as ContactItem[],
    mobiles: [{ id: uuidv4(), value: '' }] as ContactItem[],
    logo: null as File | null,
  });

  // Redirect if unauthorized
  if (!authLoading && (!user || !user.isActive)) {
    router('/banned');
    return null;
  }
  if (
    !authLoading &&
    user &&
    user.role !== 'ADMIN' &&
    !user.permissions.includes('Gestion des factures')
  ) {
    router('/unauthorized');
    return null;
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Chargement...
      </div>
    );
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'logo' && files && files[0]) {
      setForm((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Generic handlers for contact arrays (memoized)
  const addContactField = useCallback((fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles') => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: [...prev[fieldName], { id: uuidv4(), value: '' }],
    }));
  }, []);

  const removeContactField = useCallback((fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles', itemId: string) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((item) => item.id !== itemId),
    }));
  }, []);

  const updateContactField = useCallback((
    fieldName: 'adresses' | 'emails' | 'telephones' | 'mobiles',
    itemId: string,
    value: string
  ) => {
    lastEditedIdRef.current = itemId;
    setForm((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item) =>
        item.id === itemId ? { ...item, value } : item
      ),
    }));
    // Restore focus on the same element after state update
    setTimeout(() => {
      const el = inputRefs.current[itemId];
      if (el && document.activeElement !== el) {
        const pos = value.length;
        el.focus();
        if ('selectionStart' in el && 'selectionEnd' in el && typeof pos === 'number') {
          try {
            (el as HTMLInputElement).setSelectionRange?.(pos, pos);
          } catch {}
        }
      }
    }, 0);
  }, []);

  const registerRef = useCallback((key: string, el: HTMLInputElement | HTMLTextAreaElement | null) => {
    inputRefs.current[key] = el;
  }, []);

  // Validation functions
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!entreprise?.id) {
      setError('Utilisateur non authentifié.');
      toast.error('Utilisateur non authentifié.');
      return;
    }

    // Validate required fields
    if (!form.denomination || !form.matriculeFiscale) {
      setError('Dénomination et Matricule Fiscale sont requis.');
      toast.error('Dénomination et Matricule Fiscale sont requis.');
      return;
    }

    // Validate emails
    const invalidEmails = form.emails.map(item => item.value).filter(email => email.trim() && !isValidEmail(email.trim()));
    if (invalidEmails.length > 0) {
      setError('Certaines adresses email ne sont pas valides.');
      toast.error('Certaines adresses email ne sont pas valides.');
      return;
    }

    // Validate phone numbers
    const invalidPhones = [...form.telephones.map(item => item.value), ...form.mobiles.map(item => item.value)].filter(phone => phone.trim() && !isValidPhone(phone.trim()));
    if (invalidPhones.length > 0) {
      setError('Certains numéros de téléphone ne sont pas valides.');
      toast.error('Certains numéros de téléphone ne sont pas valides.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filter out empty values and prepare data
      const dataToSend: CreateMyFactureDto = {
        denomination: form.denomination,
        matriculeFiscale: form.matriculeFiscale,
        banque: form.banque,
        rib: form.rib,
        logo: form.logo || null,
        adresses: form.adresses.map(item => item.value).filter(addr => addr.trim()).length > 0 ? form.adresses.map(item => item.value).filter(addr => addr.trim()) : [],
        emails: form.emails.map(item => item.value).filter(email => email.trim()).length > 0 ? form.emails.map(item => item.value).filter(email => email.trim()) : [],
        telephones: form.telephones.map(item => item.value).filter(tel => tel.trim()).length > 0 ? form.telephones.map(item => item.value).filter(tel => tel.trim()) : [],
        mobiles: form.mobiles.map(item => item.value).filter(mobile => mobile.trim()).length > 0 ? form.mobiles.map(item => item.value).filter(mobile => mobile.trim()) : [],
      };


      await createMyFacture(entreprise.id, dataToSend);
      toast.success('Facture créée avec succès !');
      setSubmitted(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Erreur lors de la création de la facture.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      rib: '',
      banque: '',
      denomination: '',
      matriculeFiscale: '',
      adresses: [{ id: uuidv4(), value: '' }],
      emails: [{ id: uuidv4(), value: '' }],
      telephones: [{ id: uuidv4(), value: '' }],
      mobiles: [{ id: uuidv4(), value: '' }],
      logo: null,
    });
    setSubmitted(false);
    setError(null);
  };

  return (
    <div
      className={`min-h-screen bg-orvanta ${
        isMobile
          ? 'py-2 px-2'
          : isTablet || isIPadMini || isIPadPro || isSUNMITablet
          ? 'py-3 px-3'
          : 'py-4 px-4'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`${isMobile ? 'mb-2' : 'mb-3'}`}>
          <Link
            to="/dashboard_user/provider-Invoice/invoice"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-2 group text-sm"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Retour à la facture
          </Link>
          <div
            className={`bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 ${
              isMobile
                ? 'p-2.5'
                : isTablet || isIPadMini || isIPadPro || isSUNMITablet
                ? 'p-3'
                : 'p-4'
            }`}
          >
            <div
              className={`flex items-center gap-2 mb-1 ${
                isMobile ? 'flex-col text-center gap-1.5' : 'flex-row'
              }`}
            >
              <div
                className={`bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md ${
                  isMobile
                    ? 'w-8 h-8'
                    : isTablet || isIPadMini || isIPadPro || isSUNMITablet
                    ? 'w-9 h-9'
                    : 'w-10 h-10'
                }`}
              >
                <Briefcase className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </div>
              <div>
                <h1
                  className={`font-bold text-white tracking-tight ${
                    isMobile ? 'text-lg' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-xl' : 'text-xl'
                  }`}
                >
                  Nouvelle Facture
                </h1>
                <p
                  className={`text-purple-200/80 ${isMobile ? 'text-xs' : 'text-sm'}`}
                >
                  Créez une nouvelle facture personnalisée
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 overflow-hidden">
          {submitted ? (
            /* Success State */
            <div className={`text-center ${isMobile ? 'p-4' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'p-5' : 'p-6'}`}>
              <div
                className={`mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}`}
              >
                <CheckCircle className={`text-green-400 ${isMobile ? 'w-6 h-6' : 'w-7 h-7'}`} />
              </div>
              <h2 className={`font-bold text-white mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                Facture créée avec succès !
              </h2>
              <p className={`text-purple-200/80 mb-4 max-w-md mx-auto text-sm`}>
                La facture "{form.denomination}" a été créée avec succès.
              </p>
              <div className={`flex gap-2 justify-center ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg text-sm"
                >
                  Créer une autre facture
                </button>
                <Link
                  to="/dashboard_user/provider-Invoice"
                  className="px-4 py-2 bg-white/10 backdrop-blur-xl text-white font-medium rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20 text-sm"
                >
                  Voir toutes les factures
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <form
              onSubmit={handleSubmit}
              className={`${isMobile ? 'p-3' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'p-4' : 'p-5'}`}
            >
              {error && (
                <div className="bg-red-500/20 text-red-300 p-2 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              
              <div className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
                {/* Basic Information Section */}
                <div className="bg-white/5 p-3 rounded-lg border border-gray-300">
                  <h3 className="text-purple-200 font-semibold mb-3 text-sm">Informations de base</h3>
                  <div
                    className={`grid gap-3 ${isMobile ? 'grid-cols-1' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2'}`}
                  >
                    {/* Dénomination */}
                    <div className="group">
                      <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
                        Dénomination *
                      </label>
                      <input
                        type="text"
                        name="denomination"
                        value={form.denomination}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
                        placeholder="Nom de l'entreprise"
                      />
                    </div>

                    {/* Matricule Fiscale */}
                    <div className="group">
                      <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
                        Matricule Fiscale *
                      </label>
                      <input
                        type="text"
                        name="matriculeFiscale"
                        value={form.matriculeFiscale}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
                        placeholder="Numéro de matricule fiscale"
                      />
                    </div>

                    {/* RIB */}
                    <div className="group">
                      <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
                        RIB
                      </label>
                      <input
                        type="text"
                        name="rib"
                        value={form.rib}
                        onChange={handleChange}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
                        placeholder="Numéro RIB"
                      />
                    </div>

                    {/* Banque */}
                    <div className="group">
                      <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
                        Banque
                      </label>
                      <input
                        type="text"
                        name="banque"
                        value={form.banque}
                        onChange={handleChange}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 px-2.5 py-1.5 text-sm"
                        placeholder="Nom de la banque"
                      />
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="group mt-3">
                    <label className="block font-semibold text-purple-200 mb-1.5 group-focus-within:text-purple-300 transition-colors text-sm">
                      Logo (optionnel)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="logo"
                        onChange={handleChange}
                        accept="image/*"
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-500/20 file:text-purple-200 hover:file:bg-purple-500/30 transition-all duration-200 px-2.5 py-1.5 text-sm"
                      />
                      <Upload className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-white/5 p-3 rounded-lg border border-gray-300">
                  <h3 className="text-purple-200 font-semibold mb-3 text-sm">Informations de contact</h3>
                  <div
                    className={`grid gap-4 ${isMobile ? 'grid-cols-1' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2'}`}
                  >
                    {/* Addresses */}
                    <ContactFieldSection
                      title="Adresses"
                      fieldName="adresses"
                      values={form.adresses}
                      placeholder="Adresse complète"
                      icon={MapPin}
                      isTextarea={true}
                      onAdd={addContactField}
                      onRemove={removeContactField}
                      onUpdate={updateContactField}
                      registerRef={registerRef}
                    />

                    {/* Emails */}
                    <ContactFieldSection
                      title="Emails"
                      fieldName="emails"
                      values={form.emails}
                      placeholder="email@exemple.com"
                      icon={Mail}
                      inputType="email"
                      onAdd={addContactField}
                      onRemove={removeContactField}
                      onUpdate={updateContactField}
                      registerRef={registerRef}
                    />

                    {/* Telephones */}
                    <ContactFieldSection
                      title="Téléphones"
                      fieldName="telephones"
                      values={form.telephones}
                      placeholder="+216 12 345 678"
                      icon={Phone}
                      inputType="tel"
                      onAdd={addContactField}
                      onRemove={removeContactField}
                      onUpdate={updateContactField}
                      registerRef={registerRef}
                    />

                    {/* Mobiles */}
                    <ContactFieldSection
                      title="Mobiles"
                      fieldName="mobiles"
                      values={form.mobiles}
                      placeholder="+216 98 765 432"
                      icon={Smartphone}
                      inputType="tel"
                      onAdd={addContactField}
                      onRemove={removeContactField}
                      onUpdate={updateContactField}
                      registerRef={registerRef}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer la facture'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}