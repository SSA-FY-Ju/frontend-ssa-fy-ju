'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useSessionStore } from '@/stores/sessionStore';

/**
 * 필수 입력값(birthDate) 검증 가드
 *
 * 용도:
 * - /services, /result/* 등 필수 입력값이 필요한 페이지 보호
 *
 * 동작:
 * 1. required=true면 birthDate 확인
 * 2. 없으면 /survey로 리다이렉트 + 토스트
 * 3. /survey 페이지는 무한 루프 방지 (진입점)
 *
 * 사용 예:
 * ```typescript
 * export default function ServicesPage() {
 *   useRouteGuard(true); // birthDate 필수
 *   return <div>...</div>;
 * }
 * ```
 *
 * @param required - 가드 활성화 여부 (기본값: true)
 */
export function useRouteGuard(required: boolean = true) {
  const { birthDate, _hasHydrated } = useSessionStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!required) return;
    if (!_hasHydrated) return; // hydration 완료 전엔 검사 안 함
    if (pathname?.startsWith('/survey')) return;

    if (!birthDate) {
      router.push('/chat');
      toast.error('먼저 생년월일을 입력해주세요');
    }
  }, [required, _hasHydrated, birthDate, pathname, router]);
}
