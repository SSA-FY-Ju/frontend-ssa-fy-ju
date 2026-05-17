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

  // 홈 페이지에서는 헤더 숨김
  if (pathname === '/') return null;

  return (
    <header className="sticky top-0 z-40 border-b border-night-700 bg-night-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-star-500">✦ SSAju</span>
          <span className="hidden text-sm text-gray-400 sm:block">사주 기반 커리어 컨설팅</span>
        </Link>

        <nav className="flex items-center gap-4" aria-label="주요 메뉴">
          <Link
            href="/career-timing"
            className="hidden text-sm text-gray-300 hover:text-white sm:block transition-colors"
          >
            관운 분석
          </Link>
          <Link
            href="/consultation"
            className="hidden text-sm text-gray-300 hover:text-white sm:block transition-colors"
          >
            AI 컨설팅
          </Link>
          <Link
            href="/compatibility"
            className="hidden text-sm text-gray-300 hover:text-white sm:block transition-colors"
          >
            기업 궁합
          </Link>

          {isLoggedIn ? <ProfileMenu /> : <LoginButton />}
        </nav>
      </div>
    </header>
  );
}
