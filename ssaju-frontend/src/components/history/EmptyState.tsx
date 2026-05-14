'use client';

/**
 * 분석 기록 없음 상태 컴포넌트 (T102)
 *
 * 아직 분석 기록이 없을 때 표시
 * - 밤하늘 테마 + 별 아이콘 장식
 * - 분석 시작 링크 버튼
 */

import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* 별 아이콘 장식 */}
      <div className="flex gap-3 mb-6 text-star-400 text-2xl">
        <span>✦</span>
        <span className="text-star-300 text-lg self-center">✦</span>
        <span>✦</span>
      </div>

      {/* 안내 메시지 */}
      <p className="text-night-700 text-base leading-relaxed mb-8">
        아직 분석 기록이 없습니다.
        <br />
        지금 분석을 시작해보세요!
      </p>

      {/* 분석 시작 버튼 */}
      <Link
        href="/career-timing"
        className="px-8 py-3 bg-star-500 hover:bg-star-400 text-night-900 font-bold rounded-lg transition-colors"
      >
        분석 시작하기
      </Link>

      {/* 하단 별 장식 */}
      <div className="mt-10 text-star-300 text-sm opacity-50">✦ ✦ ✦</div>
    </div>
  );
}
