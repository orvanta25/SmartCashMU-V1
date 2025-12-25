// // orvanta-frontend\components\auth\loginForm.tsx
// 'use client';

// import { useState, FormEvent, useEffect } from 'react';
// import Link from 'next/link';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { login } from '../../app/api/auth';
// import { getUserProfile } from '../../app/api/user';
// import { useAuth } from './auth-context';
// import ForgotPasswordForm from './ForgotPasswordForm';

// const LoginForm = () => {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const { setUser, setEntreprise } = useAuth();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const email = searchParams.get('email') || '';
//     const password = searchParams.get('password') || '';
//     setFormData({ email: decodeURIComponent(email), password: decodeURIComponent(password) });
//   }, [searchParams]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     try {
//       await login({ email: formData.email, password: formData.password });
//       const profileResponse = await getUserProfile();
//       setUser(profileResponse);
//       setEntreprise(profileResponse.entreprise || null);
//       if (profileResponse.role === 'ADMIN') {
//         router.push('/dashboard_user');
//       } else {
//         router.push('/dashboard_user/profile');
//       }
//     } catch (error: any) {
//       setError(error.response?.data?.message || 'Erreur lors de la connexion');
//       console.error('Login error:', error.response?.data || error.message);
//     }
//   };

//   if (showForgotPassword) {
//     return (
//       <div className="max-w-md mx-auto">
//         <div className="mb-6 text-center">
//           <h1 className="text-2xl font-bold text-white">Réinitialisation</h1>
//           <p className="mt-1 text-sm text-white/60">Récupérez votre compte</p>
//         </div>
//         <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
//           <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto">
//       <div className="mb-6 text-center">
//         <h1 className="text-2xl font-bold text-white">Connexion</h1>
//         <p className="mt-1 text-sm text-white/60">Accédez à votre compte</p>
//       </div>
//       {error && (
//         <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg">
//           {error}
//         </div>
//       )}
//       <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-white/80">
//               Email <span className="text-red-400">*</span>
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
//               required
//               placeholder="Entrez votre email"
//             />
//           </div>
//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-white/80">
//               Mot de passe <span className="text-red-400">*</span>
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
//               required
//               placeholder="Entrez votre mot de passe"
//             />
//           </div>
//           <div className="flex items-center justify-end">
//             <button
//               type="button"
//               onClick={() => setShowForgotPassword(true)}
//               className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
//             >
//               Mot de passe oublié ?
//             </button>
//           </div>
//           <button
//             type="submit"
//             className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-blue-500/20"
//           >
//             Se connecter
//           </button>
//         </form>
//         <div className="p-6 border-t border-white/10 text-center">
//           <p className="text-white/60">
//             Pas encore de compte ?{' '}
//             <Link
//               href="/auth/signup"
//               className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
//             >
//               S'inscrire
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;

// orvanta-frontend\components\auth\loginForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';

import { useSearchParams, useNavigate,Link } from 'react-router-dom';
import { login } from '../../api/auth';
import { getUserProfile } from '../../api/user';
import { useAuth } from './auth-context';
import ForgotPasswordForm from './ForgotPasswordForm';
 

const LoginForm = () => {
  const [searchParams] = useSearchParams();
  const router = useNavigate();
  const { setUser, setEntreprise } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = searchParams.get('email') || '';
    const password = searchParams.get('password') || '';
    setFormData({ email: decodeURIComponent(email), password: decodeURIComponent(password) });
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login({ email: formData.email, password: formData.password });
      const profileResponse = await getUserProfile();
      setUser(profileResponse);
      setEntreprise(profileResponse.entreprise || null);
      if (profileResponse.role === 'ADMIN') {
        router('/dashboard_user');
      } else {
        router('/dashboard_user');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la connexion');
      console.error('Login error:', error.response?.data || error.message);
    }
  };

  const RightCard = (
    <div className="max-w-md w-full lg:ml-auto">
      <div className="mb-8 px-4 text-center lg:text-left">
  <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-[#D1C4E9] to-[#9575CD] bg-clip-text drop-shadow-md leading-tight">
    Accédez à votre compte et gardez le contrôle
  </h1>
  <p className="mt-2 text-base text-white/70">
    Votre entreprise, vos données, votre croissance, tout en un seul endroit.
  </p>
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
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
              required
              placeholder="Entrez votre email"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/80">
              Mot de passe <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
              required
              placeholder="Entrez votre mot de passe"
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-blue-500/20"
          >
            Se connecter
          </button>
        </form>
        <div className="p-6 border-t border-white/10 text-center">
          <p className="text-white/60">
            Pas encore de compte ?{' '}
            <Link
              to="/auth/signup"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  const ForgotCard = (
    <div className="max-w-md w-full lg:ml-auto">
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-white">Réinitialisation</h1>
        <p className="mt-1 text-sm text-white/60">Récupérez votre compte</p>
      </div>
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div className="text-white">  
  {/* Left-side advertisement slot in staircase layout */}
  <div className="mb-10">
    {/* Publicité (bannière pleine largeur) */}
    <div className="flex">
      <div className="w-full h-80 sm:h-96 rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center text-white/80 text-sm">
        Votre publicité ici
      </div>
    </div>
  </div>
</div>


        {showForgotPassword ? ForgotCard : RightCard}
      </div>
    </div>
  );
};

export default LoginForm;