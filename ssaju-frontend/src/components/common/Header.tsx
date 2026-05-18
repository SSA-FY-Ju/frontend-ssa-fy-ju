'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LoginButton } from '@/components/auth/LoginButton';
import { ProfileMenu } from '@/components/auth/ProfileMenu';
import { useAuthStore } from '@/stores/authStore';

/**
 * 글로벌 헤더
 *
 * 로그인 상태에 따라:
 * - 비로그인: LoginButton 표시
 * - 로그인됨: ProfileMenu 표시
 *
 * 홈 페이지(/)에서는 숨김
 */
export function Header() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const pathname = usePathname();

  // 홈 페이지, 채팅 입력 페이지, AI 컨설팅 페이지에서는 헤더 숨김
  if (pathname === '/' || pathname === '/chat' || pathname === '/consultation') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif italic text-lg font-semibold text-yellow-300/70 hover:text-yellow-300 transition-colors">✦ SSAju</span>
          <span className="hidden text-xs text-gray-400/50 sm:block">사주 기반 커리어 컨설팅</span>
        </Link>

        {isLoggedIn ? <ProfileMenu /> : <LoginButton />}
      </div>
    </header>
  );
}
