import { useEffect, useRef, useState } from 'react';

const RESTORED_NOTICE_MS = 3_000;

export const ConnectivityBanner = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const previousOnline = useRef(isOnline);

  useEffect(() => {
    let restoredTimer: number | null = null;

    const updateConnectivity = () => {
      const nextOnline = navigator.onLine;

      if (nextOnline && !previousOnline.current) {
        setShowRestored(true);
        if (restoredTimer !== null) window.clearTimeout(restoredTimer);
        restoredTimer = window.setTimeout(() => {
          setShowRestored(false);
          restoredTimer = null;
        }, RESTORED_NOTICE_MS);
      } else if (!nextOnline) {
        setShowRestored(false);
      }

      previousOnline.current = nextOnline;
      setIsOnline(nextOnline);
    };

    window.addEventListener('online', updateConnectivity);
    window.addEventListener('offline', updateConnectivity);

    return () => {
      window.removeEventListener('online', updateConnectivity);
      window.removeEventListener('offline', updateConnectivity);
      if (restoredTimer !== null) window.clearTimeout(restoredTimer);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed left-1/2 top-3 z-[160] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-2xl backdrop-blur-xl ${
        isOnline
          ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/95 dark:text-emerald-100'
          : 'border-amber-200 bg-amber-50/95 text-amber-950 dark:border-amber-900 dark:bg-amber-950/95 dark:text-amber-100'
      }`}
    >
      {isOnline
        ? 'Wieder online – Online-Funktionen sind wieder verfügbar.'
        : 'Offline – lokale Lernsets, Karteikarten und Übungsfragen funktionieren weiter. Rangliste, KI und gewertete Prüfungen benötigen Internet.'}
    </div>
  );
};
