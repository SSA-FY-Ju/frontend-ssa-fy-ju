'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ChatInput from '@/components/landing/ChatInput';
import type { PageState } from '@/components/landing/types';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * 채팅형 입력 페이지
 * 생년월일과 시간을 대화 형식으로 입력받습니다
 */
export default function ChatPage() {
  useAuthGuard(true);
  const router = useRouter();
  const { selectedService, _hasHydrated } = useSessionStore();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);

  useEffect(() => {
    if (!_hasHydrated || !isAuthReady) return;
    if (!isLoggedIn) return; // useAuthGuard가 이미 처리
    if (!selectedService) {
      toast.info('서비스를 먼저 선택해주세요');
      router.push('/select');
    }
  }, [_hasHydrated, isAuthReady, isLoggedIn, selectedService, router]);

  const handleStateChange = (state: PageState) => {
    if (state === 'landing') {
      router.push('/');
    }
  };

  return <ChatInput onStateChange={handleStateChange} />;
}
