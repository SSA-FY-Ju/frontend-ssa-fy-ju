'use client';

import { useRouter } from 'next/navigation';
import ChatInput from '@/components/landing/ChatInput';
import type { PageState } from '@/components/landing/types';
import { useAuthGuard } from '@/hooks/useAuthGuard';

/**
 * 채팅형 입력 페이지
 * 생년월일과 시간을 대화 형식으로 입력받습니다
 */
export default function ChatPage() {
  useAuthGuard(true);
  const router = useRouter();

  const handleStateChange = (state: PageState) => {
    if (state === 'landing') {
      router.push('/');
    }
  };

  return <ChatInput onStateChange={handleStateChange} />;
}
