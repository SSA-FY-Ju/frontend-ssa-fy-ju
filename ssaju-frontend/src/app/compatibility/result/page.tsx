'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useSessionStore } from '@/stores/sessionStore';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { analysisCache } from '@/lib/analysisCache';
import type { CompatibilityResult } from '@/types/api';

// Swiper는 브라우저 전용 — SSR 비활성화
const FullPageCompatibility = dynamic(
  () => import('@/components/compatibility/FullPageCompatibility').then((m) => ({ default: m.FullPageCompatibility })),
  { ssr: false }
);

export default function CompatibilityResultPage() {
  const router = useRouter();
  const { isAllowed } = useRouteGuard(true);

  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackIsExitMode, setFeedbackIsExitMode] = useState(false);

  const sajuResultId = useSessionStore((s) => s.sajuResultId);
  const feedbackGivenIds = useSessionStore((s) => s.feedbackGivenIds);
  const setFeedbackGiven = useSessionStore((s) => s.setFeedbackGiven);
  const exitRequestPending = useSessionStore((s) => s.exitRequestPending);
  const clearExitRequest = useSessionStore((s) => s.clearExitRequest);

  const hasFeedback = !!sajuResultId && feedbackGivenIds.includes(`${sajuResultId}_COMPATIBILITY`);

  // 캐시에서 결과 복원 — 없으면 폼으로 리다이렉트
  useEffect(() => {
    const cached = analysisCache.get<CompatibilityResult>('compatibility');
    if (!cached) {
      router.replace('/compatibility');
      return;
    }
    setResult(cached);

    const stored = sessionStorage.getItem('ssaju_compat_company')
      ?? cached.requestContext?.companyName
      ?? '';
    setCompanyName(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { confirmExit } = usePageExitGuard({
    onExitAttempt: () => {
      if (!hasFeedback) {
        setFeedbackIsExitMode(true);
        setFeedbackModalOpen(true);
      } else {
        confirmExit();
      }
    },
  });

  const handleFeedbackSubmitted = () => {
    if (sajuResultId) setFeedbackGiven(sajuResultId, 'COMPATIBILITY');
    if (feedbackIsExitMode) confirmExit();
  };

  const handleFeedbackClose = () => {
    setFeedbackModalOpen(false);
    setFeedbackIsExitMode(false);
  };

  // 헤더 "처음으로" 버튼 처리
  useEffect(() => {
    if (!exitRequestPending) return;
    clearExitRequest();
    if (!hasFeedback) {
      setFeedbackIsExitMode(true);
      setFeedbackModalOpen(true);
    } else {
      confirmExit();
    }
  }, [exitRequestPending, hasFeedback, clearExitRequest, confirmExit]);

  if (!isAllowed) return null;
  if (!result) return null;

  return (
    <main className="relative z-10 text-white" style={{ height: '100vh', overflow: 'hidden' }}>
      <FullPageCompatibility
        result={result}
        companyName={companyName}
        hasFeedback={hasFeedback}
        onFeedbackOpen={() => { setFeedbackIsExitMode(false); setFeedbackModalOpen(true); }}
      />

      {feedbackModalOpen && (
        <FeedbackModal
          feedbackType="COMPATIBILITY"
          onClose={handleFeedbackClose}
          onSubmitted={handleFeedbackSubmitted}
          exitAction={feedbackIsExitMode ? { onExit: confirmExit } : undefined}
        />
      )}
    </main>
  );
}
