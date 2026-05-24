'use client';

/**
 * 분석 기록 카드 컴포넌트
 *
 * GET /api/mypage analyses[] 항목 기반
 * - id, type, birthDate, createdAt, favoredPeriod, confidenceScore
 */

import type { MyPageAnalysisSummary } from '@/types/api';

interface HistoryCardProps {
  summary: MyPageAnalysisSummary;
  onDelete: (id: string) => void;
  onView: (id: string, type: string) => void;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  TIMING: {
    label: '관운 분석',
    icon: '🌟',
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
  },
  CONSULTATION: {
    label: 'AI 컨설팅',
    icon: '🤖',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.3)',
  },
  COMPATIBILITY: {
    label: '기업 궁합',
    icon: '🏢',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.3)',
  },
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatBirthDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${year}년 ${month}월 ${day}일`;
}

function getResultText(summary: MyPageAnalysisSummary): string {
  const period = summary.favoredPeriod === 'H1' ? '상반기 유리' : summary.favoredPeriod === 'H2' ? '하반기 유리' : '';
  const score = summary.confidenceScore != null ? `신뢰도 ${summary.confidenceScore}%` : '';
  return [period, score].filter(Boolean).join(' · ');
}

export function HistoryCard({ summary, onDelete, onView }: HistoryCardProps) {
  const config = TYPE_CONFIG[summary.type] ?? {
    label: summary.type,
    icon: '✦',
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
  };
  const resultText = getResultText(summary);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(summary.id.toString(), summary.type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onView(summary.id.toString(), summary.type);
      }}
      className="relative rounded-xl p-4 cursor-pointer transition-all"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(139,92,246,0.12)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.28)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)';
      }}
    >
      {/* 삭제 버튼 */}
      <button
        type="button"
        aria-label="기록 삭제"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(summary.id.toString());
        }}
        className="absolute top-3 right-3 text-sm transition-all"
        style={{ color: 'rgba(148,163,184,0.25)', lineHeight: 1, padding: '2px 4px' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(248,113,113,0.65)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(148,163,184,0.25)'; }}
      >
        ✕
      </button>

      {/* 헤더 행: 타입 뱃지 + 날짜 */}
      <div className="flex items-center justify-between mb-3 pr-5">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full"
          style={{
            background: config.bg,
            border: `1px solid ${config.border}`,
            color: config.color,
          }}
        >
          <span style={{ fontSize: 11 }}>{config.icon}</span>
          {config.label}
        </span>
        <span className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>
          {formatDate(summary.createdAt)}
        </span>
      </div>

      {/* 생년월일 */}
      <p className="text-xs mb-2" style={{ color: 'rgba(196,181,253,0.45)' }}>
        생년월일 {formatBirthDate(summary.birthDate)}
      </p>

      {/* 결과 미리보기 */}
      {resultText && (
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {resultText}
        </p>
      )}
    </div>
  );
}
