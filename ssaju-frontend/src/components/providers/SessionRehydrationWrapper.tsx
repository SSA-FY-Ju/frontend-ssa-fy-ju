'use client';

import { useSessionRehydration } from '@/hooks/useSessionRehydration';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/stores/authStore';

/**
 * Session 복원 래퍼 컴포넌트
 *
 * app/layout.tsx가 Server Component이므로 'use client'를 사용할 수 없음.
 * 따라서 별도의 Client Component에서 useSessionRehydration을 호출.
 *
 * 동작:
 * - 앱 부팅 시 sessionStorage에서 세션 데이터 로드 및 검증
 * - 유효하지 않으면 초기화 후 /survey로 리다이렉트
 * - AuthModal을 전역으로 렌더링 (헤더 없는 페이지에서도 로그인 모달 표시 가능)
 */
export function SessionRehydrationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionRehydration();

  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);

  return (
    <>
      {children}
      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
