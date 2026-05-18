'use client';

/** 사주프로필 탭 (T070) */

import type { SajuProfile } from '@/types/api';
import { OHangChart } from '@/components/visualization/OHangChart';

interface SajuProfileTabProps {
  profile: SajuProfile;
}

const card: React.CSSProperties = {
  backdropFilter: 'blur(12px)',
  background: 'rgba(139,92,246,0.05)',
  border: '1px solid rgba(139,92,246,0.2)',
  borderRadius: 20,
  padding: '20px 24px',
};

export function SajuProfileTab({ profile }: SajuProfileTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 일주 천간 — hero element */}
      <div
        className="animate-item flex items-center gap-6"
        style={{
          ...card,
          background: 'rgba(139,92,246,0.10)',
          border: '1px solid rgba(139,92,246,0.3)',
          animationDelay: '0s',
        }}
      >
        {/* 일주 천간 한자 크게 */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'rgba(139,92,246,0.2)',
            border: '1.5px solid rgba(139,92,246,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 24px rgba(139,92,246,0.25)',
          }}
        >
          <span
            className="font-black"
            style={{ color: '#c4b5fd', fontSize: 48, lineHeight: 1 }}
          >
            {profile.dayMaster}
          </span>
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#a78bfa', opacity: 0.7 }}>
            일주 천간
          </p>
          <p className="text-white text-sm leading-relaxed" style={{ opacity: 0.8 }}>
            {profile.personality}
          </p>
        </div>
      </div>

      {/* 오행 분포 */}
      <div className="animate-item" style={{ ...card, animationDelay: '0.1s' }}>
        <h3
          className="text-xs font-bold tracking-widest uppercase mb-4"
          style={{ color: '#a78bfa', opacity: 0.7 }}
        >
          오행 분포 (木火土金水)
        </h3>
        <OHangChart distribution={profile.oHangDistribution} />
      </div>

      {/* 십신 분포 */}
      <div className="animate-item" style={{ ...card, animationDelay: '0.2s' }}>
        <h3
          className="text-xs font-bold tracking-widest uppercase mb-3"
          style={{ color: '#a78bfa', opacity: 0.7 }}
        >
          십신 분포
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(profile.sipShinDistribution).map(([name, count]) => (
            <span
              key={name}
              className="px-3 py-1 text-sm rounded-full font-medium"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.35)',
                color: '#c4b5fd',
              }}
            >
              {name} <span style={{ opacity: 0.6 }}>{count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
