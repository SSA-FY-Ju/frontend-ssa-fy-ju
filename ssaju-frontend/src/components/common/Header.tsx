'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginButton } from '@/components/auth/LoginButton';
import { ProfileMenu } from '@/components/auth/ProfileMenu';
import { useAuthStore } from '@/stores/authStore';
import { useSessionStore } from '@/stores/sessionStore';

const RESULT_PAGES = ['/career-timing', '/consultation', '/compatibility', '/compatibility/result'];

/**
 * 인증 상태 확정 전에 자리만 잡아두는 플레이스홀더.
 *
 * isLoggedIn은 localStorage에서 복원되므로 서버 렌더 시점에는 알 수 없다.
 * 서버에서 임의로 "로그인" 또는 "로그아웃" 중 하나를 그리면 하이드레이션 직후
 * 반대 상태로 튀는 깜빡임이 생기므로, 확정될 때까지는 같은 크기의 빈 칸을 둔다.
 * 로그인 버튼(약 73×38)과 마이페이지 버튼(약 95×34)을 모두 덮는 크기로 잡아
 * 전환 시 레이아웃 이동이 없도록 한다.
 */
function AuthSlotSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 95,
        height: 38,
        borderRadius: 10,
        background: 'rgba(139,92,246,0.06)',
        border: '1px solid rgba(139,92,246,0.12)',
      }}
    />
  );
}

export function Header() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const requestExit = useSessionStore((s) => s.requestExit);
  const pathname = usePathname();
  const router = useRouter();

  // 첫 렌더는 서버와 반드시 같아야 하므로 mount 이후에만 인증 UI를 그린다.
  // _hasHydrated 만으로 판단하면 안 되는 이유: localStorage는 동기 저장소라
  // Zustand persist가 스토어 생성 시점에 이미 복원을 끝낼 수 있고, 그러면
  // 클라이언트 첫 렌더는 true / 서버는 false 가 되어 하이드레이션 불일치가 난다.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const authReady = mounted && hasHydrated;

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
        ) : !authReady ? (
          <AuthSlotSkeleton />
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
