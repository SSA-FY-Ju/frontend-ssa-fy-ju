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
  const { birthDate } = useSessionStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 가드 비활성화
    if (!required) {
      return;
    }

    // /survey 페이지는 진입점이므로 보호 안 함 (무한 루프 방지)
    if (pathname?.startsWith('/survey')) {
      return;
    }

    // birthDate 없으면 /survey로 리다이렉트
    if (!birthDate) {
      router.push('/survey');
      toast.error('먼저 기본 정보를 입력해주세요');
    }
  }, [required, birthDate, pathname, router]);
}
