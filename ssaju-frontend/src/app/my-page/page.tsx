'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useMyPage } from '@/hooks/useMyPage';
import { useHistoryDetail } from '@/hooks/useHistoryDetail';
import { useDeleteHistory } from '@/hooks/useDeleteHistory';
import { useAuth } from '@/hooks/useAuth';
import { HistoryTabs } from '@/components/history/HistoryTabs';
import { HistoryCard } from '@/components/history/HistoryCard';
import { EmptyState } from '@/components/history/EmptyState';
import { InfiniteScroll } from '@/components/history/InfiniteScroll';
import { DeleteConfirmModal } from '@/components/history/DeleteConfirmModal';
import { HistoryDetailPage } from '@/components/results/HistoryDetailPage';
import { useAuthStore } from '@/stores/authStore';
import type { AnalysisRecord } from '@/types/api';

const STAT_TYPES = [
  { key: 'TIMING',        label: '관운 분석', icon: '🌟', color: '#a78bfa', glow: 'rgba(139,92,246,0.25)' },
  { key: 'CONSULTATION',  label: 'AI 컨설팅', icon: '🤖', color: '#60a5fa', glow: 'rgba(96,165,250,0.25)'  },
  { key: 'COMPATIBILITY', label: '기업 궁합', icon: '🏢', color: '#34d399', glow: 'rgba(52,211,153,0.25)'  },
] as const;

export default function MyPage() {
  const { isAllowed } = useAuthGuard(true);
  const router = useRouter();

  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const { user } = useAuth();
  const {
    analyses, totalCount, isLoading, isLoadingMore, hasMore,
    error, activeTab, setActiveTab, loadMore, loadInitial,
  } = useMyPage();
  const { record: detailRecord, isLoading: isDetailLoading, fetchDetail, reset: resetDetail } = useHistoryDetail();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<AnalysisRecord | null>(null);
  const { deleteRecord, isDeleting } = useDeleteHistory({
    onSuccess: () => {
      setDeleteTargetId(null);
      loadInitial(activeTab);
    },
  });

  useEffect(() => {
    if (isAuthReady && user) loadInitial('ALL');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, user]);

  useEffect(() => {
    if (detailRecord) setViewingRecord(detailRecord);
  }, [detailRecord]);

  // 로드된 데이터에서 타입별 카운트
  const typeCounts = useMemo(() => ({
    TIMING:        analyses.filter((a) => a.type === 'TIMING').length,
    CONSULTATION:  analyses.filter((a) => a.type === 'CONSULTATION').length,
    COMPATIBILITY: analyses.filter((a) => a.type === 'COMPATIBILITY').length,
  }), [analyses]);

  if (!isAllowed) return null;

  if (viewingRecord) {
    return (
      <HistoryDetailPage
        record={viewingRecord}
        onBack={() => { setViewingRecord(null); resetDetail(); }}
      />
    );
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="h-screen overflow-y-auto text-white pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">

        {/* 뒤로가기 */}
        <button
          onClick={() => router.push('/select')}
          className="flex items-center gap-2 text-sm w-fit transition-colors"
          style={{ color: 'rgba(196,181,253,0.5)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#c4b5fd'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(196,181,253,0.5)'; }}
        >
          ← 서비스 선택으로
        </button>

        {/* ── 프로필 카드 ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30,20,60,0.7) 0%, rgba(15,10,40,0.75) 100%)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 20,
            padding: '24px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 배경 글로우 */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* 유저 정보 행 */}
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: '#fff',
                boxShadow: '0 0 20px rgba(109,40,217,0.4)',
                border: '2px solid rgba(167,139,250,0.3)',
              }}
            >
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">{user?.name ?? '-'}</p>
              {user?.email && (
                <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(196,181,253,0.45)' }}>{user.email}</p>
              )}
            </div>

          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid rgba(139,92,246,0.15)', margin: '20px 0 16px' }} />

          {/* 분석 현황 — totalCount + 타입별 */}
          <div>
            <p className="text-xs mb-3 font-medium" style={{ color: 'rgba(167,139,250,0.55)' }}>나의 분석 현황</p>
            <div className="grid grid-cols-4 gap-2">
              {/* 전체 */}
              <div
                style={{
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: 12,
                  padding: '12px 8px',
                  textAlign: 'center',
                }}
              >
                <p className="text-2xl font-black mb-1" style={{ color: '#a78bfa' }}>
                  {isLoading ? '…' : totalCount}
                </p>
                <p className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>전체</p>
              </div>

              {/* 타입별 */}
              {STAT_TYPES.map((t) => (
                <div
                  key={t.key}
                  style={{
                    background: `rgba(${t.key === 'TIMING' ? '139,92,246' : t.key === 'CONSULTATION' ? '96,165,250' : '52,211,153'},0.07)`,
                    border: `1px solid rgba(${t.key === 'TIMING' ? '139,92,246' : t.key === 'CONSULTATION' ? '96,165,250' : '52,211,153'},0.18)`,
                    borderRadius: 12,
                    padding: '12px 8px',
                    textAlign: 'center',
                  }}
                >
                  <p className="text-lg mb-0.5">{t.icon}</p>
                  <p className="text-xl font-black mb-1" style={{ color: t.color }}>
                    {isLoading ? '…' : typeCounts[t.key]}
                  </p>
                  <p className="text-xs leading-tight" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    {t.label.replace(' ', '\n')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 분석 기록 ── */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 16,
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* 헤더 */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ color: '#a78bfa', fontSize: 14 }}>✦</span>
              <span className="text-sm font-bold" style={{ color: 'rgba(196,181,253,0.8)' }}>분석 기록</span>
            </div>
            {!isLoading && totalCount > 0 && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                총 {totalCount}건
              </span>
            )}
          </div>

          {/* 탭 */}
          <HistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* 콘텐츠 */}
          <div className="p-4">
            {/* 상세 로딩 */}
            {isDetailLoading && (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(167,139,250,0.3)', borderTopColor: '#a78bfa' }} />
              </div>
            )}

            {/* 에러 */}
            {error && !isLoading && (
              <div className="text-center py-8">
                <p className="text-sm mb-3" style={{ color: 'rgba(248,113,113,0.8)' }}>{error}</p>
                <button
                  onClick={() => loadInitial(activeTab)}
                  className="text-xs px-4 py-1.5 rounded-lg transition-colors"
                  style={{ border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa' }}
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* 로딩 스켈레톤 */}
            {isLoading && !error && (
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            )}

            {/* 기록 목록 */}
            {!isLoading && !error && analyses.length > 0 && (
              <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} isLoadingMore={isLoadingMore}>
                <div className="flex flex-col gap-2.5">
                  {analyses.map((summary) => (
                    <HistoryCard
                      key={summary.id}
                      summary={summary}
                      onDelete={(id) => setDeleteTargetId(id)}
                      onView={(id, type) => fetchDetail(id, type)}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            )}

            {!isLoading && !error && analyses.length === 0 && <EmptyState />}
          </div>
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
