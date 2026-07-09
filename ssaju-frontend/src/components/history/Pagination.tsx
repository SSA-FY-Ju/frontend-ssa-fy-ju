'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** 마이페이지 분석 기록 목록 하단 페이지네이션 (5개 단위 윈도우) */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const WINDOW = 5;
  const start = Math.floor(currentPage / WINDOW) * WINDOW;
  const end = Math.min(start + WINDOW - 1, totalPages - 1);
  const pageNums = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3"
      style={{ borderTop: '1px solid rgba(139,92,246,0.1)' }}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
        style={{
          background: 'rgba(139,92,246,0.12)',
          color: '#a78bfa',
          border: '1px solid rgba(139,92,246,0.25)',
          opacity: currentPage === 0 ? 0.25 : 1,
          cursor: currentPage === 0 ? 'default' : 'pointer',
        }}
      >
        ‹
      </button>

      {pageNums.map((i) => (
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
          style={{
            background: currentPage === i ? 'rgba(139,92,246,0.25)' : 'transparent',
            color: currentPage === i ? '#a78bfa' : 'rgba(148,163,184,0.45)',
            border: `1px solid ${currentPage === i ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.1)'}`,
            cursor: 'pointer',
          }}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
        style={{
          background: 'rgba(139,92,246,0.12)',
          color: '#a78bfa',
          border: '1px solid rgba(139,92,246,0.25)',
          opacity: currentPage === totalPages - 1 ? 0.25 : 1,
          cursor: currentPage === totalPages - 1 ? 'default' : 'pointer',
        }}
      >
        ›
      </button>
    </div>
  );
}
