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
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      {/* 별 아이콘 장식 */}
      <div className="flex gap-3 mb-5" style={{ color: 'rgba(167,139,250,0.4)', fontSize: 20 }}>
        <span>✦</span>
        <span style={{ fontSize: 14, alignSelf: 'center' }}>✦</span>
        <span>✦</span>
      </div>

      {/* 안내 메시지 */}
      <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(148,163,184,0.5)' }}>
        아직 분석 기록이 없습니다.
        <br />
        지금 분석을 시작해보세요!
      </p>

      {/* 분석 시작 버튼 */}
      <Link
        href="/select"
        className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all"
        style={{
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.35)',
          color: '#a78bfa',
        }}
      >
        분석 시작하기
      </Link>
    </div>
  );
}
