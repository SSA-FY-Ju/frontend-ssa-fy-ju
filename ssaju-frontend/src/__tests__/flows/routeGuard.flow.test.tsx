/**
 * 사용자 흐름: 라우트 가드 (birthDate 미입력 시 /chat으로 리다이렉트)
 *
 * 배경: 이 프로젝트의 라우트 보호는 두 레이어로 나뉜다.
 *   1) 로그인 여부 — src/middleware.ts가 refreshToken 쿠키 존재 여부로
 *      서버에서 1차로 걸러낸다 (미들웨어 테스트는 이 파일의 범위 밖).
 *   2) birthDate(생년월일) 입력 여부 — 서버가 알 수 없는 클라이언트 전용
 *      상태(sessionStore)라서, 여전히 클라이언트 훅(useRouteGuard)이 담당한다.
 * 이 테스트는 2번, 즉 useRouteGuard가 실제 career-timing 페이지 안에서
 * sessionStore.birthDate 유무에 따라 접근을 막거나 허용하는지를
 * "페이지 컴포넌트를 실제로 렌더링"하는 수준까지 확인한다 (훅 단위 테스트인
 * src/__tests__/unit/hooks/useRouteGuard.test.ts보다 한 단계 더 통합적).
 */
import { screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CareerTimingPage from '@/app/career-timing/page';
import { useSessionStore } from '@/stores/sessionStore';
import { renderWithProviders } from './test-utils';

jest.mock('next/navigation');
jest.mock('sonner');
// career-timing 페이지는 마운트되자마자 useCareerTiming이 자동으로 분석을
// 시작한다(useEffect). 이 테스트는 "가드가 페이지 진입을 허용/차단하는지"만
// 보는 것이지 분석 결과 자체는 관심사가 아니므로, fetchCareerTiming이
// 절대 resolve/reject되지 않는 Promise를 반환하게 해서 phase가 'idle' 상태에
// 머물게 고정한다. (실제 분석 진행 흐름은 careerTiming.flow.test.tsx가 다룬다)
jest.mock('@/lib/api/career', () => ({
  fetchCareerTiming: jest.fn(() => new Promise(() => {})), // 이 흐름에서는 응답이 오지 않아도 됨
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('라우트 가드 흐름 (career-timing)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // sessionStore도 실제 Zustand 스토어를 그대로 쓴다. useRouteGuard는
    // _hasHydrated가 true가 되기 전까지는 판정을 보류하므로(로컬스토리지
    // 복원 전 깜빡임 방지), 테스트에서는 하이드레이션이 끝난 것으로
    // 명시적으로 세팅해줘야 가드 로직이 실제로 실행된다.
    useSessionStore.getState().reset();
    useSessionStore.getState().setHasHydrated(true);
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
    mockToast.info = jest.fn();
  });

  it('birthDate가 없으면 /chat?fromGuard=1로 리다이렉트하고 페이지 본문을 렌더링하지 않는다', async () => {
    // sessionStore.birthDate는 reset() 직후 기본값이 null이므로 별도 세팅 불필요.
    renderWithProviders(<CareerTimingPage />);

    // useRouteGuard의 useEffect가 비동기로 판정을 내리므로 waitFor로 기다린다.
    // ?fromGuard=1 쿼리는 이동 대상인 /chat 페이지가 "이미 가드가 안내
    // 토스트를 띄웠으니 중복으로 또 띄우지 마라"라고 판단하는 신호로 쓰인다.
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/chat?fromGuard=1');
    });
    // 리다이렉트와 함께 사용자에게 왜 이동했는지 안내하는 토스트도 확인
    expect(mockToast.info).toHaveBeenCalledWith('생년월일을 먼저 입력해주세요');
    // isAllowed=false인 동안 페이지는 실질적으로 빈 화면(null)을 반환하므로,
    // 분석 진행 UI 텍스트가 전혀 나타나지 않아야 한다.
    expect(screen.queryByText('사주를 분석하고 있습니다...')).not.toBeInTheDocument();
  });

  it('birthDate가 있으면 리다이렉트 없이 페이지 본문이 렌더링된다', async () => {
    useSessionStore.getState().setBirthDate('1998-05-01');
    useSessionStore.getState().setBirthTime('09:30');

    const { container } = renderWithProviders(<CareerTimingPage />);

    // 가드를 통과하면 null이 아니라 실제 <main> 트리가 렌더링된다 (분석 진행 중이라
    // disclaimer 오버레이 뒤에 가려져 있을 뿐, 리다이렉트되어 사라지지 않는다).
    // 구체적인 분석 진행 상태(로딩/결과/에러)까지는 이 테스트의 관심사가
    // 아니라서, "페이지 트리 자체가 살아있다"는 사실만 확인한다.
    await waitFor(() => {
      expect(container.querySelector('main')).not.toBeNull();
    });
    // 가드가 통과했으니 /chat 리다이렉트가 절대 일어나지 않아야 한다.
    expect(mockPush).not.toHaveBeenCalled();
  });
});
