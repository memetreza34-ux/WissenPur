import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  incidentId: string | null;
}

const createIncidentId = () =>
  `WP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    incidentId: null,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
      incidentId: createIncidentId(),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Do not include profile, e-mail, question text or local storage in logs.
    console.error('WissenPur render failure', {
      incidentId: this.state.incidentId,
      errorName: error.name,
      componentStackAvailable: Boolean(info.componentStack),
    });
  }

  private reload = () => {
    window.location.reload();
  };

  private returnHome = () => {
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-slate-950 p-5 text-white">
        <section
          role="alert"
          aria-labelledby="app-error-title"
          className="w-full max-w-lg rounded-[2rem] border border-slate-700 bg-slate-900 p-7 shadow-2xl"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
            <AlertTriangle size={30} />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
            WissenPur
          </p>
          <h1 id="app-error-title" className="mt-2 text-2xl font-black">
            Die Ansicht konnte nicht geladen werden
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
            Dein Konto wurde dadurch nicht automatisch verändert. Lade die App neu. Tritt der Fehler erneut auf, nenne dem Support nur die unten angezeigte Vorgangsnummer.
          </p>

          <div className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 font-mono text-xs text-slate-400">
            Vorgang: {this.state.incidentId || 'nicht verfügbar'}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={this.reload}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-black text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <RefreshCw size={18} />
              Neu laden
            </button>
            <button
              type="button"
              onClick={this.returnHome}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-600 px-4 py-3 font-black text-slate-100 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Home size={18} />
              Zur Startseite
            </button>
          </div>
        </section>
      </main>
    );
  }
}
