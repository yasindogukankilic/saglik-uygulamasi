import React from 'react';

export default function QuestionCard({ question, selectedAnswer, onAnswerSelect }) {
  if (!question) return null;

  /* ───────── Soru Metni ───────── */
  const questionText = question.question || question.text || '—';

  /* ───────── Seçenekleri Normalize Et ───────── */
  const ABCDE = ['A', 'B', 'C', 'D', 'E'];

  const normalizeOptions = (q) => {
    // 1) Dizi ⇒ ["Ankara", "İzmir", …]
    if (Array.isArray(q.options)) return q.options;

    // 2) Nesne ⇒ {0:"Ankara",1:"İzmir",…}
    if (typeof q.options === 'object' && q.options !== null) {
      return Object.keys(q.options)
        .sort()                            // 0,1,2,…
        .map(k => q.options[k]);
    }

    // 3) Ayrı alanlar ⇒ optA / optionA / A
    return ABCDE.map((letter) => {
      const key = ['opt', 'option', ''].map(p => p + letter)
                   .find(k => q[k] != null);
      return key ? q[key] : undefined;
    });
  };

  const options = normalizeOptions(question);
  const optionLabels = ABCDE.slice(0, options.length);

  return (
    <div className="h-full flex flex-col">
      {/* Soru başlığı */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">
          {questionText}
        </h2>
        {question.subtitle && (
          <p className="text-gray-600 mt-2 text-base sm:text-lg">
            {question.subtitle}
          </p>
        )}
      </div>

      {/* Seçenekler */}
      <div className="flex-1 space-y-3 sm:space-y-4">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;

          return (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              disabled={option == null}
              className={`w-full p-4 sm:p-5 text-left rounded-xl border-2 transition-all duration-200 group
                ${isSelected 
                  ? 'border-[#0079a9] bg-[#0079a9]/10 shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:border-[#0079a9]/50 hover:bg-[#0079a9]/5 hover:shadow-sm hover:transform hover:scale-[1.01]'
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center space-x-4">
                {/* Seçenek harfi */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-200
                  ${isSelected 
                    ? 'bg-[#0079a9] text-white' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-[#0079a9]/20 group-hover:text-[#0079a9]'
                  }`}>
                  {optionLabels[index]}
                </div>

                {/* Seçenek metni */}
                <span className={`flex-1 text-base sm:text-lg font-medium transition-colors duration-200
                  ${isSelected 
                    ? 'text-[#0079a9]' 
                    : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                  {option ?? '—'}
                </span>

                {/* Seçili işareti */}
                {isSelected && (
                  <div className="text-[#0079a9]">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Yardımcı bilgi */}
      {question.hint && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-0.5">💡</div>
            <p className="text-blue-700 text-sm sm:text-base">
              <span className="font-medium">İpucu:</span> {question.hint}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
