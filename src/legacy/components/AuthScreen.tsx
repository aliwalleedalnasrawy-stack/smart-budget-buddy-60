import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import logo from '@/assets/app-logo-transparent.png';

type Mode = 'login' | 'signup';

export const AuthScreen = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setInfo(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split('@')[0] },
          },
        });
        if (error) throw error;
        setInfo('تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      const msg = e?.message ?? 'حدث خطأ';
      if (msg.toLowerCase().includes('invalid login')) setErr('البريد أو كلمة المرور غير صحيحة');
      else if (msg.toLowerCase().includes('already registered')) setErr('هذا البريد مسجّل مسبقاً');
      else setErr(msg);
    } finally { setLoading(false); }
  };

  const google = async () => {
    setErr(''); setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
      if (res.error) throw res.error;
    } catch (e: any) {
      setErr(e?.message ?? 'فشل تسجيل الدخول عبر Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: '#000000', fontFamily: "'Cairo', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.img
            src={logo}
            alt="ميزانيتي الذكية"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-24 h-24 md:w-28 md:h-28 object-contain mb-4"
            style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,127,0.35))' }}
          />
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: '#D4A017', textShadow: '0 0 20px rgba(212,160,23,0.4)' }}>
            ميزانيتي الذكية
          </h1>
          <p className="text-sm mt-1" style={{ color: '#00FF7F' }}>دليلك إلى الحرية المالية</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 md:p-8 border" style={{
          background: 'linear-gradient(180deg, rgba(20,20,30,0.8) 0%, rgba(10,10,18,0.8) 100%)',
          borderColor: 'rgba(212,160,23,0.2)',
          boxShadow: '0 20px 60px -20px rgba(0,255,127,0.15)',
        }}>
          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => { setMode('login'); setErr(''); setInfo(''); }}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: mode === 'login' ? 'linear-gradient(135deg, #D4A017, #00FF7F)' : 'transparent',
                color: mode === 'login' ? '#000' : '#9CA3AF',
              }}
            >تسجيل الدخول</button>
            <button
              onClick={() => { setMode('signup'); setErr(''); setInfo(''); }}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: mode === 'signup' ? 'linear-gradient(135deg, #D4A017, #00FF7F)' : 'transparent',
                color: mode === 'signup' ? '#000' : '#9CA3AF',
              }}
            >حساب جديد</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <Field icon={<UserIcon size={18} />} label="الاسم">
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الكامل" maxLength={60}
                  className="w-full bg-transparent outline-none text-white placeholder-gray-500"
                />
              </Field>
            )}
            <Field icon={<Mail size={18} />} label="البريد الإلكتروني">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="you@example.com" maxLength={120}
                className="w-full bg-transparent outline-none text-white placeholder-gray-500" dir="ltr"
              />
            </Field>
            <Field icon={<Lock size={18} />} label="كلمة المرور">
              <input
                type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                required minLength={6} placeholder="••••••••" maxLength={72}
                className="w-full bg-transparent outline-none text-white placeholder-gray-500" dir="ltr"
              />
              <button type="button" onClick={() => setShowPwd(s => !s)} className="text-gray-400 hover:text-white">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>

            {err && <p className="text-sm text-red-400 text-center">{err}</p>}
            {info && <p className="text-sm text-emerald-400 text-center">{info}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #D4A017 0%, #00FF7F 100%)',
                color: '#000',
                boxShadow: '0 10px 30px -10px rgba(0,255,127,0.5)',
              }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {mode === 'login' ? 'دخول' : 'إنشاء حساب'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-xs text-gray-500">أو</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Google */}
          <button
            onClick={google} disabled={loading}
            className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            style={{ background: '#fff', color: '#000' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            متابعة عبر Google
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          🔐 بياناتك مشفّرة ومحمية بالكامل
        </p>
      </motion.div>
    </div>
  );
};

const Field = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold mb-1.5" style={{ color: '#D4A017' }}>{label}</label>
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border" style={{
      background: 'rgba(255,255,255,0.03)',
      borderColor: 'rgba(255,255,255,0.08)',
    }}>
      <span style={{ color: '#00FF7F' }}>{icon}</span>
      {children}
    </div>
  </div>
);
