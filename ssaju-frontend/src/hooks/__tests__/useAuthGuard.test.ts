/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { toast } from 'sonner';

// Mock modules
jest.mock('next/navigation');
jest.mock('sonner');
jest.mock('@/stores/authStore');

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('useAuthGuard', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockToast.info = jest.fn();
  });

  it('should allow access when logged in', () => {
    mockUsePathname.mockReturnValue('/my-page');
    mockUseAuthStore.mockReturnValue({
      isLoggedIn: true,
    } as any);

    renderHook(() => useAuthGuard(true));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to / when not logged in', () => {
    mockUsePathname.mockReturnValue('/my-page');
    mockUseAuthStore.mockReturnValue({
      isLoggedIn: false,
    } as any);

    renderHook(() => useAuthGuard(true));

    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockToast.info).toHaveBeenCalledWith('로그인 후 이용해주세요');
  });

  it('should not guard when required=false', () => {
    mockUsePathname.mockReturnValue('/my-page');
    mockUseAuthStore.mockReturnValue({
      isLoggedIn: false,
    } as any);

    renderHook(() => useAuthGuard(false));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not guard root page (login page)', () => {
    mockUsePathname.mockReturnValue('/');
    mockUseAuthStore.mockReturnValue({
      isLoggedIn: false,
    } as any);

    renderHook(() => useAuthGuard(true));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
