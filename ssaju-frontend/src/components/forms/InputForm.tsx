'use client';

/**
 * 사주 분석 입력 폼 컴포넌트
 *
 * 입력:
 * - 생년월일 (YYYY-MM-DD)
 * - 태어난 시간 (HH:mm, 선택 — 미입력 시 12:00 기본값)
 *
 * Phase 4(T051)에서 react-datepicker 캘린더 UI로 업그레이드 예정
 */

import { useState } from 'react';

interface InputFormProps {
  /** 분석 제출 콜백 */
  onSubmit: (birthDate: string, birthTime: string) => void;
  /** API 호출 진행 중 여부 */
  isLoading?: boolean;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function InputForm({ onSubmit, isLoading = false }: InputFormProps) {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');

  const validate = (): boolean => {
    let valid = true;

    // 생년월일 검증 (필수)
    if (!birthDate) {
      setDateError('생년월일을 입력해주세요.');
      valid = false;
    } else if (!DATE_REGEX.test(birthDate)) {
      setDateError('생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD)');
      valid = false;
    } else {
      setDateError('');
    }

    // 시간 검증 (선택)
    if (birthTime && !TIME_REGEX.test(birthTime)) {
      setTimeError('시간 형식이 올바르지 않습니다 (HH:mm)');
      valid = false;
    } else {
      setTimeError('');
    }

    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // 시간 미입력 시 정오(12:00) 기본값 적용
    const resolvedTime = birthTime || '12:00';
    onSubmit(birthDate, resolvedTime);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="사주 분석 입력 폼">
      <div>
        <label htmlFor="birthDate">생년월일 (YYYY-MM-DD)</label>
        <input
          id="birthDate"
          type="text"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          placeholder="예: 1990-10-10"
          aria-required="true"
          aria-describedby={dateError ? 'birthDate-error' : undefined}
        />
        {dateError && (
          <p id="birthDate-error" role="alert" style={{ color: 'red' }}>
            {dateError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="birthTime">태어난 시간 (HH:mm, 선택)</label>
        <input
          id="birthTime"
          type="text"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          placeholder="예: 14:30"
          aria-describedby={timeError ? 'birthTime-error' : undefined}
        />
        <p>시간이 미상인 경우 정오(12:00)로 분석합니다</p>
        {timeError && (
          <p id="birthTime-error" role="alert" style={{ color: 'red' }}>
            {timeError}
          </p>
        )}
      </div>

      <button type="submit" disabled={!birthDate || isLoading}>
        {isLoading ? '분석 중...' : '분석하기'}
      </button>
    </form>
  );
}
