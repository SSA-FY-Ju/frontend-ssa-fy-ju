'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginButton } from '@/components/auth/LoginButton';
import { ProfileMenu } from '@/components/auth/ProfileMenu';
import { useAuthStore } from '@/stores/authStore';
import { useSessionStore } from '@/stores/sessionStore';

const RESULT_PAGES = ['/career-timing', '/consultation', '/compatibility'];

export function Header() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const requestExit = useSessionStore((s) => s.requestExit);
  const pathname = usePathname();
  const router = useRouter();

  // 홈, 채팅 입력 페이지에서는 헤더 숨김
  if (pathname === '/' || pathname === '/chat') return null;

  const isResultPage = RESULT_PAGES.includes(pathname);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
        <Link href="/select" className="flex items-center gap-2">
          <span className="font-serif italic text-lg font-semibold text-yellow-300/70 hover:text-yellow-300 transition-colors">✦ SSAju</span>
          <span className="hidden text-xs text-gray-400/50 sm:block">사주 기반 커리어 컨설팅</span>
        </Link>

        {isResultPage ? (
          <button
            onClick={() => { if (isResultPage) { requestExit(); } else { router.push('/select'); } }}
            style={{
              padding: '7px 16px',
              borderRadius: 10,
              border: '1px solid rgba(139,92,246,0.3)',
              background: 'rgba(139,92,246,0.08)',
              color: 'rgba(196,181,253,0.8)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139,92,246,0.18)';
              e.currentTarget.style.color = '#c4b5fd';
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139,92,246,0.08)';
              e.currentTarget.style.color = 'rgba(196,181,253,0.8)';
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
            }}
          >
            처음으로
          </button>
        ) : pathname === '/select' && isLoggedIn ? (
          <button
            onClick={() => router.push('/my-page')}
            className="btn-mypage-sparkle"
            style={{
              padding: '7px 16px',
              borderRadius: 10,
              border: '1px solid rgba(139,92,246,0.3)',
              background: 'rgba(139,92,246,0.08)',
              color: 'rgba(196,181,253,0.8)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139,92,246,0.22)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139,92,246,0.08)';
            }}
          >
            <span className="sparkle-icon" style={{ fontSize: 10 }}>✦</span>
            마이페이지
          </button>
        ) : (
          <div className="flex items-center gap-4">
            {isLoggedIn ? <ProfileMenu /> : <LoginButton />}
          </div>
        )}
      </div>
    </header>
  );
}
