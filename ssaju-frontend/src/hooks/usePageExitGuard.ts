'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSessionStore } from '@/stores/sessionStore';

interface UsePageExitGuardReturn {
  shouldShowExitModal: boolean;
  confirmExit: () => void;
  cancelExit: () => void;
}

/**
 * 비로그인 + 분석 결과 있는 경우 페이지 이탈 방지 훅
 *
 * - window.beforeunload: 탭 닫기/새로고침 시 브라우저 기본 이탈 방지 다이얼로그
 * - popstate: 브라우저 뒤로가기/앞으로가기 감지 → 커스텀 모달 표시
 */
export function usePageExitGuard(): UsePageExitGuardReturn {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const sajuResultId = useSessionStore((s) => s.sajuResultId);
  const setSajuResultId = useSessionStore((s) => s.setSajuResultId);

  const [shouldShowExitModal, setShouldShowExitModal] = useState(false);

  const isActive = !isLoggedIn && !!sajuResultId;

  // 탭 닫기 / 새로고침 시 브라우저 기본 이탈 방지
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome 계열은 returnValue 설정 필요
      e.returnValue = '분석 결과가 사라집니다. 정말 나가시겠습니까?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive]);

  // 브라우저 뒤로가기/앞으로가기 감지 (Next.js App Router — popstate 기반)
  useEffect(() => {
    if (!isActive) return;

    const handlePopState = () => {
      // 뒤로가기 감지 시 히스토리 엔트리를 다시 push해 이탈을 막고 모달 표시
      window.history.pushState(null, '', window.location.href);
      setShouldShowExitModal(true);
    };

    // 현재 페이지를 히스토리에 push해 popstate가 발화될 수 있도록 준비
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isActive]);

  const confirmExit = () => {
    setSajuResultId(null);
    setShouldShowExitModal(false);
    // popstate 리스너가 제거된 상태에서 뒤로가기 재실행
    window.history.back();
  };

  const cancelExit = () => {
    setShouldShowExitModal(false);
  };

  return {
    shouldShowExitModal,
    confirmExit,
    cancelExit,
  };
}
