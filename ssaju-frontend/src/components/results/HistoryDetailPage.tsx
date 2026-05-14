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

/** CONSULTATION 결과 요약 (8섹션 전체) */
function ConsultationSummary({ data }: { data: ConsultationData }) {
  return (
    <div className="flex flex-col gap-6">
      {/* 섹션1: 추천 산업 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">추천 산업</h3>
        <ul className="flex flex-col gap-2">
          {data.recommendedIndustries.map((industry) => (
            <li key={industry.industryName} className="flex items-start gap-2">
              <span className="text-star-500 mt-0.5">✦</span>
              <div>
                <p className="text-white text-sm font-medium">{industry.industryName}</p>
                <p className="text-night-600 text-xs mt-0.5">{industry.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 섹션2: 면접 팁 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">면접 팁</h3>
        <ul className="flex flex-col gap-1.5">
          {data.interviewTips.map((tip, i) => (
            <li key={i} className="text-white text-sm leading-relaxed">• {tip}</li>
          ))}
        </ul>
      </div>

      {/* 섹션3: 강점 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">나의 강점</h3>
        <ul className="flex flex-col gap-1.5">
          {data.strengths.map((strength) => (
            <li key={strength} className="text-white text-sm leading-relaxed">• {strength}</li>
          ))}
        </ul>
      </div>

      {/* 섹션4: 사주 프로필 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">사주 프로필</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-night-600">일간</span><p className="text-white mt-0.5">{data.sajuProfile.dayMaster}</p></div>
          <div><span className="text-night-600">성격</span><p className="text-white mt-0.5">{data.sajuProfile.personality}</p></div>
        </div>
      </div>

      {/* 섹션5: 부의 운 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">부의 운</h3>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-night-600 text-xs">수입원</p>
          <p className="text-white leading-relaxed">{data.wealthStyle.incomeSource}</p>
          <p className="text-night-600 text-xs mt-1">재테크 스타일</p>
          <p className="text-white leading-relaxed">{data.wealthStyle.investmentStyle}</p>
          <p className="text-night-600 text-xs mt-1">재무 조언</p>
          <p className="text-white leading-relaxed">{data.wealthStyle.financialAdvice}</p>
        </div>
      </div>

      {/* 섹션6: 경력 로드맵 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">경력 로드맵</h3>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-night-600 text-xs">단기 (0–3개월)</p>
          <p className="text-white leading-relaxed">{data.careerRoadmap.shortTerm}</p>
          <p className="text-night-600 text-xs mt-1">중기 (3–12개월)</p>
          <p className="text-white leading-relaxed">{data.careerRoadmap.midTerm}</p>
          <p className="text-night-600 text-xs mt-1">장기 (1–3년)</p>
          <p className="text-white leading-relaxed">{data.careerRoadmap.longTerm}</p>
        </div>
      </div>

      {/* 섹션7: 브랜딩 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">퍼스널 브랜딩</h3>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-night-600 text-xs">정장 색상</p>
          <p className="text-white">{data.branding.suitColor}</p>
          <p className="text-night-600 text-xs mt-1">이미지 스타일</p>
          <p className="text-white">{data.branding.imageStyle}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.branding.powerKeywords.map((kw) => (
              <span key={kw} className="bg-night-700 text-star-300 text-xs px-2 py-1 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 섹션8: 월별 운세 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-3">월별 운세</h3>
        <div className="flex flex-col gap-3">
          {data.monthlyForecasts.map((forecast) => (
            <div key={forecast.month} className="flex gap-3 text-sm">
              <span className="text-star-400 font-medium w-8 shrink-0">{forecast.month}월</span>
              <p className="text-white leading-relaxed">{forecast.advice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** COMPATIBILITY 결과 요약 */
function CompatibilitySummary({ data }: { data: CompatibilityResult }) {
  const scoreColor =
    data.compatibilityScore >= 80
      ? 'text-green-400'
      : data.compatibilityScore >= 60
        ? 'text-star-400'
        : 'text-red-400';

  return (
    <div className="flex flex-col gap-6">
      {/* 점수 헤더 */}
      <div className="bg-night-800 rounded-xl p-6 text-center">
        <p className="text-night-600 text-sm mb-2">{data.companyName} 궁합 점수</p>
        <p className={`text-5xl font-bold ${scoreColor}`}>{data.compatibilityScore}</p>
        <p className="text-night-600 text-xs mt-1">/ 100</p>
      </div>

      {/* 세부 점수 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-4">세부 점수</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '십신 궁합', score: data.sipShinScore },
            { label: '오행 궁합', score: data.oHangScore },
            { label: '지장간 궁합', score: data.jijangGanScore },
            { label: '리더십 매칭', score: data.leadershipScore },
          ].map((item) => (
            <div key={item.label} className="bg-night-700 rounded-lg p-3 text-center">
              <p className="text-night-600 text-xs mb-1">{item.label}</p>
              <p className="text-star-400 font-bold">{item.score}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 추천 메시지 */}
      <div className="bg-night-800 rounded-xl p-5">
        <h3 className="text-star-400 text-sm font-medium mb-2">종합 의견</h3>
        <p className="text-white text-sm leading-relaxed">{data.recommendation}</p>
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
            isLoggedIn={true}
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
