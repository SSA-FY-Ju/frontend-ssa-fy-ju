'use client';

/**
 * 분석 결과 저장 훅 (Constitution III 준수: Component → Hook → API)
 *
 * SaveButton 컴포넌트가 apiFetch를 직접 호출하지 않도록
 * 저장 로직을 Hook 레이어로 분리
 */

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useSessionStore } from '@/stores/sessionStore';
import { toastUtils } from '@/lib/toast';

type AnalysisType = 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

export function useSave(analysisType: AnalysisType) {
  const [isSaving, setIsSaving] = useState(false);
  const sajuResultId = useSessionStore((state) => state.sajuResultId);

  /** 현재 분석 결과를 백엔드에 저장 */
  const save = async () => {
    if (!sajuResultId) {
      toastUtils.error('저장할 분석 결과가 없습니다');
      return;
    }

    setIsSaving(true);
    try {
      await apiFetch('/api/saju-result/save', {
        method: 'POST',
        body: { sajuResultId, analysisType },
      });
      toastUtils.success('분석 결과가 저장되었습니다');
    } catch {
      // 저장 실패 시 사용자에게 토스트 알림 표시
      toastUtils.error('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return { save, isSaving };
}
