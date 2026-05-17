/**
 * usePageExitGuard 훅 테스트
 *
 * 검증:
 * - shouldShowExitModal 초기값 false
 * - 로그인 상태에서 beforeunload 리스너 추가 안 함
 * - 비로그인 + sajuResultId 있을 때 beforeunload 리스너 추가
 * - popstate 이벤트 시 shouldShowExitModal=true
 * - confirmExit / cancelExit 동작
 */

import { renderHook, act } from '@testing-library/react';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useAuthStore } from '@/stores/authStore';
import { useSessionStore } from '@/stores/sessionStore';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/stores/sessionStore', () => ({
  useSessionStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseSessionStore = useSessionStore as jest.MockedFunction<typeof useSessionStore>;

function setupMocks({
  isLoggedIn = false,
  sajuResultId = null as string | null,
  setSajuResultId = jest.fn(),
} = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockUseAuthStore.mockImplementation((selector: (s: any) => any) =>
    selector({ isLoggedIn }),
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockUseSessionStore.mockImplementation((selector: (s: any) => any) =>
    selector({ sajuResultId, setSajuResultId }),
  );
  return { setSajuResultId };
}

describe('usePageExitGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
    jest.spyOn(window.history, 'pushState').mockImplementation(() => {});
    jest.spyOn(window.history, 'back').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shouldShowExitModal 초기값은 false', () => {
    setupMocks({ isLoggedIn: false, sajuResultId: null });
    const { result } = renderHook(() => usePageExitGuard());
    expect(result.current.shouldShowExitModal).toBe(false);
  });

  it('로그인 상태이면 beforeunload 리스너를 추가하지 않음', () => {
    setupMocks({ isLoggedIn: true, sajuResultId: 'saju-001' });
    renderHook(() => usePageExitGuard());

    const calls = (window.addEventListener as jest.Mock).mock.calls;
    const beforeunloadCalls = calls.filter(([event]) => event === 'beforeunload');
    expect(beforeunloadCalls).toHaveLength(0);
  });

  it('sajuResultId가 없으면 beforeunload 리스너를 추가하지 않음', () => {
    setupMocks({ isLoggedIn: false, sajuResultId: null });
    renderHook(() => usePageExitGuard());

    const calls = (window.addEventListener as jest.Mock).mock.calls;
    const beforeunloadCalls = calls.filter(([event]) => event === 'beforeunload');
    expect(beforeunloadCalls).toHaveLength(0);
  });

  it('비로그인 + sajuResultId 있을 때 beforeunload 리스너 추가', () => {
    setupMocks({ isLoggedIn: false, sajuResultId: 'saju-001' });
    renderHook(() => usePageExitGuard());

    const calls = (window.addEventListener as jest.Mock).mock.calls;
    const beforeunloadCalls = calls.filter(([event]) => event === 'beforeunload');
    expect(beforeunloadCalls).toHaveLength(1);
  });

  it('popstate 이벤트 발생 시 shouldShowExitModal=true', () => {
    setupMocks({ isLoggedIn: false, sajuResultId: 'saju-001' });
    const { result } = renderHook(() => usePageExitGuard());

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.shouldShowExitModal).toBe(true);
  });

  it('비로그인 + sajuResultId 없으면 popstate 이벤트에 반응 안 함', () => {
    setupMocks({ isLoggedIn: false, sajuResultId: null });
    const { result } = renderHook(() => usePageExitGuard());

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.shouldShowExitModal).toBe(false);
  });

  it('confirmExit 호출 시 shouldShowExitModal=false, setSajuResultId(null) 호출', () => {
    const setSajuResultId = jest.fn();
    setupMocks({ isLoggedIn: false, sajuResultId: 'saju-001', setSajuResultId });
    const { result } = renderHook(() => usePageExitGuard());

    // 먼저 모달 표시 상태로 만들기
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.shouldShowExitModal).toBe(true);

    act(() => {
      result.current.confirmExit();
    });

    expect(result.current.shouldShowExitModal).toBe(false);
    expect(setSajuResultId).toHaveBeenCalledWith(null);
  });

  it('cancelExit 호출 시 shouldShowExitModal=false', () => {
    setupMocks({ isLoggedIn: false, sajuResultId: 'saju-001' });
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

  it('언마운트 시 beforeunload 리스너 제거', () => {
    setupMocks({ isLoggedIn: false, sajuResultId: 'saju-001' });
    const { unmount } = renderHook(() => usePageExitGuard());

    unmount();

    const calls = (window.removeEventListener as jest.Mock).mock.calls;
    const beforeunloadCalls = calls.filter(([event]) => event === 'beforeunload');
    expect(beforeunloadCalls).toHaveLength(1);
  });

  it('언마운트 시 popstate 리스너 제거', () => {
    setupMocks({ isLoggedIn: false, sajuResultId: 'saju-001' });
    const { unmount } = renderHook(() => usePageExitGuard());

    unmount();

    const calls = (window.removeEventListener as jest.Mock).mock.calls;
    const popstateCalls = calls.filter(([event]) => event === 'popstate');
    expect(popstateCalls).toHaveLength(1);
  });

  it('beforeunload 이벤트 발생 시 e.preventDefault() 호출 및 returnValue 설정', () => {
    setupMocks({ isLoggedIn: false, sajuResultId: 'saju-001' });
    renderHook(() => usePageExitGuard());

    const event = new Event('beforeunload') as BeforeUnloadEvent;
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    Object.defineProperty(event, 'returnValue', { writable: true, value: '' });

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((event as any).returnValue).toBe('분석 결과가 사라집니다. 정말 나가시겠습니까?');
  });
});
