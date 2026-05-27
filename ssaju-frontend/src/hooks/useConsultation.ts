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

  const consultationStore = useConsultationStore();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  /** disclaimer 완료 후 실제 API 호출 */
  const runApiCall = useCallback(async () => {
    const args = pendingArgsRef.current;
    if (!args) return;

    setPhase('loading');
    consultationStore.setIsLoading(true);

    try {
      const request: ConsultationRequest = {
        birthDate: args.birthDate,
        birthTime: args.birthTime,
        targetName: user?.name || '사용자', // 유저 이름 포함
      };

      const data = await fetchConsultation(request);

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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, consultationStore]);

  const {
    isVisible: disclaimerVisible,
    isFading: disclaimerFading,
    start: startDisclaimer,
    reset: resetDisclaimer,
  } = useDisclaimerTimer({ onComplete: runApiCall });

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
    setError(null);
    setPhase('disclaimer');
    startDisclaimer();
  }, [startDisclaimer, consultationStore]);

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
