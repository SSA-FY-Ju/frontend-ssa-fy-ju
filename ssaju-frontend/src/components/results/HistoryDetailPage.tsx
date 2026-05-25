'use client';

/**
 * 분석 기록 상세 페이지 컴포넌트 (T107)
 *
 * Props:
 * - record: 분석 기록
 * - onBack: 목록으로 돌아가기 핸들러
 *
 * 분석 타입별 결과 컴포넌트 렌더링:
 * - CAREER_TIMING: CareerTimingResult
 * - CONSULTATION: ConsultationData 요약
 * - COMPATIBILITY: CompatibilityResult 요약
 */

import type {
  AnalysisRecord,
  CareerTimingResult as CareerTimingResultType,
  ConsultationData,
  CompatibilityResult,
} from '@/types/api';
import { CareerTimingResult } from '@/components/results/CareerTimingResult';

interface HistoryDetailPageProps {
  record: AnalysisRecord;
  onBack: () => void;
}

/** 날짜 포맷 헬퍼 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** CONSULTATION 결과 요약 */
function ConsultationSummary({ data }: { data: ConsultationData }) {
  const period = data.favoredPeriod === 'H1' ? '상반기' : data.favoredPeriod === 'H2' ? '하반기' : data.favoredPeriod;
  return (
    <div className="flex flex-col gap-6">
      {/* 핵심 분석 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">핵심 분석</h3>
        <p className="text-white text-sm font-bold mb-2">유리한 시기: {period} · 신뢰도 {data.confidenceScore}%</p>
        <p className="text-white/70 text-sm leading-relaxed">{data.reasoning}</p>
      </div>

      {/* 강점 / 주의 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">강점 & 주의사항</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {data.strengths.map((s) => (
            <span key={s} className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/20">{s}</span>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {data.cautions.map((c) => (
            <p key={c} className="text-rose-400/80 text-xs">⚠ {c}</p>
          ))}
        </div>
      </div>

      {/* 추천 산업 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">추천 산업</h3>
        <div className="flex flex-col gap-3">
          {data.industries.map((ind, i) => (
            <div key={i} className="text-sm">
              <p className="text-white font-semibold">{ind.name}</p>
              <p className="text-white/50 text-xs mt-0.5">{ind.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 커리어 타임라인 주의 시기 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">피해야 할 시기</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {data.careerTimeline.warningMonths.map((m) => (
            <span key={m} className="bg-night-700 text-rose-400 text-xs px-2 py-1 rounded-full border border-rose-500/20">{m}</span>
          ))}
        </div>
        <p className="text-white text-sm leading-relaxed">{data.careerTimeline.warningDescription}</p>
      </div>
    </div>
  );
}

/** COMPATIBILITY 결과 요약 */
function CompatibilitySummary({ data }: { data: CompatibilityResult }) {
  const scoreColor = data.compatibilityScore >= 80 ? '#f59e0b' : data.compatibilityScore >= 60 ? '#22c55e' : '#06b6d4';
  const roleColor = data.targetRoleAnalysis.matchScore >= 80 ? '#22c55e' : data.targetRoleAnalysis.matchScore >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col gap-6">
      {/* 점수 카드 2개 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-night-800 rounded-xl p-5 text-center">
          <p className="text-night-600 text-xs mb-2">종합 궁합 점수</p>
          <p className="text-4xl font-bold" style={{ color: scoreColor }}>{data.compatibilityScore}</p>
          <p className="text-night-600 text-xs mt-1">/ 100</p>
        </div>
        <div className="bg-night-800 rounded-xl p-5 text-center">
          <p className="text-night-600 text-xs mb-2">직군 매칭 점수</p>
          <p className="text-4xl font-bold" style={{ color: roleColor }}>{data.targetRoleAnalysis.matchScore}</p>
          <p className="text-night-600 text-xs mt-1">/ 100</p>
        </div>
      </div>

      {/* 직군 분석 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">직군 분석</h3>
        <p className="text-white/80 text-sm leading-relaxed mb-2">{data.targetRoleAnalysis.synergy}</p>
        <p className="text-rose-400/75 text-xs">⚠ {data.targetRoleAnalysis.warning}</p>
      </div>

      {/* 예상 면접 질문 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">예상 면접 질문</h3>
        <div className="flex flex-col gap-2">
          {data.expectedInterviewQuestions.map((q, i) => (
            <p key={i} className="text-white/75 text-sm leading-relaxed">Q{i + 1}. {q.question}</p>
          ))}
        </div>
      </div>

      {/* 주의사항 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">주의사항</h3>
        <div className="flex flex-col gap-1">
          {data.cautions.map((c, i) => (
            <p key={i} className="text-rose-400/75 text-xs">⚠ {c}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HistoryDetailPage({ record, onBack }: HistoryDetailPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-night-900">
      {/* 헤더: 목록으로 돌아가기 */}
      <div className="sticky top-0 z-10 bg-night-900 border-b border-night-800 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-star-400 text-sm hover:text-star-300 transition-colors"
        >
          <span>←</span>
          <span>기록으로 돌아가기</span>
        </button>
        <span className="text-night-600 text-xs ml-auto">{formatDate(record.createdAt)}</span>
      </div>

      {/* 결과 본체 */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {record.analysisType === 'CAREER_TIMING' && (
          <CareerTimingResult
            result={record.data as CareerTimingResultType}
          />
        )}

        {record.analysisType === 'CONSULTATION' && (
          <ConsultationSummary data={record.data as ConsultationData} />
        )}

        {record.analysisType === 'COMPATIBILITY' && (
          <CompatibilitySummary data={record.data as CompatibilityResult} />
        )}
      </div>
    </div>
  );
}
