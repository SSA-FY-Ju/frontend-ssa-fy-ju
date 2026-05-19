'use client';

/**
 * 오행 분포 막대 차트 (T075)
 *
 * 木火土金水 5개 오행의 개수를 Recharts BarChart로 시각화
 * 전통 색상: 木-초록, 火-빨강, 土-갈색, 金-금색, 水-파랑
 */

import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';

const OHANG_COLORS: Record<string, string> = {
  木: '#22c55e',
  火: '#ef4444',
  土: '#c47c2b',
  金: '#ffd700',
  水: '#3b82f6',
};

const OHANG_LABELS: Record<string, string> = {
  木: '목 (나무)',
  火: '화 (불)',
  土: '토 (흙)',
  金: '금 (쇠)',
  水: '수 (물)',
};

const OHANG_DESC: Record<string, string> = {
  木: '성장, 창조, 도전',
  火: '열정, 직관, 표현',
  土: '안정, 신뢰, 중재',
  金: '결단, 원칙, 완성',
  水: '지혜, 유연, 탐구',
};

interface OHangChartProps {
  distribution: Record<string, number>;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload as { name: string; value: number };
  const color = OHANG_COLORS[name] ?? '#6b7280';
  return (
    <div
      style={{
        backdropFilter: 'blur(12px)',
        background: 'rgba(10,12,28,0.92)',
        border: `1px solid ${color}55`,
        borderRadius: 10,
        padding: '8px 14px',
        boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 10px ${color}22`,
        pointerEvents: 'none',
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>
        {OHANG_LABELS[name] ?? name}
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
        {OHANG_DESC[name]}
      </p>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
        {value}개
      </p>
    </div>
  );
}

export function OHangChart({ distribution }: OHangChartProps) {
  const data = Object.entries(distribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: '#fff8a8', fontSize: 14 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={OHANG_COLORS[entry.name] ?? '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
