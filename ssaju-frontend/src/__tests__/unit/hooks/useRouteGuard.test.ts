/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/sessionStore';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { toast } from 'sonner';

// Mock modules
jest.mock('next/navigation');
jest.mock('sonner');
jest.mock('@/stores/sessionStore');

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSessionStore = useSessionStore as jest.MockedFunction<typeof useSessionStore>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('useRouteGuard', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockToast.info = jest.fn();
  });

  it('birthDate가 있으면 통과시키고 리다이렉트하지 않는다', () => {
    mockUseSessionStore.mockReturnValue({
      birthDate: '2000-01-01',
      _hasHydrated: true,
    } as any);

    const { result } = renderHook(() => useRouteGuard(true));

    expect(result.current.isAllowed).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('birthDate가 없으면 /chat으로 리다이렉트하고 안내 토스트를 띄운다', () => {
    mockUseSessionStore.mockReturnValue({
      birthDate: null,
      _hasHydrated: true,
    } as any);

    const { result } = renderHook(() => useRouteGuard(true));

    expect(result.current.isAllowed).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/chat?fromGuard=1');
    expect(mockToast.info).toHaveBeenCalledWith('생년월일을 먼저 입력해주세요');
  });

  it('sessionStore 하이드레이션 전에는 판정을 보류한다', () => {
    mockUseSessionStore.mockReturnValue({
      birthDate: null,
      _hasHydrated: false,
    } as any);

    const { result } = renderHook(() => useRouteGuard(true));

    expect(result.current.isAllowed).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('required=false면 즉시 통과시킨다', () => {
    mockUseSessionStore.mockReturnValue({
      birthDate: null,
      _hasHydrated: true,
    } as any);

    const { result } = renderHook(() => useRouteGuard(false));

    expect(result.current.isAllowed).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
