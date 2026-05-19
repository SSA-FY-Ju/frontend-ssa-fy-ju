/**
 * components/auth/LoginNudgeCard 단위 테스트
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginNudgeCard } from '@/components/auth/LoginNudgeCard';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/auth/AuthModal', () => ({
  AuthModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="auth-modal" /> : null,
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ isLoggedIn: false })),
}));

import { useAuth } from '@/hooks/useAuth';
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginNudgeCard (auth)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ isLoggedIn: false, user: null, isLoading: false, loginError: null, login: jest.fn(), signup: jest.fn(), logout: jest.fn() });
  });

  it('비로그인 상태에서 카드를 렌더링함', () => {
    render(<LoginNudgeCard />);
    expect(screen.getByText(/로그인하지 않으면/)).toBeInTheDocument();
  });

  it('로그인 상태에서 null을 반환함', () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: true, user: null, isLoading: false, loginError: null, login: jest.fn(), signup: jest.fn(), logout: jest.fn() });
    const { container } = render(<LoginNudgeCard />);
    expect(container.firstChild).toBeNull();
  });

  it('"지금 로그인하기" 버튼이 렌더링됨', () => {
    render(<LoginNudgeCard />);
    expect(screen.getByRole('button', { name: '지금 로그인하기' })).toBeInTheDocument();
  });

  it('로그인 버튼 클릭 시 AuthModal이 열림', async () => {
    const user = userEvent.setup();
    render(<LoginNudgeCard />);
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '지금 로그인하기' }));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });
});
