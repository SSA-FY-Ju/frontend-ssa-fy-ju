'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * 로그인 상태 검증 가드
 *
 * 용도:
 * - /my-page 등 로그인이 필수인 페이지 보호
 *
 * 동작:
 * 1. required=true면 isLoggedIn 확인
 * 2. 로그인 안 되어 있으면 로그인 모달 표시
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
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const pathname = usePathname();

  useEffect(() => {
    if (!required) return;
    if (!_hasHydrated || !isAuthReady) return; // 복원 + refresh 완료 전에는 판단하지 않음
    if (pathname === '/') return;

    if (!isLoggedIn) {
      openLoginModal();
    }
  }, [required, _hasHydrated, isAuthReady, isLoggedIn, pathname, openLoginModal]);
}
