/**
 * useInputValidation 훅 테스트 (T061 일부)
 */

import { renderHook, act } from '@testing-library/react';
import { useInputValidation } from '@/hooks/useInputValidation';

describe('useInputValidation', () => {
  it('초기 에러 상태는 빈 문자열', () => {
    const { result } = renderHook(() => useInputValidation());
    expect(result.current.errors.birthDate).toBe('');
    expect(result.current.errors.birthTime).toBe('');
  });

  describe('validateBirthDate', () => {
    it('빈 값: 에러 메시지 설정 후 false 반환', () => {
      const { result } = renderHook(() => useInputValidation());

      let valid: boolean;
      act(() => {
        valid = result.current.validateBirthDate('');
      });

      expect(valid!).toBe(false);
      expect(result.current.errors.birthDate).toBeTruthy();
    });

    it('올바른 과거 날짜: 에러 없음, true 반환', () => {
      const { result } = renderHook(() => useInputValidation());

      let valid: boolean;
      act(() => {
        valid = result.current.validateBirthDate('1990-10-10');
      });

      expect(valid!).toBe(true);
      expect(result.current.errors.birthDate).toBe('');
    });

    it('잘못된 형식: 에러 메시지 설정 후 false 반환', () => {
      const { result } = renderHook(() => useInputValidation());

      let valid: boolean;
      act(() => {
        valid = result.current.validateBirthDate('10/10/1990');
      });

      expect(valid!).toBe(false);
      expect(result.current.errors.birthDate).toBeTruthy();
    });

    it('미래 날짜: 에러 메시지 설정 후 false 반환', () => {
      const { result } = renderHook(() => useInputValidation());

      let valid: boolean;
      act(() => {
        valid = result.current.validateBirthDate('2099-01-01');
      });

      expect(valid!).toBe(false);
      expect(result.current.errors.birthDate).toBeTruthy();
    });
  });

  describe('validateBirthTime', () => {
    it('빈 값: 에러 없음, true 반환 (12:00 기본값)', () => {
      const { result } = renderHook(() => useInputValidation());

      let valid: boolean;
      act(() => {
        valid = result.current.validateBirthTime('');
      });

      expect(valid!).toBe(true);
      expect(result.current.errors.birthTime).toBe('');
    });

    it('올바른 시간: 에러 없음, true 반환', () => {
      const { result } = renderHook(() => useInputValidation());

      let valid: boolean;
      act(() => {
        valid = result.current.validateBirthTime('14:30');
      });

      expect(valid!).toBe(true);
      expect(result.current.errors.birthTime).toBe('');
    });

    it('잘못된 형식: 에러 메시지, false 반환', () => {
      const { result } = renderHook(() => useInputValidation());

      let valid: boolean;
      act(() => {
        valid = result.current.validateBirthTime('25:00');
      });

      expect(valid!).toBe(false);
      expect(result.current.errors.birthTime).toBeTruthy();
    });
  });

  describe('validateAll', () => {
    it('날짜 유효, 시간 빈값: true 반환', () => {
      const { result } = renderHook(() => useInputValidation());

      let valid: boolean;
      act(() => {
        valid = result.current.validateAll('1990-10-10', '');
      });

      expect(valid!).toBe(true);
    });

    it('날짜 무효: false 반환', () => {
      const { result } = renderHook(() => useInputValidation());

      let valid: boolean;
      act(() => {
        valid = result.current.validateAll('', '14:30');
      });

      expect(valid!).toBe(false);
    });
  });

  it('clearErrors 호출 시 모든 에러 초기화', () => {
    const { result } = renderHook(() => useInputValidation());

    act(() => {
      result.current.validateBirthDate('');
    });
    expect(result.current.errors.birthDate).toBeTruthy();

    act(() => {
      result.current.clearErrors();
    });
    expect(result.current.errors.birthDate).toBe('');
  });
});
