'use client';

/**
 * 무한 스크롤 컴포넌트 (T105)
 *
 * IntersectionObserver로 sentinel div를 감지하여
 * 화면 끝에 도달하면 onLoadMore 호출
 */

import { useEffect, useRef, type ReactNode } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  children: ReactNode;
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoadingMore,
  children,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div>
      {children}

      {/* sentinel: 스크롤 감지용 */}
      <div ref={sentinelRef} className="h-4" />

      {/* 추가 로딩 중 스피너 */}
      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-star-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 더 이상 기록 없음 */}
      {!hasMore && !isLoadingMore && (
        <p className="text-center text-night-600 text-sm py-6">더 이상 기록이 없습니다</p>
      )}
    </div>
  );
}
