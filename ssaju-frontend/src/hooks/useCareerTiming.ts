'use client';

/**
 * 관운 기반 채용 시기 분석 훅 (T055)
 *
 * 흐름:
 * 1. submitAnalysis() → 고지 문구 1.5초 표시 (useDisclaimerTimer)
 * 2. 고지 완료 → API 호출 + 로딩 진행 바 표시
 * 3. 응답 수신 → 결과 상태 저장
 *
 * 부가 기능:
 * - sajuResultId를 sessionStore에 저장 (피드백 연동)
 * - 비로그인 시 analysisStore에 휘발성 저장
 * - useRef로 중복 요청 방지 (T055b)
 */

import { useState, useCallback, useRef } from 'react';
import { fetchCareerTiming } from '@/lib/api/career';
import { useDisclaimerTimer } from './useDisclaimerTimer';
import { useSessionStore } from '@/stores/sessionStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';
import type { CareerTimingResult, CareerTimingRequest } from '@/types/api';

type Phase = 'idle' | 'disclaimer' | 'loading' | 'result' | 'error';

export function useCareerTiming() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<CareerTimingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 중복 요청 방지 (T055b)
  const isRequestingRef = useRef(false);
  // API 호출 인자 보존 (disclaimer 완료 후 사용)
  const pendingArgsRef = useRef<{ birthDate: string; birthTime: string } | null>(null);

  /** disclaimer 완료 후 실제 API 호출 */
  const runApiCall = useCallback(async () => {
    const args = pendingArgsRef.current;
    if (!args) return;

    setPhase('loading');

    try {
      const request: CareerTimingRequest = {
        birthDate: args.birthDate,
        birthTime: args.birthTime,
        solarType: 'SOLAR',
      };

      const data = await fetchCareerTiming(request);
      setResult(data);
      setPhase('result');

      // sessionStore에 sajuResultId 저장 (피드백 제출 시 사용)
      useSessionStore.getState().setSajuResultId(data.sajuResultId);
      useSessionStore.getState().setLastAnalysisType('CAREER_TIMING');

      // 비로그인 시 analysisStore에 휘발성 저장
      const { isLoggedIn } = useAuthStore.getState();
      if (!isLoggedIn) {
        useAnalysisStore
          .getState()
          .setCareerTimingResult(data as unknown as Record<string, unknown>);
        useAnalysisStore.getState().setCareerTimingInputs(args);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.';
      setError(message);
      setPhase('error');
      useAnalysisStore.getState().setCareerTimingError(message);
    } finally {
      isRequestingRef.current = false;
      pendingArgsRef.current = null;
    }
  }, []);

  const { isVisible: disclaimerVisible, isFading: disclaimerFading, start: startDisclaimer, reset: resetDisclaimer } =
    useDisclaimerTimer({ onComplete: runApiCall });

  /**
   * 분석 시작 (고지 문구 → 로딩 → 결과)
   * @param birthDate - 생년월일 (YYYY-MM-DD)
   * @param birthTime - 태어난 시간 (HH:mm, 기본값 12:00)
   */
  const submitAnalysis = useCallback(
    (birthDate: string, birthTime: string = '12:00') => {
      // 이미 진행 중이면 무시 (T055b)
      if (isRequestingRef.current) return;
      isRequestingRef.current = true;

      // API 호출 인자 보관
      pendingArgsRef.current = { birthDate, birthTime };
      setError(null);
      setPhase('disclaimer');

      // 고지 문구 1.5초 표시 시작
      startDisclaimer();
    },
    [startDisclaimer],
  );

  /** 상태 초기화 */
  const reset = useCallback(() => {
    resetDisclaimer();
    setResult(null);
    setError(null);
    setPhase('idle');
    isRequestingRef.current = false;
    pendingArgsRef.current = null;
  }, [resetDisclaimer]);

  return {
    phase,
    result,
    error,
    disclaimerVisible,
    disclaimerFading,
    loading: phase === 'loading',
    submitAnalysis,
    reset,
  };
}
