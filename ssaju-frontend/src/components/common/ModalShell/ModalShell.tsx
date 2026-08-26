'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ModalShellProps } from './ModalShell.types';
import { ACCENT_GRADIENTS, DEFAULT_MOTION } from './ModalShell.utils';

/**
 * 모든 모달이 공유하는 Dialog + 진입 애니메이션 카드 뼈대.
 * 배경/테두리/장식은 각 모달이 children으로 직접 그린다.
 */
export function ModalShell({
  open,
  onOpenChange,
  maxWidth,
  borderRadius = 24,
  cardStyle,
  accentBar,
  contentClassName,
  motionProps,
  children,
}: ModalShellProps) {
  const m = { ...DEFAULT_MOTION, ...motionProps };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ maxWidth }}
        className={cn(
          'max-w-none border-0 bg-transparent p-0 shadow-none [&>button:last-child]:hidden',
          contentClassName
        )}
      >
        <motion.div
          initial={m.initial}
          animate={m.animate}
          exit={m.exit}
          transition={m.transition}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth,
            borderRadius,
            overflow: 'hidden',
            ...cardStyle,
          }}
        >
          {accentBar && (
            <div style={{ height: 2, background: ACCENT_GRADIENTS[accentBar] }} />
          )}
          {children}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
