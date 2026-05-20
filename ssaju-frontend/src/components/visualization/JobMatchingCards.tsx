'use client';

/**
 * 직무별 매칭도 — 번호 리스트 에디토리얼 스타일
 */

interface JobMatchCard {
  jobTitle: string;
  score: number;
  reason: string;
  recommendation: string;
  isRecommended: boolean;
}

interface JobMatchingCardsProps {
  cards: JobMatchCard[];
}

export function JobMatchingCards({ cards }: JobMatchingCardsProps) {
  return (
    <div className="flex flex-col">
      {cards.map((card, i) => {
        const scoreColor =
          card.score >= 80 ? '#34d399' : card.score >= 60 ? '#fbbf24' : '#f87171';

        return (
          <div key={card.jobTitle}>
            <div style={{ display: 'flex', gap: 20, padding: '22px 0' }}>
              {/* 번호 */}
              <div style={{ flexShrink: 0, width: 28, textAlign: 'right', paddingTop: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(196,181,253,0.3)', letterSpacing: '0.05em' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* 본문 */}
              <div style={{ flex: 1 }}>
                {/* 직무명 + 뱃지 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                    {card.jobTitle}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: card.isRecommended ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                      border: `1px solid ${card.isRecommended ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)'}`,
                      color: card.isRecommended ? '#34d399' : '#f87171',
                      flexShrink: 0,
                    }}
                  >
                    {card.recommendation}
                  </span>
                </div>

                {/* 점수 + 바 */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>매칭도</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor }}>{card.score} / 100</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${card.score}%`,
                        height: '100%',
                        background: scoreColor,
                        borderRadius: 999,
                        boxShadow: `0 0 6px ${scoreColor}66`,
                        transition: 'width 0.7s ease',
                      }}
                    />
                  </div>
                </div>

                {/* 이유 */}
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                  {card.reason}
                </p>
              </div>
            </div>

            {/* 구분선 */}
            {i < cards.length - 1 && (
              <div style={{ height: 1, background: 'rgba(139,92,246,0.08)', margin: '0 0 0 48px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
