'use client';

// 파일 크기 예외: disclaimer→loading→result 단계 전환, sessionStore·analysisStore 저장,
// 중복 요청 방지 로직이 하나의 분석 흐름을 구성하여 분리 시 상태 일관성 위험
/**
 * 관운 기반 채용 시기 분석 훅 (T055)
 *
 * 흐름:
 * 1. submitAnalysis() → API 호출 즉시 시작 + 고지 문구 표시 (병렬)
 * 2. 고지 완료(2초) → 로딩 화면 전환, 진행 중인 요청 결과 대기
 * 3. 응답 수신 → 결과 상태 저장
 *
 * API 를 고지 문구와 병렬로 쏘는 이유: 원래는 고지 2초가 끝나야 요청이
 * 시작되는 직렬 구조라 총 대기시간이 항상 (2초 + API 응답시간)이었다.
 * 병렬화로 max(2초, API 응답시간)이 된다. 고지 문구 2초는 의도된 UX 라 유지.
 *
 * 부가 기능:
 * - sajuResultId를 sessionStore에 저장 (피드백 연동)
 * - 비로그인 시 analysisStore에 휘발성 저장
 * - useRef로 중복 요청 방지 (T055b)
 */

import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchCareerTiming } from '@/lib/api/career';
import { useDisclaimerTimer } from './useDisclaimerTimer';
import { useSessionStore } from '@/stores/sessionStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';
import { analysisCache, isPageRefresh } from '@/lib/analysisCache';
import { MYPAGE_QUERY_KEY } from './useMyPage';
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
  // 제출 시점에 시작된 진행 중인 API 요청 (disclaimer 와 병렬)
  const apiPromiseRef = useRef<Promise<CareerTimingResult> | null>(null);

  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  /** disclaimer 완료 후 호출 — 제출 시점에 시작된 요청의 결과를 기다려 화면을 전환한다 */
  const settleApiCall = useCallback(async () => {
    const args = pendingArgsRef.current;
    const promise = apiPromiseRef.current;
    if (!args || !promise) return;

    setPhase('loading');

    try {
      const data = await promise;
      setResult(data);
      setPhase('result');

      // 새로고침 시 재호출 방지용 캐싱
      analysisCache.set('careerTiming', data);
      // 마이페이지 캐시 삭제 → 진입 시 즉시 새 데이터 로드
      queryClient.removeQueries({ queryKey: MYPAGE_QUERY_KEY });

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
      apiPromiseRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isVisible: disclaimerVisible, isFading: disclaimerFading, start: startDisclaimer, reset: resetDisclaimer } =
    useDisclaimerTimer({ onComplete: settleApiCall });

  /**
   * 분석 시작 (고지 문구 → 로딩 → 결과)
   * @param birthDate - 생년월일 (YYYY-MM-DD)
   * @param birthTime - 태어난 시간 (HH:mm, 기본값 12:00)
   */
  const submitAnalysis = useCallback((birthDate: string, birthTime: string = '12:00') => {
    if (isPageRefresh()) {
      // 새로고침: 캐시 있으면 API 재호출 없이 복원
      const cached = analysisCache.get<CareerTimingResult>('careerTiming');
      if (cached) {
        setResult(cached);
        setPhase('result');
        return;
      }
    } else {
      // 일반 네비게이션: 이전 캐시 삭제 후 새 분석
      analysisCache.remove('careerTiming');
    }

    if (isRequestingRef.current) return;
    isRequestingRef.current = true;

    pendingArgsRef.current = { birthDate, birthTime };
    // API 를 여기서 즉시 시작한다 (고지 문구와 병렬).
    // 에러 처리는 settleApiCall 의 await 에서 하므로, 고지가 끝나기 전에
    // 거부되어도 unhandledrejection 이 뜨지 않도록 no-op catch 만 붙여둔다.
    const promise = fetchCareerTiming({
      birthDate,
      birthTime,
      targetName: user?.name || '사용자',
    } satisfies CareerTimingRequest);
    promise.catch(() => {});
    apiPromiseRef.current = promise;
    setError(null);
    setPhase('disclaimer');
    startDisclaimer();
  }, [startDisclaimer, user]);

  const reset = useCallback(() => {
    resetDisclaimer();
    setResult(null);
    setError(null);
    setPhase('idle');
    isRequestingRef.current = false;
    pendingArgsRef.current = null;
    apiPromiseRef.current = null;
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
