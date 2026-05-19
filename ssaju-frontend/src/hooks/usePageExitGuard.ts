'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/sessionStore';

interface UsePageExitGuardOptions {
  /** 뒤로가기 감지 시 기본 모달 대신 호출할 콜백 */
  onExitAttempt?: () => void;
}

interface UsePageExitGuardReturn {
  shouldShowExitModal: boolean;
  confirmExit: () => void;
  cancelExit: () => void;
}

/**
 * 분석 결과 페이지 이탈 방지 훅
 *
 * - popstate: 뒤로가기 감지 → onExitAttempt 콜백 또는 기본 모달 표시
 * - confirmExit(): sajuResultId 초기화 후 /select 이동
 */
export function usePageExitGuard(options?: UsePageExitGuardOptions): UsePageExitGuardReturn {
  const router = useRouter();
  const sajuResultId = useSessionStore((s) => s.sajuResultId);
  const setSajuResultId = useSessionStore((s) => s.setSajuResultId);

  const [shouldShowExitModal, setShouldShowExitModal] = useState(false);

  // 콜백을 ref로 보관해 useEffect 재실행 없이 최신값 유지
  const onExitAttemptRef = useRef(options?.onExitAttempt);
  useEffect(() => {
    onExitAttemptRef.current = options?.onExitAttempt;
  });

  const isActive = !!sajuResultId;

  useEffect(() => {
    if (!isActive) return;

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      if (onExitAttemptRef.current) {
        onExitAttemptRef.current();
      } else {
        setShouldShowExitModal(true);
      }
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isActive]);

  const confirmExit = () => {
    setSajuResultId(null);
    setShouldShowExitModal(false);
    router.push('/select');
  };

  const cancelExit = () => {
    setShouldShowExitModal(false);
  };

  return { shouldShowExitModal, confirmExit, cancelExit };
}
