'use client';

/**\n * 파일 역할: 현재 페이지 인덱스를 표시하고 페이지 점프를 제공하는 도트 네비게이션입니다.\n */

interface PageDotsProps {
  currentPage: number;
  totalPages: number;
  onDotClick: (page: number) => void;
  isLocked: boolean;
}

export default function PageDots({
  currentPage,
  totalPages,
  onDotClick,
  isLocked,
}: PageDotsProps) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex gap-3">
      {[...Array(totalPages)].map((_, idx) => (
        <button
          key={idx}
          onClick={() => onDotClick(idx)}
          disabled={isLocked}
          className={`transition-all duration-300 rounded-full ${
            idx === currentPage
              ? 'w-8 h-3 bg-blue-500'
              : 'w-3 h-3 bg-gray-500 hover:bg-gray-400'
          } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label={`Go to page ${idx + 1}`}
        />
      ))}
    </div>
  );
}
