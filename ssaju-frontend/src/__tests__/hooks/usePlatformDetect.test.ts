/**
 * usePlatformDetect 훅 테스트
 *
 * - isMobile(): 768px 기준 판별
 * - openOAuthWindow(): 모바일 리다이렉트 / 데스크톱 팝업 / 팝업 차단 폴백
 * - 팝업 닫힘 감지 후 onSuccess 콜백 호출
 */

import { renderHook, act } from '@testing-library/react';
import { usePlatformDetect } from '@/hooks/usePlatformDetect';

describe('usePlatformDetect', () => {
  const TEST_URL = 'https://auth.example.com/oauth';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  // ─── isMobile ────────────────────────────────────────────────────────────

  describe('isMobile()', () => {
    it('innerWidth가 767px이면 true를 반환한다', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      });

      const { result } = renderHook(() => usePlatformDetect());
      expect(result.current.isMobile()).toBe(true);
    });

    it('innerWidth가 768px이면 false를 반환한다', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => usePlatformDetect());
      expect(result.current.isMobile()).toBe(false);
    });

    it('innerWidth가 1440px이면 false를 반환한다', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const { result } = renderHook(() => usePlatformDetect());
      expect(result.current.isMobile()).toBe(false);
    });
  });

  // ─── openOAuthWindow — 모바일 ─────────────────────────────────────────────

  describe('openOAuthWindow() — 모바일(innerWidth < 768)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('모바일에서 window.location.href를 URL로 설정한다', () => {
      // jsdom에서 location.href를 직접 교체 (delete 후 재정의)
      const originalLocation = window.location;
      // @ts-expect-error jsdom location 교체
      delete window.location;
      // @ts-expect-error jsdom location 교체
      window.location = { ...originalLocation, href: '' };

      const { result } = renderHook(() => usePlatformDetect());

      act(() => {
        result.current.openOAuthWindow(TEST_URL);
      });

      expect(window.location.href).toBe(TEST_URL);

      // 복원
      // @ts-expect-error jsdom location 교체
      window.location = originalLocation;
    });

    it('모바일에서 window.open을 호출하지 않는다', () => {
      const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

      // jsdom navigation 경고 방지를 위해 location 교체
      const originalLocation = window.location;
      // @ts-expect-error jsdom location 교체
      delete window.location;
      // @ts-expect-error jsdom location 교체
      window.location = { ...originalLocation, href: '' };

      const { result } = renderHook(() => usePlatformDetect());

      act(() => {
        result.current.openOAuthWindow(TEST_URL);
      });

      expect(openSpy).not.toHaveBeenCalled();

      openSpy.mockRestore();
      // @ts-expect-error jsdom location 복원
      window.location = originalLocation;
    });
  });

  // ─── openOAuthWindow — 데스크톱 ───────────────────────────────────────────

  describe('openOAuthWindow() — 데스크톱(innerWidth >= 768)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      });
    });

    it('데스크톱에서 window.open을 호출해 팝업을 연다', () => {
      const mockPopup = { closed: false } as Window;
      const openSpy = jest.spyOn(window, 'open').mockReturnValue(mockPopup);

      const { result } = renderHook(() => usePlatformDetect());

      act(() => {
        result.current.openOAuthWindow(TEST_URL);
      });

      expect(openSpy).toHaveBeenCalledWith(
        TEST_URL,
        'oauth',
        expect.stringContaining('width=500'),
      );

      openSpy.mockRestore();
    });

    it('팝업이 차단(window.open이 null 반환)되면 window.location.href로 폴백한다', () => {
      const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

      const originalLocation = window.location;
      // @ts-expect-error jsdom location 교체
      delete window.location;
      // @ts-expect-error jsdom location 교체
      window.location = { ...originalLocation, href: '' };

      const { result } = renderHook(() => usePlatformDetect());

      act(() => {
        result.current.openOAuthWindow(TEST_URL);
      });

      expect(window.location.href).toBe(TEST_URL);

      openSpy.mockRestore();
      // @ts-expect-error jsdom location 교체
      window.location = originalLocation;
    });

    it('팝업이 닫히면 setInterval이 정리되고 onSuccess 콜백을 호출한다', () => {
      jest.useFakeTimers();

      const mockPopup = { closed: false } as Window;
      const openSpy = jest.spyOn(window, 'open').mockReturnValue(mockPopup);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => usePlatformDetect());

      act(() => {
        result.current.openOAuthWindow(TEST_URL, onSuccess);
      });

      expect(onSuccess).not.toHaveBeenCalled();

      // 팝업 닫힘 시뮬레이션
      (mockPopup as { closed: boolean }).closed = true;

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);

      openSpy.mockRestore();
      jest.useRealTimers();
    });

    it('팝업이 열려 있는 동안에는 onSuccess가 호출되지 않는다', () => {
      jest.useFakeTimers();

      const mockPopup = { closed: false } as Window;
      const openSpy = jest.spyOn(window, 'open').mockReturnValue(mockPopup);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => usePlatformDetect());

      act(() => {
        result.current.openOAuthWindow(TEST_URL, onSuccess);
      });

      act(() => {
        jest.advanceTimersByTime(2000); // 4번 tick, 팝업 열려있음
      });

      expect(onSuccess).not.toHaveBeenCalled();

      openSpy.mockRestore();
      jest.useRealTimers();
    });
  });
});
