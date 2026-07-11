/**
 * 사용자 흐름: 마이페이지 기록 목록 조회 → 카드 클릭 → 상세 페이지 진입
 *
 * 실제 SPA에서는 /my-page에서 카드를 클릭하면 Next.js 라우터가
 * /my-page/[id]?type=... 로 클라이언트 사이드 네비게이션을 한다. Jest 환경에는
 * 실제 라우터가 없어서 한 테스트 안에서 "페이지 전환"을 재현할 수는 없으므로,
 * 이 파일은 두 단계로 나눠서 검증한다.
 *   1) my-page 페이지가 목록을 렌더링하고, 카드 클릭 시 올바른 상세 URL로
 *      router.push가 "호출되는지"까지만 확인한다 (실제 이동 여부는 Next.js의
 *      책임이라 여기서 검증할 수 없고, 검증할 필요도 없다).
 *   2) 그 상세 URL이 가리키는 id/type으로 my-page/[id] 페이지를 별도로
 *      렌더링해서, 해당 파라미터에 맞는 분석 결과가 올바르게 나오는지 확인한다.
 * 두 페이지를 이어붙이는 방식이지만, 실제로 클릭했을 때 라우터에 어떤 값이
 * 전달되고 그 값으로 상세 페이지가 무엇을 렌더링하는지는 정확히 커버한다.
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import MyPage from '@/app/my-page/page';
import AnalysisDetailPage from '@/app/my-page/[id]/page';
import { useAuthStore } from '@/stores/authStore';
import { renderWithProviders } from './test-utils';

jest.mock('next/navigation');
jest.mock('@/lib/api/mypage', () => ({
  fetchMyPageData: jest.fn(),
  fetchAnalysisRecord: jest.fn(),
}));
// my-page 페이지는 기록 삭제 모달을 위해 useDeleteHistory를 쓰는데, 이 흐름
// 테스트는 목록 조회/이동만 검증하므로 삭제 관련 동작은 아예 목으로 대체한다
// (실제 훅을 쓰면 useMutation → useQueryClient 의존이 딸려오지만, 지금은
// 그 경로를 아예 안 타게 만드는 게 테스트 의도를 더 명확히 드러낸다).
jest.mock('@/hooks/useDeleteHistory', () => ({
  useDeleteHistory: () => ({ deleteRecord: jest.fn(), isDeleting: false }),
}));

const { fetchMyPageData, fetchAnalysisRecord } = jest.requireMock('@/lib/api/mypage');
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

// 백엔드의 실제 마이페이지 응답 형태(types/api.ts MyPageData)를 그대로 흉내낸
// 목 데이터. favoredPeriod는 'H1'/'H2' 코드값이어야 한다 — HistoryCard가
// 이 값을 "상반기 유리"/"하반기 유리" 문구로 변환해서 보여주기 때문에,
// 임의의 한글 문자열을 넣으면 카드에 아무 텍스트도 안 뜬다.
const mockMyPageData = {
  profile: { id: 1, name: '홍길동', email: 'hong@test.com', createdAt: '', lastLoginAt: '' },
  analyses: [
    { id: 1, type: 'TIMING', birthDate: '1998-05-01', createdAt: '2026-07-01T00:00:00Z', favoredPeriod: 'H1', confidenceScore: 82 },
  ],
  pagination: { page: 0, size: 10, total: 1, totalPages: 1 },
};

describe('마이페이지 목록 → 상세 흐름', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // useMyPage의 목록 조회 쿼리는 enabled: isLoggedIn 으로 게이트되어 있어서,
    // 로그인 상태가 아니면 fetchMyPageData가 아예 호출되지 않는다. setUser는
    // authStore.isLoggedIn을 true로 같이 세팅해주므로 이걸로 로그인 상태를 만든다.
    useAuthStore.getState().reset();
    useAuthStore.getState().setUser({ userId: '1', email: 'hong@test.com', name: '홍길동' });
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
  });

  it('목록을 불러와 카드로 표시하고, 클릭 시 상세 페이지 경로로 이동한다', async () => {
    const user = userEvent.setup();
    fetchMyPageData.mockResolvedValueOnce(mockMyPageData);

    renderWithProviders(<MyPage />);

    // HistoryCard 전체가 role="button"인 클릭 가능 영역이라, 그 안의 아무
    // 텍스트 노드나 클릭해도 이벤트가 카드까지 버블링되어 onView가 호출된다.
    // "신뢰도 82%" 텍스트를 앵커로 삼아 그 카드를 찾는다.
    const card = await screen.findByText(/신뢰도 82%/);
    await user.click(card);

    // HistoryCard의 onView(id, type) → router.push(`/my-page/${id}?type=${type}`)
    // 로 이어지는지, 즉 클릭한 카드의 id/type이 정확히 URL에 실리는지 확인.
    expect(mockPush).toHaveBeenCalledWith('/my-page/1?type=TIMING');
  });

  it('빈 기록일 때는 빈 상태 화면을 보여준다', async () => {
    fetchMyPageData.mockResolvedValueOnce({ ...mockMyPageData, analyses: [] });

    renderWithProviders(<MyPage />);

    // isSuccess && analyses.length === 0 조건에서 EmptyState가 렌더링된다.
    expect(await screen.findByText(/아직 분석 기록이 없습니다/)).toBeInTheDocument();
  });

  it('상세 페이지는 id/type에 맞는 분석 결과를 렌더링한다', async () => {
    // my-page/[id]/page.tsx는 useParams()로 동적 세그먼트(id)를, useSearchParams()로
    // 쿼리스트링(type)을 읽는다. 실제 라우터가 없으므로 둘 다 직접 목으로
    // 채워서 "1번 기록, TIMING 타입"으로 진입한 것처럼 재현한다.
    mockUseParams.mockReturnValue({ id: '1' });
    mockUseSearchParams.mockReturnValue(new URLSearchParams('type=TIMING') as unknown as ReturnType<typeof useSearchParams>);
    // 실제 백엔드 응답은 AnalysisRecord 타입 선언과 달리 careerFortuneDetail/
    // consultationDetail/compatibilityDetail 중 하나의 필드에 실 데이터가
    // 담겨서 온다 (페이지의 extractData 함수가 이 셋 중 존재하는 걸 찾아 씀).
    // TIMING 타입이므로 careerFortuneDetail에 CareerTimingResult 형태를 넣는다.
    fetchAnalysisRecord.mockResolvedValueOnce({
      recordId: '1',
      userId: '1',
      createdAt: Date.now(),
      careerFortuneDetail: {
        analysisId: 1,
        favoredPeriod: '2026년 상반기',
        confidenceScore: 82,
        reasoning: '관운이 강한 시기입니다.',
      },
    });

    renderWithProviders(<AnalysisDetailPage />);

    // type==='TIMING' 분기가 CareerTimingResult 컴포넌트로 careerFortuneDetail을
    // 그대로 넘겨 렌더링하므로, 그 안의 favoredPeriod 텍스트가 그대로 보여야 한다.
    expect(await screen.findByText('2026년 상반기')).toBeInTheDocument();
  });
});
