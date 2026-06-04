
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, User, Loader2, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (signUpError) throw signUpError;
        alert('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-10 text-center text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2">مغلسة نظافة وعود</h1>
          <p className="text-indigo-100 font-medium">نظام إدارة المغاسل المتطور</p>
        </div>

        <div className="p-10">
          <div className="flex gap-4 mb-8 p-1.5 bg-slate-50 rounded-2xl border">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                !isSignUp ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'
              }`}
            >
              تسجيل دخول
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                isSignUp ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all text-left"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="كلمة المرور"
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all text-left"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {isSignUp ? <UserPlus size={24} /> : <LogIn size={24} />}
                  {isSignUp ? 'إنشاء الحساب' : 'دخول النظام'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
