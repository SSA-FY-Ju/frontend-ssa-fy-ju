/**
 * usePageExitGuard 훅 테스트
 *
 * 현재 구현 기준 (beforeunload/isLoggedIn 체크는 더 이상 없음):
 * - sajuResultId가 있을 때만 popstate 리스너를 등록
 * - popstate 발생 시 onExitAttempt 콜백 또는 기본 모달(shouldShowExitModal)
 * - confirmExit(): sajuResultId 초기화 + /select 이동
 * - cancelExit(): 모달만 닫음
 * - 언마운트 시 popstate 리스너 해제
 */

import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useSessionStore } from '@/stores/sessionStore';

jest.mock('next/navigation');

jest.mock('@/stores/sessionStore', () => ({
  useSessionStore: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSessionStore = useSessionStore as jest.MockedFunction<typeof useSessionStore>;

function setupMocks({
  sajuResultId = null as string | null,
  setSajuResultId = jest.fn(),
} = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockUseSessionStore.mockImplementation((selector: (s: any) => any) =>
    selector({ sajuResultId, setSajuResultId }),
  );
  return { setSajuResultId };
}

describe('usePageExitGuard', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
    jest.spyOn(window.history, 'pushState').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shouldShowExitModal 초기값은 false', () => {
    setupMocks({ sajuResultId: null });
    const { result } = renderHook(() => usePageExitGuard());
    expect(result.current.shouldShowExitModal).toBe(false);
  });

  it('sajuResultId가 없으면 popstate 리스너를 추가하지 않음', () => {
    setupMocks({ sajuResultId: null });
    renderHook(() => usePageExitGuard());

    const calls = (window.addEventListener as jest.Mock).mock.calls;
    expect(calls.filter(([event]) => event === 'popstate')).toHaveLength(0);
  });

  it('sajuResultId가 있으면 popstate 리스너를 추가함', () => {
    setupMocks({ sajuResultId: 'saju-001' });
    renderHook(() => usePageExitGuard());

    const calls = (window.addEventListener as jest.Mock).mock.calls;
    expect(calls.filter(([event]) => event === 'popstate')).toHaveLength(1);
  });

  it('popstate 이벤트 발생 시 shouldShowExitModal=true', () => {
    setupMocks({ sajuResultId: 'saju-001' });
    const { result } = renderHook(() => usePageExitGuard());

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.shouldShowExitModal).toBe(true);
  });

  it('onExitAttempt 콜백이 있으면 모달 대신 콜백을 호출한다', () => {
    setupMocks({ sajuResultId: 'saju-001' });
    const onExitAttempt = jest.fn();
    const { result } = renderHook(() => usePageExitGuard({ onExitAttempt }));

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(onExitAttempt).toHaveBeenCalledTimes(1);
    expect(result.current.shouldShowExitModal).toBe(false);
  });

  it('sajuResultId가 없으면 popstate 이벤트에 반응 안 함', () => {
    setupMocks({ sajuResultId: null });
    const { result } = renderHook(() => usePageExitGuard());

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.shouldShowExitModal).toBe(false);
  });

  it('confirmExit 호출 시 모달 닫힘 + sajuResultId 초기화 + /select 이동', () => {
    const setSajuResultId = jest.fn();
    setupMocks({ sajuResultId: 'saju-001', setSajuResultId });
    const { result } = renderHook(() => usePageExitGuard());

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.shouldShowExitModal).toBe(true);

    act(() => {
      result.current.confirmExit();
    });

    expect(result.current.shouldShowExitModal).toBe(false);
    expect(setSajuResultId).toHaveBeenCalledWith(null);
    expect(mockPush).toHaveBeenCalledWith('/select');
  });

  it('cancelExit 호출 시 shouldShowExitModal=false', () => {
    setupMocks({ sajuResultId: 'saju-001' });
    const { result } = renderHook(() => usePageExitGuard());

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.shouldShowExitModal).toBe(true);

    act(() => {
      result.current.cancelExit();
    });

    expect(result.current.shouldShowExitModal).toBe(false);
  });

  it('언마운트 시 popstate 리스너 제거', () => {
    setupMocks({ sajuResultId: 'saju-001' });
    const { unmount } = renderHook(() => usePageExitGuard());

    unmount();

    const calls = (window.removeEventListener as jest.Mock).mock.calls;
    expect(calls.filter(([event]) => event === 'popstate')).toHaveLength(1);
  });
});
