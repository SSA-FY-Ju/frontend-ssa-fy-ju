'use client';

/** 경력로드맵 탭 (T072) */

import type { CareerRoadmap } from '@/types/api';

interface CareerRoadmapTabProps {
  roadmap: CareerRoadmap;
}

const STAGES = [
  { key: 'shortTerm' as const, label: '단기 (0-2년)', icon: '🌱' },
  { key: 'midTerm' as const, label: '중기 (3-5년)', icon: '🌿' },
  { key: 'longTerm' as const, label: '최종 목표', icon: '🌟' },
];

export function CareerRoadmapTab({ roadmap }: CareerRoadmapTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {STAGES.map(({ key, label, icon }, i) => (
        <div key={key} className="flex gap-4">
          {/* 타임라인 */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-star-500/20 border border-star-500 flex items-center justify-center text-sm">
              {icon}
            </div>
            {i < STAGES.length - 1 && (
              <div className="w-px flex-1 bg-night-700 mt-1" />
            )}
          </div>

          {/* 내용 */}
          <div className="flex-1 bg-night-800 rounded-lg p-4 mb-4">
            <h3 className="text-star-400 text-sm font-medium mb-1">{label}</h3>
            <p className="text-white text-sm leading-relaxed">{roadmap[key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
