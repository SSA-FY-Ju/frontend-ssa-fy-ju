'use client';

// 파일 크기 예외: disclaimer→loading→result 단계 전환, sessionStore·analysisStore 저장,
// 중복 요청 방지 로직이 하나의 분석 흐름을 구성하여 분리 시 상태 일관성 위험
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

import { useState, useRef, useCallback } from 'react';
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

  const user = useAuthStore((s) => s.user);

  /** disclaimer 완료 후 실제 API 호출 */
  const runApiCall = useCallback(async () => {
    const args = pendingArgsRef.current;
    if (!args) return;

    setPhase('loading');

    try {
      const request: CareerTimingRequest = {
        birthDate: args.birthDate,
        birthTime: args.birthTime,
        targetName: user?.name || '사용자',
      };

      const data = await fetchCareerTiming(request);
      setResult(data);
      setPhase('result');

      // analysisId → 로컬 fallback 순으로 사용
      const resultId = data.analysisId
        ? String(data.analysisId)
        : `CAREER_TIMING_${args.birthDate}_${args.birthTime}`;
      useSessionStore.getState().setSajuResultId(resultId);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const { isVisible: disclaimerVisible, isFading: disclaimerFading, start: startDisclaimer, reset: resetDisclaimer } =
    useDisclaimerTimer({ onComplete: runApiCall });

  /**
   * 분석 시작 (고지 문구 → 로딩 → 결과)
   * @param birthDate - 생년월일 (YYYY-MM-DD)
   * @param birthTime - 태어난 시간 (HH:mm, 기본값 12:00)
   */
  const submitAnalysis = useCallback((birthDate: string, birthTime: string = '12:00') => {
    console.log('[useCareerTiming] submitAnalysis called', { birthDate, birthTime, phase, isRequesting: isRequestingRef.current });
    // 이미 진행 중이면 무시 (T055b)
    if (isRequestingRef.current) {
      console.warn('[useCareerTiming] Already requesting, ignoring call');
      return;
    }
    isRequestingRef.current = true;

    // API 호출 인자 보관
    pendingArgsRef.current = { birthDate, birthTime };
    setError(null);
    setPhase('disclaimer');

    // 고지 문구 1.5초 표시 시작
    console.log('[useCareerTiming] starting disclaimer');
    startDisclaimer();
  }, [startDisclaimer, phase]);

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
