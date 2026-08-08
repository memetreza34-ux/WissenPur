import { useEffect, useState } from 'react';
import { Download, ShieldCheck, Trash2, X } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import {
  deleteCurrentAccount,
  exportCurrentAccountData,
} from '../services/accountService';
import {
  ANALYTICS_OWNER_KEY,
  ANALYTICS_STORAGE_KEY,
  normalizeLearningHistory,
} from '../services/learningAnalytics';
import { getPublicErrorMessage } from '../services/publicErrorMessage';
import { Button } from './UI';

const downloadJson = (value: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const readLocalAnalyticsForUser = (uid: string) => {
  if (localStorage.getItem(ANALYTICS_OWNER_KEY) !== uid) return [];
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return normalizeLearningHistory(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
};

export const AccountPrivacyPanel = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isDangerOpen, setIsDangerOpen] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const closePanel = () => {
    if (isBusy) return;
    setIsOpen(false);
    setIsDangerOpen(false);
    setDeleteConfirmation('');
  };
  const dialogRef = useAccessibleDialog(isOpen, closePanel);

  const exportData = async () => {
    setIsBusy(true);
    setMessage(null);
    try {
      if (!user) throw new Error('Bitte melde dich zuerst an.');
      const expectedUid = user.uid;
      const exported = await exportCurrentAccountData();
      if (auth.currentUser?.uid !== expectedUid || exported.account.uid !== expectedUid) {
        throw new Error('Die Kontositzung hat sich während des Exports geändert. Bitte starte den Export erneut.');
      }

      const localLearningAnalytics = readLocalAnalyticsForUser(exported.account.uid);
      const completeExport = {
        ...exported,
        localDevice: {
          learningAnalytics: localLearningAnalytics,
          note: 'Diese Lernanalyse wurde nur in diesem Browser gespeichert und für diesen Export lokal ergänzt.',
        },
      };
      const date = exported.exportedAt.slice(0, 10);
      downloadJson(completeExport, `wissenpur-datenexport-${date}.json`);
      setMessage('Dein Datenexport inklusive lokaler Lernanalyse wurde erstellt.');
    } catch (error) {
      setMessage(getPublicErrorMessage(error, 'Der Datenexport konnte nicht abgeschlossen werden.'));
    } finally {
      setIsBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation !== 'LÖSCHEN') return;
    setIsBusy(true);
    setMessage(null);
    try {
      await deleteCurrentAccount();
      window.location.replace('/');
    } catch (error) {
      setMessage(getPublicErrorMessage(error, 'Das Konto konnte nicht sicher gelöscht werden.'));
      setIsBusy(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage(null);
          setIsDangerOpen(false);
          setDeleteConfirmation('');
          setIsOpen(true);
        }}
        className="fixed bottom-28 right-4 z-[80] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-black text-slate-700 shadow-xl backdrop-blur-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
        aria-label="Datenschutz und Kontodaten öffnen"
      >
        <ShieldCheck size={18} className="text-blue-600" aria-hidden="true" />
        Daten
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <section
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-panel-title"
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  Konto und Datenschutz
                </p>
                <h2 id="privacy-panel-title" className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  Deine Daten
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fenster schließen"
                disabled={isBusy}
                onClick={closePanel}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
              <p className="font-black text-slate-900 dark:text-white">Angemeldetes Konto</p>
              <p className="mt-1 break-all">{user.email || user.displayName || user.uid}</p>
            </div>

            {message && (
              <div role="status" aria-live="polite" className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                {message}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <Download className="mt-0.5 shrink-0 text-blue-600" size={22} aria-hidden="true" />
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white">Daten exportieren</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Erstellt eine JSON-Datei mit Serverdaten und ergänzt die nur auf diesem Gerät gespeicherte persönliche Lernanalyse lokal.
                    </p>
                  </div>
                </div>
                <Button fullWidth variant="outline" className="mt-4" disabled={isBusy} onClick={exportData}>
                  <Download size={17} aria-hidden="true" />
                  {isBusy ? 'Export wird erstellt …' : 'JSON-Export herunterladen'}
                </Button>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-900 dark:bg-rose-950/20">
                <div className="flex items-start gap-3">
                  <Trash2 className="mt-0.5 shrink-0 text-rose-600" size={22} aria-hidden="true" />
                  <div>
                    <h3 className="font-black text-rose-900 dark:text-rose-100">Konto vollständig löschen</h3>
                    <p className="mt-1 text-sm text-rose-800/80 dark:text-rose-200/80">
                      Löscht servergespeicherten Lernfortschritt, Rangliste, Quiz-Sitzungen und Firebase-Login sowie kontoabhängige lokale Daten dieses Browsers. Die Aktion kann nicht rückgängig gemacht werden.
                    </p>
                  </div>
                </div>

                {!isDangerOpen ? (
                  <Button
                    fullWidth
                    variant="danger"
                    className="mt-4"
                    disabled={isBusy}
                    onClick={() => setIsDangerOpen(true)}
                  >
                    Löschung vorbereiten
                  </Button>
                ) : (
                  <div className="mt-4 space-y-3">
                    <label htmlFor="delete-account-confirmation" className="block text-sm font-bold text-rose-900 dark:text-rose-100">
                      Gib zur Bestätigung <span className="font-black">LÖSCHEN</span> ein:
                    </label>
                    <input
                      id="delete-account-confirmation"
                      value={deleteConfirmation}
                      onChange={(event) => setDeleteConfirmation(event.target.value)}
                      autoComplete="off"
                      className="w-full rounded-xl border-2 border-rose-200 bg-white px-4 py-3 font-black outline-none focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-900 dark:bg-slate-950"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => {
                          setIsDangerOpen(false);
                          setDeleteConfirmation('');
                        }}
                      >
                        Abbrechen
                      </Button>
                      <Button
                        variant="danger"
                        disabled={isBusy || deleteConfirmation !== 'LÖSCHEN'}
                        onClick={deleteAccount}
                      >
                        {isBusy ? 'Wird gelöscht …' : 'Endgültig löschen'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-5 text-xs font-medium leading-relaxed text-slate-400">
              Der technische Export und die Selbstlöschung ersetzen nicht die noch ausstehenden vollständigen Datenschutz- und Impressumstexte für die öffentliche Veröffentlichung.
            </p>
          </section>
        </div>
      )}
    </>
  );
};
