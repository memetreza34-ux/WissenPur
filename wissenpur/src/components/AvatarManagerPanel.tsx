import { useEffect, useMemo, useState } from 'react';
import { Check, Coins, RotateCcw, UserRound, X } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import {
  equipServerShopAvatar,
  getCallableErrorMessage,
  purchaseServerShopItem,
  type ServerEconomyStats,
} from '../services/economyService';
import { getStats, saveStats } from '../storage';
import type { UserStats } from '../types';
import { Button } from './UI';

const AVATARS = [
  { id: 'avatar1', name: 'Aneka', cost: 200, url: '/avatars/aneka.svg' },
  { id: 'avatar2', name: 'Jude', cost: 300, url: '/avatars/jude.svg' },
  { id: 'avatar3', name: 'Avery', cost: 500, url: '/avatars/avery.svg' },
  { id: 'avatar4', name: 'Robot Blau', cost: 800, url: '/avatars/robot-blue.svg' },
  { id: 'avatar5', name: 'Robot Gold', cost: 1_000, url: '/avatars/robot-gold.svg' },
] as const;

const mergeServerStats = (server: ServerEconomyStats): UserStats => {
  const local = getStats();
  const serverAvatar = (server as ServerEconomyStats & { customPhotoURL?: string | null }).customPhotoURL;
  return {
    ...local,
    ...server,
    customName: local.customName,
    age: local.age,
    wrongQuestions: local.wrongQuestions || [],
    customDifficultyTimes: local.customDifficultyTimes,
    darkMode: local.darkMode,
    customQuizzes: local.customQuizzes || [],
    customPhotoURL: typeof serverAvatar === 'string' ? serverAvatar : undefined,
  };
};

const persistServerStats = (server: ServerEconomyStats): UserStats => {
  const merged = mergeServerStats(server);
  saveStats(merged);
  return merged;
};

export const AvatarManagerPanel = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<UserStats>(() => getStats());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setStats(getStats());
    setMessage(null);
    setBusyId(null);
    setIsOpen(false);
    setChanged(false);
  }), []);

  const close = () => {
    setIsOpen(false);
    setMessage(null);
    if (changed) {
      window.dispatchEvent(new CustomEvent('wissenpur:stats-updated'));
      setChanged(false);
    }
  };
  const dialogRef = useAccessibleDialog(isOpen, close);

  const activeAvatar = useMemo(
    () => AVATARS.find((avatar) => avatar.url === stats.customPhotoURL) || null,
    [stats.customPhotoURL],
  );

  const applyServerResponse = (serverStats: ServerEconomyStats) => {
    const merged = persistServerStats(serverStats);
    setStats(merged);
    setChanged(true);
  };

  const equip = async (avatarId: string) => {
    setBusyId(avatarId);
    setMessage(null);
    try {
      const response = await equipServerShopAvatar(avatarId);
      applyServerResponse(response.stats);
      setMessage(avatarId === 'default' ? 'Standardavatar aktiviert.' : 'Avatar aktiviert.');
    } catch (error) {
      setMessage(getCallableErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const purchase = async (avatarId: string) => {
    setBusyId(avatarId);
    setMessage(null);
    try {
      const purchased = await purchaseServerShopItem(avatarId);
      applyServerResponse(purchased.stats);

      // The purchase already equips the avatar in authoritative economy state.
      // A follow-up equip keeps the public leaderboard avatar in sync immediately.
      const equipped = await equipServerShopAvatar(avatarId);
      applyServerResponse(equipped.stats);
      setMessage('Avatar gekauft und aktiviert.');
    } catch (error) {
      setMessage(getCallableErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStats(getStats());
          setMessage(null);
          setIsOpen(true);
        }}
        className="fixed bottom-72 right-4 z-[80] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-black text-slate-700 shadow-xl backdrop-blur-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
        aria-label="Avatare verwalten"
      >
        {activeAvatar ? (
          <img src={activeAvatar.url} alt="" className="h-5 w-5 rounded-md" />
        ) : (
          <UserRound size={18} className="text-violet-600" />
        )}
        Avatare
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[145] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-manager-title"
            tabIndex={-1}
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">Profil</p>
                <h2 id="avatar-manager-title" className="mt-1 text-2xl font-black">Deine Avatare</h2>
                <p className="mt-2 text-sm text-slate-500">Gekaufte Avatare kannst du jederzeit kostenlos wechseln.</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Avatarverwaltung schließen"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {message && (
              <div role="status" aria-live="polite" className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
                {message}
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className={`rounded-[1.5rem] border-2 p-4 ${!activeAvatar ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800"><UserRound size={30} /></div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div><h3 className="font-black">Standard</h3><p className="text-xs text-slate-500">Kein Shop-Avatar</p></div>
                  {!activeAvatar ? <span className="flex items-center gap-1 text-xs font-black text-violet-600"><Check size={16} /> Aktiv</span> : <Button size="sm" variant="outline" disabled={busyId !== null} onClick={() => void equip('default')}><RotateCcw size={15} /> Nutzen</Button>}
                </div>
              </div>

              {AVATARS.map((avatar) => {
                const unlocked = stats.unlockedAvatars?.includes(avatar.id) === true;
                const active = stats.customPhotoURL === avatar.url;
                return (
                  <div key={avatar.id} className={`rounded-[1.5rem] border-2 p-4 ${active ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    <img src={avatar.url} alt={`Avatar ${avatar.name}`} className="h-16 w-16 rounded-2xl object-cover" />
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <h3 className="font-black">{avatar.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">{unlocked ? 'Freigeschaltet' : `${avatar.cost} Münzen`}</p>
                      </div>
                      {active ? (
                        <span className="flex items-center gap-1 text-xs font-black text-violet-600"><Check size={16} /> Aktiv</span>
                      ) : unlocked ? (
                        <Button size="sm" variant="outline" disabled={busyId !== null} onClick={() => void equip(avatar.id)}>Nutzen</Button>
                      ) : (
                        <Button size="sm" disabled={busyId !== null || (stats.coins || 0) < avatar.cost} onClick={() => void purchase(avatar.id)}>
                          <Coins size={15} /> {avatar.cost}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-xs font-medium text-slate-400">Shop-Avatare liegen lokal in WissenPur. Die Auswahl wird serverseitig geprüft und beeinflusst weder Punkte noch Lernfortschritt.</p>
          </section>
        </div>
      )}
    </>
  );
};
