'use client';

/** 부의운 탭 (T071) */

import type { WealthStyle } from '@/types/api';

interface WealthStyleTabProps {
  wealthStyle: WealthStyle;
}

const FIELDS: { key: keyof WealthStyle; label: string }[] = [
  { key: 'incomeSource', label: '주요 소득원' },
  { key: 'financialAdvice', label: '재무 조언' },
  { key: 'investmentStyle', label: '투자 성향' },
  { key: 'additionalIncome', label: '추가 수입' },
];

export function WealthStyleTab({ wealthStyle }: WealthStyleTabProps) {
  return (
    <div className="flex flex-col gap-3">
      {FIELDS.map(({ key, label }) => (
        <div key={key} className="bg-night-800 rounded-lg p-4">
          <h3 className="text-star-400 text-xs font-medium mb-1">{label}</h3>
          <p className="text-white text-sm leading-relaxed">{wealthStyle[key]}</p>
        </div>
      ))}
    </div>
  );
}
