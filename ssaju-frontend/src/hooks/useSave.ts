'use client';

/**
 * 분석 결과 저장 훅
 *
 * - useMutation으로 저장 처리
 */

import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useSessionStore } from '@/stores/sessionStore';
import { toastUtils } from '@/lib/toast';

type AnalysisType = 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

export function useSave(analysisType: AnalysisType) {
  const sajuResultId = useSessionStore((state) => state.sajuResultId);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!sajuResultId) throw new Error('저장할 분석 결과가 없습니다');
      return apiFetch('/api/saju-result/save', {
        method: 'POST',
        body: { sajuResultId, analysisType },
      });
    },
    onSuccess: () => toastUtils.success('분석 결과가 저장되었습니다'),
    onError: () => toastUtils.error('저장에 실패했습니다. 다시 시도해주세요.'),
  });

  return { save: mutate, isSaving: isPending };
}
