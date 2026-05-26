'use client';

/**
 * 섹션 네비게이터 (T065c)
 *
 * - 데스크톱(≥1024px): 화면 우측 고정 플로팅 인디케이터
 * - 모바일: 표시 안 함 (스와이프로 섹션 이동)
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
              {/* 레이블 */}
              <span
                className={[
                  'text-xs font-medium whitespace-nowrap transition-colors duration-200 text-right',
                  isActive ? 'text-star-400' : 'text-gray-300/45 group-hover:text-star-300',
                ].join(' ')}
              >
                {label}
              </span>

              {/* 달 모양 인디케이터 — 활성일 때만 표시 */}
              <span
                className={[
                  'text-star-400 text-sm transition-opacity duration-200 w-4 text-center',
                  isActive ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              >
                🌙
              </span>
            </button>
          );
        })}
      </nav>

    </>
  );
}
