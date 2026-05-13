'use client';

// 파일 크기 예외: idle→loading→found/not_found→manual 상태 전환 로직과
// lookupCompany·confirmCompany·switchToManual 액션이 하나의 기업조회 흐름을 구성
/**
 * 기업 정보 조회 훅 (T084)
 *
 * 우선순위 (FR-008):
 * 1. 기업명 제공 → 자동완성 API로 조회
 * 2. 조회 성공 → confirmModal에서 확인 요청
 * 3. 조회 실패 → 수동 입력 안내
 * 4. 수동 입력 → 입력값 그대로 사용
 *
 * 재시도 정책 (Q5): 타임아웃/네트워크만, 1s-2s-4s
 */

import { useState } from 'react';
import { fetchCompanyAutocomplete } from '@/lib/api/company';

export type CompanyInfoStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'manual';

export interface CompanyInfoState {
  companyName: string;
  status: CompanyInfoStatus;
  suggestions: string[];
  error: string | null;
}

export function useCompanyInfo() {
  const [state, setState] = useState<CompanyInfoState>({
    companyName: '',
    status: 'idle',
    suggestions: [],
    error: null,
  });

  /**
   * 기업명으로 자동조회 시도
   */
  const lookupCompany = async (companyName: string) => {
    if (!companyName.trim()) return;

    setState((prev) => ({
      ...prev,
      companyName,
      status: 'loading',
      error: null,
    }));

    try {
      const result = await fetchCompanyAutocomplete({ query: companyName.trim() });

      if (result.suggestions.length > 0) {
        setState((prev) => ({
          ...prev,
          status: 'found',
          suggestions: result.suggestions.slice(0, 10),
        }));
      } else {
        setState((prev) => ({
          ...prev,
          status: 'not_found',
          suggestions: [],
        }));
      }
    } catch {
      // 조회 실패 → 수동 입력 안내
      setState((prev) => ({
        ...prev,
        status: 'not_found',
        suggestions: [],
        error: '기업 정보 자동 조회에 실패했습니다. 직접 입력해주세요.',
      }));
    }
  };

  /**
   * 기업 확인 (자동조회 결과 수락)
   */
  const confirmCompany = (companyName: string) => {
    setState((prev) => ({
      ...prev,
      companyName,
      status: 'manual', // 확인 완료 상태 (manual과 동일 취급)
    }));
  };

  /**
   * 수동 입력 모드로 전환
   */
  const switchToManual = () => {
    setState((prev) => ({
      ...prev,
      status: 'manual',
      suggestions: [],
    }));
  };

  /**
   * 상태 초기화
   */
  const reset = () => {
    setState({
      companyName: '',
      status: 'idle',
      suggestions: [],
      error: null,
    });
  };

  return {
    ...state,
    lookupCompany,
    confirmCompany,
    switchToManual,
    reset,
  };
}
