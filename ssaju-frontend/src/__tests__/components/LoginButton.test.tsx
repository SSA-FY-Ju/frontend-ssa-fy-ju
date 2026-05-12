/**
 * LoginButton 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginButton } from '@/components/auth/LoginButton';
import { useAuthStore } from '@/stores/authStore';

// useAuth 모킹
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn().mockReturnValue({
    isLoggedIn: false,
    loginWithKakao: jest.fn(),
    loginWithGoogle: jest.fn(),
    isLoading: false,
    loginError: null,
  }),
}));

describe('LoginButton', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  it('로그인 버튼이 렌더링됨', () => {
    render(<LoginButton />);
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('로그인 버튼 클릭 시 모달 열림', () => {
    render(<LoginButton />);
    fireEvent.click(screen.getByText('로그인'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('모달에 카카오/구글 버튼이 표시됨', () => {
    render(<LoginButton />);
    fireEvent.click(screen.getByText('로그인'));
    expect(screen.getByText('카카오로 계속하기')).toBeInTheDocument();
    expect(screen.getByText('구글로 계속하기')).toBeInTheDocument();
  });

  it('모달 닫기 버튼 클릭 시 모달 닫힘', () => {
    render(<LoginButton />);
    fireEvent.click(screen.getByText('로그인'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('닫기'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
