'use client';

// 파일 크기 예외: disclaimer→loading→result 단계 전환, sessionStore·analysisStore 저장,
// 중복 요청 방지 로직이 하나의 분석 흐름을 구성하여 분리 시 상태 일관성 위험
/**
 * 기업 궁합 분석 훅 (T086)
 *
 * 흐름:
 * 1. submitCompatibility() → 고지 문구 1.5초 → API 호출(5-8초)
 * 2. 응답 수신 → result 상태 저장
 *
 * 부가 기능:
 * - sajuResultId를 sessionStore에 저장 (피드백 연동)
 * - 비로그인 시 analysisStore에 휘발성 저장
 * - useRef로 중복 요청 방지 (T055b 패턴)
 */

import { useState, useRef } from 'react';
import { fetchCompatibility } from '@/lib/api/company';
import { useDisclaimerTimer } from './useDisclaimerTimer';
import { useSessionStore } from '@/stores/sessionStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';
import type { CompatibilityResult, CompatibilityRequest } from '@/types/api';

type Phase = 'idle' | 'disclaimer' | 'loading' | 'result' | 'error';

interface CompatibilityArgs {
  birthDate: string;
  birthTime: string;
  companyName: string;
}

export function useCompatibility() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 중복 요청 방지
  const isRequestingRef = useRef(false);
  // disclaimer 완료 후 사용할 인자 보존
  const pendingArgsRef = useRef<CompatibilityArgs | null>(null);

  /** disclaimer 완료 후 실제 API 호출 */
  const runApiCall = async () => {
    const args = pendingArgsRef.current;
    if (!args) return;

    setPhase('loading');

    try {
      // sajuResultId는 sessionStore에서 가져옴 (선행 분석 결과)
      const sajuResultId = useSessionStore.getState().sajuResultId ?? '';

      const request: CompatibilityRequest = {
        sajuResultId,
        companyName: args.companyName,
      };

      const data = await fetchCompatibility(request);
      setResult(data);
      setPhase('result');

      // sessionStore에 sajuResultId 저장 (피드백 제출 시 사용)
      useSessionStore.getState().setSajuResultId(data.sajuResultId);
      useSessionStore.getState().setLastAnalysisType('COMPATIBILITY');

      // 비로그인 시 analysisStore에 휘발성 저장
      const { isLoggedIn } = useAuthStore.getState();
      if (!isLoggedIn) {
        useAnalysisStore
          .getState()
          .setCompatibilityResult(data as unknown as Record<string, unknown>);
        useAnalysisStore.getState().setCompatibilityInputs(args as unknown as Record<string, unknown>);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '기업 궁합 분석 중 오류가 발생했습니다.';
      setError(message);
      setPhase('error');
      useAnalysisStore.getState().setCompatibilityError(message);
    } finally {
      isRequestingRef.current = false;
      pendingArgsRef.current = null;
    }
  };

  const {
    isVisible: disclaimerVisible,
    isFading: disclaimerFading,
    start: startDisclaimer,
    reset: resetDisclaimer,
  } = useDisclaimerTimer({ onComplete: runApiCall });

  /**
   * 궁합 분석 시작 (고지 문구 → 로딩 → 결과)
   */
  const submitCompatibility = (birthDate: string, birthTime: string = '12:00', companyName: string) => {
    // 이미 진행 중이면 무시
    if (isRequestingRef.current) return;
    isRequestingRef.current = true;

    pendingArgsRef.current = { birthDate, birthTime, companyName };
    setError(null);
    setPhase('disclaimer');
    startDisclaimer();
  };

  /** 상태 초기화 */
  const reset = () => {
    resetDisclaimer();
    setResult(null);
    setError(null);
    setPhase('idle');
    isRequestingRef.current = false;
    pendingArgsRef.current = null;
  };

  return {
    phase,
    result,
    error,
    disclaimerVisible,
    disclaimerFading,
    loading: phase === 'loading',
    submitCompatibility,
    reset,
  };
}
