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

function mockAuthState(isLoggedIn: boolean) {
  (mockUseAuthStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { isLoggedIn: boolean }) => unknown) =>
      selector({ isLoggedIn }),
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
});
