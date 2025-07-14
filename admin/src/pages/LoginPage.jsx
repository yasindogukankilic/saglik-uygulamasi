import React, { useState } from 'react';
import { Eye, EyeOff, Activity, Mail, Lock, AlertCircle } from 'lucide-react';
import Input   from '../components/ui/Input';
import Button  from '../components/ui/Button';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';   // auth export’unuz

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  /* Firebase hata kodlarını Türkçeye çevir */
  const authMsg = (code) => ({
    'auth/user-not-found' : 'Bu e-posta adresine ait kullanıcı bulunamadı.',
    'auth/wrong-password' : 'Şifre hatalı. Lütfen tekrar deneyin.',
    'auth/invalid-email'  : 'Geçerli bir e-posta adresi girin.',
    'auth/too-many-requests' : 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.'
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
      setErrors({ general: authMsg(err.code) });
    } finally {
      setLoading(false);
    }
  };

  /* ------- UI ------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0079a9] via-[#0079a9] to-[#58dd91] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Başlık */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Activity className="w-8 h-8 text-[#0079a9]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Edanur</h1>
          <p className="text-blue-100">Sağlık Sınav Yönetim Sistemi</p>
        </div>

        {/* Login Kartı */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Giriş Yap</h2>
            <p className="text-gray-600">Yönetim paneline erişmek için giriş yapın</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                required
              />
              <Mail className="absolute right-3 top-9 w-4 h-4 text-gray-400" />
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
                required
              />
              <Lock className="absolute right-10 top-9 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-9 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" disabled={loading}
                    className="w-full py-3 text-base font-semibold">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Giriş yapılıyor…</span>
                </div>
              ) : 'Giriş Yap'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-100 text-sm">© 2025 HealthAdmin. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}
