'use client';

// 파일 크기 예외: DatePicker·시간 입력·검증 에러·제출 버튼이 하나의 폼 단위를
// 구성. 개별 필드 분리 시 useInputValidation 훅 props 전달이 복잡해짐
/**
 * 사주 분석 입력 폼 (T051)
 *
 * 입력:
 * - 생년월일: react-datepicker 밤하늘 테마 캘린더
 * - 태어난 시간: HH:mm 텍스트 입력 (미입력 시 12:00 기본값)
 *
 * 검증: useInputValidation 훅으로 실시간 Zod 검증
 */

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useInputValidation } from '@/hooks/useInputValidation';

interface InputFormProps {
  /** 분석 제출 콜백 */
  onSubmit: (birthDate: string, birthTime: string) => void;
  /** API 호출 진행 중 여부 */
  isLoading?: boolean;
}

export function InputForm({ onSubmit, isLoading = false }: InputFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState('');
  const { errors, validateBirthDate, validateBirthTime, validateAll } = useInputValidation();

  /** 날짜 선택 핸들러 */
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      // 실시간 검증
      validateBirthDate(format(date, 'yyyy-MM-dd'));
    }
  };

  /** 시간 입력 핸들러 */
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthTime(e.target.value);
    validateBirthTime(e.target.value);
  };

  /** 폼 제출 핸들러 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const birthDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    if (!validateAll(birthDateStr, birthTime)) return;

    // 시간 미입력 시 12:00 기본값 적용
    onSubmit(birthDateStr, birthTime || '12:00');
  };

  const birthDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  return (
    <form onSubmit={handleSubmit} aria-label="사주 분석 입력 폼" autoComplete="off">
      {/* 생년월일 입력 */}
      <div className="mb-4">
        <label htmlFor="birthDate" className="block text-star-300 text-sm font-medium mb-1">
          생년월일
        </label>
        <DatePicker
          id="birthDate"
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          maxDate={new Date()}
          locale={ko}
          placeholderText="예: 1990-10-10"
          className="w-full bg-night-800 border border-night-700 text-white rounded px-3 py-2 focus:outline-none focus:border-star-500"
          calendarClassName="bg-night-900 text-white border border-night-700"
          required
          autoComplete="off"
          aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
        />
        {errors.birthDate && (
          <p id="birthDate-error" role="alert" className="mt-1 text-red-400 text-sm">
            {errors.birthDate}
          </p>
        )}
      </div>

      {/* 시간 입력 */}
      <div className="mb-6">
        <label htmlFor="birthTime" className="block text-star-300 text-sm font-medium mb-1">
          태어난 시간 <span className="text-night-700 text-xs">(선택)</span>
        </label>
        <input
          id="birthTime"
          type="text"
          value={birthTime}
          onChange={handleTimeChange}
          placeholder="예: 14:30"
          autoComplete="off"
          className="w-full bg-night-800 border border-night-700 text-white rounded px-3 py-2 focus:outline-none focus:border-star-500"
          aria-describedby="birthTime-hint"
        />
        <p id="birthTime-hint" className="mt-1 text-night-700 text-xs">
          시간이 미상인 경우 정오(12:00)로 분석합니다
        </p>
        {errors.birthTime && (
          <p role="alert" className="mt-1 text-red-400 text-sm">
            {errors.birthTime}
          </p>
        )}
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={!birthDateStr || isLoading}
        className="w-full bg-star-500 hover:bg-star-400 disabled:bg-night-700 disabled:cursor-not-allowed text-night-900 font-bold py-3 px-6 rounded transition-colors"
      >
        {isLoading ? '분석 중...' : '분석하기'}
      </button>
    </form>
  );
}
