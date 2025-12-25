'use client';

import { useState, FormEvent } from 'react';
import { forgotPassword } from '../../api/auth';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Sending password reset request for:', email);
      await forgotPassword({ email });
      setIsSubmitted(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la demande de réinitialisation');
      console.error('Password reset error:', error.response?.data || error.message);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Email envoyé !</h2>
        <p className="text-white/60 mb-4">
          Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
        </p>
        <button
          onClick={onBack}
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
        >
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-2">Mot de passe oublié</h2>
      <p className="text-white/60 mb-4">
        Entrez votre email pour réinitialiser votre mot de passe
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-white/80">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
            required
            placeholder="Entrez votre email"
          />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors duration-200"
          >
            Retour
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;