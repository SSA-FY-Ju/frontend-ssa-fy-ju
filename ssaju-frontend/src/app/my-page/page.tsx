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

const STAT_TYPES = [
  { key: 'TIMING', label: '관운 분석', icon: '🌟', color: '#a78bfa' },
  { key: 'CONSULTATION', label: 'AI 컨설팅', icon: '🤖', color: '#60a5fa' },
  { key: 'COMPATIBILITY', label: '기업 궁합', icon: '🏢', color: '#34d399' },
] as const;

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

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

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

        {/* ── 프로필 카드 ── */}
        <div
          className="flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(30,20,60,0.7) 0%, rgba(15,10,40,0.75) 100%)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 20,
            padding: '20px 24px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div className="flex items-center gap-4">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 0 20px rgba(109,40,217,0.4)',
                border: '2px solid rgba(167,139,250,0.3)',
              }}
            >
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">
                {user?.name ?? '-'}
              </p>
              {user?.email && (
                <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(196,181,253,0.45)' }}>
                  {user.email}
                </p>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(139,92,246,0.15)', margin: '16px 0 12px' }} />

          <div>
            <p className="text-xs mb-2.5 font-medium" style={{ color: 'rgba(167,139,250,0.55)' }}>
              나의 분석 현황
            </p>
            <div className="grid grid-cols-4 gap-2">
              <div
                style={{
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: 12,
                  padding: '10px 8px',
                  textAlign: 'center',
                }}
              >
                <p className="text-base mb-0.5">✨</p>
                <p className="text-lg font-black mb-0.5" style={{ color: '#a78bfa' }}>
                  {isLoading ? '…' : totalCount}
                </p>
                <p className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>
                  전체
                </p>
              </div>

              {STAT_TYPES.map((t) => (
                <div
                  key={t.key}
                  style={{
                    background: `rgba(${t.key === 'TIMING' ? '139,92,246' : t.key === 'CONSULTATION' ? '96,165,250' : '52,211,153'},0.07)`,
                    border: `1px solid rgba(${t.key === 'TIMING' ? '139,92,246' : t.key === 'CONSULTATION' ? '96,165,250' : '52,211,153'},0.18)`,
                    borderRadius: 12,
                    padding: '10px 8px',
                    textAlign: 'center',
                  }}
                >
                  <p className="text-base mb-0.5">{t.icon}</p>
                  <p className="text-lg font-black mb-0.5" style={{ color: t.color }}>
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
          className="flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 16,
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
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

          {/* 페이지네이션 */}
          {!isLoading && !error && totalPages > 1 && (() => {
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
                  onClick={() => setPage(currentPage - 1)}
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
                    onClick={() => setPage(i)}
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
                  onClick={() => setPage(currentPage + 1)}
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
          })()}
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
