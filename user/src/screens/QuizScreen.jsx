import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, CheckCircle } from 'lucide-react';

import { fetchQuestions, saveResult } from '../services/quizApi';
import { useTimer }          from '../hooks/useTimer';
import { useQuiz }           from '../hooks/useQuiz';
import { useMediaControls }  from '../hooks/useMediaControls';

import QuestionCard     from '../components/QuestionCard';
import MediaControlBar  from '../components/MediaControlBar';
import QuizButton       from '../components/QuizButton';
import PrimaryButton    from '../components/PrimaryButton';

/* ———————————————————————————————————————————————— */

export default function QuizScreen() {
  const { sessionId }          = useParams();
  const nav                    = useNavigate();
  const { state }              = useLocation();          // form + contentId
  const { first, last, email, contentId } = state || {};

  /* ---------- Guard -------------------------------------------- */
  useEffect(() => {
    if (!first || !last || !email || !contentId) {
      alert('Oturum bilgileri eksik. Lütfen tekrar giriş yapın.');
      nav(`/quiz-entry/${sessionId}`);
    }
  }, [first, last, email, contentId, sessionId, nav]);

  /* ---------- Sorular ------------------------------------------ */
  const [questions, setQuestions] = useState(null);      // null = yükleniyor
  useEffect(() => {
    if (!contentId) return;
    fetchQuestions(contentId)
      .then(setQuestions)
      .catch(err => {
        console.error(err);
        alert('Quiz verileri yüklenirken hata oluştu.');
        nav('/');
      });
  }, [contentId, nav]);

  /* ---------- Quiz & Timer ------------------------------------- */
  const timer = useTimer();
  const quiz  = useQuiz(questions || []);

  /* ---------- Sonuç Kaydetme ----------------------------------- */
  useEffect(() => {
    if (quiz.finished && email && contentId)
      saveResult(contentId, { email, first, last }, quiz.result)
        .catch(console.error);
  }, [quiz.finished, quiz.result, email, first, last, contentId]);

  /* ---------- Medya Kontrol ------------------------------------ */
  const mediaRef = useRef(null);
  const media    = useMediaControls(mediaRef);

  /* ---------- YÜKLENİYOR --------------------------------------- */
  if (questions === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0079a9] to-[#005c82] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4" />
          <p className="text-lg font-medium">Quiz yükleniyor…</p>
        </div>
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Bu quize ait soru bulunamadı.</p>
      </div>
    );
  }

  /* ---------- Yardımcılar -------------------------------------- */
  const ABCD = ['A', 'B', 'C', 'D'];

  // indis (0-3) → seçenek metnini güvenli getir
  const getOptText = (q, idx) => {
    if (q.options != null) {
      if (Array.isArray(q.options))       return q.options[idx];
      if (q.options[idx] != null)         return q.options[idx];
    }
    // ayrı alanlar: optA / optionA / A
    const key = ['opt', 'option', ''].map(p => p + ABCD[idx])
                 .find(k => q[k] != null);
    return key ? q[key] : undefined;
  };

  /* ─────────────────────────── QUIZ BİTTİ ────────────────────── */
  if (quiz.finished) {
    const { correct, wrong } = quiz.result;
    const pct = Math.round((correct / questions.length) * 100);

    const stats = [
      { label: 'Doğru',  value: correct, color: 'green' },
      { label: 'Yanlış', value: wrong,   color: 'red'   },
      { label: 'Başarı', value: `%${pct}`, color: 'blue' }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Başlık */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Quiz Tamamlandı!</h1>
            <p className="text-lg text-gray-600">
              Merhaba {first}, sonuçlarınız aşağıda:
            </p>
          </div>

          {/* Özet */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center">
                  <div className={`text-3xl font-bold text-${s.color}-600 mb-2`}>{s.value}</div>
                  <div className="text-gray-600">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Soru Bazlı Detay */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Soru Bazında Analiz</h2>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              {questions.map((q, i) => {
                const ans     = quiz.result.answers?.[i];
                const ok      = ans === q.correctAnswer;

                const yourTxt = ans != null ? getOptText(q, ans)           : undefined;
                const corrTxt =           getOptText(q, q.correctAnswer);

                return (
                  <div key={q.id} className={`
                    p-4 rounded-lg border-2
                    ${ok ? 'border-green-200 bg-green-50'
                         : 'border-red-200 bg-red-50'}
                  `}>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-bold">Soru {i + 1}</span>
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-medium
                        ${ok ? 'bg-green-200 text-green-800'
                             : 'bg-red-200 text-red-800'}
                      `}>{ok ? 'Doğru' : 'Yanlış'}</span>
                    </div>

                    <p className="mb-3">{q.question}</p>

                    <p className="text-sm">
                      <span className="text-gray-600">Sizin cevabınız: </span>
                      <span className={ok ? 'text-green-700' : 'text-red-700'}>
                        {ans != null
                          ? `${ABCD[ans]}) ${yourTxt ?? '—'}`
                          : '—'}
                      </span>
                    </p>

                    {!ok && (
                      <p className="text-sm text-green-700">
                        Doğru cevap: {ABCD[q.correctAnswer]}) {corrTxt ?? '—'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <PrimaryButton onClick={() => nav(`/join/${sessionId}`)}>
              Ana Sayfaya Dön
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────── AKTİF QUIZ ────────────────────── */
  const q        = quiz.currentQ;
  const mediaURL = q?.mediaURL;
  const mType    = q?.mediaType ?? 'image';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Medya */}
        <div className="w-full lg:w-1/2 h-64 lg:h-screen lg:order-2 bg-gray-900 relative">
          {mediaURL ? (
            mType === 'video' ? (
              <>
                <video
                  ref={mediaRef}
                  src={mediaURL}
                  className="w-full h-full object-contain bg-black"
                  onTimeUpdate={media.onTime}
                  onLoadedMetadata={media.onLoadedMeta}
                  onPlay={() => media.playPause()}
                  onPause={() => media.playPause()}
                />
                <MediaControlBar
                  mediaType="video"
                  currentQuestion={quiz.index + 1}
                  totalQuestions={questions.length}
                  {...media}
                />
              </>
            ) : (
              <>
                <img
                  src={mediaURL}
                  alt="Soru medyası"
                  className="w-full h-full object-contain bg-black"
                />
                <MediaControlBar
                  mediaType={mType}
                  currentQuestion={quiz.index + 1}
                  totalQuestions={questions.length}
                />
              </>
            )
          ) : (
            <>
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                <div className="text-white/70 text-6xl">📝</div>
              </div>
              <MediaControlBar
                mediaType="image"
                currentQuestion={quiz.index + 1}
                totalQuestions={questions.length}
              />
            </>
          )}
        </div>

        {/* Soru */}
        <div className="w-full lg:w-1/2 lg:order-1 flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <QuestionCard
              question={q}
              selectedAnswer={quiz.selected}
              onAnswerSelect={quiz.select}
            />
          </div>

          {/* Alt Bar */}
          <div className="p-4 sm:p-6 lg:p-8 bg-white border-t border-gray-200">
            <div className="max-w-md mx-auto">
              <QuizButton onClick={quiz.next} disabled={quiz.selected == null}>
                {quiz.index === questions.length - 1 ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Quiz'i Bitir</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sonraki Soru</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </QuizButton>

              {quiz.selected == null && (
                <p className="text-center text-gray-500 text-sm mt-3">
                  Devam etmek için bir seçenek seçin
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
