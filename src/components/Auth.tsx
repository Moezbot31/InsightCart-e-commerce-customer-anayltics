import React, { useState } from 'react';
import { 
  LogIn, BarChart3, ShieldCheck, Briefcase, Mail, Lock, 
  ArrowRight, Chrome, Github, AlertCircle, CheckCircle2
} from 'lucide-react';
import { signInWithGoogle, loginWithEmail, registerWithEmail, resetPassword, signInAsGuest } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'analyst' | 'executive'>('analyst');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      localStorage.setItem('pending_role', selectedRole);
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation') {
        setError('Authentication provider not enabled. Please enable Email/Password and Google in the Firebase Console.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      localStorage.setItem('pending_role', selectedRole);
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation') {
        // Fallback to anonymous if Google is disabled
        try {
          await signInAsGuest();
        } catch (guestErr: any) {
          if (guestErr.code === 'auth/admin-restricted-operation') {
            setError('Google Sign-In and Guest access are restricted. Please enable them in the Firebase Console.');
          } else {
            setError('Google Sign-In is not enabled. Please enable it in the Firebase Console.');
          }
        }
      } else {
        setError(err.message || 'Google sign-in failed');
      }
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      localStorage.setItem('pending_role', selectedRole);
      await signInAsGuest();
    } catch (err: any) {
      if (err.code === 'auth/admin-restricted-operation') {
        setError('Guest login is restricted by the administrator. Please enable Anonymous Auth in the Firebase Console.');
      } else {
        setError(err.message || 'Guest login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    try {
      await resetPassword(email);
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl">
              <BarChart3 size={28} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isLogin ? 'Login to InsightCart' : 'Join InsightCart'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start optimizing your business growth today.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {resetSent && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-600 text-sm">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <p>Password reset email sent! Please check your inbox.</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('analyst')}
                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedRole === 'analyst' ? 'border-black bg-white shadow-sm' : 'border-transparent bg-gray-100 text-gray-400'
                }`}
              >
                <Briefcase size={16} />
                <span className="text-xs font-bold">Analyst</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('executive')}
                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedRole === 'executive' ? 'border-black bg-white shadow-sm' : 'border-transparent bg-gray-100 text-gray-400'
                }`}
              >
                <ShieldCheck size={16} />
                <span className="text-xs font-bold">Executive</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-black transition-colors text-sm"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Password</label>
              {isLogin && (
                <button 
                  type="button"
                  onClick={handleResetPassword}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-black transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-black/10"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isLogin ? 'Login' : 'Sign Up'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">OR</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all text-sm font-bold"
          >
            <Chrome size={18} className="text-gray-600" />
            Continue with Google
          </button>
          <button 
            className="w-full flex items-center justify-center gap-3 py-4 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all text-sm font-bold opacity-50 cursor-not-allowed"
            title="Microsoft login coming soon"
          >
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-[#F25022]"></div>
              <div className="bg-[#7FBA00]"></div>
              <div className="bg-[#00A4EF]"></div>
              <div className="bg-[#FFB900]"></div>
            </div>
            Continue with Microsoft
          </button>
          <button 
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-4 bg-gray-50 text-gray-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Continue as Guest
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-black hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
