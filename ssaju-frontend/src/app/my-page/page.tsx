'use client';

import { useEffect, useState } from 'react';
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
import type { AnalysisRecord } from '@/types/api';


const QUICK_ANALYSIS = [
  { href: '/career-timing', icon: '🌟', label: '관운 분석', desc: '올해의 커리어 운세' },
  { href: '/consultation', icon: '🤖', label: 'AI 컨설팅', desc: 'AI 맞춤 커리어 조언' },
  { href: '/compatibility', icon: '🏢', label: '기업 궁합', desc: '기업과의 궁합 확인' },
];

export default function MyPage() {
  useAuthGuard(true);
  const router = useRouter();

  const { user, logout } = useAuth();
  const { records, isLoading, isLoadingMore, hasMore, error, activeTab, setActiveTab, loadMore, loadInitial } = useMyPage();
  const { record: detailRecord, isLoading: isDetailLoading, fetchDetail, reset: resetDetail } = useHistoryDetail();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<AnalysisRecord | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { deleteRecord, isDeleting } = useDeleteHistory({
    onSuccess: () => {
      setDeleteTargetId(null);
      loadInitial(activeTab);
    },
  });

  useEffect(() => {
    if (user) loadInitial(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (detailRecord) setViewingRecord(detailRecord);
  }, [detailRecord]);

  if (viewingRecord) {
    return (
      <HistoryDetailPage
        record={viewingRecord}
        onBack={() => { setViewingRecord(null); resetDetail(); }}
      />
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen text-white pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* 뒤로가기 */}
        <button
          onClick={() => router.push('/select')}
          className="flex items-center gap-2 text-sm w-fit transition-colors"
          style={{ color: 'rgba(196,181,253,0.55)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#c4b5fd'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(196,181,253,0.55)'; }}
        >
          ← 서비스 선택으로
        </button>

        {/* 프로필 카드 */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30,20,60,0.6) 0%, rgba(15,10,35,0.65) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 20,
            padding: '24px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="flex items-center gap-4">
            <div
              style={{
                width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: '#fff',
                boxShadow: '0 0 20px rgba(109,40,217,0.4)',
                border: '2px solid rgba(167,139,250,0.3)',
              }}
            >
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg leading-tight truncate">{user?.name ?? '-'}</p>
              {user?.email && (
                <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(196,181,253,0.45)' }}>{user.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* 빠른 분석 시작 */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 16,
            padding: '20px 24px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span style={{ color: '#a78bfa', fontSize: 14 }}>✦</span>
            <span className="text-sm font-bold" style={{ color: 'rgba(196,181,253,0.8)' }}>빠른 분석 시작</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ANALYSIS.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all"
                style={{
                  background: 'rgba(139,92,246,0.07)',
                  border: '1px solid rgba(139,92,246,0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139,92,246,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)';
                }}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>{item.label}</span>
                <span className="text-xs text-center leading-tight" style={{ color: 'rgba(148,163,184,0.5)' }}>{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 분석 기록 */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 16,
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="px-6 pt-5 pb-4 flex items-center gap-2">
            <span style={{ color: '#a78bfa', fontSize: 14 }}>✦</span>
            <span className="text-sm font-bold" style={{ color: 'rgba(196,181,253,0.8)' }}>분석 기록</span>
          </div>

          <HistoryTabs activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); loadInitial(tab); }} />

          <div className="p-4">
            {isDetailLoading && (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(167,139,250,0.3)', borderTopColor: '#a78bfa' }} />
              </div>
            )}

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

            {isLoading && !error && (
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            )}

            {!isLoading && !error && records.length > 0 && (
              <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} isLoadingMore={isLoadingMore}>
                <div className="flex flex-col gap-2.5">
                  {records.map((record) => (
                    <HistoryCard
                      key={record.recordId}
                      record={record}
                      onDelete={(id) => setDeleteTargetId(id)}
                      onView={(id) => fetchDetail(id)}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            )}

            {!isLoading && !error && records.length === 0 && <EmptyState />}
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.06)',
            color: 'rgba(248,113,113,0.7)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
            e.currentTarget.style.color = 'rgba(248,113,113,0.7)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
          }}
        >
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>

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
