'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSessionStore } from '@/stores/sessionStore';

/**
 * 라우트 접근 가드 — birthDate(생년월일) 입력 여부만 체크한다.
 *
 * 로그인 여부는 서버가 미들웨어(src/middleware.ts)에서 refreshToken 쿠키로
 * 먼저 걸러내므로 여기서는 다루지 않는다. birthDate는 서버가 알 수 없는
 * 클라이언트 전용 상태(sessionStore)라 클라이언트 가드로 남아있다.
 *
 * 반환값:
 * - isAllowed: true면 birthDate 확인 완료 → 페이지 렌더링 허용
 *              false면 검사 중이거나 리다이렉트 예정 → null 반환 권장
 *
 * @param required - 가드 활성화 여부 (기본값: true)
 */
export function useRouteGuard(required: boolean = true): { isAllowed: boolean } {
  const [isAllowed, setIsAllowed] = useState(false);
  const settledRef = useRef<'allowed' | 'birth-redirect' | null>(null);

  const { birthDate, _hasHydrated } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    if (!required) {
      settledRef.current = 'allowed';
      setIsAllowed(true);
      return;
    }

    if (!_hasHydrated) return;

    if (!birthDate) {
      // birthDate 리다이렉트는 한 번만 실행
      if (settledRef.current !== 'birth-redirect') {
        settledRef.current = 'birth-redirect';
        toast.info('생년월일을 먼저 입력해주세요');
        router.push('/chat?fromGuard=1');
      }
      setIsAllowed(false);
      return;
    }

    settledRef.current = 'allowed';
    setIsAllowed(true);
  }, [required, _hasHydrated, birthDate, router]);

  return { isAllowed };
}
