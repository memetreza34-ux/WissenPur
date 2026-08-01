import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, Coins, Zap, Shield, RotateCcw } from 'lucide-react';
import { soundManager } from '../lib/sound';
import { Button, Card } from './UI';

interface DailySpinWheelProps {
  onClaimReward: (reward: { type: 'coins' | 'fiftyFifty' | 'secondChance'; amount: number }) => void;
}

export interface SpinReward {
  id: number;
  label: string;
  type: 'coins' | 'fiftyFifty' | 'secondChance';
  amount: number;
  color: string;
  icon: string;
}

export const SPIN_REWARDS: SpinReward[] = [
  { id: 0, label: '50 Münzen', type: 'coins', amount: 50, color: '#f59e0b', icon: '🪙' },
  { id: 1, label: '1x 50:50', type: 'fiftyFifty', amount: 1, color: '#3b82f6', icon: '🌓' },
  { id: 2, label: '100 Münzen', type: 'coins', amount: 100, color: '#10b981', icon: '💰' },
  { id: 3, label: '1x Chance', type: 'secondChance', amount: 1, color: '#ec4899', icon: '🛡️' },
  { id: 4, label: '200 Münzen', type: 'coins', amount: 200, color: '#8b5cf6', icon: '💎' },
  { id: 5, label: '2x 50:50', type: 'fiftyFifty', amount: 2, color: '#06b6d4', icon: '⚡' },
];

export const DailySpinWheel: React.FC<DailySpinWheelProps> = ({ onClaimReward }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<SpinReward | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSpin = () => {
    if (isSpinning || wonReward) return;

    soundManager.init();
    setIsSpinning(true);

    // Pick random index 0-5
    const selectedIndex = Math.floor(Math.random() * SPIN_REWARDS.length);
    const reward = SPIN_REWARDS[selectedIndex];

    // Segment angle = 360 / 6 = 60 degrees
    // Calculate rotation to align segment to top pointer
    const fullSpins = 5; // 5 full 360 degree spins
    const targetDegree = fullSpins * 360 + (360 - selectedIndex * 60 - 30);

    setRotation(targetDegree);

    // Play tick sound during spin
    let tickCount = 0;
    const interval = setInterval(() => {
      soundManager.playSpin();
      tickCount++;
      if (tickCount > 20) clearInterval(interval);
    }, 150);

    setTimeout(() => {
      setIsSpinning(false);
      setWonReward(reward);
      soundManager.playLevelUp();
      onClaimReward(reward);
    }, 4000);
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold gap-2 shadow-lg shadow-amber-500/20"
        onClick={() => {
          soundManager.init();
          soundManager.playClick();
          setIsOpen(true);
        }}
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
                <p className="text-xs text-slate-400">Drehe das Rad und gewinne Münzen oder Power-Ups!</p>
              </div>

              {/* Wheel Container */}
              <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                {/* Pointer Arrow */}
                <div className="absolute -top-3 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-md" />

                {/* SVG Animated Wheel */}
                <motion.div
                  style={{ rotate: rotation }}
                  transition={{ duration: 4, ease: [0.15, 0.99, 0.3, 1] }}
                  className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden"
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {SPIN_REWARDS.map((reward, i) => {
                      const angle = 360 / SPIN_REWARDS.length;
                      const startAngle = i * angle;
                      const endAngle = (i + 1) * angle;

                      const x1 = 100 + 100 * Math.cos((Math.PI * startAngle) / 180);
                      const y1 = 100 + 100 * Math.sin((Math.PI * startAngle) / 180);
                      const x2 = 100 + 100 * Math.cos((Math.PI * endAngle) / 180);
                      const y2 = 100 + 100 * Math.sin((Math.PI * endAngle) / 180);

                      const d = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

                      return (
                        <g key={reward.id}>
                          <path d={d} fill={reward.color} stroke="#0f172a" strokeWidth="2" />
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

                {/* Center Hub Button */}
                <div className="absolute z-20 w-14 h-14 rounded-full bg-slate-900 border-4 border-amber-400 shadow-lg flex items-center justify-center text-xl font-black text-amber-400">
                  🎯
                </div>
              </div>

              {/* Won Reward Banner or Spin Button */}
              {wonReward ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl space-y-2"
                >
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Gewonnen!</p>
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
                  {isSpinning ? 'Dreht sich...' : 'Jetzt Drehen! 🎲'}
                </Button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
