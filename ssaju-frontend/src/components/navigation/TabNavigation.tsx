'use client';

/**
 * 컨설팅 탭 네비게이션 (T065)
 *
 * - 8개 탭: 추천산업, 면접팁, 강점, 사주프로필, 부의운, 경력로드맵, 브랜딩, 월별운세
 * - 데스크톱: 모든 탭 한 줄 표시
 * - 태블릿/모바일: 가로 스크롤
 * - 활성 탭: 금색 3px 언더라인 + ★
 * - 전환: 0.2초 이내
 */

export const TAB_LABELS = [
  '추천산업',
  '면접팁',
  '강점',
  '사주프로필',
  '부의운',
  '경력로드맵',
  '브랜딩',
  '월별운세',
] as const;

interface TabNavigationProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function TabNavigation({ selectedIndex, onSelect }: TabNavigationProps) {
  return (
    <nav
      aria-label="컨설팅 탭"
      className="w-full overflow-x-auto scrollbar-hide"
    >
      <ul
        role="tablist"
        className="flex min-w-max border-b border-night-700"
      >
        {TAB_LABELS.map((label, index) => {
          const isActive = selectedIndex === index;
          return (
            <li key={label} role="none">
              <button
                role="tab"
                aria-selected={isActive}
                aria-controls={`tab-panel-${index}`}
                id={`tab-${index}`}
                onClick={() => onSelect(index)}
                className={[
                  'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200',
                  'hover:bg-lavender-50/10',
                  isActive
                    ? 'text-star-500 border-b-[3px] border-star-500 -mb-px'
                    : 'text-night-700 hover:text-star-300',
                ].join(' ')}
              >
                {isActive && <span aria-hidden="true" className="mr-1">★</span>}
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
