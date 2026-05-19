'use client';

/** 사주프로필 탭 — 일주 천간 중앙 배치 + 오행/십신 */

import type { SajuProfile } from '@/types/api';
import { OHangChart } from '@/components/visualization/OHangChart';

interface SajuProfileTabProps {
  profile: SajuProfile;
}

export function SajuProfileTab({ profile }: SajuProfileTabProps) {
  return (
    <div className="flex flex-col gap-0">

      {/* ── 일주 천간 히어로 — 중앙 배치 ── */}
      <div
        className="animate-item"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingBottom: 36,
          position: 'relative',
          animationDelay: '0s',
        }}
      >
        {/* 배경 방사형 glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <p
          className="animate-item"
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.25em',
            color: '#a78bfa',
            opacity: 0.6,
            textTransform: 'uppercase',
            marginBottom: 16,
            animationDelay: '0s',
          }}
        >
          일주 천간
        </p>

        {/* 천간 문자 — 초대형 */}
        <span
          className="animate-item"
          style={{
            fontSize: 'clamp(7rem, 20vw, 10rem)',
            fontWeight: 900,
            lineHeight: 1,
            color: '#c4b5fd',
            fontFamily: 'serif',
            textShadow: '0 0 60px rgba(139,92,246,0.6), 0 0 120px rgba(139,92,246,0.25)',
            position: 'relative',
            animationDelay: '0.1s',
          }}
        >
          {profile.dayMaster}
        </span>

        {/* 성격 인용문 */}
        <p
          className="animate-item"
          style={{
            marginTop: 24,
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.75,
            fontStyle: 'italic',
            maxWidth: 360,
            animationDelay: '0.22s',
          }}
        >
          &ldquo;{profile.personality}&rdquo;
        </p>
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: 'rgba(139,92,246,0.15)', marginBottom: 32 }} />

      {/* ── 오행 분포 ── */}
      <div className="animate-item" style={{ marginBottom: 32, animationDelay: '0.12s' }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.22em',
            color: '#a78bfa',
            opacity: 0.6,
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          오행 분포 (木火土金水)
        </p>
        <OHangChart distribution={profile.oHangDistribution} />
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: 'rgba(139,92,246,0.15)', marginBottom: 28 }} />

      {/* ── 십신 분포 ── */}
      <div className="animate-item" style={{ animationDelay: '0.22s' }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.22em',
            color: '#a78bfa',
            opacity: 0.6,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          십신 분포
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(profile.sipShinDistribution).map(([name, count]) => (
            <span
              key={name}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#c4b5fd',
                padding: '4px 14px',
                borderRadius: 999,
                border: '1px solid rgba(139,92,246,0.3)',
                background: 'rgba(139,92,246,0.08)',
              }}
            >
              {name}
              <span style={{ opacity: 0.45, marginLeft: 5, fontSize: 11 }}>{count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
