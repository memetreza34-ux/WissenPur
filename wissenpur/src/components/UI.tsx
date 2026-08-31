import React from 'react';
import { motion } from 'motion/react';
import { soundManager } from '../lib/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'group relative overflow-hidden inline-flex items-center justify-center font-extrabold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950';

  const variants = {
    primary: 'bg-blue-600 text-white shadow-[0_10px_25px_-8px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-[0_15px_30px_-10px_rgba(37,99,235,0.8)] hover:border-blue-400 active:translate-y-1',
    secondary: 'glass-card text-slate-900 dark:text-white hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:shadow-xl active:translate-y-1',
    outline: 'border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg active:translate-y-1',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 active:translate-y-1',
    danger: 'bg-rose-500 text-white shadow-[0_10px_25px_-8px_rgba(244,63,94,0.4)] hover:bg-rose-600 hover:shadow-[0_15px_30px_-10px_rgba(244,63,94,0.8)] hover:border-rose-400 active:translate-y-1'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5 text-base',
    lg: 'px-8 py-4.5 text-lg',
    xl: 'px-10 py-5.5 text-xl'
  };

  return (
    <motion.button
      {...props}
      type={type}
      whileTap={props.disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={(event) => {
        if (!props.disabled) {
          soundManager.init();
          soundManager.playClick();
        }
        onClick?.(event);
      }}
    >
      <div className="pointer-events-none absolute inset-0 h-full w-[200%] -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, ariaLabel }) => (
  <motion.div
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    aria-label={onClick ? ariaLabel : undefined}
    onClick={() => {
      if (onClick) {
        soundManager.init();
        soundManager.playClick();
        onClick();
      }
    }}
    onKeyDown={(event) => {
      if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      soundManager.init();
      soundManager.playClick();
      onClick();
    }}
    whileTap={onClick ? { scale: 0.98, y: 2 } : undefined}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className={`glass-panel rounded-[2rem] p-6 ${onClick ? 'cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl active:bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:active:bg-slate-800/50' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

export const Badge: React.FC<{ icon: React.ReactNode; label: string | number; color: 'amber' | 'blue' | 'emerald' | 'rose' | 'slate' }> = ({ icon, label, color }) => {
  const colors = {
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 glow-amber backdrop-blur-md',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 glow-blue backdrop-blur-md',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 glow-emerald backdrop-blur-md',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30 shadow-[0_0_15px_-3px_rgba(244,63,94,0.5)] backdrop-blur-md',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30 backdrop-blur-md shadow-lg'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-1.5 text-xs font-black shadow-sm ${colors[color]}`}
    >
      <motion.span
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="shrink-0"
        aria-hidden="true"
      >
        {icon}
      </motion.span>
      <span className="tracking-tight">{label}</span>
    </motion.div>
  );
};

interface ProgressBarProps {
  progress?: number;
  value?: number;
  color?: string;
  glow?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  value,
  color = 'bg-gradient-to-r from-blue-500 to-indigo-600',
  glow = true,
  label = 'Fortschritt',
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress ?? value ?? 0));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(normalizedProgress)}
      className="relative h-3 w-full overflow-hidden rounded-full bg-slate-900/10 shadow-inner backdrop-blur-sm dark:bg-slate-100/10"
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${normalizedProgress}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`relative z-10 h-full rounded-full ${color} ${glow ? 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' : ''}`}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/60 to-transparent blur-sm" />
        <div className="pointer-events-none absolute inset-0 w-[200%] animate-shimmer bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-40" />
      </motion.div>
    </div>
  );
};
