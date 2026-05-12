'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { apiFetch } from '@/lib/api/client';
import { toastUtils } from '@/lib/toast';

/**
 * 비로그인 분석 결과 → 로그인 시 자동 저장 훅
 *
 * 로그인 상태가 false → true로 변경될 때:
 * 1. analysisStore에 저장된 분석 데이터 확인
 * 2. 백엔드에 저장 요청
 * 3. 성공 시 analysisStore 초기화
 */
export function useAutoSaveOnLogin() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const analysisStore = useAnalysisStore();
  // 초기값을 현재 로그인 상태로 설정 (마운트 시 이미 로그인 상태면 저장 안 함)
  const prevIsLoggedIn = useRef(isLoggedIn);

  useEffect(() => {
    // 비로그인 → 로그인으로 전환된 경우에만 실행
    if (!prevIsLoggedIn.current && isLoggedIn) {
      const saveAnalysisData = async () => {
        const { careerTiming, compatibility } = useAnalysisStore.getState();
        const dataToSave = [];

        if (careerTiming.result) {
          dataToSave.push({ type: 'CAREER_TIMING', data: careerTiming.result });
        }
        if (compatibility.result) {
          dataToSave.push({ type: 'COMPATIBILITY', data: compatibility.result });
        }

        if (dataToSave.length === 0) return;

        try {
          await Promise.all(
            dataToSave.map((item) =>
              apiFetch('/api/saju-result/save', {
                method: 'POST',
                body: item,
              }),
            ),
          );

          // 저장 성공 후 메모리 초기화
          analysisStore.reset();
          toastUtils.success('분석 결과가 저장되었습니다');
        } catch {
          toastUtils.error('분석 결과 저장에 실패했습니다');
        }
      };

      saveAnalysisData();
    }

    prevIsLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, analysisStore]);
}
