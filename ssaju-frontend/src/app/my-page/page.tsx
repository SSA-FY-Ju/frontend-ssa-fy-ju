'use client';

/**
 * 마이페이지 — 분석 기록 페이지 (T108)
 *
 * 4-layer: Page → Component → Hook → API
 *
 * 기능:
 * - 비로그인 시 /career-timing 리다이렉트 (useMyPageAccess)
 * - 탭별 분석 기록 목록 (useMyPage)
 * - 무한 스크롤 (InfiniteScroll)
 * - 기록 상세 보기 (useHistoryDetail → HistoryDetailPage)
 * - 기록 삭제 확인 모달 (DeleteConfirmModal)
 */

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useMyPageAccess } from '@/hooks/useMyPageAccess';
import { useMyPage } from '@/hooks/useMyPage';
import { useHistoryDetail } from '@/hooks/useHistoryDetail';
import { useDeleteHistory } from '@/hooks/useDeleteHistory';
import { HistoryTabs } from '@/components/history/HistoryTabs';
import { HistoryCard } from '@/components/history/HistoryCard';
import { EmptyState } from '@/components/history/EmptyState';
import { InfiniteScroll } from '@/components/history/InfiniteScroll';
import { DeleteConfirmModal } from '@/components/history/DeleteConfirmModal';
import { HistoryDetailPage } from '@/components/results/HistoryDetailPage';
import type { AnalysisRecord } from '@/types/api';

export default function MyPage() {
  // Route Guard: require login to access this page
  useAuthGuard(true);

  const { isLoggedIn, isChecking } = useMyPageAccess();

  const {
    records,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    activeTab,
    setActiveTab,
    loadMore,
    loadInitial,
  } = useMyPage();

  const { record: detailRecord, isLoading: isDetailLoading, fetchDetail, reset: resetDetail } =
    useHistoryDetail();

  // 삭제 모달 대상 ID
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  // 상세 보기 중인 기록 (fetchDetail 완료 후 표시)
  const [viewingRecord, setViewingRecord] = useState<AnalysisRecord | null>(null);

  const { deleteRecord, isDeleting } = useDeleteHistory({
    onSuccess: () => {
      // 삭제 성공 시 목록 reload
      setDeleteTargetId(null);
      loadInitial(activeTab);
    },
  });

  // 마운트 시 첫 탭 데이터 로드
  useEffect(() => {
    if (isLoggedIn) {
      loadInitial(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // 상세 기록 fetch 완료 시 viewingRecord 설정
  useEffect(() => {
    if (detailRecord) {
      setViewingRecord(detailRecord);
    }
  }, [detailRecord]);

  // 접근 권한 체크 중
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-night-900 pt-16">
        <p className="text-night-600 text-sm">로딩 중...</p>
      </div>
    );
  }

  // 비로그인 (리다이렉트 중)
  if (!isLoggedIn) return null;

  // 상세 보기 화면
  if (viewingRecord) {
    return (
      <HistoryDetailPage
        record={viewingRecord}
        onBack={() => {
          setViewingRecord(null);
          resetDetail();
        }}
      />
    );
  }

  /** 카드 클릭: 상세 기록 fetch */
  const handleView = async (recordId: string) => {
    await fetchDetail(recordId);
  };

  return (
    <div className="min-h-screen bg-night-900 pt-16">
      {/* 헤더 */}
      <header className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
        <h1 className="text-white text-2xl font-bold">내 분석 기록</h1>
        <p className="text-night-600 text-sm mt-1">나의 사주 분석 결과를 확인하세요</p>
      </header>

      {/* 탭 */}
      <div className="max-w-2xl mx-auto">
        <HistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* 본문 */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* 상세 로딩 중 오버레이 */}
        {isDetailLoading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-star-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className="text-center py-10">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => loadInitial(activeTab)}
              className="mt-4 px-4 py-2 text-star-400 border border-star-400 rounded-lg text-sm hover:bg-star-400 hover:text-night-900 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 로딩 중 스켈레톤 */}
        {isLoading && !error && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-night-800 rounded-xl animate-pulse border border-night-700"
              />
            ))}
          </div>
        )}

        {/* 기록 목록 */}
        {!isLoading && !error && records.length > 0 && (
          <InfiniteScroll
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          >
            <div className="flex flex-col gap-3">
              {records.map((record) => (
                <HistoryCard
                  key={record.recordId}
                  record={record}
                  onDelete={(id) => setDeleteTargetId(id)}
                  onView={handleView}
                />
              ))}
            </div>
          </InfiniteScroll>
        )}

        {/* 기록 없음 */}
        {!isLoading && !error && records.length === 0 && <EmptyState />}
      </main>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        recordId={deleteTargetId}
        onConfirm={(id) => deleteRecord(id)}
        onClose={() => setDeleteTargetId(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
