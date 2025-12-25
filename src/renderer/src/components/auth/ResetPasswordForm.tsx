'use client';

import { useState, FormEvent } from 'react';
import { useSearchParams,Link } from 'react-router-dom';

import { resetPassword } from '../../api/auth';

const ResetPasswordForm = () => {
  const [searchParams, _] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      console.log('Sending reset password request:', { token, newPassword: formData.newPassword });
      await resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });
      setIsSuccessful(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
      console.error('Reset password error:', error.response?.data || error.message);
    }
  };

  if (isSuccessful) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Mot de passe réinitialisé !</h2>
        <p className="text-white/60 mb-4">
          Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
        </p>
        <Link
          to="/"
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Lien invalide</h2>
        <p className="text-white/60 mb-4">
          Le lien de réinitialisation est invalide ou manquant. Veuillez demander un nouveau lien.
        </p>
        <Link
          to="/"
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Réinitialiser le mot de passe</h1>
        <p className="mt-1 text-sm text-white/60">Entrez votre nouveau mot de passe</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/80">
              Nouveau mot de passe <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
              required
              placeholder="Entrez votre nouveau mot de passe"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/80">
              Confirmer le mot de passe <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
              required
              placeholder="Confirmez votre nouveau mot de passe"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-blue-500/20"
          >
            Réinitialiser
          </button>
        </form>

        <div className="p-6 border-t border-white/10 text-center">
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;