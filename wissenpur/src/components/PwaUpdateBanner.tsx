import { useEffect, useState } from 'react';

export const PwaUpdateBanner = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let hasSeenController = Boolean(navigator.serviceWorker.controller);

    const handleControllerChange = () => {
      if (hasSeenController) {
        setUpdateAvailable(true);
        return;
      }
      hasSeenController = true;
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-24 left-1/2 z-[165] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-blue-200 bg-white/95 p-4 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-blue-900 dark:bg-slate-900/95 dark:text-white"
    >
      <p className="font-black">Neue WissenPur-Version verfügbar</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Lade die App neu, sobald du deine aktuelle Lernrunde abgeschlossen hast.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setUpdateAvailable(false)}
          className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
        >
          Später
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Neu laden
        </button>
      </div>
    </div>
  );
};
