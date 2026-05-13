'use client';

/**
 * 직무별 매칭도 카드 (T089)
 *
 * - 직무명, 점수, 진행 바, 이유, 추천/주의 문구
 * - 3-5개 카드 표시
 */

import type { JobMatchCard } from '@/types/api';

interface JobMatchingCardsProps {
  cards: JobMatchCard[];
}

export function JobMatchingCards({ cards }: JobMatchingCardsProps) {
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => {
        const scoreColor =
          card.score >= 80 ? '#22c55e' : card.score >= 60 ? '#f59e0b' : '#ef4444';

        return (
          <div
            key={card.jobTitle}
            className="bg-night-800 border border-night-700 rounded-lg p-4 flex flex-col gap-2"
          >
            {/* 헤더: 직무명 + 추천/주의 뱃지 */}
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{card.jobTitle}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  card.isRecommended
                    ? 'bg-star-500/20 text-star-400 border border-star-500/40'
                    : 'bg-red-900/30 text-red-400 border border-red-500/40'
                }`}
              >
                {card.recommendation}
              </span>
            </div>

            {/* 점수 + 진행 바 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-night-700">매칭도</span>
                <span style={{ color: scoreColor }} className="font-bold">
                  {card.score} / 100
                </span>
              </div>
              <div className="h-2 bg-night-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${card.score}%`, backgroundColor: scoreColor }}
                />
              </div>
            </div>

            {/* 이유 */}
            <p className="text-night-700 text-xs leading-relaxed">{card.reason}</p>
          </div>
        );
      })}
    </div>
  );
}
