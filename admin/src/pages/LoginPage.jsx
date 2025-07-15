import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Activity, Mail, Lock, AlertCircle } from 'lucide-react';
import Input   from '../components/ui/Input';
import Button  from '../components/ui/Button';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';   // auth export'unuz

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ---------- responsive check ---------- */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* Firebase hata kodlarını Türkçeye çevir */
  const authMsg = (code) => ({
    'auth/user-not-found' : 'Bu e-posta adresine ait kullanıcı bulunamadı.',
    'auth/wrong-password' : 'Şifre hatalı. Lütfen tekrar deneyin.',
    'auth/invalid-email'  : 'Geçerli bir e-posta adresi girin.',
    'auth/too-many-requests' : 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.',
    'auth/invalid-credential' : 'E-posta veya şifre hatalı. Lütfen kontrol edin.'
  }[code] || 'Giriş sırasında bir hata oluştu.');

  /* ------- form helpers ------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())       e.email = 'E-posta zorunlu';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-posta geçersiz';
    if (!form.password)           e.password = 'Şifre zorunlu';
    else if (form.password.length < 6) e.password = 'Şifre en az 6 karakter olmalı';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ------- submit ------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      const token = await cred.user.getIdTokenResult(true);

      /* Sadece admin giriş yapabilir */
      if (!token.claims.admin) {
        setErrors({ general: 'Bu panele erişim yetkiniz yok.' });
        await auth.signOut();
        return;
      }

      onLogin?.(cred.user);   // parent route yönlendirebilir
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: authMsg(err.code) });
    } finally {
      setLoading(false);
    }
  };

  /* ------- UI ------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0079a9] via-[#0079a9] to-[#58dd91] 
                    flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo & Başlık */}
        <div className="text-center mb-6 sm:mb-8">
          <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} 
                          bg-white rounded-full flex items-center justify-center 
                          mx-auto mb-3 sm:mb-4 shadow-lg transition-all duration-200`}>
            <Activity className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-[#0079a9]`} />
          </div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} 
                         font-bold text-white mb-2 transition-all duration-200`}>
            HealthAdmin
          </h1>
          <p className={`text-blue-100 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Sağlık Sınav Yönetim Sistemi
          </p>
        </div>

        {/* Login Kartı */}
        <div className={`bg-white rounded-2xl shadow-2xl 
                        ${isMobile ? 'p-6' : 'p-8'} 
                        transition-all duration-200
                        backdrop-blur-sm bg-white/95`}>
          <div className="mb-6">
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} 
                           font-bold text-gray-800 mb-2`}>
              Giriş Yap
            </h2>
            <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Yönetim paneline erişmek için giriş yapın
            </p>
          </div>

          {errors.general && (
            <div className={`mb-4 p-3 bg-red-50 border border-red-200 rounded-lg 
                           flex items-start space-x-2 ${isMobile ? 'text-sm' : ''}`}>
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 leading-relaxed">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* E-posta */}
            <div className="relative">
              <Input
                label="E-posta Adresi"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="kullanici@ornek.com"
                className="pr-10"
                autoComplete="email"
                required
              />
              <Mail className="absolute right-3 top-9 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Şifre */}
            <div className="relative">
              <Input
                label="Şifre"
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                className="pr-10"
                autoComplete="current-password"
                required
              />
          
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-9 p-1 text-gray-400 hover:text-gray-600 
                           transition-colors rounded-md hover:bg-gray-100 
                           focus:outline-none focus:ring-2 focus:ring-[#0079a9]/20"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className={`w-full ${isMobile ? 'py-3 text-base' : 'py-3 text-base'} 
                         font-semibold transition-all duration-200
                         disabled:cursor-not-allowed disabled:opacity-70`}
              size={isMobile ? "md" : "lg"}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent 
                                  rounded-full animate-spin" />
                  <span>Giriş yapılıyor…</span>
                </div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className={`text-blue-100 ${isMobile ? 'text-xs' : 'text-sm'} 
                        transition-all duration-200`}>
            © 2025 HealthAdmin. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}