/**
 * LoginButton 컴포넌트 테스트
 *
 * 현재 구현 기준: LoginButton은 모달을 직접 렌더링하지 않고
 * authStore.openLoginModal()만 호출한다. 실제 모달(AuthModal)은
 * SessionRehydrationWrapper에서 전역으로 렌더링되므로 여기서 검증하지 않는다.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginButton } from '@/components/auth/LoginButton';
import { useAuthStore } from '@/stores/authStore';

describe('LoginButton', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it('로그인 버튼이 렌더링됨', () => {
    render(<LoginButton />);
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('클릭 시 authStore.isLoginModalOpen이 true가 됨', () => {
    render(<LoginButton />);
    expect(useAuthStore.getState().isLoginModalOpen).toBe(false);

    fireEvent.click(screen.getByText('로그인'));

    expect(useAuthStore.getState().isLoginModalOpen).toBe(true);
  });
});
