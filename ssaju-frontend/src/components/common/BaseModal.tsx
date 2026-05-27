'use client';

/**
 * 공통 모달 기반 컴포넌트
 *
 * 반복되는 모달 구조(고정 오버레이 → 백드롭 → 글래스모피즘 컨테이너 → 액센트 바)를 추상화.
 * 애니메이션 상태(opacity/transform)는 각 모달에서 backdropStyle/containerStyle로 주입.
 */

interface BaseModalProps {
  children: React.ReactNode;
  /** 제공 시 백드롭 클릭으로 닫힘 (closeOnBackdrop=false로 비활성화 가능) */
  onClose?: () => void;
  /** 컨테이너 최대 너비 px (기본 420) */
  maxWidth?: number;
  /** z-index (기본 50) */
  zIndex?: number;
  /** 상단 액센트 바 색상. false면 렌더링 안 함 (기본 'purple') */
  accentBar?: 'purple' | 'red' | false;
  /** false로 설정 시 백드롭 클릭 비활성화 (기본 true) */
  closeOnBackdrop?: boolean;
  /** 백드롭 기본 스타일에 병합/덮어쓰기 (opacity 애니메이션 등) */
  backdropStyle?: React.CSSProperties;
  /** 컨테이너 기본 스타일에 병합/덮어쓰기 (opacity/transform 애니메이션 등) */
  containerStyle?: React.CSSProperties;
  /**
   * 외부 고정 div의 className.
   * 제공 시 기본 'flex items-center justify-center' 대체.
   * 제공 시 외부 padding(0 16px)도 생략되므로, 필요하면 className에 직접 포함.
   * (예: FeedbackModal의 'flex items-end sm:items-center justify-center')
   */
  outerClassName?: string;
  /** 컨테이너 div에 추가할 className (Tailwind 반응형 spacing 등) */
  containerClassName?: string;
}

export function BaseModal({
  children,
  onClose,
  maxWidth = 420,
  zIndex = 50,
  accentBar = 'purple',
  closeOnBackdrop = true,
  backdropStyle,
  containerStyle,
  outerClassName,
  containerClassName,
}: BaseModalProps) {
  const accentGradient =
    accentBar === 'purple'
      ? 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(99,102,241,0.6), transparent)'
      : accentBar === 'red'
      ? 'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.7) 40%, rgba(251,146,60,0.7) 70%, transparent 100%)'
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={outerClassName ?? 'flex items-center justify-center'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        // outerClassName을 제공하면 padding 포함 여부를 className에서 제어
        ...(outerClassName ? {} : { padding: '0 16px' }),
      }}
    >
      {/* 백드롭 */}
      <div
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(4,2,18,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          ...backdropStyle,
        }}
      />

      {/* 글래스모피즘 컨테이너 */}
      <div
        className={containerClassName}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth,
          background: 'linear-gradient(150deg, rgba(30,20,60,0.75) 0%, rgba(15,10,35,0.8) 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 24,
          overflow: 'hidden',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          ...containerStyle,
        }}
      >
        {accentGradient && (
          <div style={{ height: 2, background: accentGradient }} />
        )}
        {children}
      </div>
    </div>
  );
}
