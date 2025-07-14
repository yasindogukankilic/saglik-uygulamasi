  import React, { useState, useEffect } from 'react';
  import { Play, Pause, ChevronRight } from 'lucide-react';

  // Custom hooks
  const useTimer = (initialTime = 0) => {
    const [time, setTime] = useState(initialTime);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
      if (!isPlaying) return;
      
      const interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);

      return () => clearInterval(interval);
    }, [isPlaying]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const reset = () => setTime(0);

    return { time, isPlaying, togglePlay, reset };
  };

  const useQuiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const questions = [
      {
        id: 1,
        question: "Yetişkin bir bireyde göğüs kompresyonu derinliği yaklaşık ne kadar olmalıdır?",
        options: ["1 cm", "2 cm", "3 cm", "5 cm"],
        correct: 3
      }
    ];

    const handleAnswerSelect = (answerIndex) => {
      setSelectedAnswer(answerIndex);
    };

    const handleSubmit = () => {
      setShowResult(true);
    };

    const resetQuiz = () => {
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
    };

    return {
      questions,
      currentQuestion,
      selectedAnswer,
      showResult,
      handleAnswerSelect,
      handleSubmit,
      resetQuiz
    };
  };

  // Utility functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (current, total) => {
    return Math.round((current / total) * 100);
  };

  // Components
  const ProgressBar = ({ progress, className = "" }) => {
    return (
      <div className={`w-full bg-[#0079a9] rounded-full h-2 overflow-hidden ${className}`}>
        <div 
          className="h-full bg-[#58dd91] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const AudioPlayer = ({ time, isPlaying, onTogglePlay, onNext }) => {
    const [simulatedProgress, setSimulatedProgress] = useState(15);

    useEffect(() => {
      if (!isPlaying) return;
      
      const interval = setInterval(() => {
        setSimulatedProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 2;
        });
      }, 500);

      return () => clearInterval(interval);
    }, [isPlaying]);

    return (
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onTogglePlay}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-[#0079a9]" />
            ) : (
              <Play className="w-5 h-5 text-[#0079a9] ml-0.5" />
            )}
          </button>
          
          <div className="flex-1 mx-3">
            <ProgressBar progress={simulatedProgress} />
          </div>
          
          <button 
            onClick={onNext}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronRight className="w-5 h-5 text-[#0079a9]" />
          </button>
        </div>
      </div>
    );
  };

  const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }) => {
    return (
      <div className="bg-[#0079a9] rounded-t-3xl p-6 flex-1 flex flex-col">
        <h2 className="text-xl font-semibold text-white mb-8 leading-relaxed text-center">
          {question.question}
        </h2>
        
        <div className="space-y-4 flex-1">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                selectedAnswer === index
                  ? 'border-white bg-white/20 text-white font-medium scale-95'
                  : 'border-white/40 hover:border-white/70 text-white/90 hover:bg-white/5'
              }`}
            >
              <span className="text-base">{option}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const SubmitButton = ({ onSubmit, disabled, className = "" }) => {
    return (
      <div className="p-6 bg-[#0079a9]">
        <button
          onClick={onSubmit}
          disabled={disabled}
          className={`w-full py-4 px-6 bg-white text-[#0079a9] font-bold rounded-xl text-lg
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-100 active:bg-gray-200 transform hover:scale-105'
            } transition-all duration-200 shadow-lg ${className}`}
        >
          Gönder
        </button>
      </div>
    );
  };

  const Footer = () => {
    return (
      <div className="text-center py-4 px-6 bg-[#0079a9]">
        <p className="text-sm text-white/70">
          Your name will be shared
        </p>
      </div>
    );
  };

  // Main App Component
  const MobileQuizApp = () => {
    const { time, isPlaying, togglePlay } = useTimer();
    const { 
      questions, 
      selectedAnswer, 
      showResult, 
      handleAnswerSelect, 
      handleSubmit 
    } = useQuiz();

    const currentQuestion = questions[0];

    const handleNext = () => {
      console.log('Sonraki soru');
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Hero Image Section */}
        <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
          {/* Placeholder for medical image */}
          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
            <div className="text-6xl opacity-30">🏥</div>
          </div>
          
          {/* Audio Player Overlay */}
          <AudioPlayer 
            time={time}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onNext={handleNext}
          />
        </div>

        {/* Quiz Content */}
        <div className="flex-1 flex flex-col">
          {!showResult ? (
            <>
              <QuestionCard
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
              />
              
              <SubmitButton
                onSubmit={handleSubmit}
                disabled={selectedAnswer === null}
              />
            </>
          ) : (
            <div className="bg-[#0079a9] rounded-t-3xl flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Tebrikler!
                </h2>
                <p className="text-white/80 mb-6">
                  Soruyu başarıyla tamamladınız.
                </p>
                <p className="text-sm text-white/60">
                  Doğru cevap: {currentQuestion.options[currentQuestion.correct]}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    );
  };

  export default MobileQuizApp;