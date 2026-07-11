'use client';

const STAT_TYPES = [
  { key: 'TIMING', label: '관운 분석', icon: '🌟', color: '#a78bfa' },
  { key: 'CONSULTATION', label: 'AI 컨설팅', icon: '🤖', color: '#60a5fa' },
  { key: 'COMPATIBILITY', label: '기업 궁합', icon: '🏢', color: '#34d399' },
] as const;

interface ProfileCardProps {
  name: string | undefined;
  email: string | undefined;
  isLoading: boolean;
  totalCount: number;
  typeCounts: Record<'TIMING' | 'CONSULTATION' | 'COMPATIBILITY', number>;
}

/** 마이페이지 상단 프로필 + 분석 현황 통계 카드 */
export function ProfileCard({ name, email, isLoading, totalCount, typeCounts }: ProfileCardProps) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div
      className="flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(30,20,60,0.97) 0%, rgba(15,10,40,0.98) 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 20,
        padding: '20px 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="flex items-center gap-4">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 0 20px rgba(109,40,217,0.4)',
            border: '2px solid rgba(167,139,250,0.3)',
          }}
        >
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base leading-tight truncate">
            {name ?? '-'}
          </p>
          {email && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(196,181,253,0.45)' }}>
              {email}
            </p>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(139,92,246,0.15)', margin: '16px 0 12px' }} />

      <div>
        <p className="text-xs mb-2.5 font-medium" style={{ color: 'rgba(167,139,250,0.55)' }}>
          나의 분석 현황
        </p>
        <div className="grid grid-cols-4 gap-2">
          <div
            style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 12,
              padding: '10px 8px',
              textAlign: 'center',
            }}
          >
            <p className="text-base mb-0.5">✨</p>
            <p className="text-lg font-black mb-0.5" style={{ color: '#a78bfa' }}>
              {isLoading ? '…' : totalCount}
            </p>
            <p className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>
              전체
            </p>
          </div>

          {STAT_TYPES.map((t) => (
            <div
              key={t.key}
              style={{
                background: `rgba(${t.key === 'TIMING' ? '139,92,246' : t.key === 'CONSULTATION' ? '96,165,250' : '52,211,153'},0.07)`,
                border: `1px solid rgba(${t.key === 'TIMING' ? '139,92,246' : t.key === 'CONSULTATION' ? '96,165,250' : '52,211,153'},0.18)`,
                borderRadius: 12,
                padding: '10px 8px',
                textAlign: 'center',
              }}
            >
              <p className="text-base mb-0.5">{t.icon}</p>
              <p className="text-lg font-black mb-0.5" style={{ color: t.color }}>
                {isLoading ? '…' : typeCounts[t.key]}
              </p>
              <p className="text-xs leading-tight" style={{ color: 'rgba(148,163,184,0.5)' }}>
                {t.label.replace(' ', '\n')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
