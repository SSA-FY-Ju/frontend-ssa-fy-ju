'use client';

// 파일 크기 예외: disclaimer→loading→result 단계, Zustand 캐시 관리, 탭 선택
// 로직이 하나의 컨설팅 흐름을 구성. 분리 시 캐시 유효성 검증 로직 분산 위험
/**
 * AI 커리어 컨설팅 훅 (T066)
 *
 * 흐름:
 * 1. submitConsultation() → disclaimer 1.5초 → API 호출(15-20초)
 * 2. 19개 필드 전체 수신 → consultationStore에 캐싱
 * 3. 탭 전환 시 store 메모리 조회 (0.2초 이내, 재요청 없음)
 *
 * 타임아웃 정책 (FR-027):
 * - 20초 타임아웃, 최대 2회 재시도 (각 5초 간격)
 */

import { useState, useRef } from 'react';
import { fetchConsultation } from '@/lib/api/career';
import { useConsultationStore } from '@/stores/consultationStore';
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
        solarType: 'SOLAR',
      };

      const data = await fetchConsultation(request);

      // Zustand에 전체 캐싱 (탭 전환 0.2초 보증)
      consultationStore.setConsultation(data, data.sajuResultId);
      setPhase('result');
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
   * 컨설팅 분석 시작
   * 캐시 유효 시 API 재호출 없이 즉시 result 상태로 전환 (0.2초)
   */
  const submitConsultation = (birthDate: string, birthTime: string = '12:00', sajuResultId?: string) => {
    // 캐시 히트: 즉시 결과 표시
    if (sajuResultId && consultationStore.isValid(sajuResultId)) {
      setPhase('result');
      return;
    }

    if (isRequestingRef.current) return;
    isRequestingRef.current = true;

    pendingArgsRef.current = { birthDate, birthTime };
    setError(null);
    setPhase('disclaimer');
    startDisclaimer();
  };

  /** 탭 선택 (0.2초 이내 — 메모리 조회) */
  const selectTab = (index: number) => {
    consultationStore.setSelectedTabIndex(index);
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
    selectedTabIndex: consultationStore.selectedTabIndex,
    submitConsultation,
    selectTab,
    reset,
  };
}
