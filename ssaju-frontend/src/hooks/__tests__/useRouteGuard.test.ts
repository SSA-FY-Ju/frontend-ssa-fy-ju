/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useSessionStore } from '@/stores/sessionStore';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { toast } from 'sonner';

// Mock modules
jest.mock('next/navigation');
jest.mock('sonner');
jest.mock('@/stores/sessionStore');

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseSessionStore = useSessionStore as jest.MockedFunction<typeof useSessionStore>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('useRouteGuard', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockToast.error = jest.fn();
  });

  it('should allow access when birthDate exists', () => {
    mockUsePathname.mockReturnValue('/career-timing');
    mockUseSessionStore.mockReturnValue({
      birthDate: '2000-01-01',
    } as any);

    renderHook(() => useRouteGuard(true));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to /survey when birthDate is missing', () => {
    mockUsePathname.mockReturnValue('/career-timing');
    mockUseSessionStore.mockReturnValue({
      birthDate: null,
    } as any);

    renderHook(() => useRouteGuard(true));

    expect(mockPush).toHaveBeenCalledWith('/survey');
    expect(mockToast.error).toHaveBeenCalledWith(
      '먼저 기본 정보를 입력해주세요'
    );
  });

  it('should not guard when required=false', () => {
    mockUsePathname.mockReturnValue('/career-timing');
    mockUseSessionStore.mockReturnValue({
      birthDate: null,
    } as any);

    renderHook(() => useRouteGuard(false));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not guard /survey pages (entry point)', () => {
    mockUsePathname.mockReturnValue('/survey');
    mockUseSessionStore.mockReturnValue({
      birthDate: null,
    } as any);

    renderHook(() => useRouteGuard(true));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not guard /survey/[step] pages', () => {
    mockUsePathname.mockReturnValue('/survey/step2');
    mockUseSessionStore.mockReturnValue({
      birthDate: null,
    } as any);

    renderHook(() => useRouteGuard(true));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
