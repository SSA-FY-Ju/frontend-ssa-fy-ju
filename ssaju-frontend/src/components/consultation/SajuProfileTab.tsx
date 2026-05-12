'use client';

/** 사주프로필 탭 (T070) */

import type { SajuProfile } from '@/types/api';
import { OHangChart } from '@/components/visualization/OHangChart';

interface SajuProfileTabProps {
  profile: SajuProfile;
}

export function SajuProfileTab({ profile }: SajuProfileTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 일주 천간 */}
      <div className="bg-night-800 rounded-lg p-4 text-center">
        <p className="text-star-300 text-sm mb-1">일주 천간</p>
        <p className="text-star-500 text-5xl font-bold">{profile.dayMaster}</p>
      </div>

      {/* 성격 특성 */}
      <div className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-sm font-medium mb-2">성격 특성</h3>
        <p className="text-white text-sm leading-relaxed">{profile.personality}</p>
      </div>

      {/* 오행 분포 */}
      <div className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-sm font-medium mb-3">오행 분포 (木火土金水)</h3>
        <OHangChart distribution={profile.oHangDistribution} />
      </div>

      {/* 십신 분포 */}
      <div className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-sm font-medium mb-2">십신 분포</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(profile.sipShinDistribution).map(([name, count]) => (
            <span key={name} className="px-3 py-1 bg-night-700 text-star-300 text-sm rounded-full">
              {name} {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
