/**
 * Header 컴포넌트 테스트
 *
 * 현재 구현 기준:
 * - pathname이 '/' 또는 '/chat'이면 헤더 자체를 숨김(null)
 * - 로고는 '/select'로 연결
 * - 결과 페이지(RESULT_PAGES)에서는 "처음으로" 버튼
 * - '/select'에서 로그인 상태면 "마이페이지" 버튼
 * - 그 외에는 로그인 여부에 따라 ProfileMenu / LoginButton
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { useAuthStore } from '@/stores/authStore';

jest.mock('next/navigation');

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/stores/sessionStore', () => ({
  useSessionStore: jest.fn(() => jest.fn()),
}));

jest.mock('@/components/auth/LoginButton', () => ({
  LoginButton: () => <div data-testid="login-button" />,
}));

jest.mock('@/components/auth/ProfileMenu', () => ({
  ProfileMenu: () => <div data-testid="profile-menu" />,
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

/**
 * _hasHydrated: localStorage 복원 완료 여부.
 * Header는 이 값이 true이고 mount까지 끝난 뒤에야 인증 UI(로그인/프로필/마이페이지)를
 * 그린다. 서버 렌더 시점에는 로그인 여부를 알 수 없으므로 그 전에는 스켈레톤을 둔다.
 */
function mockAuthState(isLoggedIn: boolean, hasHydrated = true) {
  (mockUseAuthStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { isLoggedIn: boolean; _hasHydrated: boolean }) => unknown) =>
      selector({ isLoggedIn, _hasHydrated: hasHydrated }),
  );
}

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn() } as unknown as ReturnType<typeof useRouter>);
    mockUsePathname.mockReturnValue('/select');
  });

  it('pathname이 "/"이면 렌더링하지 않음 (null)', () => {
    mockUsePathname.mockReturnValue('/');
    mockAuthState(false);
    const { container } = render(<Header />);
    expect(container).toBeEmptyDOMElement();
  });

  it('pathname이 "/chat"이면 렌더링하지 않음 (null)', () => {
    mockUsePathname.mockReturnValue('/chat');
    mockAuthState(false);
    const { container } = render(<Header />);
    expect(container).toBeEmptyDOMElement();
  });

  it('로고 링크가 "/select" 경로로 렌더링됨', () => {
    mockAuthState(false);
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /SSAju/ });
    expect(logoLink).toHaveAttribute('href', '/select');
  });

  it('/select에서 비로그인 상태면 LoginButton을 표시함', () => {
    mockUsePathname.mockReturnValue('/my-page');
    mockAuthState(false);
    render(<Header />);
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-menu')).not.toBeInTheDocument();
  });

  it('로그인 상태면 ProfileMenu를 표시함', () => {
    mockUsePathname.mockReturnValue('/my-page');
    mockAuthState(true);
    render(<Header />);
    expect(screen.getByTestId('profile-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
  });

  it('결과 페이지(career-timing 등)에서는 "처음으로" 버튼을 표시함', () => {
    mockUsePathname.mockReturnValue('/career-timing');
    mockAuthState(true);
    render(<Header />);
    expect(screen.getByRole('button', { name: '처음으로' })).toBeInTheDocument();
  });

  it('/select에서 로그인 상태면 "마이페이지" 버튼을 표시함', () => {
    mockUsePathname.mockReturnValue('/select');
    mockAuthState(true);
    render(<Header />);
    expect(screen.getByRole('button', { name: /마이페이지/ })).toBeInTheDocument();
  });

  // 아래 두 케이스는 SSR 복구(1단계)의 회귀 방지용이다.
  // 예전에는 SessionRehydrationWrapper가 하이드레이션 전 트리 전체를 null로 막아
  // prerender HTML의 본문이 0자였다. 이제는 본문을 그리고, 인증 UI만 늦게 확정한다.
  it('하이드레이션 전에는 인증 UI 대신 스켈레톤을 표시함', () => {
    mockUsePathname.mockReturnValue('/my-page');
    mockAuthState(true, false);
    render(<Header />);
    expect(screen.queryByTestId('profile-menu')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
  });

  it('하이드레이션 전에도 헤더 골격(로고)은 렌더링됨', () => {
    mockUsePathname.mockReturnValue('/my-page');
    mockAuthState(false, false);
    render(<Header />);
    expect(screen.getByRole('link', { name: /SSAju/ })).toHaveAttribute('href', '/select');
  });
});
