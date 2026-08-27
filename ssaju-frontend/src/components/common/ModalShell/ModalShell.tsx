'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ModalShellProps } from './ModalShell.types';
import { ACCENT_GRADIENTS } from './ModalShell.utils';

/**
 * 모든 모달이 공유하는 Dialog + 진입 애니메이션 카드 뼈대.
 * 배경/테두리/장식은 각 모달이 children으로 직접 그린다.
 *
 * framer-motion 을 쓰지 않는 이유:
 *
 * 이 컴포넌트가 motion.div 로 하던 일은 페이드 + 위로 슬라이드 + 살짝 확대
 * (opacity 0→1, y 32→0, scale 0.94→1) 뿐이었다. 그 대가로 framer-motion
 * 청크 95 kB(raw)가 모달을 쓰는 모든 라우트의 First Load JS 에 들어왔다
 * (/my-page·/consultation·/compatibility/result 가 각각 +53 kB).
 *
 * 그런데 감싸고 있는 DialogContent 가 이미 같은 효과를 CSS 로 하고 있다:
 *   data-[state=open]:animate-in fade-in-0 zoom-in-95 slide-in-from-top-[48%]
 * 즉 JS 애니메이션이 CSS 애니메이션 위에 중복으로 얹혀 있었다.
 *
 * exit 는 애초에 동작하지 않았다 — framer-motion 의 exit 는 <AnimatePresence>
 * 안에서만 유효한데 여기엔 없다. 닫힐 때 애니메이션은 지금도 Radix 의
 * data-[state=closed] CSS 가 처리한다.
 *
 * 그래서 motion.div 를 平 div 로 바꾸고 진입 모션은 DialogContent 에 맡긴다.
 * 모달별 모션 미세조정(motionProps)은 함께 제거했다 — 차이가 y 16 vs 32,
 * duration 0.28 vs 0.4 수준이라 CSS 한 겹으로 충분하다.
 */
export function ModalShell({
  open,
  onOpenChange,
  maxWidth,
  borderRadius = 24,
  cardStyle,
  accentBar,
  contentClassName,
  children,
}: ModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ maxWidth }}
        className={cn(
          'max-w-none border-0 bg-transparent p-0 shadow-none [&>button:last-child]:hidden',
          'duration-300',
          contentClassName
        )}
      >
        <div
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
