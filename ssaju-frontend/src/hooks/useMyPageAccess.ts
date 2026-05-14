'use client';

/**
 * 마이페이지 접근 권한 훅 (T098)
 *
 * 비로그인 상태라면 로그인 모달을 열어 로그인 유도
 * 반환: { isLoggedIn, isChecking }
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface UseMyPageAccessReturn {
  isLoggedIn: boolean;
  isChecking: boolean;
}

export function useMyPageAccess(): UseMyPageAccessReturn {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal();
    }
    setIsChecking(false);
  }, [isLoggedIn, openLoginModal]);

  return { isLoggedIn, isChecking };
}
