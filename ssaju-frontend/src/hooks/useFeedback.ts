'use client';

/**
 * 만족도 피드백 제출 훅
 *
 * - useMutation으로 제출 처리
 * - 성공 시 토스트 + onSuccess 콜백 (모달 닫기)
 */

import { useMutation } from '@tanstack/react-query';
import { submitFeedback } from '@/lib/api/feedback';
import { useSessionStore } from '@/stores/sessionStore';
import { toastUtils } from '@/lib/toast';
import type { FeedbackRequest } from '@/types/api';

/**
 * UI 내부에서 쓰는 피드백 대상 명칭.
 * 사주(SAJU)는 백엔드에서 피드백 대상이 아니라 요청 시 400을 반환하므로 포함하지 않는다.
 */
type FeedbackType = 'CONSULTATION' | 'COMPATIBILITY';

/** UI 내부 명칭 → 백엔드 FeedbackType enum 값 (US6에서 값이 변경됨) */
const FEEDBACK_TYPE_MAP: Record<FeedbackType, FeedbackRequest['feedbackType']> = {
  CONSULTATION:   'CAREER_CONSULTATION',
  COMPATIBILITY:  'COMPANY_COMPATIBILITY',
};

export function useFeedback(feedbackType: FeedbackType, onSuccess?: () => void) {
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: ({ satisfactionStatus, feedbackContent }: {
      satisfactionStatus: 'SATISFIED' | 'DISSATISFIED';
      feedbackContent?: string;
    }) => {
      const sajuResultIdRaw = useSessionStore.getState().sajuResultId;
      const analysisId = sajuResultIdRaw ? Number(sajuResultIdRaw) : null;

      if (!analysisId || isNaN(analysisId)) {
        throw new Error('분석 결과가 없습니다. 먼저 분석을 진행해주세요.');
      }

      const request: FeedbackRequest = {
        analysisId,
        feedbackType: FEEDBACK_TYPE_MAP[feedbackType],
        satisfactionStatus,
        feedbackContent: feedbackContent?.trim() || undefined,
      };

      return submitFeedback(request);
    },
    onSuccess: () => {
      toastUtils.success('피드백이 저장되었습니다');
      onSuccess?.();
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : '제출 중 오류가 발생했습니다. 다시 시도해주세요.';
      toastUtils.error(message);
    },
  });

  const submit = (
    satisfactionStatus: 'SATISFIED' | 'DISSATISFIED',
    feedbackContent?: string,
  ) => mutate({ satisfactionStatus, feedbackContent });

  return {
    submit,
    isSubmitting: isPending,
    error: error instanceof Error ? error.message : null,
    reset,
  };
}
