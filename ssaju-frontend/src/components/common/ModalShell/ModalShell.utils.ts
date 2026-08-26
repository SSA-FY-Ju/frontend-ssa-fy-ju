import type { Target, Transition } from 'framer-motion';

export const ACCENT_GRADIENTS = {
  purple: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(99,102,241,0.6), transparent)',
  red: 'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.7) 40%, rgba(251,146,60,0.7) 70%, transparent 100%)',
} as const;

export const DEFAULT_MOTION: { initial: Target; animate: Target; exit: Target; transition: Transition } = {
  initial: { opacity: 0, y: 32, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.96 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};
