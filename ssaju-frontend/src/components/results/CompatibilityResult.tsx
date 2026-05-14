'use client';

/**
 * 기업 궁합 분석 결과 컴포넌트
 *
 * compatibility/page.tsx에서 결과 렌더링 부분을 분리
 * 종합 점수, 직무 매칭, 경력 마일스톤, 월별 운세 표시
 */

import type { CompatibilityResult as CompatibilityResultType } from '@/types/api';
import { CompatibilityScore } from '@/components/visualization/CompatibilityScore';
import { JobMatchingCards } from '@/components/visualization/JobMatchingCards';
import { MonthlyCalendar } from '@/components/visualization/MonthlyCalendar';

interface CompatibilityResultProps {
  result: CompatibilityResultType;
  onReset: () => void;
}

export function CompatibilityResult({ result, onReset }: CompatibilityResultProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 기업명 헤더 */}
      <div className="text-center">
        <p className="text-night-700 text-sm">분석 대상 기업</p>
        <h2 className="text-star-500 text-2xl font-bold">{result.companyName}</h2>
      </div>

      {/* 종합 점수 + 4개 항목 */}
      <CompatibilityScore
        score={result.compatibilityScore}
        confidenceLevel={result.confidenceLevel}
        sipShinScore={result.sipShinScore}
        oHangScore={result.oHangScore}
        jijangGanScore={result.jijangGanScore}
        leadershipScore={result.leadershipScore}
      />

      {/* 종합 평가 */}
      <div className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-sm font-medium mb-2">종합 평가</h3>
        <p className="text-white text-sm leading-relaxed">{result.recommendation}</p>
      </div>

      {/* 직무별 매칭도 */}
      <section>
        <h3 className="text-star-400 text-sm font-medium mb-3">직무별 매칭도</h3>
        <JobMatchingCards cards={result.jobMatchCards} />
      </section>

      {/* 경력 발전 마일스톤 */}
      <section className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-sm font-medium mb-3">경력 발전 로드맵</h3>
        <div className="flex flex-col gap-3">
          <div className="border-l-2 border-star-500 pl-3">
            <p className="text-star-300 text-xs font-medium mb-1">0 ~ 3개월</p>
            <p className="text-white text-sm">{result.careerMilestone.shortTerm}</p>
          </div>
          <div className="border-l-2 border-star-400 pl-3">
            <p className="text-star-300 text-xs font-medium mb-1">3 ~ 12개월</p>
            <p className="text-white text-sm">{result.careerMilestone.midTerm}</p>
          </div>
          <div className="border-l-2 border-star-300 pl-3">
            <p className="text-star-300 text-xs font-medium mb-1">1 ~ 3년</p>
            <p className="text-white text-sm">{result.careerMilestone.longTerm}</p>
          </div>
        </div>
      </section>

      {/* 월별 운세 */}
      <section>
        <h3 className="text-star-400 text-sm font-medium mb-3">월별 운세</h3>
        <MonthlyCalendar forecasts={result.monthlyForecasts} />
      </section>

      {/* 새 분석 */}
      <button
        onClick={onReset}
        className="w-full border border-night-700 hover:border-star-500 text-star-300 text-sm py-2 rounded transition-colors"
      >
        새 분석 시작하기
      </button>
    </div>
  );
}
