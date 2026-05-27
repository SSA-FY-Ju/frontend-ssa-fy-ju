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

import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchCompatibility } from '@/lib/api/company';
import { ApiError } from '@/lib/api/client';
import { useDisclaimerTimer } from './useDisclaimerTimer';
import { useSessionStore } from '@/stores/sessionStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';
import { analysisCache, isPageRefresh } from '@/lib/analysisCache';
import { MYPAGE_QUERY_KEY } from './useMyPage';
import type { CompatibilityResult, CompatibilityRequest, TargetRole } from '@/types/api';

type Phase = 'idle' | 'disclaimer' | 'loading' | 'result' | 'error' | 'founding-date-needed';

interface CompatibilityArgs {
  birthDate: string;
  birthTime: string;
  targetRole: TargetRole;
  companyName: string;
  companyFoundingDate?: string;
  companyFoundingTime?: string;
}

export function useCompatibility() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // 중복 요청 방지
  const isRequestingRef = useRef(false);
  // disclaimer 완료 후 사용할 인자 보존
  const pendingArgsRef = useRef<CompatibilityArgs | null>(null);

  /** disclaimer 완료 후 실제 API 호출 */
  const runApiCall = useCallback(async () => {
    const args = pendingArgsRef.current;
    if (!args) return;

    setPhase('loading');

    try {
      const request: CompatibilityRequest = {
        userBirthDate: args.birthDate,
        userBirthTime: args.birthTime,
        targetRole: args.targetRole,
        companyName: args.companyName,
        ...(args.companyFoundingDate ? { companyFoundingDate: args.companyFoundingDate } : {}),
        ...(args.companyFoundingTime ? { companyFoundingTime: args.companyFoundingTime } : {}),
      };

      const data = await fetchCompatibility(request);
      setResult(data);
      setPhase('result');
      pendingArgsRef.current = null;
      isRequestingRef.current = false;

      // 새로고침 시 재호출 방지용 캐싱
      analysisCache.set('compatibility', data);
      // 마이페이지 캐시 삭제 → 진입 시 즉시 새 데이터 로드
      queryClient.removeQueries({ queryKey: MYPAGE_QUERY_KEY });

      useSessionStore.getState().setLastAnalysisType('COMPATIBILITY');
      const resultId = data.analysisId != null
        ? String(data.analysisId)
        : data.compatibilityId != null
          ? String(data.compatibilityId)
          : `COMPATIBILITY_${args.birthDate}_${args.birthTime}_${args.companyName}`;
      useSessionStore.getState().setSajuResultId(resultId);

      // 비로그인 시 analysisStore에 휘발성 저장
      const { isLoggedIn } = useAuthStore.getState();
      if (!isLoggedIn) {
        useAnalysisStore
          .getState()
          .setCompatibilityResult(data as unknown as Record<string, unknown>);
        useAnalysisStore.getState().setCompatibilityInputs(args as unknown as Record<string, unknown>);
      }
    } catch (err) {
      isRequestingRef.current = false;

      // 404: 설립일자 조회 실패 → 직접 입력 단계 (pendingArgs 보존)
      if (err instanceof ApiError && err.statusCode === 404) {
        setPhase('founding-date-needed');
        return;
      }

      pendingArgsRef.current = null;
      const message = err instanceof Error ? err.message : '기업 궁합 분석 중 오류가 발생했습니다.';
      setError(message);
      setPhase('error');
      useAnalysisStore.getState().setCompatibilityError(message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    isVisible: disclaimerVisible,
    isFading: disclaimerFading,
    start: startDisclaimer,
    reset: resetDisclaimer,
  } = useDisclaimerTimer({ onComplete: runApiCall });

  /**
   * 궁합 분석 시작 (고지 문구 → 로딩 → 결과)
   */
  const submitCompatibility = useCallback((
    birthDate: string,
    birthTime: string = '12:00',
    targetRole: TargetRole,
    companyName: string,
    companyFoundingDate?: string,
    companyFoundingTime?: string,
  ) => {
    if (isPageRefresh()) {
      const cached = analysisCache.get<CompatibilityResult>('compatibility');
      if (cached) {
        setResult(cached);
        setPhase('result');
        return;
      }
    } else {
      analysisCache.remove('compatibility');
    }

    if (isRequestingRef.current) return;
    isRequestingRef.current = true;

    pendingArgsRef.current = { birthDate, birthTime, targetRole, companyName, companyFoundingDate, companyFoundingTime };
    setError(null);
    setPhase('disclaimer');
    startDisclaimer();
  }, [startDisclaimer]);

  /**
   * 설립일자 직접 입력 후 재제출 (disclaimer 건너뜜)
   * companyFoundingTime은 09:00으로 고정
   */
  const submitWithFoundingDate = useCallback((foundingDate: string) => {
    const args = pendingArgsRef.current;
    if (!args || isRequestingRef.current) return;

    isRequestingRef.current = true;
    pendingArgsRef.current = {
      ...args,
      companyFoundingDate: foundingDate,
      companyFoundingTime: '09:00',
    };
    runApiCall();
  }, [runApiCall]);

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
    submitWithFoundingDate,
    reset,
  };
}
