import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Brain, Check, Frown, Meh, Smile } from 'lucide-react';
import { Question } from '../types';
import { Button } from '../components/UI';
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

    onQuestionsUpdated?.(updatedQuestions);

    setIsFlipped(false);
    window.setTimeout(() => {
      if (currentQuestionIndex < localQuestions.length - 1) {
        setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
      } else {
        onClose();
      }
    }, 150);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent">
      <header className="glass-panel z-50 flex shrink-0 items-center justify-between p-6">
        <button
          type="button"
          aria-label="Karteikarten schließen"
          onClick={() => {
            onClose();
            setIsFlipped(false);
          }}
          className="-ml-2 p-2 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-white"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
        <div className="text-sm font-black tracking-widest text-slate-900 dark:text-white">
          {currentQuestionIndex + 1} / {localQuestions.length}
        </div>
        <div className="w-8" aria-hidden="true" />
      </header>

      <main className="perspective-1000 relative flex flex-1 flex-col items-center justify-center p-6">
        <button
          type="button"
          aria-label={isFlipped ? 'Antwortseite der Karteikarte' : 'Karteikarte umdrehen'}
          aria-pressed={isFlipped}
          className={`transform-style-3d relative aspect-[3/4] w-full max-w-sm cursor-pointer border-0 bg-transparent p-0 text-inherit transition-transform duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          <div className="backface-hidden glass-card absolute inset-0 flex flex-col items-center rounded-[2.5rem] p-6 text-center">
            {q.imageUrl ? (
              <div className="mb-6 h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-inner dark:bg-slate-800">
                <img src={q.imageUrl} alt="Illustration zur Frage" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-500 dark:bg-blue-900/30">
                <Brain size={40} />
              </div>
            )}
            <h2 className="mb-auto mt-auto text-xl font-black leading-tight text-slate-900 dark:text-white">{q.question}</h2>
            <p className="mt-auto text-xs font-bold uppercase tracking-widest text-slate-400">Tippen zum Umdrehen</p>
          </div>

          <div className="backface-hidden glass-card rotate-y-180 absolute inset-0 flex flex-col items-center rounded-[2.5rem] bg-gradient-to-br from-purple-50/90 to-blue-50/90 p-6 text-center dark:from-purple-900/40 dark:to-blue-900/40">
            <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900/30">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="mb-4 text-2xl font-black text-green-600 dark:text-green-400">{q.options[q.correctAnswer]}</h2>
            <div className="mb-6 h-1 w-12 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
            <p className="no-scrollbar overflow-y-auto font-medium leading-relaxed text-slate-600 dark:text-slate-300">{q.explanation}</p>
          </div>
        </button>

        {isFlipped ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex w-full max-w-sm flex-col items-center"
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Wie sicher warst du?</p>
            <div className="flex w-full gap-2">
              <button type="button" onClick={() => handleRating(1)} className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-red-100 px-2 py-3 font-black text-red-600 transition-colors hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50">
                <Frown size={24} />
                <span className="text-xs">Schwer</span>
              </button>
              <button type="button" onClick={() => handleRating(3)} className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-yellow-100 px-2 py-3 font-black text-yellow-600 transition-colors hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50">
                <Meh size={24} />
                <span className="text-xs">Gut</span>
              </button>
              <button type="button" onClick={() => handleRating(5)} className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-green-100 px-2 py-3 font-black text-green-600 transition-colors hover:bg-green-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50">
                <Smile size={24} />
                <span className="text-xs">Leicht</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="pointer-events-none mt-12 flex w-full max-w-sm gap-4 opacity-0" aria-hidden="true">
            <div className="h-16 w-full" />
          </div>
        )}
      </main>
    </div>
  );
};
