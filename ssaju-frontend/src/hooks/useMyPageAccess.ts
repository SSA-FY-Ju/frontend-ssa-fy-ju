'use client';

/**
 * 마이페이지 접근 권한 훅 (T098)
 *
 * 비로그인 상태라면 /career-timing으로 자동 리다이렉트
 * 반환: { isLoggedIn, isChecking }
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface UseMyPageAccessReturn {
  isLoggedIn: boolean;
  isChecking: boolean;
}

export function useMyPageAccess(): UseMyPageAccessReturn {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 마운트 직후 로그인 여부 확인
    if (!isLoggedIn) {
      router.push('/career-timing');
    }
    setIsChecking(false);
  }, [isLoggedIn, router]);

  return { isLoggedIn, isChecking };
}
