import { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson,
  FileSpreadsheet,
  Upload,
  X,
} from 'lucide-react';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import {
  estimateLearningLibraryBytes,
  MAX_IMPORT_BYTES,
  MAX_LIBRARY_DECKS,
  MAX_LIBRARY_QUESTIONS,
  MAX_LIBRARY_SERIALIZED_BYTES,
  parseLearningSetImport,
  type LearningSetImportResult,
} from '../services/learningSetImport';
import { getStats } from '../storage';
import type { CustomQuiz } from '../types';
import { Button } from './UI';

interface LearningSetImportPanelProps {
  isOpen: boolean;
  currentDeckCount: number;
  onClose: () => void;
  onImport: (deck: CustomQuiz) => void | Promise<void>;
}

const downloadText = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const downloadCsvTemplate = () => {
  downloadText(
    [
      'frage;option1;option2;option3;option4;richtig;erklaerung;kategorie;schwierigkeit',
      'Welche Spannung hat eine übliche Steckdose in Deutschland?;230 V;24 V;400 V;12 V;1;230 V ist die übliche Nennspannung.;technik;leicht',
    ].join('\n'),
    'wissenpur-lernset-vorlage.csv',
    'text/csv;charset=utf-8',
  );
};

export const LearningSetImportPanel = ({
  isOpen,
  currentDeckCount,
  onClose,
  onImport,
}: LearningSetImportPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<LearningSetImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const reset = () => {
    setPreview(null);
    setError(null);
    setIsBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const close = () => {
    reset();
    onClose();
  };
  const dialogRef = useAccessibleDialog(isOpen, close);

  const readFile = async (file: File | undefined) => {
    reset();
    if (!file) return;
    if (currentDeckCount >= MAX_LIBRARY_DECKS) {
      setError(`Die Bibliothek kann höchstens ${MAX_LIBRARY_DECKS} Lernsets enthalten.`);
      return;
    }
    if (file.size > MAX_IMPORT_BYTES) {
      setError('Die Datei ist größer als 1 MB.');
      return;
    }

    setIsBusy(true);
    try {
      const text = await file.text();
      const result = parseLearningSetImport(text, file.name);
      const currentDecks = getStats().customQuizzes || [];
      const nextDecks = [...currentDecks, result.deck];
      const totalQuestions = nextDecks.reduce(
        (total, deck) => total + deck.questions.length,
        0,
      );
      if (totalQuestions > MAX_LIBRARY_QUESTIONS) {
        throw new Error(
          `Die Bibliothek ist auf insgesamt ${MAX_LIBRARY_QUESTIONS} Fragen begrenzt. Lösche zuerst ein altes Lernset.`,
        );
      }
      if (estimateLearningLibraryBytes(nextDecks) > MAX_LIBRARY_SERIALIZED_BYTES) {
        throw new Error(
          'Die Bibliothek wäre nach diesem Import zu groß für eine zuverlässige Cloud-Synchronisierung. Kürze Erklärungen oder lösche ein altes Lernset.',
        );
      }
      setPreview(result);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Die Datei konnte nicht importiert werden.');
    } finally {
      setIsBusy(false);
    }
  };

  const confirmImport = async () => {
    if (!preview) return;
    setIsBusy(true);
    setError(null);
    try {
      await onImport(preview.deck);
      close();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Das Lernset konnte nicht gespeichert werden.');
      setIsBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="learning-set-import-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
              Eigene Inhalte
            </p>
            <h2 id="learning-set-import-title" className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
              Lernset importieren
            </h2>
          </div>
          <button
            type="button"
            aria-label="Import schließen"
            onClick={close}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          <p className="font-black text-slate-900 dark:text-white">Unterstützte Formate</p>
          <p className="mt-1 leading-relaxed">
            JSON mit einem <code>questions</code>-Array oder CSV/TSV mit Frage, Optionen, richtiger Antwort und Erklärung. Maximal 1 MB und 100 Fragen pro Datei.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".json,.csv,.tsv,.txt,application/json,text/csv,text/tab-separated-values"
          className="sr-only"
          onChange={(event) => void readFile(event.target.files?.[0])}
        />

        {!preview && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
              className="rounded-[1.5rem] border-2 border-dashed border-purple-200 bg-purple-50 p-6 text-left transition hover:border-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 dark:border-purple-900 dark:bg-purple-950/20"
            >
              <Upload className="text-purple-600" size={28} aria-hidden="true" />
              <p className="mt-4 font-black text-slate-950 dark:text-white">Datei auswählen</p>
              <p className="mt-1 text-xs text-slate-500">JSON, CSV oder TSV</p>
            </button>
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="rounded-[1.5rem] border border-slate-200 p-6 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Download className="text-slate-500" size={28} aria-hidden="true" />
              <p className="mt-4 font-black text-slate-950 dark:text-white">CSV-Vorlage</p>
              <p className="mt-1 text-xs text-slate-500">Beispiel herunterladen</p>
            </button>
          </div>
        )}

        {isBusy && !preview && (
          <div role="status" aria-live="polite" className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
            Datei wird geprüft …
          </div>
        )}

        {error && (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">
            <AlertTriangle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {preview && (
          <div className="mt-5 space-y-4">
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={24} aria-hidden="true" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Vorschau bereit</p>
                  <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{preview.deck.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {preview.importedQuestions} gültige Fragen · {preview.format.toUpperCase()}
                  </p>
                </div>
                {preview.format === 'json'
                  ? <FileJson className="ml-auto text-emerald-600" aria-hidden="true" />
                  : <FileSpreadsheet className="ml-auto text-emerald-600" aria-hidden="true" />}
              </div>
            </div>

            {preview.warnings.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-black">Hinweise</p>
                <ul className="mt-2 space-y-1">
                  {preview.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
                </ul>
              </div>
            )}

            <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
              {preview.deck.questions.slice(0, 8).map((question, index) => (
                <div key={question.id} className="rounded-xl bg-white p-3 text-sm dark:bg-slate-800">
                  <p className="font-black">{index + 1}. {question.question}</p>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                    Richtig: {question.options[question.correctAnswer]}
                  </p>
                </div>
              ))}
              {preview.deck.questions.length > 8 && (
                <p className="py-2 text-center text-xs font-bold text-slate-400">Weitere {preview.deck.questions.length - 8} Fragen</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" disabled={isBusy} onClick={reset}>Andere Datei</Button>
              <Button disabled={isBusy} onClick={() => void confirmImport()}>
                {isBusy ? 'Speichert …' : 'Lernset importieren'}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
