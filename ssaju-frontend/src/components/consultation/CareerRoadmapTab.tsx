'use client';

/** 경력로드맵 탭 (T072) */

import type { CareerRoadmap } from '@/types/api';

interface CareerRoadmapTabProps {
  roadmap: CareerRoadmap;
}

const STAGES = [
  { key: 'shortTerm' as const, label: '단기', period: '0 — 2년', icon: '🌱', color: '#67e8f9' },
  { key: 'midTerm'   as const, label: '중기', period: '3 — 5년', icon: '🌿', color: '#22d3ee' },
  { key: 'longTerm'  as const, label: '장기', period: '최종 목표', icon: '🌟', color: '#06b6d4' },
];

export function CareerRoadmapTab({ roadmap }: CareerRoadmapTabProps) {
  return (
    <div className="flex flex-col gap-0">
      {STAGES.map(({ key, label, period, icon, color }, i) => (
        <div
          key={key}
          className="animate-item flex gap-5"
          style={{ animationDelay: `${i * 0.12}s` }}
        >
          {/* Timeline column */}
          <div className="flex flex-col items-center" style={{ width: 48, flexShrink: 0 }}>
            {/* Node */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(6,182,212,0.12)',
                border: `2px solid ${color}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                boxShadow: `0 0 16px ${color}33`,
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
            {/* Connector line */}
            {i < STAGES.length - 1 && (
              <div
                style={{
                  width: 2,
                  flexGrow: 1,
                  minHeight: 24,
                  background: `linear-gradient(180deg, ${color}55, rgba(6,182,212,0.1))`,
                  margin: '4px 0',
                }}
              />
            )}
          </div>

          {/* Content card */}
          <div
            style={{
              flex: 1,
              backdropFilter: 'blur(12px)',
              background: 'rgba(6,182,212,0.04)',
              border: '1px solid rgba(6,182,212,0.18)',
              borderRadius: 18,
              padding: '18px 22px',
              marginBottom: i < STAGES.length - 1 ? 12 : 0,
            }}
          >
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="font-black text-base" style={{ color }}>
                {label}
              </h3>
              <span className="text-xs font-medium" style={{ color, opacity: 0.55 }}>
                {period}
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed" style={{ opacity: 0.85 }}>
              {roadmap[key]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
