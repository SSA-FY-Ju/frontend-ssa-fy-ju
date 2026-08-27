'use client';

/**
 * AI 커리어 컨설팅 훅 (T065b, T066)
 *
 * 흐름:
 * 1. submitConsultation() → API 호출 즉시 시작 + disclaimer 표시 (병렬)
 *    — 원래는 고지 2초가 끝나야 요청이 시작되는 직렬 구조라 총 대기가
 *      항상 (2초 + API)였다. 병렬화로 max(2초, API)가 된다.
 * 2. 19개 필드 전체 수신 → consultationStore에 저장
 * 3. FullPageConsultation에서 Swiper.js 수직 슬라이드로 탐색
 *
 * 캐싱 없음: 같은 사용자도 날짜를 달리해 여러 번 분석 가능하므로 매번 새로 요청
 */

import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchConsultation } from '@/lib/api/career';
import { useConsultationStore } from '@/stores/consultationStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';
import { useDisclaimerTimer } from './useDisclaimerTimer';
import { analysisCache, isPageRefresh } from '@/lib/analysisCache';
import { MYPAGE_QUERY_KEY } from './useMyPage';
import type { ConsultationRequest, ConsultationData } from '@/types/api';

type Phase = 'idle' | 'disclaimer' | 'loading' | 'result' | 'error';

export function useConsultation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const isRequestingRef = useRef(false);
  const pendingArgsRef = useRef<{ birthDate: string; birthTime: string } | null>(null);
  // 제출 시점에 시작된 진행 중인 API 요청 (disclaimer 와 병렬)
  const apiPromiseRef = useRef<Promise<ConsultationData> | null>(null);

  const consultationStore = useConsultationStore();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  /** disclaimer 완료 후 호출 — 제출 시점에 시작된 요청의 결과를 기다려 화면을 전환한다 */
  const settleApiCall = useCallback(async () => {
    const args = pendingArgsRef.current;
    const promise = apiPromiseRef.current;
    if (!args || !promise) return;

    setPhase('loading');
    consultationStore.setIsLoading(true);

    try {
      const data = await promise;

      // Zustand 메모리에 전체 캐싱
      consultationStore.setConsultation(data);
      setPhase('result');

      // 새로고침 시 재호출 방지용 캐싱
      analysisCache.set('consultation', data);
      // 마이페이지 캐시 삭제 → 진입 시 즉시 새 데이터 로드
      queryClient.removeQueries({ queryKey: MYPAGE_QUERY_KEY });

      const resultId = data.consultationId
        ? String(data.consultationId)
        : `CONSULTATION_${args.birthDate}_${args.birthTime}`;
      useSessionStore.getState().setSajuResultId(resultId);
      useSessionStore.getState().setLastAnalysisType('CONSULTATION');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 컨설팅 분석 중 오류가 발생했습니다.';
      setError(message);
      consultationStore.setError(message);
      setPhase('error');
    } finally {
      isRequestingRef.current = false;
      pendingArgsRef.current = null;
      apiPromiseRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationStore]);

  const {
    isVisible: disclaimerVisible,
    isFading: disclaimerFading,
    start: startDisclaimer,
    reset: resetDisclaimer,
  } = useDisclaimerTimer({ onComplete: settleApiCall });

  /**
   * 컨설팅 분석 시작 — 매번 새로 API 호출 (캐싱 없음)
   */
  const submitConsultation = useCallback((birthDate: string, birthTime: string = '12:00') => {
    if (isPageRefresh()) {
      const cached = analysisCache.get<ConsultationData>('consultation');
      if (cached) {
        consultationStore.setConsultation(cached);
        setPhase('result');
        return;
      }
    } else {
      analysisCache.remove('consultation');
    }

    if (isRequestingRef.current) return;
    isRequestingRef.current = true;

    pendingArgsRef.current = { birthDate, birthTime };
    // API 를 여기서 즉시 시작한다 (고지 문구와 병렬).
    // 에러 처리는 settleApiCall 의 await 에서 하므로, 고지가 끝나기 전에
    // 거부되어도 unhandledrejection 이 뜨지 않도록 no-op catch 만 붙여둔다.
    const promise = fetchConsultation({
      birthDate,
      birthTime,
      targetName: user?.name || '사용자', // 유저 이름 포함
    } satisfies ConsultationRequest);
    promise.catch(() => {});
    apiPromiseRef.current = promise;
    setError(null);
    setPhase('disclaimer');
    startDisclaimer();
  }, [startDisclaimer, consultationStore, user]);

  /**
   * Swiper onSlideChange 콜백에서 호출
   * swiper.activeIndex (0-based) → consultationStore.currentSectionIndex 동기화
   */
  const handleSectionChange = (index: number) => {
    consultationStore.setCurrentSectionIndex(index);
  };

  const reset = () => {
    resetDisclaimer();
    consultationStore.clearData();
    setPhase('idle');
    setError(null);
    isRequestingRef.current = false;
    pendingArgsRef.current = null;
    apiPromiseRef.current = null;
  };

  return {
    phase,
    error,
    disclaimerVisible,
    disclaimerFading,
    loading: phase === 'loading',
    consultation: consultationStore.consultation,
    currentSectionIndex: consultationStore.currentSectionIndex,
    handleSectionChange,
    submitConsultation,
    reset,
  };
}
