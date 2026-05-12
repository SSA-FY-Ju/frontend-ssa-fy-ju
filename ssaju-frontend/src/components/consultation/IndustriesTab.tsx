'use client';

/** 추천산업 탭 (T067) */

import type { IndustryRecommendation } from '@/types/api';

interface IndustriesTabProps {
  industries: IndustryRecommendation[];
}

export function IndustriesTab({ industries }: IndustriesTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {industries.map((item, i) => (
        <div key={i} className="bg-night-800 rounded-lg p-4">
          <h3 className="text-star-400 font-bold mb-1">{item.industryName}</h3>
          <p className="text-white text-sm mb-3 leading-relaxed">{item.reason}</p>
          <div className="flex flex-wrap gap-2">
            {item.recommendedRoles.map((role) => (
              <span key={role} className="px-2 py-1 bg-night-700 text-star-300 text-xs rounded-full">
                {role}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
