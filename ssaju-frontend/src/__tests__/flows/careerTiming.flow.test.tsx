/**
 * 사용자 흐름: 관운 분석 자동 제출 → 결과 표시 / 에러 표시
 *
 * career-timing 페이지는 진입 즉시(라우트 가드를 통과하고 birthDate가 있으면)
 * useCareerTiming 훅이 자동으로 분석을 시작한다. 흐름은
 *   idle → disclaimer(고지 문구 2초 노출) → loading → result 또는 error
 * 이 테스트는 라우트 가드 통과는 이미 전제(routeGuard.flow.test.tsx에서 검증)로
 * 깔고, 그 이후 "자동 제출 → 결과/에러 렌더링"까지 실제 페이지 컴포넌트로
 * 끝까지 확인한다.
 */
import { screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CareerTimingPage from '@/app/career-timing/page';
import { useSessionStore } from '@/stores/sessionStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';
import { renderWithProviders } from './test-utils';

jest.mock('next/navigation');
jest.mock('@/lib/api/career', () => ({
  fetchCareerTiming: jest.fn(),
}));

const { fetchCareerTiming } = jest.requireMock('@/lib/api/career');
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// 백엔드가 내려주는 실제 응답 형태(types/api.ts의 CareerTimingResult)를 그대로
// 흉내낸 목 데이터. analysisId는 useCareerTiming이 sessionStore.sajuResultId를
// 채우는 데 쓰인다(피드백 제출 시 어떤 분석에 대한 피드백인지 구분하는 키).
const mockResult = {
  analysisId: 1001,
  favoredPeriod: '2026년 상반기',
  confidenceScore: 82,
  reasoning: '관운이 강하게 들어오는 시기입니다.',
};

/**
 * disclaimer(2000ms) 타이머를 빠르게 통과시키는 헬퍼.
 * useDisclaimerTimer는 1.5초 후 페이드아웃을 시작해 2초 시점에 onComplete를
 * 호출하고, 그때 phase가 disclaimer → loading으로 넘어간다. jest 가짜 타이머로
 * 2000ms를 건너뛰면 이 전환을 기다리지 않고 즉시 발생시킬 수 있다.
 */
async function skipDisclaimer() {
  await act(async () => {
    jest.advanceTimersByTime(2000);
  });
}

describe('관운 분석 제출 흐름', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // disclaimer 타이머(setTimeout 기반)를 제어하려면 가짜 타이머가 필요하다.
    jest.useFakeTimers();
    useSessionStore.getState().reset();
    useSessionStore.getState().setHasHydrated(true);
    // 이 흐름 테스트는 라우트 가드 통과가 전제이므로 birthDate를 미리 채워둔다
    // (routeGuard.flow.test.tsx가 birthDate 없을 때의 리다이렉트를 이미 검증함).
    useSessionStore.getState().setBirthDate('1998-05-01');
    useSessionStore.getState().setBirthTime('09:30');
    useAnalysisStore.getState().reset();
    useAuthStore.getState().reset();
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    // 가짜 타이머를 다음 테스트 파일/스위트로 새지 않게 원복
    jest.useRealTimers();
  });

  it('진입 시 자동으로 분석이 시작되어 결과가 표시된다', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);

    renderWithProviders(<CareerTimingPage />);

    // 마운트 직후에는 disclaimer 문구가 화면을 가리고 있어 실제 결과 UI가
    // 아직 안 보인다. 2초를 건너뛰어야 loading → API 호출로 넘어간다.
    await skipDisclaimer();

    // useCareerTiming이 sessionStore의 birthDate/birthTime을 실어
    // fetchCareerTiming을 호출했는지 확인 (targetName 등 다른 필드도 같이
    // 전달되므로 objectContaining으로 필요한 필드만 체크).
    await waitFor(() => {
      expect(fetchCareerTiming).toHaveBeenCalledWith(
        expect.objectContaining({ birthDate: '1998-05-01', birthTime: '09:30' }),
      );
    });

    // 신뢰도 숫자(82)는 CircularGauge 컴포넌트가 0→82로 1.4초짜리
    // requestAnimationFrame 카운트업 애니메이션을 돌리기 때문에, 렌더 직후
    // 값을 단정적으로 읽으면 항상 0에 가깝게 보인다. 그래서 애니메이션
    // 여부와 무관하게 즉시 확정되는 결과 텍스트(favoredPeriod)로만
    // "결과 phase까지 도달했다"는 걸 확인한다.
    expect(await screen.findByText('2026년 상반기')).toBeInTheDocument();
  });

  it('분석 API 실패 시 에러 메시지와 재시도 버튼이 표시된다', async () => {
    fetchCareerTiming.mockRejectedValueOnce(new Error('분석 중 오류가 발생했습니다.'));

    renderWithProviders(<CareerTimingPage />);

    await skipDisclaimer();

    // phase가 'error'가 되면 ErrorMessage 컴포넌트가 retryLabel="다시 시도"
    // 버튼을 렌더링한다. 정확한 에러 메시지 문구는 useErrorHandler가 가공해서
    // 바꿀 수 있으므로, 여기서는 "에러 상태로 전환되어 재시도 UI가 뜨는지"만
    // 확인하고 메시지 내용 자체는 검증하지 않는다.
    expect(await screen.findByRole('button', { name: /다시 시도/ })).toBeInTheDocument();
  });
});
