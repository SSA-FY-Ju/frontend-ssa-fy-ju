'use client';

/**
 * 분석 기록 카드 컴포넌트 (T103)
 *
 * Props:
 * - record: 분석 기록
 * - onDelete: 삭제 버튼 클릭 핸들러
 * - onView: 카드 클릭 핸들러 (상세 보기)
 *
 * 분석 타입별 미리보기:
 * - CAREER_TIMING: h1Period + H1 신뢰도
 * - CONSULTATION: 첫 번째 추천 산업명
 * - COMPATIBILITY: companyName + 점수
 */

import type { AnalysisRecord, CareerTimingResult, ConsultationData, CompatibilityResult } from '@/types/api';

interface HistoryCardProps {
  record: AnalysisRecord;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

/** 분석 타입 뱃지 레이블 */
const TYPE_LABEL: Record<AnalysisRecord['analysisType'], string> = {
  CAREER_TIMING: '관운 분석',
  CONSULTATION: 'AI 컨설팅',
  COMPATIBILITY: '기업 궁합',
};

/** 날짜를 한국 형식으로 변환 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 분석 타입별 핵심 결과 미리보기 텍스트 */
function getPreviewText(record: AnalysisRecord): string {
  switch (record.analysisType) {
    case 'CAREER_TIMING': {
      const data = record.data as CareerTimingResult;
      return `${data.h1Period} · H1 신뢰도 ${data.h1Confidence}%`;
    }
    case 'CONSULTATION': {
      const data = record.data as ConsultationData;
      const first = data.recommendedIndustries[0];
      return first ? first.industryName : '추천 산업 없음';
    }
    case 'COMPATIBILITY': {
      const data = record.data as CompatibilityResult;
      return `${data.companyName} · ${data.compatibilityScore}점`;
    }
    default:
      return '';
  }
}

export function HistoryCard({ record, onDelete, onView }: HistoryCardProps) {
  const previewText = getPreviewText(record);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(record.recordId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onView(record.recordId);
      }}
      className="relative bg-night-800 border border-night-700 hover:border-star-400 rounded-xl p-5 cursor-pointer transition-colors"
    >
      {/* 우상단 삭제 버튼 */}
      <button
        type="button"
        aria-label="기록 삭제"
        onClick={(e) => {
          e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
          onDelete(record.recordId);
        }}
        className="absolute top-4 right-4 text-night-600 hover:text-red-400 transition-colors text-lg"
      >
        🗑️
      </button>

      {/* 날짜 */}
      <p className="text-night-600 text-xs mb-2">{formatDate(record.createdAt)}</p>

      {/* 분석 타입 뱃지 */}
      <span className="inline-block px-2 py-0.5 bg-night-700 text-star-400 text-xs rounded-full mb-3">
        {TYPE_LABEL[record.analysisType]}
      </span>

      {/* 핵심 결과 미리보기 */}
      <p className="text-white text-sm font-medium">{previewText}</p>
    </div>
  );
}
