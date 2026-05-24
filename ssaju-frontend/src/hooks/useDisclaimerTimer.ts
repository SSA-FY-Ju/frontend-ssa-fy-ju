'use client';

/**
 * 고지 문구 타이밍 관리 훅 (T054)
 *
 * 흐름:
 * 1. start() 호출 → 고지 문구 표시
 * 2. 1.5초 후 페이드 아웃 시작 (500ms)
 * 3. 총 2초 후 onComplete 콜백 → 로딩 상태로 전환
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseDisclaimerTimerOptions {
  /** 고지 문구 표시 완료 후 콜백 (로딩 전환 시점) */
  onComplete: () => void;
}

export function useDisclaimerTimer({ onComplete }: UseDisclaimerTimerOptions) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 항상 최신 onComplete를 참조하도록 ref에 보관
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  /**
   * 고지 문구 타이머 시작
   * - 1500ms: 고지 문구 표시 → 페이드 아웃 시작
   * - 2000ms: 페이드 완료 → onComplete 호출
   */
  const start = useCallback(() => {
    setIsVisible(true);
    setIsFading(false);

    // 1.5초 후 페이드 아웃 시작
    timerRef.current = setTimeout(() => {
      setIsFading(true);

      // 500ms 페이드 아웃 완료 후 onComplete 호출
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsFading(false);
        onCompleteRef.current();
      }, 500);
    }, 1500);
  }, []);

  /** 타이머 정리 */
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
    setIsFading(false);
  }, []);

  return { isVisible, isFading, start, reset };
}
