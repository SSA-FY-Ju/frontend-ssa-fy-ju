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
  return (
    <div className="flex flex-col gap-6">
      {/* 종합 요약 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">종합 분석</h3>
        <p className="text-white text-sm leading-relaxed">{data.analysisSummary}</p>
      </div>

      {/* 전환점 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">운명의 전환점</h3>
        <div className="flex flex-col gap-3">
          {data.pivotPoints.map((pt, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-star-400 font-medium shrink-0 w-28">{pt.month}</span>
              <div>
                <p className="text-white leading-relaxed">{pt.description}</p>
                <p className="text-night-600 text-xs mt-0.5">점수 {pt.score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주의 시기 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">주의 시기</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {data.warningMonths.map((m) => (
            <span key={m} className="bg-night-700 text-rose-400 text-xs px-2 py-1 rounded-full border border-rose-500/20">{m}</span>
          ))}
        </div>
        <p className="text-white text-sm leading-relaxed">{data.warningDescription}</p>
      </div>
    </div>
  );
}

/** COMPATIBILITY 결과 요약 */
function CompatibilitySummary({ data }: { data: CompatibilityResult }) {
  return (
    <div className="flex flex-col gap-6">
      {/* 점수 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-night-800 rounded-xl p-5 text-center">
          <p className="text-night-600 text-xs mb-2">시너지 점수</p>
          <p className="text-4xl font-bold text-star-400">{data.potentialSynergy}</p>
          <p className="text-night-600 text-xs mt-1">/ 100</p>
        </div>
        <div className="bg-night-800 rounded-xl p-5 text-center">
          <p className="text-night-600 text-xs mb-2">장기 안정성</p>
          <p className="text-4xl font-bold text-green-400">{data.longTermStability}</p>
          <p className="text-night-600 text-xs mt-1">/ 100</p>
        </div>
      </div>

      {/* 면접 키워드 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">면접 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {data.actionableStrategy.interviewKeywords.map((kw, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">{kw}</span>
          ))}
        </div>
      </div>

      {/* 약점 방어 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-2">약점 방어 전략</h3>
        <p className="text-white text-sm leading-relaxed italic">{data.actionableStrategy.weaknessDefense}</p>
      </div>

      {/* 면접 최적 시기 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">면접 최적 시기</h3>
        <div className="flex flex-col gap-2">
          {data.actionableStrategy.bestTiming.luckyDays.map((day, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/80">
              <span>🌙</span><span>{day}</span>
            </div>
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
