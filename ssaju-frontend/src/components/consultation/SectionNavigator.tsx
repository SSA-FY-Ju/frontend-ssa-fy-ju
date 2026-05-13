'use client';

/**
 * 섹션 네비게이터 (T065c)
 *
 * - 데스크톱(≥1024px): 화면 우측 고정 플로팅 인디케이터
 *   - 8개 점(dot), 활성 섹션 금색 강조
 *   - 클릭 시 onNavigate(index) → 호출자에서 fullpageApi.moveTo(index+1) 처리
 * - 모바일/태블릿(<1024px): 상단 고정 섹션 점프 바
 *   - 8개 섹션명 가로 스크롤, 활성 섹션 금색 강조
 *   - 터치 영역 44px 이상 확보
 * - prefers-reduced-motion: 시각적 전환 없이 즉시 표시
 */

interface SectionNavigatorProps {
  /** 섹션 레이블 배열 (8개) */
  sections: string[];
  /** 현재 활성 섹션 index (0-based) */
  currentIndex: number;
  /** 섹션 클릭 시 콜백 — 호출자에서 fullpageApi.moveTo(index+1) 처리 */
  onNavigate: (index: number) => void;
}

export function SectionNavigator({ sections, currentIndex, onNavigate }: SectionNavigatorProps) {
  return (
    <>
      {/* 데스크톱: 우측 플로팅 인디케이터 */}
      <nav
        aria-label="섹션 네비게이터"
        className="hidden lg:flex flex-col gap-3 fixed right-6 top-1/2 -translate-y-1/2 z-40"
      >
        {sections.map((label, index) => (
          <button
            key={label}
            onClick={() => onNavigate(index)}
            title={label}
            aria-label={`${label} 섹션으로 이동`}
            aria-current={currentIndex === index ? 'true' : undefined}
            className={[
              'w-3 h-3 rounded-full transition-all duration-200',
              'min-w-[44px] min-h-[44px] flex items-center justify-center -m-4 p-4',
              currentIndex === index
                ? 'bg-star-500 scale-125'
                : 'bg-night-700 hover:bg-star-300',
            ].join(' ')}
          >
            <span className="w-3 h-3 rounded-full block" />
          </button>
        ))}
      </nav>

      {/* 모바일/태블릿: 상단 고정 점프 바 */}
      <nav
        aria-label="섹션 빠른 이동"
        className="lg:hidden sticky top-0 z-40 bg-night-900/95 backdrop-blur-sm border-b border-night-700 overflow-x-auto scrollbar-hide"
      >
        <div className="flex min-w-max px-4 py-1">
          {sections.map((label, index) => (
            <button
              key={label}
              onClick={() => onNavigate(index)}
              aria-current={currentIndex === index ? 'true' : undefined}
              className={[
                'px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors duration-200',
                'min-h-[44px] flex items-center',
                currentIndex === index
                  ? 'text-star-500 border-b-2 border-star-500'
                  : 'text-night-700 hover:text-star-300',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
