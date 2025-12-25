"use client";

import { ArrowLeft, UserPlus, UserCog, Shield, Key, Phone, Mail, Briefcase, CheckCircle, User, Lock, Check, AlertCircle } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom"
import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { useAuth } from "../../../../components/auth/auth-context";
import { CreateEmployeeDto, UpdateEmployeeDto, UserRole, getEmployeeById, createEmployee, updateEmployee } from "@renderer/api/user-management";

const ROLES = [
  { value: "caissier", label: "Caissier", icon: "💰", description: "Gestion des transactions et encaissements", backendValue: UserRole.CAISSIER },
  { value: "magasinier", label: "Magasinier", icon: "📦", description: "Gestion des stocks et inventaires", backendValue: UserRole.MAGASINIER },
  { value: "chef_de_rayon", label: "Chef de rayon", icon: "👨‍💼", description: "Supervision d'un secteur spécifique", backendValue: UserRole.CHEF_RAYON },
  { value: "serveur", label: "Serveur", icon: "🍽️", description: "Service client et commandes", backendValue: UserRole.SERVEUR },
  { value: "comptable", label: "Comptable", icon: "📊", description: "Gestion financière et comptabilité", backendValue: UserRole.COMPTABLE },
  { value: "gerant", label: "Gérant", icon: "🏢", description: "Direction et gestion générale", backendValue: UserRole.GERANT },
];

const PERMISSIONS = [
  {
    value: "categories",
    label: "Gestion des catégories",
    icon: "🏷️",
    description: "Créer, modifier et supprimer les catégories de produits",
    category: "Produits",
  },
  {
    value: "produits",
    label: "Gestion des produits",
    icon: "📱",
    description: "Ajouter, modifier et gérer les produits",
    category: "Produits",
  },
  {
    value: "inventaire",
    label: "Gestion de l'inventaire",
    icon: "📋",
    description: "Suivi des stocks et inventaires",
    category: "Stock",
  },
  {
    value: "acc",
    label: "Gestion des acc",
    icon: "🔐",
    description: "Ajouter, modifier et supprimer les acc",
    category: "Acc",
  },
  {
    value: "charges",
    label: "Gestion des charges",
    icon: "💸",
    description: "Gérer les dépenses et charges",
    category: "Finance",
  },
  {
    value: "achats_fournisseurs",
    label: "Gestion des achats fournisseurs",
    icon: "🛒",
    description: "Commandes et relations fournisseurs",
    category: "Achats",
  },
  {
    value: "ventes",
    label: "Gestion des ventes",
    icon: "💳",
    description: "Suivi des ventes et transactions",
    category: "Ventes",
  },
  {
    value: "tickets_resto",
    label: "Gestion des tickets resto",
    icon: "🎫",
    description: "Traitement des tickets resto",
    category: "Ventes",
  },
  {
    value: "balance",
    label: "Gestion de la balance",
    icon: "⚖️",
    description: "Contrôle des pesées et mesures",
    category: "Outils",
  },
];

const permissionValueToLabelMap = PERMISSIONS.reduce((acc, perm) => {
  acc[perm.value] = perm.label;
  return acc;
}, {} as Record<string, string>);

const labelToPermissionValueMap = PERMISSIONS.reduce((acc, perm) => {
  acc[perm.label] = perm.value;
  return acc;
}, {} as Record<string, string>);

type EditUserFormState = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  permissions: string[];
  fondCaisse?: string;
};

export default function EditUserForm() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const editId =  params?.id as string || searchParams.get("id");
  const { isMobile, isTablet } = useDeviceType();
  const { user, loading } = useAuth();

  const [form, setForm] = useState<EditUserFormState>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    role: UserRole.CAISSIER,
    permissions: [],
    fondCaisse: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingUser, setLoadingUser] = useState(!!editId);

  const isEditMode = !!editId;

  useEffect(() => {
    if (editId) {
      setLoadingUser(true);
      getEmployeeById(editId)
        .then((data: any) => {
          setForm({
            nom: data.nom || "",
            prenom: data.prenom || "",
            email: data.email || "",
            telephone: data.telephone || "",
            role: data.role || UserRole.CAISSIER,
            permissions: (data.permissions || []).map((label: string) => labelToPermissionValueMap[label] || label),
            password: "",
            confirmPassword: "",
            fondCaisse: data.fondcaisse ? data.fondcaisse.toString() : "",
          });
          setLoadingUser(false);
        })
        .catch(() => {
          setError("Erreur lors du chargement de l'utilisateur.");
          setLoadingUser(false);
        });
    }
  }, [editId]);

  if (loading || loadingUser) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e17] to-[#050811]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#00ffea]/30 border-t-[#00ffea] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#00ffea] font-orbitron tracking-wider">CHARGEMENT...</p>
      </div>
    </div>
  );
  
  if (!user || user.role !== 'ADMIN') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e17] to-[#050811]">
      <div className="text-center p-8 bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20">
        <div className="w-12 h-12 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-[#ff416c]" />
        </div>
        <h2 className="text-xl font-orbitron tracking-wider text-white mb-2">ACCÈS REFUSÉ</h2>
        <p className="text-[#00ffea]/70">Vous n'avez pas les autorisations nécessaires</p>
      </div>
    </div>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === "permissions" && type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        permissions: checked ? [...(prev.permissions ?? []), value] : (prev.permissions ?? []).filter((p) => p !== value),
      }));
    } else if (name === "role") {
      const selectedRole = ROLES.find((role) => role.value === value);
      setForm((prev) => ({
        ...prev,
        role: selectedRole?.backendValue || UserRole.CAISSIER,
        fondCaisse: selectedRole?.backendValue === UserRole.CAISSIER || selectedRole?.backendValue === UserRole.SERVEUR ? prev.fondCaisse : "",
      }));
    } else if (name === "fondCaisse") {
      const val = value.replace(/[^0-9.,]/g, "").replace(",", ".");
      setForm((prev) => ({ ...prev, fondCaisse: val }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password && form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if ((form.permissions ?? []).length === 0) {
      setError("Veuillez sélectionner au moins une permission.");
      return;
    }

    if (form.fondCaisse && isNaN(parseFloat(form.fondCaisse))) {
      setError("Le fond de caisse doit être un nombre valide.");
      return;
    }

    setSubmitting(true);
    try {
      const permissionsWithLabels = (form.permissions ?? []).map((value) => permissionValueToLabelMap[value]);
      const fondCaisseValue = form.fondCaisse ? parseFloat(form.fondCaisse) : undefined;
      if (isEditMode) {
        const payload: UpdateEmployeeDto = {
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone,
          role: form.role,
          permissions: permissionsWithLabels,
          ...(form.password && { password: form.password, confirmPassword: form.confirmPassword }),
          fondcaisse: fondCaisseValue,
        };
        await updateEmployee(editId!, payload);
        setSuccess("Utilisateur modifié avec succès !");
      } else {
        const payload: CreateEmployeeDto = {
          nom: form.nom || "",
          prenom: form.prenom || "",
          email: form.email || "",
          telephone: form.telephone || "",
          codePin: form.password || "",
          role: form.role || UserRole.CAISSIER,
          permissions: permissionsWithLabels,
          fondcaisse: fondCaisseValue,
        };
        await createEmployee(payload);
        setSuccess("Utilisateur ajouté avec succès !");
        setForm({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          password: "",
          confirmPassword: "",
          role: UserRole.CAISSIER,
          permissions: [],
          fondCaisse: "",
        });
      }
      setTimeout(() => router("/dashboard_user/configuration/user-management/list"), 1500);
    } catch (err: any) {
      const errorMessage = err.message || (isEditMode ? "Erreur lors de la modification de l'utilisateur." : "Erreur lors de l'ajout de l'utilisateur.");
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRole = ROLES.find((role) => role.backendValue === form.role);
  const permissionsByCategory = PERMISSIONS.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, typeof PERMISSIONS>,
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#050811] ${isMobile ? 'p-2' : isTablet ? 'p-3' : 'p-4'}`}>
      <div className={`mx-auto ${isMobile ? 'max-w-full' : isTablet ? 'max-w-3xl' : 'max-w-4xl'} py-3 ${isMobile ? 'px-2' : isTablet ? 'px-3' : 'px-4'}`}>
        {/* Header */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 mb-4 ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ffea]/10 via-transparent to-[#0099ff]/10"></div>
          <div className="relative">
            <div className={`flex items-center gap-3 mb-3 ${isMobile ? 'flex-col items-start' : 'flex-row'}`}>
              <div className={`${isMobile ? 'w-10 h-10' : isTablet ? 'w-12 h-12' : 'w-14 h-14'} bg-gradient-to-br from-[#00ffea] to-[#0099ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#00ffea]/30`}>
                {isEditMode ? <UserCog className={`${isMobile ? 'w-5 h-5' : isTablet ? 'w-6 h-6' : 'w-7 h-7'} text-white`} /> : <UserPlus className={`${isMobile ? 'w-5 h-5' : isTablet ? 'w-6 h-6' : 'w-7 h-7'} text-white`} />}
              </div>
              <div className={isMobile ? 'text-center w-full' : 'flex-1'}>
                <h1 className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} font-bold font-orbitron tracking-wider text-white mb-1`}>
                  {isEditMode ? "MODIFIER UTILISATEUR" : "AJOUTER UTILISATEUR"}
                </h1>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[#00ffea]/70`}>
                  {isEditMode ? "Modifiez les informations et permissions de l'utilisateur" : "Créez un nouveau compte utilisateur avec des permissions personnalisées"}
                </p>
              </div>
              <div className={`${isMobile ? 'w-full mt-3' : ''}`}>
                <button
                  onClick={() => router("/dashboard_user/configuration/user-management/list")}
                  className={`group px-4 py-2 bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 hover:from-[#00ffea]/20 hover:to-[#0099ff]/20 border border-[#00ffea]/30 hover:border-[#00ffea] text-white font-orbitron tracking-wider transition-all duration-300 flex items-center justify-center gap-2 rounded-lg ${isMobile ? 'w-full' : ''}`}
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  RETOUR LISTE
                </button>
              </div>
            </div>

            {/* Progress Steps */}
            <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row gap-3'} items-center`}>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${currentStep >= 1 ? "bg-gradient-to-r from-[#00ffea]/20 to-[#0099ff]/20 text-[#00ffea] border border-[#00ffea]/30" : "bg-[#0a0e17]/50 text-[#00ffea]/50 border border-[#00ffea]/20"} ${isMobile ? 'w-full' : ''}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 1 ? "bg-[#00ffea] text-[#0a0e17]" : "bg-[#0a0e17] border border-[#00ffea] text-[#00ffea]"}`}>1</div>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-orbitron tracking-wider`}>INFORMATIONS</span>
              </div>
              <div className={`h-0.5 ${isMobile ? 'w-full' : 'w-6'} ${currentStep >= 2 ? "bg-gradient-to-r from-[#00ffea] to-[#0099ff]" : "bg-[#00ffea]/20"} transition-all duration-300`}></div>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${currentStep >= 2 ? "bg-gradient-to-r from-[#00ffea]/20 to-[#0099ff]/20 text-[#00ffea] border border-[#00ffea]/30" : "bg-[#0a0e17]/50 text-[#00ffea]/50 border border-[#00ffea]/20"} ${isMobile ? 'w-full' : ''}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 2 ? "bg-[#00ffea] text-[#0a0e17]" : "bg-[#0a0e17] border border-[#00ffea] text-[#00ffea]"}`}>2</div>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-orbitron tracking-wider`}>RÔLE & PERMISSIONS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className={`bg-gradient-to-br from-[#ff416c]/10 to-transparent backdrop-blur-xl border border-[#ff416c]/30 rounded-lg p-3 mb-3 ${isMobile ? 'text-sm' : ''}`}>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#ff416c]/20 to-[#ff6b9d]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-3 h-3 text-[#ff416c]" />
              </div>
              <div>
                <h4 className="text-[#ff416c] font-orbitron tracking-wider text-sm mb-1">ERREUR DE VALIDATION</h4>
                <p className="text-[#ff416c]/80 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className={`bg-gradient-to-br from-[#00ff88]/10 to-transparent backdrop-blur-xl border border-[#00ff88]/30 rounded-lg p-3 mb-3 ${isMobile ? 'text-sm' : ''}`}>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#00ff88]/20 to-[#00ccaa]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 text-[#00ff88]" />
              </div>
              <div>
                <h4 className="text-[#00ff88] font-orbitron tracking-wider text-sm mb-1">SUCCÈS</h4>
                <p className="text-[#00ff88]/80 text-xs">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information Section */}
          <div className="bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 overflow-hidden">
            <div className={`bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 ${isMobile ? 'p-3' : isTablet ? 'p-3' : 'p-4'} border-b border-[#00ffea]/20`}>
              <h2 className={`flex items-center gap-2 ${isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'} font-bold font-orbitron tracking-wider text-white`}>
                <div className="w-5 h-5 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded-lg flex items-center justify-center">
                  <User className="w-3 h-3 text-[#00ffea]" />
                </div>
                INFORMATIONS PERSONNELLES
              </h2>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[#00ffea]/70 mt-1`}>Renseignez les informations de base de l'utilisateur</p>
            </div>

            <div className={`${isMobile ? 'p-3' : isTablet ? 'p-3' : 'p-4'}`}>
              <div className={`grid grid-cols-1 ${isTablet ? 'md:grid-cols-2' : 'lg:grid-cols-2'} gap-3`}>
                {[
                  { name: "nom", label: "Nom de famille", placeholder: "Entrez le nom de famille", icon: User },
                  { name: "prenom", label: "Prénom", placeholder: "Entrez le prénom", icon: User },
                  { name: "email", label: "Email", placeholder: "email@exemple.com", type: "email", icon: Mail },
                  { name: "telephone", label: "Numéro de Téléphone", placeholder: "+216 XX XXX XXX", type: "tel", icon: Phone },
                  { name: "password", label: `Mot de Passe ${isEditMode ? "(facultatif)" : ""}`, placeholder: isEditMode ? "Nouveau mot de passe (facultatif)" : "Mot de passe sécurisé", type: "password", icon: Lock, required: !isEditMode },
                  { name: "confirmPassword", label: `Confirmation du Mot de Passe ${isEditMode ? "(facultatif)" : ""}`, placeholder: isEditMode ? "Confirmez le nouveau mot de passe" : "Confirmez le mot de passe", type: "password", icon: Key, required: !isEditMode },
                ].map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                      <div className="flex items-center gap-2 mb-1">
                        <field.icon className="w-3 h-3 text-[#00ffea]" />
                        {field.label}
                      </div>
                    </label>
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      onFocus={field.name === "nom" || field.name === "prenom" ? () => setCurrentStep(1) : undefined}
                      className={`w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300 ${isMobile ? 'text-sm' : ''}`}
                      placeholder={field.placeholder}
                      required={field.required !== false}
                    />
                  </div>
                ))}
                {(form.role === UserRole.CAISSIER || form.role === UserRole.SERVEUR) && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-3 h-3 text-[#00ffea]" />
                        Fond de caisse (optionnel)
                      </div>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      name="fondCaisse"
                      value={form.fondCaisse || ""}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/30 text-white placeholder-[#00ffea]/50 focus:outline-none focus:border-[#00ffea] focus:ring-1 focus:ring-[#00ffea]/30 transition-all duration-300 ${isMobile ? 'text-sm' : ''}`}
                      placeholder="Montant initial du fond de caisse (optionnel)"
                      min="0"
                      step="0.01"
                      autoComplete="off"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Role and Permissions Section */}
          <div className="bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 overflow-hidden">
            <div className={`bg-gradient-to-r from-[#00ffea]/10 to-[#0099ff]/10 ${isMobile ? 'p-3' : isTablet ? 'p-3' : 'p-4'} border-b border-[#00ffea]/20`}>
              <h2 className={`flex items-center gap-2 ${isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'} font-bold font-orbitron tracking-wider text-white`}>
                <div className="w-5 h-5 bg-gradient-to-br from-[#00ffea]/20 to-[#0099ff]/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-3 h-3 text-[#00ffea]" />
                </div>
                RÔLE ET RESPONSABILITÉS
              </h2>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[#00ffea]/70 mt-1`}>Définissez le rôle et les permissions de l'utilisateur</p>
            </div>

            <div className={`${isMobile ? 'p-3' : isTablet ? 'p-3' : 'p-4'} space-y-4`}>
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-orbitron tracking-wider text-[#00ffea]/70 mb-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-[#00ffea]" />
                    SÉLECTIONNER UN RÔLE
                  </div>
                </label>

                <div className={`grid grid-cols-1 ${isTablet ? 'md:grid-cols-2' : 'lg:grid-cols-3 xl:grid-cols-3'} gap-2`}>
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`group cursor-pointer p-3 rounded-lg border-2 transition-all duration-300 ${form.role === role.backendValue ? "border-[#00ffea] bg-gradient-to-br from-[#00ffea]/10 to-[#0099ff]/10 shadow-lg shadow-[#00ffea]/20" : "border-[#00ffea]/30 bg-[#0a0e17]/50 hover:border-[#00ffea] hover:bg-gradient-to-br hover:from-[#00ffea]/5 hover:to-[#0099ff]/5"}`}
                      onClick={() => setCurrentStep(2)}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={form.role === role.backendValue}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-2">
                        <div className={`${isMobile ? 'text-lg' : 'text-xl'} mt-1`}>{role.icon}</div>
                        <div className="flex-1">
                          <h3 className={`font-semibold font-orbitron tracking-wider text-white ${isMobile ? 'text-sm' : 'text-base'}`}>{role.label}</h3>
                          <p className={`text-[#00ffea]/70 ${isMobile ? 'text-xs' : 'text-sm'}`}>{role.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${form.role === role.backendValue ? "border-[#00ffea] bg-[#00ffea]" : "border-[#00ffea]/50 group-hover:border-[#00ffea]"}`}>
                          {form.role === role.backendValue && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {selectedRole && (
                  <div className={`mt-2 p-3 bg-gradient-to-br from-[#00ffea]/10 to-[#0099ff]/10 rounded-lg border border-[#00ffea]/30 ${isMobile ? 'text-sm' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className={`${isMobile ? 'text-lg' : 'text-xl'}`}>{selectedRole.icon}</div>
                      <div>
                        <h4 className="text-[#00ffea] font-orbitron tracking-wider text-sm">RÔLE SÉLECTIONNÉ: {selectedRole.label}</h4>
                        <p className={`text-[#00ffea]/70 ${isMobile ? 'text-xs' : 'text-sm'}`}>{selectedRole.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Permissions Section */}
              <div className="space-y-3 border-t border-[#00ffea]/20 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3 h-3 text-[#00ffea]" />
                  <h3 className={`${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'} font-semibold font-orbitron tracking-wider text-white`}>PERMISSIONS DÉTAILLÉES</h3>
                </div>

                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="space-y-1.5">
                    <h4 className={`text-[#00ffea] font-orbitron tracking-wider flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                      <div className="w-1.5 h-1.5 bg-[#00ffea] rounded-full animate-pulse"></div>
                      {category}
                    </h4>
                    <div className={`grid grid-cols-1 ${isTablet ? 'md:grid-cols-2' : 'lg:grid-cols-2'} gap-1.5 ml-2`}>
                      {perms.map((perm) => (
                        <label
                          key={perm.value}
                          className={`group flex items-start gap-2 p-2.5 rounded-lg bg-[#0a0e17]/50 border border-[#00ffea]/20 hover:bg-gradient-to-br hover:from-[#00ffea]/5 hover:to-[#0099ff]/5 hover:border-[#00ffea]/40 transition-all duration-300 cursor-pointer`}
                        >
                          <div className="relative flex-shrink-0 mt-0.5">
                            <input
                              type="checkbox"
                              name="permissions"
                              value={perm.value}
                              checked={(form.permissions ?? []).includes(perm.value)}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${(form.permissions ?? []).includes(perm.value) ? "bg-[#00ffea] border-[#00ffea]" : "border-[#00ffea]/50 group-hover:border-[#00ffea]"}`}>
                              {(form.permissions ?? []).includes(perm.value) && (
                                <Check className="w-3 h-3 text-[#0a0e17]" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>{perm.icon}</span>
                              <span className={`text-white font-orbitron tracking-wider ${isMobile ? 'text-xs' : 'text-sm'}`}>{perm.label}</span>
                            </div>
                            <p className={`text-[#00ffea]/70 ${isMobile ? 'text-xs' : 'text-sm'}`}>{perm.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className={`bg-gradient-to-br from-[#0a0e17]/80 to-[#050811]/80 backdrop-blur-xl rounded-xl border border-[#00ffea]/20 shadow-2xl shadow-[#00ffea]/5 ${isMobile ? 'p-3' : isTablet ? 'p-3' : 'p-4'}`}>
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-3'} justify-between items-center`}>
              <div className={`${isMobile ? 'text-center w-full' : 'text-left'}`}>
                <h3 className={`text-white font-orbitron tracking-wider ${isMobile ? 'text-sm' : 'text-base'} mb-1`}>
                  {isEditMode ? "PRÊT À MODIFIER L'UTILISATEUR ?" : "PRÊT À CRÉER L'UTILISATEUR ?"}
                </h3>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[#00ffea]/70`}>Vérifiez les informations avant de confirmer</p>
              </div>
              <div className={`flex gap-2 ${isMobile ? 'w-full justify-center' : ''}`}>
                <button
                  type="button"
                  onClick={() => router("/dashboard_user/configuration/user-management/list")}
                  className={`px-4 py-2 bg-gradient-to-r from-[#ff416c]/10 to-[#ff6b9d]/10 hover:from-[#ff416c]/20 hover:to-[#ff6b9d]/20 border border-[#ff416c]/30 hover:border-[#ff416c] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${isMobile ? 'text-sm flex-1' : ''}`}
                >
                  <AlertCircle className="w-3 h-3 text-[#ff416c]" />
                  ANNULER
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`group px-5 py-2 bg-gradient-to-r from-[#00ffea] to-[#0099ff] hover:from-[#00ffea] hover:to-[#0099ff] text-white font-orbitron tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#00ffea]/25 hover:shadow-xl hover:shadow-[#00ffea]/40 disabled:opacity-50 disabled:cursor-not-allowed ${isMobile ? 'text-sm flex-1' : ''}`}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-xs">{isEditMode ? "MODIFICATION..." : "CRÉATION..."}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isEditMode ? <UserCog className="w-3 h-3 transition-transform group-hover:scale-110" /> : <UserPlus className="w-3 h-3 transition-transform group-hover:scale-110" />}
                      <span className="text-xs">{isEditMode ? "MODIFIER" : "CRÉER"}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}