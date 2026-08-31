import { useState } from 'react';
import { ArrowRight, BookOpen, Brain, CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { Button } from './UI';

const ONBOARDING_KEY = 'wissenpur_onboarding_v1_completed';

const STEPS = [
  {
    eyebrow: 'Willkommen bei WissenPur',
    title: 'Heute wissen, was als Nächstes dran ist',
    description: 'Auf „Heute“ siehst du fällige Karteikarten und deinen empfohlenen nächsten Lernschritt. Für lokale Übungen brauchst du kein Konto.',
    icon: Brain,
  },
  {
    eyebrow: 'Deine Lerninhalte',
    title: 'Lernsets erstellen, importieren und wiederholen',
    description: 'Nutze eigene JSON-, CSV- oder TSV-Lernsets, den manuellen Editor oder KI-Übungssets. Fällige Karten landen automatisch in deiner Wiederholungsqueue.',
    icon: BookOpen,
  },
  {
    eyebrow: 'Fair und transparent',
    title: 'Übung bleibt Übung – Rangliste bleibt geprüft',
    description: 'Nur servergeprüfte Ranglistenrunden vergeben Punkte. Eigene und KI-generierte Inhalte bleiben ungewertet. Lernanalyse und persönliche Lernhistorie bleiben auf diesem Gerät.',
    icon: ShieldCheck,
  },
] as const;

const hasCompletedOnboarding = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return false;
  }
};

const rememberCompletion = () => {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1');
  } catch {
    // The onboarding may reappear when browser storage is unavailable.
  }
};

export const FirstRunOnboarding = () => {
  const [isOpen, setIsOpen] = useState(() => !hasCompletedOnboarding());
  const [step, setStep] = useState(0);

  const complete = () => {
    rememberCompletion();
    setIsOpen(false);
  };
  const dialogRef = useAccessibleDialog(isOpen, complete);

  if (!isOpen) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-run-title"
        aria-describedby="first-run-description"
        tabIndex={-1}
        className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl outline-none dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg">
            <Icon size={28} />
          </div>
          <button
            type="button"
            onClick={complete}
            aria-label="Einführung überspringen"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{current.eyebrow}</p>
        <h1 id="first-run-title" className="mt-2 text-3xl font-black leading-tight text-slate-950 dark:text-white">{current.title}</h1>
        <p id="first-run-description" className="mt-4 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">{current.description}</p>

        <div className="mt-6 flex items-center gap-2" aria-label={`Schritt ${step + 1} von ${STEPS.length}`}>
          {STEPS.map((_, index) => (
            <span key={index} aria-hidden="true" className={`h-2 rounded-full transition-all ${index === step ? 'w-8 bg-blue-600' : index < step ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={complete}>
            Überspringen
          </Button>
          <Button onClick={() => isLast ? complete() : setStep((value) => value + 1)}>
            {isLast ? <><CheckCircle2 size={18} /> Los geht’s</> : <><Sparkles size={18} /> Weiter <ArrowRight size={18} /></>}
          </Button>
        </div>

        <p className="mt-5 text-center text-[11px] font-medium text-slate-400">Diese Einführung speichert nur lokal, dass du sie abgeschlossen hast. Keine Tracking-ID, kein Cloud-Eintrag.</p>
      </section>
    </div>
  );
};
