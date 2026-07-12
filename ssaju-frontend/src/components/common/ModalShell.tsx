'use client';

import { motion, type Target, type Transition } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const ACCENT_GRADIENTS = {
  purple: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(99,102,241,0.6), transparent)',
  red: 'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.7) 40%, rgba(251,146,60,0.7) 70%, transparent 100%)',
} as const;

const DEFAULT_MOTION: { initial: Target; animate: Target; exit: Target; transition: Transition } = {
  initial: { opacity: 0, y: 32, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.96 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 카드 최대 너비(px) */
  maxWidth: number;
  /** 카드 모서리 반경(px, 기본 24) */
  borderRadius?: number;
  /** 카드 배경/테두리/그림자 등. background/border 레이어를 직접 그리는 모달은 생략 가능 */
  cardStyle?: React.CSSProperties;
  /** 카드 상단 2px 그라디언트 바 */
  accentBar?: keyof typeof ACCENT_GRADIENTS;
  /** DialogContent에 병합할 클래스 (위치 오버라이드, 좌우 마진 등) */
  contentClassName?: string;
  /** 진입/퇴장 모션 커스터마이즈 (기본값은 AuthModal과 동일) */
  motionProps?: Partial<typeof DEFAULT_MOTION>;
  children: React.ReactNode;
}

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
