'use client';

/** 부의운 탭 — 정의 목록 스타일, 컨테이너 없음 */

import type { WealthStyle } from '@/types/api';

interface WealthStyleTabProps {
  wealthStyle: WealthStyle;
}

const FIELDS: { key: keyof WealthStyle; label: string }[] = [
  { key: 'incomeSource',    label: '주요 소득원' },
  { key: 'investmentStyle', label: '투자 성향'   },
  { key: 'financialAdvice', label: '재무 조언'   },
  { key: 'additionalIncome',label: '추가 수입'   },
];

export function WealthStyleTab({ wealthStyle }: WealthStyleTabProps) {
  return (
    <div className="flex flex-col">
      {FIELDS.map(({ key, label }, i) => (
        <div key={key}>
          <div
            className="animate-item"
            style={{
              padding: '24px 0',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {/* 라벨 */}
            <p
              className="animate-item"
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.22em',
                color: '#eab308',
                opacity: 0.65,
                textTransform: 'uppercase',
                marginBottom: 10,
                animationDelay: `${i * 0.12}s`,
              }}
            >
              {label}
            </p>

            {/* 값 — 첫 번째는 히어로 사이즈 */}
            <p
              className="animate-item"
              style={{
                fontSize: i === 0
                  ? 'clamp(1.25rem, 4vw, 1.8rem)'
                  : '1rem',
                fontWeight: i === 0 ? 800 : 500,
                color: i === 0 ? '#fff' : 'rgba(255,255,255,0.78)',
                lineHeight: 1.55,
                letterSpacing: i === 0 ? '-0.01em' : 'normal',
                textShadow: i === 0 ? '0 0 30px rgba(234,179,8,0.25)' : 'none',
                animationDelay: `${i * 0.12 + 0.07}s`,
              }}
            >
              {wealthStyle[key]}
            </p>
          </div>

          {/* 구분선 (마지막 제외) */}
          {i < FIELDS.length - 1 && (
            <div style={{ height: 1, background: 'rgba(234,179,8,0.12)' }} />
          )}
        </div>
      ))}
    </div>
  );
}
