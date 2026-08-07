import { useEffect, useMemo, useState } from 'react';
import {
  BookPlus,
  CheckCircle2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { CATEGORIES } from '../data';
import { auth } from '../firebase';
import { syncUserStats } from '../services/firebaseService';
import { applyLearningLibraryPolicy } from '../services/learningLibraryPolicy';
import { MAX_IMPORTED_QUESTIONS } from '../services/learningSetImport';
import { getStats, saveStats } from '../storage';
import type { CategoryId, CustomQuiz, Difficulty, Question, UserStats } from '../types';
import { Button, Card } from './UI';

const MAX_NEW_MANUAL_QUESTIONS = 30;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

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

const isCategoryId = (value: string): value is CategoryId =>
  CATEGORIES.some((entry) => entry.id === value);

const currentDecks = (): CustomQuiz[] => getStats().customQuizzes || [];

export const ManualLearningSetPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<CustomQuiz[]>(() => currentDecks());
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editingDeckCreatedAt, setEditingDeckCreatedAt] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('allgemein');
  const [difficulty, setDifficulty] = useState<Difficulty>('mittel');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const maxQuestions = editingDeckId ? MAX_IMPORTED_QUESTIONS : MAX_NEW_MANUAL_QUESTIONS;

  useEffect(() => {
    const refresh = () => setAvailableDecks(currentDecks());
    window.addEventListener('wissenpur:stats-updated', refresh);
    window.addEventListener('wissenpur:library-updated', refresh);
    return () => {
      window.removeEventListener('wissenpur:stats-updated', refresh);
      window.removeEventListener('wissenpur:library-updated', refresh);
    };
  }, []);

  const canCommitQuestion = useMemo(() => {
    const normalizedOptions = options.map((option) => option.trim());
    const canGrow = Boolean(editingQuestionId) || questions.length < maxQuestions;
    return questionText.trim().length >= 3 &&
      explanation.trim().length >= 3 &&
      normalizedOptions.length >= MIN_OPTIONS &&
      normalizedOptions.length <= MAX_OPTIONS &&
      normalizedOptions.every((option) => option.length > 0) &&
      correctAnswer >= 0 && correctAnswer < normalizedOptions.length &&
      new Set(normalizedOptions.map((option) => option.toLocaleLowerCase('de-DE'))).size === normalizedOptions.length &&
      canGrow;
  }, [correctAnswer, editingQuestionId, explanation, maxQuestions, options, questionText, questions.length]);

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setExplanation('');
  };

  const resetAll = () => {
    setEditingDeckId(null);
    setEditingDeckCreatedAt(null);
    setTitle('');
    setCategory('allgemein');
    setDifficulty('mittel');
    setQuestions([]);
    setMessage(null);
    resetQuestionForm();
  };

  const loadDeck = (deckId: string) => {
    if (!deckId) {
      resetAll();
      return;
    }
    const deck = currentDecks().find((entry) => entry.id === deckId);
    if (!deck) {
      setMessage('Das Lernset wurde nicht gefunden.');
      return;
    }
    setEditingDeckId(deck.id);
    setEditingDeckCreatedAt(deck.createdAt);
    setTitle(deck.title);
    setQuestions(deck.questions);
    const firstQuestion = deck.questions[0];
    setCategory(firstQuestion && isCategoryId(firstQuestion.category) ? firstQuestion.category : 'allgemein');
    setDifficulty(firstQuestion?.difficulty || 'mittel');
    resetQuestionForm();
    setMessage(`„${deck.title}“ ist zum Bearbeiten geladen.`);
  };

  const beginEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.question);
    setOptions(question.options.slice(0, MAX_OPTIONS));
    setCorrectAnswer(Math.min(question.correctAnswer, question.options.length - 1));
    setExplanation(question.explanation);
    setCategory(isCategoryId(question.category) ? question.category : 'allgemein');
    setDifficulty(question.difficulty || 'mittel');
    setMessage('Frage geladen. Nach einer Inhaltsänderung beginnt ihre SRS-Wiederholung neu.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const commitQuestion = () => {
    setMessage(null);
    if (!canCommitQuestion) {
      setMessage('Frage, 2–6 unterschiedliche Antworten und eine kurze Erklärung sind erforderlich.');
      return;
    }

    const normalizedQuestion = questionText.trim();
    if (questions.some((question) =>
      question.id !== editingQuestionId &&
      question.question.toLocaleLowerCase('de-DE') === normalizedQuestion.toLocaleLowerCase('de-DE')
    )) {
      setMessage('Diese Frage ist bereits im Lernset enthalten.');
      return;
    }

    const previous = editingQuestionId
      ? questions.find((question) => question.id === editingQuestionId)
      : undefined;
    const next: Question = {
      id: previous?.id || createLocalId('manual-question'),
      category,
      question: normalizedQuestion.slice(0, 500),
      options: options.map((option) => option.trim().slice(0, 250)),
      correctAnswer,
      explanation: explanation.trim().slice(0, 2_000),
      difficulty,
      ...(previous?.imageUrl ? { imageUrl: previous.imageUrl } : {}),
    };

    if (editingQuestionId) {
      setQuestions((current) => current.map((question) => question.id === editingQuestionId ? next : question));
      setMessage('Frage aktualisiert. Der SRS-Status dieser Frage wurde zurückgesetzt.');
    } else {
      setQuestions((current) => [...current, next]);
      setMessage(`Frage ${questions.length + 1} hinzugefügt.`);
    }
    resetQuestionForm();
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((current) => current.filter((question) => question.id !== questionId));
    if (editingQuestionId === questionId) resetQuestionForm();
    setMessage(null);
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    setOptions((current) => [...current, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
    setCorrectAnswer((current) => {
      if (current === index) return 0;
      return current > index ? current - 1 : current;
    });
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

    const currentStats = getStats();
    const deck: CustomQuiz = {
      id: editingDeckId || createLocalId('set-manual'),
      title: normalizedTitle.slice(0, 100),
      createdAt: editingDeckCreatedAt || Date.now(),
      questions,
    };
    const library = currentStats.customQuizzes || [];
    const candidateDecks = editingDeckId
      ? library.map((entry) => entry.id === editingDeckId ? deck : entry)
      : [...library, deck];

    try {
      const policy = applyLearningLibraryPolicy(candidateDecks);
      const savedDeck = policy.decks.find((entry) => entry.id === deck.id);
      if (!savedDeck || savedDeck.questions.length !== questions.length) {
        throw new Error('Die Bibliothek hat ihr Größenlimit erreicht. Lösche oder verkleinere zuerst ein Lernset.');
      }

      const nextStats: UserStats = { ...currentStats, customQuizzes: policy.decks };
      saveStats(nextStats);
      setAvailableDecks(policy.decks);
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
          resetAll();
          setAvailableDecks(currentDecks());
          setIsOpen(true);
        }}
        className="fixed bottom-60 left-4 z-[80] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-black text-slate-700 shadow-xl backdrop-blur-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
        aria-label="Lernset erstellen oder bearbeiten"
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
                <h1 className="text-2xl font-black">{editingDeckId ? 'Lernset bearbeiten' : 'Lernset manuell erstellen'}</h1>
              </div>
              <button type="button" aria-label="Editor schließen" onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X /></button>
            </div>
          </header>

          <main className="mx-auto max-w-4xl space-y-6 p-5 pb-24">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-medium text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-100">
              Eigene Lernsets sind persönliche Übungsinhalte. Sie können als Karteikarten und Probeprüfung genutzt werden, erzeugen aber keine Ranglistenpunkte.
            </div>

            {message && <div role="status" className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">{message}</div>}

            {availableDecks.length > 0 && (
              <Card className="p-5">
                <label htmlFor="existing-learning-set" className="text-xs font-black uppercase tracking-widest text-slate-500">Vorhandenes Lernset bearbeiten</label>
                <select id="existing-learning-set" value={editingDeckId || ''} onChange={(event) => loadDeck(event.target.value)} className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900">
                  <option value="">Neues Lernset erstellen</option>
                  {availableDecks.map((deck) => <option key={deck.id} value={deck.id}>{deck.title} · {deck.questions.length} Fragen</option>)}
                </select>
              </Card>
            )}

            <Card className="space-y-4 p-6">
              <div>
                <label htmlFor="manual-set-title" className="text-xs font-black uppercase tracking-widest text-slate-500">Name des Lernsets</label>
                <input id="manual-set-title" value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} placeholder="z. B. AP1 – Schutzmaßnahmen" className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-transparent px-4 py-3 font-bold outline-none focus:border-indigo-500 dark:border-slate-700" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="text-xs font-black uppercase tracking-widest text-slate-500">Kategorie für neue/geänderte Frage</span><select value={category} onChange={(event) => setCategory(event.target.value as CategoryId)} className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900">{CATEGORIES.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select></label>
                <label className="block"><span className="text-xs font-black uppercase tracking-widest text-slate-500">Schwierigkeit</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"><option value="leicht">Leicht</option><option value="mittel">Mittel</option><option value="schwer">Schwer</option></select></label>
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{editingQuestionId ? 'Frage bearbeiten' : 'Neue Frage'}</p><h2 className="text-xl font-black">{editingQuestionId ? 'Inhalt aktualisieren' : `Frage ${questions.length + 1}`}</h2></div><span className="text-xs font-black text-slate-400">{questions.length}/{maxQuestions}</span></div>
              <textarea value={questionText} maxLength={500} onChange={(event) => setQuestionText(event.target.value)} placeholder="Frage eingeben" rows={3} className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-transparent px-4 py-3 font-bold outline-none focus:border-indigo-500 dark:border-slate-700" />
              <div className="grid gap-3 sm:grid-cols-2">
                {options.map((option, index) => (
                  <label key={index} className={`rounded-2xl border-2 p-3 ${correctAnswer === index ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="mb-2 flex items-center gap-2"><input type="radio" name="correct-answer" checked={correctAnswer === index} onChange={() => setCorrectAnswer(index)} /><span className="text-xs font-black uppercase tracking-widest text-slate-500">Antwort {String.fromCharCode(65 + index)} {correctAnswer === index ? '· richtig' : ''}</span>{options.length > MIN_OPTIONS && <button type="button" aria-label={`Antwort ${String.fromCharCode(65 + index)} entfernen`} onClick={(event) => { event.preventDefault(); removeOption(index); }} className="ml-auto rounded-lg p-1 text-slate-400 hover:text-rose-600"><X size={14} /></button>}</div>
                    <input value={option} maxLength={250} onChange={(event) => setOptions((current) => current.map((entry, optionIndex) => optionIndex === index ? event.target.value : entry))} className="w-full bg-transparent font-bold outline-none" placeholder={`Antwort ${String.fromCharCode(65 + index)}`} />
                  </label>
                ))}
              </div>
              {options.length < MAX_OPTIONS && <Button size="sm" variant="outline" onClick={addOption}><Plus size={16} /> Antwort hinzufügen</Button>}
              <textarea value={explanation} maxLength={2000} onChange={(event) => setExplanation(event.target.value)} placeholder="Kurze Erklärung, warum die Antwort richtig ist" rows={3} className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-transparent px-4 py-3 font-medium outline-none focus:border-indigo-500 dark:border-slate-700" />
              <div className={editingQuestionId ? 'grid grid-cols-2 gap-3' : ''}>
                {editingQuestionId && <Button variant="outline" onClick={resetQuestionForm}>Bearbeitung abbrechen</Button>}
                <Button fullWidth={!editingQuestionId} disabled={!canCommitQuestion} onClick={commitQuestion}><Plus size={18} /> {editingQuestionId ? 'Frage aktualisieren' : 'Frage hinzufügen'}</Button>
              </div>
            </Card>

            {questions.length > 0 && (
              <section>
                <div className="mb-3"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vorschau</p><h2 className="text-xl font-black">{questions.length} gespeicherte Frage{questions.length === 1 ? '' : 'n'}</h2></div>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="flex items-start gap-4 p-5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-black text-indigo-700">{index + 1}</div>
                      <div className="min-w-0 flex-1"><h3 className="font-black">{question.question}</h3><p className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mr-1 inline" size={15} />{question.options[question.correctAnswer]}</p><p className="mt-1 text-xs text-slate-500">{question.options.length} Antworten · {question.explanation}</p></div>
                      <div className="flex shrink-0 gap-1"><button type="button" aria-label="Frage bearbeiten" onClick={() => beginEditQuestion(question)} className="rounded-xl p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30"><Pencil size={18} /></button><button type="button" aria-label="Frage entfernen" onClick={() => removeQuestion(question.id)} className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"><Trash2 size={18} /></button></div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={resetAll}>Neues Set</Button>
              <Button disabled={!title.trim() || questions.length === 0} onClick={saveDeck}><Save size={18} /> {editingDeckId ? 'Änderungen speichern' : 'Lernset speichern'}</Button>
            </div>
          </main>
        </div>
      )}
    </>
  );
};
