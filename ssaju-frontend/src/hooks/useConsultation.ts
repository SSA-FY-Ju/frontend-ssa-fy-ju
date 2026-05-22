'use client';

/**
 * AI 커리어 컨설팅 훅 (T065b, T066)
 *
 * 흐름:
 * 1. submitConsultation() → disclaimer 1.5초 → API 호출(20초)
 * 2. 19개 필드 전체 수신 → consultationStore에 저장
 * 3. FullPageConsultation에서 Swiper.js 수직 슬라이드로 탐색
 *
 * 캐싱 없음: 같은 사용자도 날짜를 달리해 여러 번 분석 가능하므로 매번 새로 요청
 */

import { useState, useRef } from 'react';
import { fetchConsultation } from '@/lib/api/career';
import { useConsultationStore } from '@/stores/consultationStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useDisclaimerTimer } from './useDisclaimerTimer';
import type { ConsultationRequest } from '@/types/api';

type Phase = 'idle' | 'disclaimer' | 'loading' | 'result' | 'error';

export function useConsultation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const isRequestingRef = useRef(false);
  const pendingArgsRef = useRef<{ birthDate: string; birthTime: string } | null>(null);

  const consultationStore = useConsultationStore();

  /** disclaimer 완료 후 실제 API 호출 */
  const runApiCall = async () => {
    const args = pendingArgsRef.current;
    if (!args) return;

    setPhase('loading');
    consultationStore.setIsLoading(true);

    try {
      const request: ConsultationRequest = {
        birthDate: args.birthDate,
        birthTime: args.birthTime,
      };

      const data = await fetchConsultation(request);

      // Zustand 메모리에 전체 캐싱
      consultationStore.setConsultation(data);
      setPhase('result');

      // API 응답의 sajuResultId 사용, 없으면 로컬 fallback
      const resultId = data.sajuResultId
        ? String(data.sajuResultId)
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
    }
  };

  const {
    isVisible: disclaimerVisible,
    isFading: disclaimerFading,
    start: startDisclaimer,
    reset: resetDisclaimer,
  } = useDisclaimerTimer({ onComplete: runApiCall });

  /**
   * 컨설팅 분석 시작 — 매번 새로 API 호출 (캐싱 없음)
   */
  const submitConsultation = (birthDate: string, birthTime: string = '12:00') => {
    if (isRequestingRef.current) return;
    isRequestingRef.current = true;

    pendingArgsRef.current = { birthDate, birthTime };
    setError(null);
    setPhase('disclaimer');
    startDisclaimer();
  };

  /**
   * Swiper onSlideChange 콜백에서 호출
   * swiper.activeIndex (0-based) → consultationStore.currentSectionIndex 동기화
   */
  const handleSectionChange = (index: number) => {
    consultationStore.setCurrentSectionIndex(index);
  };

  /** 상태 초기화 */
  const reset = () => {
    resetDisclaimer();
    consultationStore.clearData();
    setPhase('idle');
    setError(null);
    isRequestingRef.current = false;
    pendingArgsRef.current = null;
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
