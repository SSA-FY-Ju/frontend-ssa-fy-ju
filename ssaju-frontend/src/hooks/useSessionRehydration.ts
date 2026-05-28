'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSessionStore } from '@/stores/sessionStore';
import { parseSessionData } from '@/lib/validation/schemas';

/**
 * 앱 부팅 시 sessionStorage에서 세션 데이터를 복원하고 검증
 *
 * 호출 장소:
 * - app/layout.tsx의 RootLayout에서 호출 (앱 부팅 시 1회)
 *
 * 동작:
 * 1. sessionStorage에서 'sessionData' 로드
 * 2. Zod로 검증 (YYYY-MM-DD, HH:mm 형식)
 * 3. 실패 시: 데이터 초기화 → /chat으로 리다이렉트 → 토스트
 * 4. 성공 시: sessionStore 초기화 (자동)
 * 5. 없으면: 첫 방문으로 처리 (에러 없음)
 *
 * 주의:
 * - useRouter()는 'use client' 컴포넌트에서만 호출 가능
 * - app/layout.tsx가 'use client'여야 함
 * - 중복 호출 방지: app/layout.tsx에서 RootLayout 컴포넌트의 최상단에서만 호출
 */
export function useSessionRehydration() {
  const { initSession, clearSession } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sessionData');

      // sessionStorage에 데이터가 없으면 첫 방문 또는 초기화됨 → 정상
      if (!raw) {
        return;
      }

      // 데이터가 있으면 검증
      const sessionData = parseSessionData(raw);

      // 검증 성공 → sessionStore에 초기화
      initSession(sessionData);
    } catch (error) {
      // 검증 실패: sessionStorage 데이터 오염 또는 형식 오류
      // 1. sessionStorage 초기화
      sessionStorage.removeItem('sessionData');

      // 2. sessionStore 초기화
      clearSession();

      // 3. /chat으로 리다이렉트 (생년월일 재입력)
      router.push('/chat');

      // 4. 사용자에게 알림
      toast.error('세션이 만료되었습니다. 다시 시작해주세요');
    }
  }, [initSession, clearSession, router]);
}
