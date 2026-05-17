/**
 * LoginNudgeCard 컴포넌트 테스트
 *
 * 검증:
 * - isLoggedIn=true 시 null 반환
 * - show=false 시 null 반환
 * - !isLoggedIn && show=true 시 카드 렌더링
 * - role="region" aria-label="로그인 안내"
 * - 카카오 버튼 클릭 시 loginWithKakao 호출
 * - 구글 버튼 클릭 시 loginWithGoogle 호출
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginNudgeCard } from '@/components/common/LoginNudgeCard';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function setupMocks({
  isLoggedIn = false,
  openLoginModal = jest.fn(),
  loginWithKakao = jest.fn().mockResolvedValue(undefined),
  loginWithGoogle = jest.fn().mockResolvedValue(undefined),
} = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockUseAuthStore.mockImplementation((selector: (s: any) => any) =>
    selector({ isLoggedIn, openLoginModal }),
  );

  mockUseAuth.mockReturnValue({
    loginWithKakao,
    loginWithGoogle,
    isLoggedIn,
    user: null,
    isLoading: false,
    loginError: null,
    logout: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return { openLoginModal, loginWithKakao, loginWithGoogle };
}

describe('LoginNudgeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isLoggedIn=true 이면 아무것도 렌더링하지 않음', () => {
    setupMocks({ isLoggedIn: true });
    const { container } = render(<LoginNudgeCard show={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('show=false 이면 아무것도 렌더링하지 않음', () => {
    setupMocks({ isLoggedIn: false });
    const { container } = render(<LoginNudgeCard show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('isLoggedIn=true + show=false 이면 아무것도 렌더링하지 않음', () => {
    setupMocks({ isLoggedIn: true });
    const { container } = render(<LoginNudgeCard show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('!isLoggedIn && show=true 이면 카드 렌더링', () => {
    setupMocks({ isLoggedIn: false });
    render(<LoginNudgeCard show={true} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('role="region" aria-label="로그인 안내" 속성 확인', () => {
    setupMocks({ isLoggedIn: false });
    render(<LoginNudgeCard show={true} />);
    expect(screen.getByRole('region', { name: '로그인 안내' })).toBeInTheDocument();
  });

  it('카카오로 로그인 버튼이 렌더링됨', () => {
    setupMocks({ isLoggedIn: false });
    render(<LoginNudgeCard show={true} />);
    expect(screen.getByText('카카오로 로그인')).toBeInTheDocument();
  });

  it('구글로 로그인 버튼이 렌더링됨', () => {
    setupMocks({ isLoggedIn: false });
    render(<LoginNudgeCard show={true} />);
    expect(screen.getByText('구글로 로그인')).toBeInTheDocument();
  });

  it('카카오 버튼 클릭 시 openLoginModal과 loginWithKakao 호출', () => {
    const { openLoginModal, loginWithKakao } = setupMocks({ isLoggedIn: false });
    render(<LoginNudgeCard show={true} />);

    fireEvent.click(screen.getByText('카카오로 로그인'));

    expect(openLoginModal).toHaveBeenCalledTimes(1);
    expect(loginWithKakao).toHaveBeenCalledTimes(1);
  });

  it('구글 버튼 클릭 시 openLoginModal과 loginWithGoogle 호출', () => {
    const { openLoginModal, loginWithGoogle } = setupMocks({ isLoggedIn: false });
    render(<LoginNudgeCard show={true} />);

    fireEvent.click(screen.getByText('구글로 로그인'));

    expect(openLoginModal).toHaveBeenCalledTimes(1);
    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('카카오 버튼만 클릭해도 구글 버튼 콜백은 호출되지 않음', () => {
    const { loginWithKakao, loginWithGoogle } = setupMocks({ isLoggedIn: false });
    render(<LoginNudgeCard show={true} />);

    fireEvent.click(screen.getByText('카카오로 로그인'));

    expect(loginWithKakao).toHaveBeenCalledTimes(1);
    expect(loginWithGoogle).not.toHaveBeenCalled();
  });

  it('구글 버튼만 클릭해도 카카오 버튼 콜백은 호출되지 않음', () => {
    const { loginWithKakao, loginWithGoogle } = setupMocks({ isLoggedIn: false });
    render(<LoginNudgeCard show={true} />);

    fireEvent.click(screen.getByText('구글로 로그인'));

    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
    expect(loginWithKakao).not.toHaveBeenCalled();
  });

  it('카드 내에 결과 저장 안내 텍스트 포함', () => {
    setupMocks({ isLoggedIn: false });
    render(<LoginNudgeCard show={true} />);
    expect(screen.getByText(/결과가 저장되지 않습니다/)).toBeInTheDocument();
  });
});
