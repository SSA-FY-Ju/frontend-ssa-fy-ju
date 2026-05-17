'use client';

/**\n * 파일 역할: 채팅 입력 단계에서 생년월일 입력/검증 UI를 담당합니다.\n */

import { useState } from 'react';

interface DatePickerFieldProps {
  onSubmit: (date: string) => void;
}

export default function DatePickerField({ onSubmit }: DatePickerFieldProps) {
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!date) {
      setError('날짜를 선택해주세요');
      return;
    }

    // Validate date is not in future
    const selectedDate = new Date(date);
    const today = new Date();
    if (selectedDate > today) {
      setError('과거 날짜를 선택해주세요');
      return;
    }

    onSubmit(date);
  };

  return (
    <div className="flex-shrink-0 px-6 py-4 border-t border-slate-700 space-y-3">
      <input
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setError('');
        }}
        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        확인
      </button>
    </div>
  );
}
