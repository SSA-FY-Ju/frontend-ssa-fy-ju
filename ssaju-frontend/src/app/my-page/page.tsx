'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useMyPage } from '@/hooks/useMyPage';
import { useDeleteHistory } from '@/hooks/useDeleteHistory';
import { useAuth } from '@/hooks/useAuth';
import { HistoryTabs } from '@/components/history/HistoryTabs';
import { HistoryCard } from '@/components/history/HistoryCard';
import { EmptyState } from '@/components/history/EmptyState';
import { DeleteConfirmModal } from '@/components/history/DeleteConfirmModal';
import { ProfileCard } from '@/components/history/ProfileCard';
import { Pagination } from '@/components/history/Pagination';

export default function MyPage() {
  const { isAllowed } = useAuthGuard(true);
  const router = useRouter();
  const { user } = useAuth();

  const {
    analyses,
    allAnalyses,
    totalCount,
    isLoading,
    isSuccess,
    error,
    activeTab,
    setActiveTab,
    currentPage,
    totalPages,
    setPage,
    refetch,
  } = useMyPage();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { deleteRecord, isDeleting } = useDeleteHistory({
    onSuccess: () => setDeleteTargetId(null),
  });

  const typeCounts = useMemo(
    () => ({
      TIMING: allAnalyses.filter((a) => a.type === 'TIMING').length,
      CONSULTATION: allAnalyses.filter((a) => a.type === 'CONSULTATION').length,
      COMPATIBILITY: allAnalyses.filter((a) => a.type === 'COMPATIBILITY').length,
    }),
    [allAnalyses],
  );

  if (!isAllowed) return null;

  return (
    <div className="min-h-screen text-white pt-16 pb-8">
      <div className="max-w-2xl w-full mx-auto px-4 py-5 flex flex-col gap-4">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.push('/select')}
          className="flex items-center gap-2 text-sm w-fit transition-colors flex-shrink-0"
          style={{ color: 'rgba(196,181,253,0.5)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#c4b5fd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(196,181,253,0.5)';
          }}
        >
          ← 서비스 선택으로
        </button>

        <ProfileCard
          name={user?.name}
          email={user?.email}
          isLoading={isLoading}
          totalCount={totalCount}
          typeCounts={typeCounts}
        />

        {/* ── 분석 기록 ── */}
        <div
          className="flex flex-col"
          style={{
            background: 'rgba(10,12,28,0.6)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* 헤더 */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span style={{ color: '#a78bfa', fontSize: 14 }}>✦</span>
              <span className="text-sm font-bold" style={{ color: 'rgba(196,181,253,0.8)' }}>
                분석 기록
              </span>
            </div>
            {!isLoading && totalCount > 0 && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(139,92,246,0.12)',
                  color: '#a78bfa',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                총 {totalCount}건
              </span>
            )}
          </div>

          <HistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* 카드 목록 */}
          <div className="flex flex-col p-3">
            {/* 로딩 스켈레톤 — 최초 성공 전에만 표시 */}
            {isLoading && !isSuccess && (
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />
                ))}
              </div>
            )}

            {/* 에러 — 최초 성공 전(첫 로드 실패)에만 표시 */}
            {error && !isLoading && !isSuccess && (
              <div className="flex flex-col items-center justify-center flex-1 gap-3">
                <p className="text-sm" style={{ color: 'rgba(248,113,113,0.8)' }}>
                  {error}
                </p>
                <button
                  onClick={() => refetch()}
                  className="text-xs px-4 py-1.5 rounded-lg transition-colors"
                  style={{ border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa' }}
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* 기록 카드 목록 */}
            {isSuccess && analyses.length > 0 && (
              <div
                key={`${activeTab}-${currentPage}`}
                className="flex flex-col gap-2.5"
                style={{ animation: 'fadeInUp 0.22s ease forwards' }}
              >
                {analyses.map((summary) => (
                  <HistoryCard
                    key={`${summary.type}_${summary.id}`}
                    summary={summary}
                    onView={(id, type) => router.push(`/my-page/${id}?type=${type}`)}
                  />
                ))}
              </div>
            )}

            {/* 빈 기록 — 성공했는데 데이터가 없을 때 표시 */}
            {isSuccess && analyses.length === 0 && (
              <div
                key={activeTab}
                className="flex items-center justify-center py-6"
                style={{ animation: 'fadeInUp 0.22s ease forwards' }}
              >
                <EmptyState />
              </div>
            )}
          </div>

          {!isLoading && !error && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        recordId={deleteTargetId}
        onConfirm={(id) => deleteRecord(id)}
        onClose={() => setDeleteTargetId(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
