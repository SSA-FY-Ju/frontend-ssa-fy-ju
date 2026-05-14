'use client';

/**
 * 섹션 네비게이터 (T065c)
 *
 * - 데스크톱(≥1024px): 화면 우측 고정 플로팅 인디케이터
 *   - 8개 섹션 레이블 항상 표시
 *   - 활성 섹션: 왼쪽 달(☽) 표시 + 금색 레이블 + 금색 도트
 *   - 비활성 섹션: 연한 레이블 + 회색 도트
 * - 모바일/태블릿(<1024px): 상단 고정 섹션 점프 바
 *   - 8개 섹션명 가로 스크롤, 활성 섹션 금색 언더라인
 */

interface SectionNavigatorProps {
  sections: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function SectionNavigator({ sections, currentIndex, onNavigate }: SectionNavigatorProps) {
  return (
    <>
      {/* 데스크톱: 우측 플로팅 — 레이블 항상 표시 */}
      <nav
        aria-label="섹션 네비게이터"
        className="hidden lg:flex flex-col gap-1 fixed right-5 top-1/2 -translate-y-1/2 z-40"
      >
        {sections.map((label, index) => {
          const isActive = currentIndex === index;
          return (
            <button
              key={label}
              onClick={() => onNavigate(index)}
              aria-label={`${label} 섹션으로 이동`}
              aria-current={isActive ? 'true' : undefined}
              className="flex items-center gap-2 group py-1 focus:outline-none"
            >
              {/* 달 모양 인디케이터 — 활성일 때만 표시 */}
              <span
                className={[
                  'text-star-400 text-sm transition-opacity duration-200 w-4 text-center',
                  isActive ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              >
                🌙
              </span>

              {/* 레이블 */}
              <span
                className={[
                  'text-xs font-medium whitespace-nowrap transition-colors duration-200 text-right',
                  isActive ? 'text-star-400' : 'text-gray-300/45 group-hover:text-star-300',
                ].join(' ')}
              >
                {label}
              </span>

              {/* 도트 */}
              <span
                className={[
                  'flex-shrink-0 rounded-full transition-all duration-200',
                  isActive
                    ? 'w-2.5 h-2.5 bg-star-500 ring-2 ring-star-500/40'
                    : 'w-1.5 h-1.5 bg-night-600 group-hover:bg-star-400',
                ].join(' ')}
              />
            </button>
          );
        })}
      </nav>

      {/* 모바일/태블릿: 상단 고정 점프 바 */}
      <nav
        aria-label="섹션 빠른 이동"
        className="lg:hidden sticky top-0 z-40 bg-night-900/95 backdrop-blur-sm border-b border-night-800 overflow-x-auto scrollbar-hide"
      >
        <div className="flex min-w-max px-3 py-0.5">
          {sections.map((label, index) => {
            const isActive = currentIndex === index;
            return (
              <button
                key={label}
                onClick={() => onNavigate(index)}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'relative px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors duration-200',
                  'min-h-[44px] flex items-center',
                  isActive ? 'text-star-400' : 'text-gray-300/45 hover:text-star-300',
                ].join(' ')}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-star-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
