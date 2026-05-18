'use client';

/** 부의운 탭 (T071) */

import type { WealthStyle } from '@/types/api';

interface WealthStyleTabProps {
  wealthStyle: WealthStyle;
}

const FIELDS: { key: keyof WealthStyle; label: string; icon: string }[] = [
  { key: 'incomeSource',    label: '주요 소득원', icon: '💼' },
  { key: 'investmentStyle', label: '투자 성향',   icon: '📈' },
  { key: 'financialAdvice', label: '재무 조언',   icon: '🪙' },
  { key: 'additionalIncome',label: '추가 수입',   icon: '✨' },
];

export function WealthStyleTab({ wealthStyle }: WealthStyleTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {FIELDS.map(({ key, label, icon }, i) => (
        <div
          key={key}
          className="animate-item flex gap-4 items-start"
          style={{
            backdropFilter: 'blur(12px)',
            background: 'rgba(234,179,8,0.05)',
            border: '1px solid rgba(234,179,8,0.18)',
            borderRadius: 20,
            padding: '20px 24px',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {/* Icon */}
          <span
            aria-hidden="true"
            style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}
          >
            {icon}
          </span>

          <div>
            <h3
              className="font-bold text-sm mb-1"
              style={{ color: '#fde047', letterSpacing: '0.01em' }}
            >
              {label}
            </h3>
            <p className="text-white text-sm leading-relaxed" style={{ opacity: 0.85 }}>
              {wealthStyle[key]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
