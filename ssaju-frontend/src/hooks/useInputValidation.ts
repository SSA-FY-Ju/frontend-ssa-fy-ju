'use client';

/**
 * 입력 폼 검증 훅 (T052)
 *
 * 기능:
 * - 생년월일/시간 실시간 Zod 검증
 * - 에러 메시지 상태 관리
 * - birthDate: YYYY-MM-DD, 과거 날짜만 (FR-001, FR-004)
 * - birthTime: HH:mm 또는 빈값 → 12:00 기본값 (FR-002, FR-003)
 */

import { useState } from 'react';
import { birthDateSchema, birthTimeSchema } from '@/services/utils/validation';

interface ValidationErrors {
  birthDate: string;
  birthTime: string;
}

export function useInputValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({
    birthDate: '',
    birthTime: '',
  });

  /**
   * 생년월일 실시간 검증
   */
  const validateBirthDate = (value: string): boolean => {
    if (!value) {
      setErrors((prev) => ({ ...prev, birthDate: '생년월일을 입력해주세요.' }));
      return false;
    }

    const result = birthDateSchema.safeParse(value);
    if (!result.success) {
      setErrors((prev) => ({
        ...prev,
        birthDate: result.error.errors[0]?.message ?? '생년월일이 올바르지 않습니다.',
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, birthDate: '' }));
    return true;
  };

  /**
   * 시간 실시간 검증 (빈값은 유효 — 12:00 기본값 적용)
   */
  const validateBirthTime = (value: string): boolean => {
    if (!value) {
      // 빈값은 유효 (12:00 기본값)
      setErrors((prev) => ({ ...prev, birthTime: '' }));
      return true;
    }

    const result = birthTimeSchema.safeParse(value);
    if (!result.success) {
      setErrors((prev) => ({
        ...prev,
        birthTime: result.error.errors[0]?.message ?? '시간 형식이 올바르지 않습니다 (HH:mm).',
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, birthTime: '' }));
    return true;
  };

  /**
   * 전체 폼 검증 (제출 시 호출)
   * @returns 검증 통과 여부
   */
  const validateAll = (birthDate: string, birthTime: string): boolean => {
    const dateValid = validateBirthDate(birthDate);
    const timeValid = validateBirthTime(birthTime);
    return dateValid && timeValid;
  };

  /** 에러 초기화 */
  const clearErrors = () => {
    setErrors({ birthDate: '', birthTime: '' });
  };

  return {
    errors,
    validateBirthDate,
    validateBirthTime,
    validateAll,
    clearErrors,
  };
}
