'use client';

/** AI 컨설팅 로딩 컴포넌트 — 우주적/별빛 테마 (T077) */

import { useEffect, useState } from 'react';

const PROGRESS_MESSAGES = [
  '사주 데이터를 해석하는 중...',
  '강점 분석 중...',
  '추천 산업 탐색 중...',
  '경력 로드맵 생성 중...',
  '면접 팁 생성 중...',
  '브랜딩 전략 수립 중...',
  '부의운 패턴 분석 중...',
  '월별 운세 계산 중...',
  '최종 리포트 정리 중...',
];

export function ConsultationLoading() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center py-12 gap-8"
      aria-live="polite"
      aria-label="AI 분석 중입니다..."
    >
      {/* 중앙 별 아이콘 — pulse */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        {/* 외부 pulse 링 */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(249,217,118,0.35)',
            animation: 'star-pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
          }}
        />
        {/* 내부 glow 원 */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 8,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,217,118,0.18) 0%, transparent 70%)',
            animation: 'star-pulse-glow 2s ease-in-out infinite',
          }}
        />
        {/* 별 아이콘 */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            animation: 'star-spin-slow 6s linear infinite',
          }}
        >
          ✦
        </span>
      </div>

      {/* 메인 텍스트 + 타이핑 dots */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-white font-semibold text-lg tracking-tight">
          AI가 당신의 사주를 분석하고 있어요
        </p>
        <div className="chat-typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* 진행 메시지 순환 */}
      <div
        style={{
          minWidth: 220,
          textAlign: 'center',
          padding: '10px 20px',
          borderRadius: 12,
          background: 'rgba(249,217,118,0.06)',
          border: '1px solid rgba(249,217,118,0.15)',
        }}
      >
        <p
          className="text-star-300 text-sm"
          key={msgIndex}
          style={{ animation: 'msg-fade-in 0.4s ease' }}
        >
          {PROGRESS_MESSAGES[msgIndex]}
        </p>
      </div>

      <style>{`
        @keyframes star-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.18); opacity: 0.2; }
        }
        @keyframes star-pulse-glow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        @keyframes star-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes msg-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
