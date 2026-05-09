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
  const baseStyles = 'inline-flex items-center justify-center font-extrabold rounded-2xl transition-all disabled:opacity-50 cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-blue-600 text-white shadow-[0_10px_25px_-8px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-[0_15px_30px_-10px_rgba(37,99,235,0.5)] active:scale-[0.98]',
    secondary: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-700 active:scale-[0.98]',
    outline: 'border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98]',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98]',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_10px_25px_-8px_rgba(244,63,94,0.4)] active:scale-[0.98]'
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
      {children}
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
    whileTap={onClick ? { scale: 0.98, y: 1 } : undefined}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={`bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-slate-100/60 dark:border-slate-800/60 ${onClick ? 'cursor-pointer hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 active:bg-slate-50/50 dark:active:bg-slate-800/50' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

export const Badge: React.FC<{ icon: React.ReactNode; label: string | number; color: 'amber' | 'blue' | 'emerald' | 'rose' | 'slate' }> = ({ icon, label, color }) => {
  const colors = {
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/30 shadow-amber-100/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/30 shadow-blue-100/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30 shadow-emerald-100/20',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/30 shadow-rose-100/20',
    slate: 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-100/50 dark:border-slate-700/50 shadow-slate-100/20'
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

export const ProgressBar: React.FC<{ progress: number; color?: string }> = ({ progress, color = 'bg-gradient-to-r from-blue-500 to-indigo-600' }) => (
  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner dark:shadow-none">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`h-full ${color} relative z-10 rounded-full`}
    >
      <div className="absolute top-0 right-0 w-4 h-full bg-white/30 blur-sm" />
    </motion.div>
    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress-stripe_1s_linear_infinite] opacity-30" />
  </div>
);
