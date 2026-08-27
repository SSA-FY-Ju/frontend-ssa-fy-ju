import type { CSSProperties, ReactNode } from 'react';
import type { ACCENT_GRADIENTS } from './ModalShell.utils';

export interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 카드 최대 너비(px) */
  maxWidth: number;
  /** 카드 모서리 반경(px, 기본 24) */
  borderRadius?: number;
  /** 카드 배경/테두리/그림자 등. background/border 레이어를 직접 그리는 모달은 생략 가능 */
  cardStyle?: CSSProperties;
  /** 카드 상단 2px 그라디언트 바 */
  accentBar?: keyof typeof ACCENT_GRADIENTS;
  /** DialogContent에 병합할 클래스 (위치 오버라이드, 좌우 마진 등) */
  contentClassName?: string;
  children: ReactNode;
}
