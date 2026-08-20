/**
 * Centralized Macro Design System Tokens & Cursor-Style Theme Constants
 * Ensures 100% color serialization, responsiveness, and uniformity across all components.
 */

export const MACRO_COLORS = {
  protein: {
    hex: '#8b5cf6', // Electric Violet
    label: 'Protein',
    shortLabel: 'Prot',
    text: 'text-violet-400',
    textLight: 'text-violet-700',
    bg: 'bg-violet-500',
    bgLight: 'bg-violet-600',
    border: 'border-violet-500/30',
    badgeDark: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    badgeLight: 'bg-violet-50 text-violet-700 border-violet-200',
    hoverBorder: 'hover:border-violet-500/50',
  },
  carbs: {
    hex: '#f59e0b', // Warm Amber Gold
    label: 'Carbs',
    shortLabel: 'Carbs',
    text: 'text-amber-400',
    textLight: 'text-amber-700',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500',
    border: 'border-amber-500/30',
    badgeDark: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    badgeLight: 'bg-amber-50 text-amber-700 border-amber-200',
    hoverBorder: 'hover:border-amber-500/50',
  },
  fat: {
    hex: '#06b6d4', // Electric Cyan
    label: 'Fat',
    shortLabel: 'Fat',
    text: 'text-cyan-400',
    textLight: 'text-cyan-700',
    bg: 'bg-cyan-400',
    bgLight: 'bg-cyan-500',
    border: 'border-cyan-500/30',
    badgeDark: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    badgeLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    hoverBorder: 'hover:border-cyan-500/50',
  },
  kcal: {
    hex: '#f97316', // Vibrant Energy Coral / Orange
    hexExceeded: '#f97316', // Native element color
    label: 'Calories',
    shortLabel: 'Kcal',
    text: 'text-orange-400',
    textLight: 'text-orange-600',
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-500',
    border: 'border-orange-500/30',
    badgeDark: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    badgeLight: 'bg-orange-50 text-orange-700 border-orange-200',
    hoverBorder: 'hover:border-orange-500/50',
  },
} as const;

/**
 * Format massive numbers (e.g. 1,000,000) into compact, unbreakable text
 */
export const formatCompactNumber = (val: number): string => {
  if (!val || val === 0) return '0';
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (val >= 10000) {
    return `${(val / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return val.toLocaleString();
};

/**
 * Cursor-style High-Contrast Obsidian Theme Classes
 */
export const CURSOR_THEME = {
  dark: {
    canvas: 'bg-[#080808] text-white',
    header: 'bg-[#080808]/85 border-white/[0.08] text-white',
    card: 'bg-[#121214] border-white/[0.08] text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)]',
    cardHover: 'hover:border-white/[0.16] hover:shadow-[0_12px_40px_rgba(0,0,0,0.8)]',
    elevated: 'bg-[#18181b] border-white/[0.08] text-white',
    input: 'bg-[#18181b] border-white/[0.12] text-white placeholder:text-zinc-500 focus:border-white/30',
    pill: 'bg-[#141416] border-white/[0.08]',
    pillActive: 'bg-white text-black font-black shadow-md',
    pillInactive: 'text-zinc-400 hover:text-white',
    primaryButton: 'bg-white text-black hover:bg-zinc-200 font-extrabold shadow-sm active:scale-95 transition-all',
    secondaryButton: 'bg-[#18181b] hover:bg-[#222226] text-zinc-200 border border-white/[0.08] active:scale-95 transition-all',
    dangerButton: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30',
    divider: 'border-white/[0.08]',
    textMuted: 'text-zinc-500',
    textSecondary: 'text-zinc-400',
  },
  light: {
    canvas: 'bg-slate-50 text-slate-900',
    header: 'bg-white/85 border-slate-200 text-slate-900 shadow-xs',
    card: 'bg-white/95 backdrop-blur-xs border-slate-200/80 hover:border-slate-300 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]',
    cardHover: 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]',
    elevated: 'bg-slate-100 border-slate-200 text-slate-900',
    input: 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-500',
    pill: 'bg-slate-100/90 border-slate-300/80',
    pillActive: 'bg-black text-white font-black shadow-sm',
    pillInactive: 'text-slate-600 hover:text-slate-900',
    primaryButton: 'bg-black hover:bg-zinc-800 text-white font-extrabold shadow-sm active:scale-95 transition-all',
    secondaryButton: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/80 active:scale-95 transition-all',
    dangerButton: 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200',
    divider: 'border-slate-200/80',
    textMuted: 'text-slate-400',
    textSecondary: 'text-slate-600',
  },
};
