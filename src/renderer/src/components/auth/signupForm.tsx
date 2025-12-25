'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from './auth-context';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { CreateEntrepriseDto } from '../../types/auth';

interface SignUpFormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  denomination: string;
  matriculeFiscale: string;
  secteurActivite: string;
  region: string;
  ville: string;
  pays: string;
  codePin: string;
}

// Countries and regions (governorates) options
const paysOptions: string[] = [
  "Tunisie",
  "Algérie",
  "Maroc",
  "Libye",
  "France",
  "Espagne",
  "Italie",
  "Allemagne",
  "Canada",
  "Autre",
];

const regionsByPays: Record<string, string[]> = {
  Tunisie: [
    "Tunis",
    "Ariana",
    "Ben Arous",
    "Manouba",
    "Nabeul",
    "Zaghouan",
    "Bizerte",
    "Béja",
    "Jendouba",
    "Kef",
    "Siliana",
    "Sousse",
    "Monastir",
    "Mahdia",
    "Sfax",
    "Kairouan",
    "Kasserine",
    "Sidi Bouzid",
    "Gabès",
    "Medenine",
    "Tataouine",
    "Gafsa",
    "Tozeur",
    "Kébili",
  ],
};

const SignUpForm = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    denomination: '',
    matriculeFiscale: '',
    secteurActivite: '',
    region: '',
    ville: '',
    pays: '',
    codePin: '',
  });
  const [error, setError] = useState('');
  const { setUser, setEntreprise } = useAuth();
  const router = useNavigate();

  const regionOptions = regionsByPays[formData.pays] || [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.codePin.length !== 4 || !/^\d{4}$/.test(formData.codePin)) {
      setError('Le code PIN doit être composé de 4 chiffres');
      return;
    }

    const payload: CreateEntrepriseDto = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      denomination: formData.denomination || undefined,
      matriculeFiscale: formData.matriculeFiscale || undefined,
      secteurActivite: formData.secteurActivite,
      region: formData.region,
      ville: formData.ville,
      pays: formData.pays,
      codePin: formData.codePin,
    };

    try {
      const { user} = await register(payload);
      setUser(user);
      setEntreprise(user.entreprise);
      router('/dashboard_user');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de l\'inscription');
      console.error('Signup error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-white/80 mb-4">
            Entrez vos informations
          </label>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Téléphone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                required
                placeholder="+216 XX XXX XXX"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Nom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                required
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Prénom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                required
                placeholder="Votre prénom"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Code PIN (4 chiffres) <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="codePin"
                value={formData.codePin}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                required
                placeholder="Entrez votre code PIN"
                maxLength={4}
                pattern="\d{4}"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Dénomination
              </label>
              <input
                type="text"
                name="denomination"
                value={formData.denomination}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                placeholder="Nom de l'entreprise"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Matricule Fiscale
              </label>
              <input
                type="text"
                name="matriculeFiscale"
                value={formData.matriculeFiscale}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                placeholder="Matricule fiscale"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Secteur d'Activité <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="secteurActivite"
                value={formData.secteurActivite}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                required
                placeholder="Votre secteur d'activité"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Pays <span className="text-red-400">*</span>
              </label>
              <select
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                required
              >
                <option value="">Sélectionnez un pays</option>
                {paysOptions.map((p) => (
                  <option key={p} value={p} className="bg-black text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Région <span className="text-red-400">*</span>
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                required
              >
                <option value="">Sélectionnez une région</option>
                {regionOptions.map((region) => (
                  <option key={region} value={region} className="bg-black text-white">
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">
                Ville <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                required
                placeholder="Votre ville"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-blue-500/40"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;