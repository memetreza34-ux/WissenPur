import { useMemo, useState } from 'react';
import {
  BookPlus,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { CATEGORIES } from '../data';
import { auth } from '../firebase';
import { syncUserStats } from '../services/firebaseService';
import { applyLearningLibraryPolicy } from '../services/learningLibraryPolicy';
import { getStats, saveStats } from '../storage';
import type { CategoryId, CustomQuiz, Difficulty, Question, UserStats } from '../types';
import { Button, Card } from './UI';

const MAX_MANUAL_QUESTIONS = 30;

const createLocalId = (prefix: string): string => {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `${prefix}-${Date.now()}-${random}`;
};

const syncBestEffort = (stats: UserStats) => {
  if (!auth.currentUser) return;
  void syncUserStats(stats).catch((error: unknown) => {
    console.warn('Manuelles Lernset wurde lokal gespeichert, konnte aber nicht mit der Cloud synchronisiert werden.', error);
  });
};

export const ManualLearningSetPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('allgemein');
  const [difficulty, setDifficulty] = useState<Difficulty>('mittel');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const canAdd = useMemo(() => {
    const normalizedOptions = options.map((option) => option.trim());
    return questionText.trim().length >= 3 &&
      explanation.trim().length >= 3 &&
      normalizedOptions.every((option) => option.length > 0) &&
      new Set(normalizedOptions.map((option) => option.toLocaleLowerCase('de-DE'))).size === normalizedOptions.length &&
      questions.length < MAX_MANUAL_QUESTIONS;
  }, [explanation, options, questionText, questions.length]);

  const resetQuestionForm = () => {
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setExplanation('');
  };

  const resetAll = () => {
    setTitle('');
    setCategory('allgemein');
    setDifficulty('mittel');
    setQuestions([]);
    setMessage(null);
    resetQuestionForm();
  };

  const addQuestion = () => {
    setMessage(null);
    if (!canAdd) {
      setMessage('Frage, vier unterschiedliche Antworten und eine kurze Erklärung sind erforderlich.');
      return;
    }

    const normalizedQuestion = questionText.trim();
    if (questions.some((question) => question.question.toLocaleLowerCase('de-DE') === normalizedQuestion.toLocaleLowerCase('de-DE'))) {
      setMessage('Diese Frage ist bereits im Lernset enthalten.');
      return;
    }

    const next: Question = {
      id: createLocalId('manual-question'),
      category,
      question: normalizedQuestion.slice(0, 500),
      options: options.map((option) => option.trim().slice(0, 250)),
      correctAnswer,
      explanation: explanation.trim().slice(0, 2_000),
      difficulty,
    };
    setQuestions((current) => [...current, next]);
    resetQuestionForm();
    setMessage(`Frage ${questions.length + 1} hinzugefügt.`);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((current) => current.filter((question) => question.id !== questionId));
    setMessage(null);
  };

  const saveDeck = () => {
    setMessage(null);
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setMessage('Gib dem Lernset zuerst einen Namen.');
      return;
    }
    if (questions.length === 0) {
      setMessage('Füge mindestens eine vollständige Frage hinzu.');
      return;
    }

    const createdAt = Date.now();
    const deck: CustomQuiz = {
      id: createLocalId('set-manual'),
      title: normalizedTitle.slice(0, 100),
      createdAt,
      questions,
    };
    const currentStats = getStats();
    const candidateDecks = [...(currentStats.customQuizzes || []), deck];

    try {
      const policy = applyLearningLibraryPolicy(candidateDecks);
      const savedDeck = policy.decks.find((entry) => entry.id === deck.id);
      if (!savedDeck || savedDeck.questions.length !== questions.length) {
        throw new Error('Die Bibliothek hat ihr Größenlimit erreicht. Lösche oder verkleinere zuerst ein Lernset.');
      }

      const nextStats: UserStats = { ...currentStats, customQuizzes: policy.decks };
      saveStats(nextStats);
      window.dispatchEvent(new CustomEvent<UserStats>('wissenpur:stats-updated', { detail: nextStats }));
      window.dispatchEvent(new Event('wissenpur:library-updated'));
      syncBestEffort(nextStats);
      resetAll();
      setIsOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Das Lernset konnte nicht gespeichert werden.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage(null);
          setIsOpen(true);
        }}
        className="fixed bottom-60 left-4 z-[80] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-black text-slate-700 shadow-xl backdrop-blur-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
        aria-label="Manuelles Lernset erstellen"
      >
        <BookPlus size={18} className="text-indigo-600" />
        Erstellen
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[145] overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Eigener Inhalt</p>
                <h1 className="text-2xl font-black">Lernset manuell erstellen</h1>
              </div>
              <button type="button" aria-label="Editor schließen" onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X /></button>
            </div>
          </header>

          <main className="mx-auto max-w-4xl space-y-6 p-5 pb-24">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-medium text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-100">
              Manuelle Lernsets sind persönliche Übungsinhalte. Sie können als Karteikarten und Probeprüfung genutzt werden, erzeugen aber keine Ranglistenpunkte.
            </div>

            {message && <div role="status" className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">{message}</div>}

            <Card className="space-y-4 p-6">
              <div>
                <label htmlFor="manual-set-title" className="text-xs font-black uppercase tracking-widest text-slate-500">Name des Lernsets</label>
                <input id="manual-set-title" value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} placeholder="z. B. AP1 – Schutzmaßnahmen" className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-transparent px-4 py-3 font-bold outline-none focus:border-indigo-500 dark:border-slate-700" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="text-xs font-black uppercase tracking-widest text-slate-500">Kategorie</span><select value={category} onChange={(event) => setCategory(event.target.value as CategoryId)} className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900">{CATEGORIES.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select></label>
                <label className="block"><span className="text-xs font-black uppercase tracking-widest text-slate-500">Schwierigkeit</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"><option value="leicht">Leicht</option><option value="mittel">Mittel</option><option value="schwer">Schwer</option></select></label>
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neue Frage</p><h2 className="text-xl font-black">Frage {questions.length + 1}</h2></div><span className="text-xs font-black text-slate-400">{questions.length}/{MAX_MANUAL_QUESTIONS}</span></div>
              <textarea value={questionText} maxLength={500} onChange={(event) => setQuestionText(event.target.value)} placeholder="Frage eingeben" rows={3} className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-transparent px-4 py-3 font-bold outline-none focus:border-indigo-500 dark:border-slate-700" />
              <div className="grid gap-3 sm:grid-cols-2">
                {options.map((option, index) => (
                  <label key={index} className={`rounded-2xl border-2 p-3 ${correctAnswer === index ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="mb-2 flex items-center gap-2"><input type="radio" name="correct-answer" checked={correctAnswer === index} onChange={() => setCorrectAnswer(index)} /><span className="text-xs font-black uppercase tracking-widest text-slate-500">Antwort {String.fromCharCode(65 + index)} {correctAnswer === index ? '· richtig' : ''}</span></div>
                    <input value={option} maxLength={250} onChange={(event) => setOptions((current) => current.map((entry, optionIndex) => optionIndex === index ? event.target.value : entry))} className="w-full bg-transparent font-bold outline-none" placeholder={`Antwort ${String.fromCharCode(65 + index)}`} />
                  </label>
                ))}
              </div>
              <textarea value={explanation} maxLength={2000} onChange={(event) => setExplanation(event.target.value)} placeholder="Kurze Erklärung, warum die Antwort richtig ist" rows={3} className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-transparent px-4 py-3 font-medium outline-none focus:border-indigo-500 dark:border-slate-700" />
              <Button fullWidth disabled={!canAdd} onClick={addQuestion}><Plus size={18} /> Frage hinzufügen</Button>
            </Card>

            {questions.length > 0 && (
              <section>
                <div className="mb-3"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vorschau</p><h2 className="text-xl font-black">{questions.length} gespeicherte Frage{questions.length === 1 ? '' : 'n'}</h2></div>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="flex items-start gap-4 p-5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-black text-indigo-700">{index + 1}</div>
                      <div className="min-w-0 flex-1"><h3 className="font-black">{question.question}</h3><p className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mr-1 inline" size={15} />{question.options[question.correctAnswer]}</p><p className="mt-1 text-xs text-slate-500">{question.explanation}</p></div>
                      <button type="button" aria-label="Frage entfernen" onClick={() => removeQuestion(question.id)} className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"><Trash2 size={18} /></button>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={resetAll}>Zurücksetzen</Button>
              <Button disabled={!title.trim() || questions.length === 0} onClick={saveDeck}><Save size={18} /> Lernset speichern</Button>
            </div>
          </main>
        </div>
      )}
    </>
  );
};
