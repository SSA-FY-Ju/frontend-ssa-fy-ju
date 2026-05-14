/**
 * Header 컴포넌트 테스트
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/common/Header';
import { useAuthStore } from '@/stores/authStore';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/components/auth/LoginButton', () => ({
  LoginButton: () => <div data-testid="login-button" />,
}));

jest.mock('@/components/auth/ProfileMenu', () => ({
  ProfileMenu: () => <div data-testid="profile-menu" />,
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

function mockAuthState(isLoggedIn: boolean) {
  (mockUseAuthStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { isLoggedIn: boolean }) => unknown) =>
      selector({ isLoggedIn }),
  );
}

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SSAju 링크가 "/" 경로로 렌더링됨', () => {
    mockAuthState(false);
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /SSAju/ });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('aria-label="주요 메뉴" 네비게이션이 렌더링됨', () => {
    mockAuthState(false);
    render(<Header />);
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
  });

  it('비로그인 상태에서 LoginButton을 표시함', () => {
    mockAuthState(false);
    render(<Header />);
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-menu')).not.toBeInTheDocument();
  });

  it('로그인 상태에서 ProfileMenu를 표시함', () => {
    mockAuthState(true);
    render(<Header />);
    expect(screen.getByTestId('profile-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
  });

  it('네비게이션 링크(관운 분석, AI 컨설팅, 기업 궁합)가 렌더링됨', () => {
    mockAuthState(false);
    render(<Header />);
    expect(screen.getByRole('link', { name: '관운 분석' })).toHaveAttribute('href', '/career-timing');
    expect(screen.getByRole('link', { name: 'AI 컨설팅' })).toHaveAttribute('href', '/consultation');
    expect(screen.getByRole('link', { name: '기업 궁합' })).toHaveAttribute('href', '/compatibility');
  });
});
