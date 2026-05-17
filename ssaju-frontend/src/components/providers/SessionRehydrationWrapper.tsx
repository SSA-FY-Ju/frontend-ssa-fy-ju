'use client';

import { useSessionRehydration } from '@/hooks/useSessionRehydration';

/**
 * Session 복원 래퍼 컴포넌트
 *
 * app/layout.tsx가 Server Component이므로 'use client'를 사용할 수 없음.
 * 따라서 별도의 Client Component에서 useSessionRehydration을 호출.
 *
 * 동작:
 * - 앱 부팅 시 sessionStorage에서 세션 데이터 로드 및 검증
 * - 유효하지 않으면 초기화 후 /survey로 리다이렉트
 */
export function SessionRehydrationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // 세션 복원 및 검증 실행
  useSessionRehydration();

  return <>{children}</>;
}
