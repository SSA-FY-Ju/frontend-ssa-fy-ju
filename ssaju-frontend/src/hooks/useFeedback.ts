'use client';

/**
 * 만족도 피드백 제출 훅 (T094)
 *
 * 흐름:
 * 1. submit(satisfactionStatus, feedbackContent) 호출
 * 2. sessionStore에서 sajuResultId 획득
 * 3. POST /api/feedback/satisfaction 호출 (타임아웃 10초)
 * 4. 성공: Sonner 토스트 + onSuccess 콜백 (모달 닫기)
 * 5. 실패: 에러 메시지 표시
 */

import { useState } from 'react';
import { submitFeedback } from '@/lib/api/feedback';
import { useSessionStore } from '@/stores/sessionStore';
import { toastUtils } from '@/lib/toast';
import type { FeedbackRequest } from '@/types/api';

type FeedbackType = 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

export function useFeedback(feedbackType: FeedbackType, onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 피드백 제출
   * @param satisfactionStatus - 만족/불만족
   * @param feedbackContent - 상세 의견 (선택, 최대 500자)
   */
  const submit = async (
    satisfactionStatus: 'SATISFIED' | 'UNSATISFIED',
    feedbackContent?: string,
  ) => {
    const sajuResultId = useSessionStore.getState().sajuResultId;

    if (!sajuResultId) {
      setError('분석 결과가 없습니다. 먼저 분석을 진행해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const request: FeedbackRequest = {
      sajuResultId,
      feedbackType,
      satisfactionStatus,
      feedbackContent: feedbackContent?.trim() || undefined,
    };

    try {
      await submitFeedback(request);
      toastUtils.success('피드백이 저장되었습니다');
      onSuccess?.();
    } catch {
      // 피드백 제출 실패 — 사용자에게 재시도 안내
      setError('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, error };
}
