'use client';

/**
 * 관운 분석 결과 컴포넌트 (T057)
 *
 * 표시 내용:
 * - H1/H2 권장 시기 (큰 텍스트, 별 아이콘)
 * - 각 시기별 신뢰도 진행 바
 * - 분석 근거 텍스트
 * - 저장 버튼 (로그인 상태에 따라 조건부)
 * - 피드백 버튼
 */

import type { CareerTimingResult as CareerTimingResultType } from '@/types/api';
import { ConfidenceBar } from '@/components/visualization/ConfidenceBar';

interface CareerTimingResultProps {
  result: CareerTimingResultType;
  isLoggedIn: boolean;
  onSave?: () => void;
  onFeedback?: () => void;
  onLoginToSave?: () => void;
}

export function CareerTimingResult({
  result,
  isLoggedIn,
  onSave,
  onFeedback,
  onLoginToSave,
}: CareerTimingResultProps) {
  // 신뢰도가 더 높은 시기를 추천으로 표시
  const recommended = result.h1Confidence >= result.h2Confidence ? 'H1' : 'H2';
  const recommendedPeriod = recommended === 'H1' ? result.h1Period : result.h2Period;

  return (
    <div className="flex flex-col gap-6">
      {/* 결과 헤더 */}
      <div className="text-center py-6">
        <p className="text-star-300 text-sm mb-2">채용 운이 좋은 시기</p>
        <h2 className="text-star-500 text-4xl font-bold mb-1">
          ★ {recommended} 권장
        </h2>
        <p className="text-white text-lg">{recommendedPeriod}</p>
      </div>

      {/* 신뢰도 진행 바 */}
      <div className="flex flex-col gap-4 px-2">
        <ConfidenceBar score={result.h1Confidence} label={`H1 — ${result.h1Period}`} />
        <ConfidenceBar score={result.h2Confidence} label={`H2 — ${result.h2Period}`} />
      </div>

      {/* 분석 근거 */}
      <div className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-sm font-medium mb-2">분석 근거</h3>
        <p className="text-white text-sm leading-relaxed">{result.recommendation}</p>
      </div>

      {/* 저장 버튼 */}
      <div className="flex flex-col gap-2">
        {isLoggedIn ? (
          <button
            onClick={onSave}
            className="w-full bg-star-500 hover:bg-star-400 text-night-900 font-bold py-3 rounded transition-colors"
          >
            이 결과 저장하기
          </button>
        ) : (
          <div className="bg-night-800 border border-night-700 rounded-lg p-4 text-center">
            <p className="text-star-300 text-sm mb-3">결과를 저장하려면 로그인해주세요</p>
            <button
              onClick={onLoginToSave}
              className="px-6 py-2 bg-night-700 hover:bg-night-600 text-white text-sm rounded transition-colors"
            >
              로그인하기
            </button>
          </div>
        )}

        {/* 피드백 버튼 */}
        {onFeedback && (
          <button
            onClick={onFeedback}
            className="w-full border border-night-700 hover:border-star-500 text-star-300 text-sm py-2 rounded transition-colors"
          >
            이 결과에 대해 의견을 알려주세요
          </button>
        )}
      </div>
    </div>
  );
}
