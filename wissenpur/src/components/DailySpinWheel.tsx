import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles } from 'lucide-react';
import { auth } from '../firebase';
import { soundManager } from '../lib/sound';
import { getStats, saveStats } from '../storage';
import {
  getCallableErrorMessage,
  spinServerDailyWheel,
  type ServerEconomyStats,
} from '../services/economyService';
import { Button } from './UI';

interface DailySpinWheelProps {
  onClaimReward: (reward: {
    type: 'coins' | 'fiftyFifty' | 'timeFreeze' | 'secondChance';
    amount: number;
  }) => void;
}

export interface SpinReward {
  id: number;
  label: string;
  type: 'coins' | 'fiftyFifty' | 'timeFreeze' | 'secondChance';
  amount: number;
  color: string;
  icon: string;
}

export const SPIN_REWARDS: SpinReward[] = [
  { id: 0, label: '25 Münzen', type: 'coins', amount: 25, color: '#f59e0b', icon: '🪙' },
  { id: 1, label: '50 Münzen', type: 'coins', amount: 50, color: '#10b981', icon: '💰' },
  { id: 2, label: '100 Münzen', type: 'coins', amount: 100, color: '#8b5cf6', icon: '💎' },
  { id: 3, label: '1× 50:50', type: 'fiftyFifty', amount: 1, color: '#3b82f6', icon: '🌓' },
  { id: 4, label: '1× Zeit-Freeze', type: 'timeFreeze', amount: 1, color: '#06b6d4', icon: '❄️' },
  { id: 5, label: '1× zweite Chance', type: 'secondChance', amount: 1, color: '#ec4899', icon: '🛡️' },
];

const berlinDateKey = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const preserveLocalLearningData = (serverStats: ServerEconomyStats) => {
  const localStats = getStats();
  return {
    ...localStats,
    ...serverStats,
    customName: localStats.customName,
    age: localStats.age,
    wrongQuestions: localStats.wrongQuestions || [],
    customDifficultyTimes: localStats.customDifficultyTimes,
    darkMode: localStats.darkMode,
    customQuizzes: localStats.customQuizzes || [],
    customPhotoURL: serverStats.customPhotoURL ?? localStats.customPhotoURL,
  };
};

export const DailySpinWheel: React.FC<DailySpinWheelProps> = ({ onClaimReward }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<SpinReward | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const tickIntervalRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);

  const clearAnimationTimers = () => {
    if (tickIntervalRef.current !== null) {
      window.clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
  };

  useEffect(() => () => clearAnimationTimers(), []);

  const handleSpin = async () => {
    if (isSpinning || wonReward) return;

    const expectedUid = auth.currentUser?.uid;
    if (!expectedUid) {
      setErrorMessage('Bitte melde dich erneut an, um das Glücksrad zu verwenden.');
      return;
    }

    soundManager.init();
    setErrorMessage(null);
    setIsSpinning(true);
    clearAnimationTimers();

    try {
      const result = await spinServerDailyWheel();
      if (auth.currentUser?.uid !== expectedUid) {
        setIsSpinning(false);
        return;
      }

      const selectedIndex = SPIN_REWARDS.findIndex(
        (reward) => reward.type === result.reward.type && reward.amount === result.reward.amount,
      );
      const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;
      const reward = SPIN_REWARDS[safeIndex];

      // Commit the authoritative server state immediately while the original
      // authenticated session is still active. The animation is presentation
      // only and must never own a delayed account-data write.
      saveStats(preserveLocalLearningData(result.stats));
      onClaimReward(result.reward);

      const fullSpins = 5;
      const targetDegree = rotation + fullSpins * 360 + (360 - safeIndex * 60 - 30);
      setRotation(targetDegree);

      let tickCount = 0;
      tickIntervalRef.current = window.setInterval(() => {
        soundManager.playSpin();
        tickCount += 1;
        if (tickCount > 20 && tickIntervalRef.current !== null) {
          window.clearInterval(tickIntervalRef.current);
          tickIntervalRef.current = null;
        }
      }, 150);

      finishTimeoutRef.current = window.setTimeout(() => {
        if (tickIntervalRef.current !== null) {
          window.clearInterval(tickIntervalRef.current);
          tickIntervalRef.current = null;
        }
        finishTimeoutRef.current = null;
        if (auth.currentUser?.uid !== expectedUid) return;
        setIsSpinning(false);
        setWonReward(reward);
        soundManager.playLevelUp();
      }, 4000);
    } catch (error) {
      clearAnimationTimers();
      setIsSpinning(false);
      setErrorMessage(getCallableErrorMessage(error));
    }
  };

  const openWheel = () => {
    soundManager.init();
    soundManager.playClick();
    setErrorMessage(null);

    // A reward is intentionally kept visible for the rest of the same day,
    // but an app that stays open across midnight must allow the new day's spin
    // without requiring a reload.
    if (getStats().lastSpinDate !== berlinDateKey()) {
      setWonReward(null);
    }

    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold gap-2 shadow-lg shadow-amber-500/20"
        onClick={openWheel}
      >
        <Sparkles className="w-4 h-4 fill-current text-amber-200" />
        <span>Glücksrad</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 max-w-md w-full space-y-6 text-center relative overflow-hidden shadow-2xl"
            >
              <button
                type="button"
                aria-label="Glücksrad schließen"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Tägliche Belohnung</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Tägliches Glücksrad</h2>
                <p className="text-xs text-slate-400">Ein Dreh pro Konto und Kalendertag.</p>
              </div>

              <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                <div className="absolute -top-3 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-md" />

                <motion.div
                  style={{ rotate: rotation }}
                  transition={{ duration: 4, ease: [0.15, 0.99, 0.3, 1] }}
                  className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden"
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90" aria-hidden="true">
                    {SPIN_REWARDS.map((reward, index) => {
                      const angle = 360 / SPIN_REWARDS.length;
                      const startAngle = index * angle;
                      const endAngle = (index + 1) * angle;
                      const x1 = 100 + 100 * Math.cos((Math.PI * startAngle) / 180);
                      const y1 = 100 + 100 * Math.sin((Math.PI * startAngle) / 180);
                      const x2 = 100 + 100 * Math.cos((Math.PI * endAngle) / 180);
                      const y2 = 100 + 100 * Math.sin((Math.PI * endAngle) / 180);
                      const path = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

                      return (
                        <g key={reward.id}>
                          <path d={path} fill={reward.color} stroke="#0f172a" strokeWidth="2" />
                          <text
                            x="145"
                            y="105"
                            transform={`rotate(${startAngle + angle / 2}, 100, 100)`}
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {reward.icon}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>

                <div className="absolute z-20 w-14 h-14 rounded-full bg-slate-900 border-4 border-amber-400 shadow-lg flex items-center justify-center text-xl font-black text-amber-400">
                  🎯
                </div>
              </div>

              {errorMessage && (
                <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm font-bold text-rose-200">
                  {errorMessage}
                </div>
              )}

              {wonReward ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl space-y-2"
                >
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Gewonnen</p>
                  <p className="text-xl font-black text-white flex items-center justify-center gap-2">
                    <span>{wonReward.icon}</span>
                    <span>{wonReward.label}</span>
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Einsammeln
                  </Button>
                </motion.div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isSpinning}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-lg py-4 shadow-xl shadow-amber-500/30"
                  onClick={handleSpin}
                >
                  {isSpinning ? 'Ergebnis wird bestätigt …' : 'Jetzt drehen'}
                </Button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
