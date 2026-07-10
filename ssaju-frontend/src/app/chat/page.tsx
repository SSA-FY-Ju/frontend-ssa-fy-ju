'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import ChatInput from '@/components/landing/ChatInput';
import type { PageState } from '@/components/landing/types';
import { useSessionStore } from '@/stores/sessionStore';

// 로그인 여부는 미들웨어(src/middleware.ts)가 서버에서 먼저 걸러낸다.
function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedService, _hasHydrated } = useSessionStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!selectedService) {
      // useRouteGuard가 리다이렉트한 경우 toast 생략 (이미 다른 toast 출력됨)
      const fromGuard = searchParams.get('fromGuard') === '1';
      if (!fromGuard) {
        toast.info('서비스를 먼저 선택해주세요');
      }
      router.push('/select');
    }
  }, [_hasHydrated, selectedService, router, searchParams]);

  const handleStateChange = (state: PageState) => {
    if (state === 'landing') {
      router.push('/');
    }
  };

  if (!selectedService) return null;
  return <ChatInput onStateChange={handleStateChange} />;
}

/**
 * 채팅형 입력 페이지
 * 생년월일과 시간을 대화 형식으로 입력받습니다
 */
export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}
