'use client';

/**
 * 홈페이지 (/)
 *
 * 사용자가 처음 방문했을 때 보는 랜딩 페이지
 */

export default function HomePage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-night-900 text-white flex flex-col items-center justify-center px-4">
      {/* 배경 별 효과 (Phase 2에서 구현) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Canvas 기반 별 배경은 Phase 2에서 추가 */}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 text-center max-w-2xl">
        <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-4 text-star-400">
          SSAju
        </h1>
        <p className="text-lg lg:text-xl text-gray-300 mb-8 font-body">
          당신의 관운을 분석하여 최적의 커리어 경로를 제시합니다
        </p>

        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <button className="btn-primary">
            관운 분석 시작하기
          </button>
          <button className="btn-secondary">
            자세히 알아보기
          </button>
        </div>
      </div>

      {/* 하단 안내 */}
      <div className="absolute bottom-8 text-sm text-gray-500 text-center">
        <p>생년월일과 시간을 입력하여 당신의 커리어 타이밍을 분석받으세요</p>
      </div>
    </div>
  );
}
