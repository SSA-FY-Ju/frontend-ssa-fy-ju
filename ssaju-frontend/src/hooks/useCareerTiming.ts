'use client';

/**
 * 관운 기반 채용 시기 분석 훅
 *
 * 기능:
 * - 생년월일/시간 입력 받아 분석 API 호출
 * - sajuResultId를 sessionStore에 저장 (피드백 연동용)
 * - 비로그인 시 analysisStore에 결과 임시 저장 (휘발성)
 * - 중복 요청 방지 (useRef Race Condition 차단)
 */

import { useState, useCallback, useRef } from 'react';
import { fetchCareerTiming } from '@/lib/api/career';
import { useSessionStore } from '@/stores/sessionStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';
import type { CareerTimingResult, CareerTimingRequest } from '@/types/api';

export function useCareerTiming() {
  const [result, setResult] = useState<CareerTimingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 중복 요청 방지 플래그
  const isRequestingRef = useRef(false);

  /**
   * 관운 분석 실행
   * @param birthDate - 생년월일 (YYYY-MM-DD)
   * @param birthTime - 태어난 시간 (HH:mm, 기본값 12:00)
   */
  const submitAnalysis = useCallback(
    async (birthDate: string, birthTime: string = '12:00') => {
      // 이미 요청 중이면 중복 방지
      if (isRequestingRef.current) return;
      isRequestingRef.current = true;

      setLoading(true);
      setError(null);

      try {
        const request: CareerTimingRequest = {
          birthDate,
          birthTime,
          solarType: 'SOLAR',
        };

        const data = await fetchCareerTiming(request);
        setResult(data);

        // sessionStore에 sajuResultId 저장 (피드백 제출 시 사용)
        useSessionStore.getState().setSajuResultId(data.sajuResultId);
        useSessionStore.getState().setLastAnalysisType('CAREER_TIMING');

        // 비로그인 사용자: analysisStore에 휘발성 저장
        const { isLoggedIn } = useAuthStore.getState();
        if (!isLoggedIn) {
          useAnalysisStore
            .getState()
            .setCareerTimingResult(data as unknown as Record<string, unknown>);
          useAnalysisStore.getState().setCareerTimingInputs({ birthDate, birthTime });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.';
        setError(message);
        useAnalysisStore.getState().setCareerTimingError(message);
      } finally {
        setLoading(false);
        isRequestingRef.current = false;
      }
    },
    [],
  );

  /** 결과 및 에러 초기화 */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
    isRequestingRef.current = false;
  }, []);

  return { result, loading, error, submitAnalysis, reset };
}
