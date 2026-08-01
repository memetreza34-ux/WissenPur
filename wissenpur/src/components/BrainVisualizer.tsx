import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Zap, Target, Award, Sparkles, ArrowRight, Play, BookOpen, RotateCcw } from 'lucide-react';
import { UserStats, CategoryId } from '../types';
import { soundManager } from '../lib/sound';
import { Button, Card, ProgressBar } from './UI';

interface BrainVisualizerProps {
  userStats: UserStats;
  onSelectCategory: (categoryId: CategoryId) => void;
}

export interface BrainLobe {
  id: string;
  name: string;
  latinName: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  glowColor: string;
  categories: { id: CategoryId; title: string; icon: string }[];
  svgPath: string;
  cx: number;
  cy: number;
}

export const BRAIN_LOBES: BrainLobe[] = [
  {
    id: 'frontal',
    name: 'Frontallappen',
    latinName: 'Lobus frontalis',
    description: 'Verantwortlich für Logik, abstraktes Denken, Wissenschaft & Entscheidungsfindung.',
    icon: '💡',
    color: 'from-amber-500 to-orange-600',
    gradient: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    categories: [
      { id: 'wissenschaft', title: 'Wissenschaft', icon: '🔬' },
      { id: 'technik', title: 'Technik', icon: '⚙️' },
      { id: 'allgemein', title: 'Allgemeinwissen', icon: '🌐' }
    ],
    // SVG path coordinates for Frontal Lobe (front top area)
    svgPath: 'M 160 90 C 230 60, 320 60, 370 100 C 400 130, 410 180, 380 230 C 350 250, 280 250, 220 230 C 180 210, 140 150, 160 90 Z',
    cx: 280,
    cy: 145
  },
  {
    id: 'parietal',
    name: 'Parietallappen',
    latinName: 'Lobus parietalis',
    description: 'Räumliche Orientierung, geografisches Verständnis & kosmisches Bewusstsein.',
    icon: '🗺️',
    color: 'from-blue-500 to-indigo-600',
    gradient: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    categories: [
      { id: 'geografie', title: 'Geografie', icon: '🌍' },
      { id: 'deutschland', title: 'Deutschland', icon: '🏰' },
      { id: 'weltall', title: 'Weltall', icon: '🚀' }
    ],
    // SVG path coordinates for Parietal Lobe (top back area)
    svgPath: 'M 370 100 C 450 110, 520 160, 530 230 C 510 270, 450 280, 380 230 C 410 180, 400 130, 370 100 Z',
    cx: 445,
    cy: 180
  },
  {
    id: 'occipital',
    name: 'Okzipitallappen',
    latinName: 'Lobus occipitalis',
    description: 'Visuelles Zentrum: Erkennung von Symbolen, Flaggen, Kunst & Film-Muster.',
    icon: '👁️',
    color: 'from-purple-500 to-pink-600',
    gradient: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    categories: [
      { id: 'kunst', title: 'Kunst', icon: '🎨' },
      { id: 'filme', title: 'Filme & Serien', icon: '🎬' },
      { id: 'flaggen', title: 'Flaggen erraten', icon: '🚩' }
    ],
    // SVG path coordinates for Occipital Lobe (back lower area)
    svgPath: 'M 530 230 C 560 280, 550 350, 490 380 C 450 370, 430 330, 440 290 C 450 280, 510 270, 530 230 Z',
    cx: 495,
    cy: 310
  },
  {
    id: 'temporal',
    name: 'Temporallappen',
    latinName: 'Lobus temporalis',
    description: 'Sprachverständnis, auditives Gedächtnis, Musik, Geschichten & Literatur.',
    icon: '🎵',
    color: 'from-emerald-500 to-teal-600',
    gradient: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    categories: [
      { id: 'musik', title: 'Musik', icon: '🎧' },
      { id: 'sprache', title: 'Sprache & Wörter', icon: '💬' },
      { id: 'literatur', title: 'Literatur', icon: '📖' }
    ],
    // SVG path coordinates for Temporal Lobe (middle lower area)
    svgPath: 'M 250 230 C 330 250, 400 250, 440 290 C 430 330, 370 370, 280 350 C 230 330, 210 270, 250 230 Z',
    cx: 330,
    cy: 300
  },
  {
    id: 'cerebellum',
    name: 'Kleinhirn',
    latinName: 'Cerebellum',
    description: 'Feinmotorik, Reaktionszeit, Bewegungskoordination, Sport & Gaming-Reflexe.',
    icon: '⚡',
    color: 'from-rose-500 to-red-600',
    gradient: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    categories: [
      { id: 'sport', title: 'Sport', icon: '⚽' },
      { id: 'videospiele', title: 'Videospiele', icon: '🎮' }
    ],
    // SVG path coordinates for Cerebellum (bottom rear)
    svgPath: 'M 450 370 C 510 380, 510 450, 440 470 C 370 470, 370 410, 430 380 C 430 370, 440 370, 450 370 Z',
    cx: 440,
    cy: 425
  },
  {
    id: 'limbic',
    name: 'Limbisches System',
    latinName: 'Systema limbicum',
    description: 'Emotionen, historisches Gedächtnis, Empathie, Naturverbundenheit & Politik.',
    icon: '🏛️',
    color: 'from-cyan-500 to-blue-600',
    gradient: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    categories: [
      { id: 'geschichte', title: 'Geschichte', icon: '📜' },
      { id: 'tiere', title: 'Tiere', icon: '🦁' },
      { id: 'natur', title: 'Natur & Umwelt', icon: '🌿' },
      { id: 'mythologie', title: 'Mythologie', icon: '⚡' },
      { id: 'politik', title: 'Politik & Gesellschaft', icon: '⚖️' },
      { id: 'wirtschaft', title: 'Wirtschaft', icon: '📊' }
    ],
    // SVG path coordinates for Limbic System (center core)
    svgPath: 'M 220 230 C 280 250, 350 250, 380 230 C 400 130, 200 120, 220 230 Z',
    cx: 270,
    cy: 195
  }
];

export const BrainVisualizer: React.FC<BrainVisualizerProps> = ({ userStats, onSelectCategory }) => {
  const [selectedLobe, setSelectedLobe] = useState<BrainLobe | null>(null);
  const [hoveredLobe, setHoveredLobe] = useState<string | null>(null);

  // Calculate mastery score for a given brain lobe
  const calculateLobeMastery = (lobe: BrainLobe) => {
    if (!userStats.categoryStats) return { percentage: 0, totalQuestions: 0, correct: 0 };

    let totalQuestions = 0;
    let correctAnswers = 0;

    lobe.categories.forEach(cat => {
      const stats = userStats.categoryStats?.[cat.id];
      if (stats) {
        totalQuestions += stats.totalQuestions || 0;
        correctAnswers += stats.correctAnswers || 0;
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    return { percentage, totalQuestions, correct: correctAnswers };
  };

  // Overall Brain Activity / Capacity
  const calculateOverallBrainMastery = () => {
    let totalScore = 0;
    BRAIN_LOBES.forEach(lobe => {
      totalScore += calculateLobeMastery(lobe).percentage;
    });
    return Math.round(totalScore / BRAIN_LOBES.length);
  };

  const overallMastery = calculateOverallBrainMastery();

  // Find weakest lobe to provide AI recommendation
  const getWeakestLobe = () => {
    let minMastery = 101;
    let weakest = BRAIN_LOBES[0];

    BRAIN_LOBES.forEach(lobe => {
      const m = calculateLobeMastery(lobe).percentage;
      if (m < minMastery) {
        minMastery = m;
        weakest = lobe;
      }
    });

    return weakest;
  };

  const weakestLobe = getWeakestLobe();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <Card className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden border-indigo-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Interaktive Wissens-Kartierung</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-3">
              <span>Dein Wissens-Gehirn</span>
              <span className="text-3xl">🧠</span>
            </h1>
            <p className="text-slate-300 max-w-xl text-sm md:text-base leading-relaxed">
              Jedes richtig geantwortete Quiz aktiviert deinen Neokortex. Klicke auf die Hirnareale, um deine Stärken zu analysieren und Schwachstellen gezielt zu trainieren!
            </p>
          </div>

          {/* Overall Capacity Circle Gauge */}
          <div className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shrink-0">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${overallMastery}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-amber-400"
                  strokeWidth="3.5"
                  strokeDasharray="0, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{overallMastery}%</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">Aktivität</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-300 mt-2">
              {overallMastery > 75 ? '🔥 Synapsen-Feuerwerk' : overallMastery > 40 ? '⚡ Hohe Hirnaktivität' : '🌱 Im Synapsen-Aufbau'}
            </span>
          </div>
        </div>
      </Card>

      {/* Main Interactive Brain & Advisor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Brain Map (SVG) */}
        <Card className="lg:col-span-8 bg-slate-900/90 dark:bg-slate-950 border-slate-800 p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
          {/* Subtle Background Synapse Network Grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative w-full max-w-[600px] aspect-[4/3] flex items-center justify-center">
            <svg viewBox="100 40 500 460" className="w-full h-full drop-shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
              <defs>
                {BRAIN_LOBES.map(lobe => (
                  <radialGradient id={`grad-${lobe.id}`} key={lobe.id} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={lobe.gradient} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={lobe.gradient} stopOpacity="0.4" />
                  </radialGradient>
                ))}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Brain Outer Silhouette / Glow Effect */}
              <path
                d="M 160 90 C 230 60, 320 60, 370 100 C 450 110, 520 160, 530 230 C 560 280, 550 350, 490 380 C 510 380, 510 450, 440 470 C 370 470, 370 410, 430 380 C 430 370, 370 370, 280 350 C 230 330, 210 270, 250 230 C 180 210, 140 150, 160 90 Z"
                fill="none"
                stroke="rgba(99, 102, 241, 0.2)"
                strokeWidth="6"
                filter="url(#glow)"
              />

              {/* Individual Brain Lobes */}
              {BRAIN_LOBES.map(lobe => {
                const mastery = calculateLobeMastery(lobe);
                const isHovered = hoveredLobe === lobe.id;
                const isSelected = selectedLobe?.id === lobe.id;

                return (
                  <g key={lobe.id} className="cursor-pointer">
                    <motion.path
                      d={lobe.svgPath}
                      fill={`url(#grad-${lobe.id})`}
                      stroke={isHovered || isSelected ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                      strokeWidth={isHovered || isSelected ? "3.5" : "2"}
                      opacity={isHovered ? 1 : isSelected ? 0.95 : 0.8}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      onMouseEnter={() => setHoveredLobe(lobe.id)}
                      onMouseLeave={() => setHoveredLobe(null)}
                      onClick={() => {
                        soundManager.init();
                        soundManager.playClick();
                        setSelectedLobe(lobe);
                      }}
                    />

                    {/* Glowing Synapse Center Node */}
                    <g
                      transform={`translate(${lobe.cx}, ${lobe.cy})`}
                      onClick={() => {
                        soundManager.init();
                        soundManager.playClick();
                        setSelectedLobe(lobe);
                      }}
                      onMouseEnter={() => setHoveredLobe(lobe.id)}
                      onMouseLeave={() => setHoveredLobe(null)}
                    >
                      <circle
                        r="22"
                        fill="rgba(15, 23, 42, 0.8)"
                        stroke={lobe.gradient}
                        strokeWidth="2.5"
                        className="shadow-lg"
                      />
                      <text
                        textAnchor="middle"
                        dy="6"
                        fontSize="18"
                        className="select-none pointer-events-none"
                      >
                        {lobe.icon}
                      </text>

                      {/* Mastery Badge Bubble */}
                      <g transform="translate(14, -14)">
                        <rect
                          width="32"
                          height="18"
                          rx="9"
                          fill={mastery.percentage > 50 ? '#10b981' : mastery.percentage > 0 ? '#3b82f6' : '#64748b'}
                          className="shadow"
                        />
                        <text
                          x="16"
                          y="13"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {mastery.percentage}%
                        </text>
                      </g>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 flex items-center justify-between w-full text-slate-400 text-xs px-2">
            <span>💡 Tipp: Klicke auf ein Areal für Details</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Echtzeit-Synapsen-Synchronisation
            </span>
          </div>
        </Card>

        {/* Brain Advisor & Region Quick Selector */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Prof. Brain Tip Box */}
          <Card className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border-indigo-700/50 p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl shrink-0">
                🧠
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-indigo-200 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Prof. Brain's Analyse
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {weakestLobe ? (
                    <>
                      Dein <strong className="text-amber-300">{weakestLobe.name}</strong> benötigt Training! Spiele Fragen in <span className="underline decoration-amber-400">{weakestLobe.categories.map(c => c.title).join(', ')}</span>, um neue Synapsen zu bilden.
                    </>
                  ) : (
                    'Ausgezeichnete Gehirnaktivität in allen Arealen!'
                  )}
                </p>
              </div>
            </div>
            {weakestLobe && (
              <Button
                variant="primary"
                size="sm"
                className="mt-4 w-full text-xs font-bold gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                onClick={() => setSelectedLobe(weakestLobe)}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{weakestLobe.name} trainieren</span>
              </Button>
            )}
          </Card>

          {/* List of Lobes Overview */}
          <div className="space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Hirnareale Übersicht
            </h3>
            <div className="space-y-2">
              {BRAIN_LOBES.map(lobe => {
                const mastery = calculateLobeMastery(lobe);
                const isSelected = selectedLobe?.id === lobe.id;

                return (
                  <motion.div
                    key={lobe.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      soundManager.init();
                      soundManager.playClick();
                      setSelectedLobe(lobe);
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lobe.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-sm">{lobe.name}</h4>
                        <p className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {lobe.categories.length} Kategorien
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {mastery.percentage}%
                      </span>
                      <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Detail Modal for Selected Lobe */}
      <AnimatePresence>
        {selectedLobe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Top Accent Gradient Header */}
              <div className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${selectedLobe.color}`} />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-inner">
                    {selectedLobe.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {selectedLobe.latinName}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {selectedLobe.name}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLobe(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedLobe.description}
              </p>

              {/* Progress & Stats */}
              {(() => {
                const stats = calculateLobeMastery(selectedLobe);
                return (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span>Areal-Aktivierung:</span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">{stats.percentage}%</span>
                    </div>
                    <ProgressBar progress={stats.percentage} />
                    <div className="flex justify-between text-[11px] font-medium text-slate-400">
                      <span>Beantwortete Fragen: {stats.totalQuestions}</span>
                      <span>Richtig: {stats.correct}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Categories list in this lobe */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                  Zugehörige Quiz-Kategorien
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {selectedLobe.categories.map(cat => {
                    const catStat = userStats.categoryStats?.[cat.id];
                    const accuracy = catStat && catStat.totalQuestions > 0
                      ? Math.round((catStat.correctAnswers / catStat.totalQuestions) * 100)
                      : 0;

                    return (
                      <div
                        key={cat.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {cat.title}
                            </h5>
                            <span className="text-[11px] text-slate-400">
                              {catStat ? `${catStat.roundsPlayed} Runden gespielt (${accuracy}% Genauigkeit)` : 'Noch nicht gespielt'}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          className="px-4 py-2 text-xs font-bold shrink-0 gap-1.5"
                          onClick={() => {
                            setSelectedLobe(null);
                            onSelectCategory(cat.id);
                          }}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Spielen</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer action */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedLobe(null)}
                  className="w-full"
                >
                  Schließen
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
