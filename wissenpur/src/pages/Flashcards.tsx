import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Check, ChevronLeft, ChevronRight, Frown, Meh, Smile } from 'lucide-react';
import { Question } from '../types';
import { Button } from '../components/Button';
import { calculateNextReview, initSRSData, Quality } from '../services/srsService';

interface FlashcardsProps {
  questions: Question[];
  onClose: () => void;
  onQuestionsUpdated?: (updatedQuestions: Question[]) => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ questions, onClose, onQuestionsUpdated }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);

  const q = localQuestions[currentQuestionIndex];
  if (!q) return null;

  const handleRating = (quality: Quality) => {
    const srsData = q.srsData || initSRSData();
    const newSrsData = calculateNextReview(srsData, quality);
    
    const updatedQuestions = [...localQuestions];
    updatedQuestions[currentQuestionIndex] = { ...q, srsData: newSrsData };
    setLocalQuestions(updatedQuestions);
    
    if (onQuestionsUpdated) {
      onQuestionsUpdated(updatedQuestions);
    }

    setIsFlipped(false);
    setTimeout(() => {
      if (currentQuestionIndex < localQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // End of deck
        onClose();
      }
    }, 150);
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <header className="shrink-0 p-6 flex justify-between items-center glass-panel z-50">
        <button onClick={() => { onClose(); setIsFlipped(false); }} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <X size={24} strokeWidth={2.5} />
        </button>
        <div className="font-black text-slate-900 dark:text-white tracking-widest text-sm">
          {currentQuestionIndex + 1} / {localQuestions.length}
        </div>
        <div className="w-8" />
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center perspective-1000 relative">
        <div 
          className={`w-full max-w-sm aspect-[3/4] relative transform-style-3d transition-transform duration-700 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden glass-card rounded-[2.5rem] p-6 flex flex-col items-center text-center">
            {q.imageUrl ? (
              <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-inner">
                <img src={q.imageUrl} alt="Frage Illustration" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shrink-0">
                <Brain size={40} />
              </div>
            )}
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-auto mb-auto">{q.question}</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-auto">Tippen zum Umdrehen</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden glass-card rounded-[2.5rem] p-6 flex flex-col items-center text-center rotate-y-180 bg-gradient-to-br from-purple-50/90 to-blue-50/90 dark:from-purple-900/40 dark:to-blue-900/40">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6 shrink-0">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 text-green-600 dark:text-green-400">{q.options[q.correctAnswer]}</h2>
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 shrink-0" />
            <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed overflow-y-auto no-scrollbar">{q.explanation}</p>
          </div>
        </div>

        {isFlipped ? (
          <div className="mt-12 w-full max-w-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Wie war das?</p>
            <div className="flex gap-2 w-full">
              <button onClick={() => handleRating(1)} className="flex-1 py-3 px-2 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-black hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex flex-col items-center gap-1">
                <Frown size={24} />
                <span className="text-xs">Schwer</span>
              </button>
              <button onClick={() => handleRating(3)} className="flex-1 py-3 px-2 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-black hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors flex flex-col items-center gap-1">
                <Meh size={24} />
                <span className="text-xs">Gut</span>
              </button>
              <button onClick={() => handleRating(5)} className="flex-1 py-3 px-2 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-black hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex flex-col items-center gap-1">
                <Smile size={24} />
                <span className="text-xs">Leicht</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 mt-12 w-full max-w-sm opacity-0 pointer-events-none">
            {/* Placeholder to keep layout stable */}
            <div className="h-16 w-full"></div>
          </div>
        )}
      </main>
    </div>
  );
};
