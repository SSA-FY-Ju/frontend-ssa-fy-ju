'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * 로그인 상태 검증 가드
 *
 * 용도:
 * - /my-page 등 로그인이 필수인 페이지 보호
 *
 * 동작:
 * 1. required=true면 isLoggedIn 확인
 * 2. 로그인 안 되어 있으면 /로 리다이렉트
 * 3. 루트('/') 페이지는 무한 루프 방지 (로그인 유도 페이지)
 *
 * 사용 예:
 * ```typescript
 * export default function MyPage() {
 *   useAuthGuard(true); // 로그인 필수
 *   return <div>...</div>;
 * }
 * ```
 *
 * @param required - 가드 활성화 여부 (기본값: true)
 */
export function useAuthGuard(required: boolean = true) {
  const { isLoggedIn, _hasHydrated, openLoginModal } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!required) return;
    if (!_hasHydrated) return; // localStorage 복원 전에는 판단하지 않음
    if (pathname === '/') return;

    if (!isLoggedIn) {
      openLoginModal();
      router.push('/select');
    }
  }, [required, _hasHydrated, isLoggedIn, pathname, router, openLoginModal]);
}
