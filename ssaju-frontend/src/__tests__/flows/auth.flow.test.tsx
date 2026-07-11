/**
 * 사용자 흐름: 로그인 → 로그아웃
 *
 * AuthModal(선택 화면 → 로그인 폼 → 제출)과 useAuth.logout()을 실제 컴포넌트/훅
 * 그대로 구동해서, authStore.isLoggedIn이 각 단계에서 올바르게 전환되는지
 * 끝까지 확인한다. 이 프로젝트의 인증 아키텍처(accessToken/refreshToken을
 * HttpOnly 쿠키로 관리, 미들웨어가 로그인 여부를 서버에서 1차로 걸러냄)에서
 * 클라이언트 쪽에 남은 책임은 "로그인 폼 제출 → authStore 갱신 → UI 반영"
 * 이 부분이라, 이 흐름 테스트가 그 경계를 검증한다.
 *
 * 목(mock) 구성 요약:
 * - next/navigation: AuthModal이 로그인 성공 후 router.push('/select')를
 *   호출하므로 실제 라우터 없이 호출 여부만 확인
 * - @/lib/api/auth: 실제 HTTP 요청 없이 login()/logout()의 성공·실패를 흉내냄
 * - @/lib/api/mypage: useAuth.login()이 로그인 직후 사용자 정보 동기화를 위해
 *   fetchMyPageData를 한 번 더 호출하는데(내부 구현), 이걸 안 막으면 실제
 *   axios 요청이 나가버려서 테스트가 네트워크에 의존하게 된다
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { renderWithProviders, AppProviders } from './test-utils';

jest.mock('next/navigation');
jest.mock('@/lib/api/auth', () => ({
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
}));
jest.mock('@/lib/api/mypage', () => ({
  fetchMyPageData: jest.fn().mockResolvedValue({
    profile: { id: 1, name: '테스트', email: 'test@test.com', createdAt: '', lastLoginAt: '' },
    analyses: [],
    pagination: { page: 0, size: 1, total: 0, totalPages: 0 },
  }),
}));

const { login: loginApi, logout: logoutApi } = jest.requireMock('@/lib/api/auth');
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('로그인 → 로그아웃 흐름', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // authStore는 실제 Zustand 스토어(모킹하지 않음)를 그대로 쓴다.
    // 테스트 간 상태가 새는 걸 막기 위해 매번 초기 상태로 리셋한다.
    useAuthStore.getState().reset();
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
  });

  it('선택 화면 → 로그인 폼 입력 → 제출 → 로그인 상태로 전환되고 모달이 닫힌다', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    loginApi.mockResolvedValueOnce({ accessToken: 'test-token' });

    renderWithProviders(<AuthModal isOpen onClose={onClose} />);

    // AuthModal은 열리면 먼저 "로그인/회원가입" 선택 화면(view='select')을 보여준다.
    // 이 선택 화면의 "로그인" 버튼은 이모지+제목+부제목이 한 버튼 안에 같이
    // 들어있어서, 접근성 이름(accessible name)이 그 텍스트들을 전부 이어붙인
    // 값이 된다(예: "🔑 로그인 기존 계정으로 계속하기 ›"). 그래서
    // getByRole('button', { name: '로그인' })은 정확히 일치하지 않아 실패하고,
    // 대신 화면에 보이는 텍스트 노드만 정확히 매칭하는 getByText를 쓴다.
    await user.click(screen.getByText('로그인'));

    // 로그인 폼(view='login')으로 전환된 뒤에는 이메일/비밀번호 input을 채운다.
    // 이 input들은 <label>에 htmlFor 연결이 없어서(디자인상 label과 input이
    // 시각적으로만 묶여 있음) getByLabelText로는 못 찾고, placeholder로 찾는다.
    await user.type(screen.getByPlaceholderText('example@email.com'), 'user@test.com');
    await user.type(screen.getByPlaceholderText('비밀번호를 입력해주세요'), 'password123');

    // 여기서는 화면에 로그인 폼의 제출 버튼("로그인")만 남아있고, 위에서 클릭한
    // 선택 화면 버튼은 이미 언마운트된 상태라 getByRole('button', {name:'로그인'})이
    // 그 제출 버튼 하나로 유일하게 매칭된다 (제출 버튼은 다른 텍스트를 안 붙임).
    await user.click(screen.getByRole('button', { name: '로그인' }));

    // handleLogin은 비동기(useAuth.login → loginApi → fetchMyPageData)라서
    // isLoggedIn이 true가 되는 시점을 waitFor로 기다린다.
    await waitFor(() => {
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
    });
    // 로그인 API가 폼에 입력한 값 그대로 호출됐는지도 함께 검증
    expect(loginApi).toHaveBeenCalledWith({ email: 'user@test.com', password: 'password123' });
    // AuthModal.handleLogin은 성공 시 onClose()를 호출해 모달을 닫는다
    expect(onClose).toHaveBeenCalled();
    // 그리고 /select로 리다이렉트한다 (로그인 후 서비스 선택 화면으로 이동)
    expect(mockPush).toHaveBeenCalledWith('/select');
  });

  it('로그인 실패 시 에러 메시지를 보여주고 로그인 상태가 되지 않는다', async () => {
    const user = userEvent.setup();
    // jest.requireActual으로 진짜 ApiError 클래스를 가져온다 — 위에서 login을
    // 통째로 jest.fn()으로 목킹했기 때문에, 던지는 에러도 AuthModal의
    // `err instanceof ApiError && err.statusCode === 401` 분기를 타도록
    // 실제 ApiError 인스턴스여야 한다 (평범한 Error면 이 분기를 안 탐).
    const { ApiError } = jest.requireActual('@/lib/api/client');
    loginApi.mockRejectedValueOnce(new ApiError(401, 'UNAUTHORIZED', '인증 실패', 'req-1'));

    renderWithProviders(<AuthModal isOpen onClose={jest.fn()} />);

    await user.click(screen.getByText('로그인'));
    await user.type(screen.getByPlaceholderText('example@email.com'), 'user@test.com');
    await user.type(screen.getByPlaceholderText('비밀번호를 입력해주세요'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    // 401 ApiError를 받으면 AuthModal이 이 고정 문구를 localError로 표시한다
    // (findByText는 비동기 렌더를 기다려주므로 waitFor 없이도 안전)
    expect(await screen.findByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
    // 로그인 실패이므로 authStore는 계속 비로그인 상태여야 한다
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });

  it('로그인 상태에서 logout() 호출 시 비로그인 상태로 전환된다', async () => {
    // 로그인 화면 UI 없이, "이미 로그인된 상태"를 authStore에 직접 세팅해서
    // 로그아웃 흐름만 따로 검증한다 (로그인 흐름은 위 두 테스트가 이미 커버함).
    useAuthStore.getState().setUser({ userId: 'u1', email: 'a@b.com', name: '테스트' });
    logoutApi.mockResolvedValueOnce(undefined);

    // 컴포넌트를 렌더링할 필요는 없고 useAuth 훅만 있으면 되므로 renderHook 사용.
    // useAuth 내부가 useQueryClient()를 쓰기 때문에 wrapper로 AppProviders를 넘긴다.
    const { result } = renderHook(() => useAuth(), { wrapper: AppProviders });

    expect(useAuthStore.getState().isLoggedIn).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    // logout()은 authStore.reset() + 여러 스토어 초기화 + 캐시 삭제를 한다.
    // 여기서는 그중 인증 관련 상태(isLoggedIn, user)만 확인한다.
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(logoutApi).toHaveBeenCalled();
  });
});
