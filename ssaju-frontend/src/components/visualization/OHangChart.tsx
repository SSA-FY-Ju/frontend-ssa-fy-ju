'use client';

/**
 * 오행 분포 막대 차트 (T075)
 *
 * 木火土金水 5개 오행의 개수를 Recharts BarChart로 시각화
 * 전통 색상: 木-초록, 火-빨강, 土-갈색, 金-금색, 水-파랑
 */

import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const OHANG_COLORS: Record<string, string> = {
  木: '#22c55e',
  火: '#ef4444',
  土: '#92400e',
  金: '#ffd700',
  水: '#3b82f6',
};

interface OHangChartProps {
  distribution: Record<string, number>;
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
            contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #2a3050', color: '#fff' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
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
