'use client';

/** 추천산업 탭 (T067) */

import type { IndustryRecommendation } from '@/types/api';

interface IndustriesTabProps {
  industries: IndustryRecommendation[];
}

export function IndustriesTab({ industries }: IndustriesTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {industries.map((item, i) => (
        <div
          key={i}
          className="animate-item"
          style={{
            backdropFilter: 'blur(12px)',
            background: 'rgba(16,185,129,0.05)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 20,
            padding: '24px 24px 24px 28px',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {/* Left accent bar */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              background: 'linear-gradient(180deg, #10b981, #059669)',
              borderRadius: '20px 0 0 20px',
            }}
          />

          {/* Industry name */}
          <h3
            className="font-black mb-2"
            style={{ color: '#34d399', fontSize: '1.25rem', letterSpacing: '-0.01em' }}
          >
            {item.industryName}
          </h3>

          {/* Reason */}
          <p className="text-white text-sm leading-relaxed mb-4" style={{ opacity: 0.85 }}>
            {item.reason}
          </p>

          {/* Role badges */}
          <div className="flex flex-wrap gap-2">
            {item.recommendedRoles.map((role) => (
              <span
                key={role}
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.35)',
                  color: '#6ee7b7',
                }}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
