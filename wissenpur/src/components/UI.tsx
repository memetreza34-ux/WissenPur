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
  ...props
}) => {
  const baseStyles = 'group relative overflow-hidden inline-flex items-center justify-center font-extrabold rounded-2xl transition-all duration-300 disabled:opacity-50 cursor-pointer select-none border border-transparent';
  
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
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={(e) => {
        soundManager.init();
        soundManager.playClick();
        if (props.onClick) props.onClick(e);
      }}
      {...props}
    >
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <motion.div 
    onClick={() => {
      if (onClick) {
        soundManager.init();
        soundManager.playClick();
        onClick();
      }
    }}
    whileTap={onClick ? { scale: 0.98, y: 2 } : undefined}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={`glass-panel rounded-[2rem] p-6 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 active:bg-slate-50/50 dark:active:bg-slate-800/50' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

export const Badge: React.FC<{ icon: React.ReactNode; label: string | number; color: 'amber' | 'blue' | 'emerald' | 'rose' | 'slate' }> = ({ icon, label, color }) => {
  const colors = {
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 glow-amber backdrop-blur-md',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 glow-blue backdrop-blur-md',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 glow-emerald backdrop-blur-md',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-[0_0_15px_-3px_rgba(244,63,94,0.5)] backdrop-blur-md',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30 backdrop-blur-md shadow-lg'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-black text-xs border shadow-sm ${colors[color]}`}
    >
      <motion.span 
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="shrink-0"
      >
        {icon}
      </motion.span>
      <span className="tracking-tight">{label}</span>
    </motion.div>
  );
};

export const ProgressBar: React.FC<{ progress: number; color?: string; glow?: boolean }> = ({ progress, color = 'bg-gradient-to-r from-blue-500 to-indigo-600', glow = true }) => (
  <div className="w-full h-3 bg-slate-900/10 dark:bg-slate-100/10 rounded-full overflow-hidden relative shadow-inner backdrop-blur-sm">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`h-full ${color} relative z-10 rounded-full ${glow ? 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' : ''}`}
    >
      <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white/60 to-transparent blur-sm pointer-events-none" />
      <div className="absolute inset-0 w-[200%] bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-shimmer opacity-40 pointer-events-none" />
    </motion.div>
  </div>
);
