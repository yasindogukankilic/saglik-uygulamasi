import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, ArrowRight } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

export default function QuizEntryScreen() {
  const { sessionId } = useParams();
  const nav = useNavigate();

  /* -------- seans bilgisi -------- */
  const [session, setSession] = useState(null);
  const [loadingSess, setLoad] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'sessions', sessionId));
      if (!snap.exists()) {
        alert('Geçersiz davet 😞');
        nav('/');
        return;
      }
      setSession(snap.data());
      setLoad(false);
    };
    fetch();
  }, [sessionId, nav]);

  /* -------- form state -------- */
  const [form, setForm] = useState({ first: '', last: '', email: '' });
  const [err, setErr] = useState({});

  const update = (k, v) => {
    setForm({ ...form, [k]: v });
    setErr({ ...err, [k]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.first.trim()) e.first = 'Ad zorunlu';
    if (!form.last.trim()) e.last = 'Soyad zorunlu';
    if (!form.email.trim()) e.email = 'E-posta zorunlu';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-posta geçersiz';
    setErr(e);
    return !Object.keys(e).length;
  };

  const handleStart = async () => {
    if (!validate()) return;
    await setDoc(
      doc(db, `sessions/${sessionId}/students`, form.email),
      {
        firstName: form.first,
        lastName: form.last,
        email: form.email,
        joinedAt: serverTimestamp()
      },
      { merge: true }
    );
    nav(`/quiz/${sessionId}`, { state: form });
  };

  /* -------- render -------- */
  if (loadingSess) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0079a9] to-[#005c82] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Başlık Container */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
            {session.sessionName}
          </h1>
          <p className="text-white/80 text-base sm:text-lg">
            Katılmak için bilgilerinizi girin
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="space-y-5 sm:space-y-6">
            <InputField
              label="Ad"
              Icon={User}
              value={form.first}
              onChange={(v) => update('first', v)}
              error={err.first}
              placeholder="Adınızı girin"
            />
            <InputField
              label="Soyad"
              Icon={User}
              value={form.last}
              onChange={(v) => update('last', v)}
              error={err.last}
              placeholder="Soyadınızı girin"
            />
            <InputField
              label="E-posta"
              type="email"
              Icon={Mail}
              value={form.email}
              onChange={(v) => update('email', v)}
              error={err.email}
              placeholder="ornek@email.com"
            />

            <div className="pt-2">
              <PrimaryButton onClick={handleStart}>
                Quiz'e Başla
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* Alt bilgi */}
        <div className="text-center mt-6 text-white/60 text-sm">
          Bilgileriniz güvenli bir şekilde saklanmaktadır
        </div>
      </div>
    </div>
  );
}