/**
 * useDisclaimerTimer 훅 테스트 (T062 일부)
 */

import { renderHook, act } from '@testing-library/react';
import { useDisclaimerTimer } from '@/hooks/useDisclaimerTimer';

jest.useFakeTimers();

describe('useDisclaimerTimer', () => {
  const onComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('초기 상태: isVisible false, isFading false', () => {
    const { result } = renderHook(() => useDisclaimerTimer({ onComplete }));
    expect(result.current.isVisible).toBe(false);
    expect(result.current.isFading).toBe(false);
  });

  it('start() 호출 시 즉시 isVisible true', () => {
    const { result } = renderHook(() => useDisclaimerTimer({ onComplete }));

    act(() => {
      result.current.start();
    });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.isFading).toBe(false);
  });

  it('1500ms 후 isFading true로 전환', () => {
    const { result } = renderHook(() => useDisclaimerTimer({ onComplete }));

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(result.current.isFading).toBe(true);
  });

  it('2000ms(1500+500) 후 onComplete 호출', () => {
    const { result } = renderHook(() => useDisclaimerTimer({ onComplete }));

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.isVisible).toBe(false);
  });

  it('reset() 호출 시 상태 초기화', () => {
    const { result } = renderHook(() => useDisclaimerTimer({ onComplete }));

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.isFading).toBe(false);
    // reset 이후 타이머 진행해도 onComplete 호출 안 됨
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(onComplete).not.toHaveBeenCalled();
  });
});
