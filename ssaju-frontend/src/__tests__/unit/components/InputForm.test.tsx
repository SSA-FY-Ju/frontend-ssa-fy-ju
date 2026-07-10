/**
 * InputForm 컴포넌트 테스트 (T036 / T061)
 *
 * react-datepicker 모킹: DatePicker → 일반 text input으로 대체
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputForm } from '@/components/forms/InputForm';

// react-datepicker를 단순 text input으로 모킹
jest.mock('react-datepicker', () => {
  const MockDatePicker = ({
    onChange,
    placeholderText,
    id,
    className,
  }: {
    onChange: (date: Date | null) => void;
    placeholderText?: string;
    id?: string;
    className?: string;
  }) => (
    <input
      id={id}
      data-testid="date-picker"
      placeholder={placeholderText}
      className={className}
      onChange={(e) => {
        if (!e.target.value) { onChange(null); return; }
        const d = new Date(e.target.value);
        onChange(isNaN(d.getTime()) ? null : d);
      }}
    />
  );
  MockDatePicker.displayName = 'MockDatePicker';
  return MockDatePicker;
});

// date-fns/locale 모킹
jest.mock('date-fns/locale', () => ({ ko: {} }));
jest.mock('react-datepicker/dist/react-datepicker.css', () => ({}));

describe('InputForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('생년월일/시간 입력 필드와 제출 버튼 렌더링', () => {
    render(<InputForm onSubmit={mockSubmit} />);
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    expect(screen.getByLabelText(/태어난 시간/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '분석하기' })).toBeInTheDocument();
  });

  it('안내 문구(12:00 기본값) 표시됨', () => {
    render(<InputForm onSubmit={mockSubmit} />);
    expect(screen.getByText(/정오\(12:00\)/)).toBeInTheDocument();
  });

  it('날짜 미선택 시 버튼 비활성화', () => {
    render(<InputForm onSubmit={mockSubmit} />);
    expect(screen.getByRole('button', { name: '분석하기' })).toBeDisabled();
  });

  it('유효한 날짜 선택 시 버튼 활성화', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByTestId('date-picker'), {
      target: { value: '1990-10-10' },
    });

    expect(screen.getByRole('button', { name: '분석하기' })).not.toBeDisabled();
  });

  it('날짜 + 시간 입력 후 제출 시 onSubmit 호출', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByTestId('date-picker'), {
      target: { value: '1990-10-10' },
    });
    fireEvent.change(screen.getByLabelText(/태어난 시간/), {
      target: { value: '14:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: '분석하기' }));

    expect(mockSubmit).toHaveBeenCalledWith('1990-10-10', '14:30');
  });

  it('시간 미입력 후 제출 시 기본값 12:00으로 호출', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByTestId('date-picker'), {
      target: { value: '1990-10-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: '분석하기' }));

    expect(mockSubmit).toHaveBeenCalledWith('1990-10-10', '12:00');
  });

  it('잘못된 시간 형식 입력 시 에러 메시지 표시', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByTestId('date-picker'), {
      target: { value: '1990-10-10' },
    });
    fireEvent.change(screen.getByLabelText(/태어난 시간/), {
      target: { value: '25:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: '분석하기' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('isLoading=true 시 버튼 비활성화 및 텍스트 변경', () => {
    render(<InputForm onSubmit={mockSubmit} isLoading={true} />);

    fireEvent.change(screen.getByTestId('date-picker'), {
      target: { value: '1990-10-10' },
    });

    expect(screen.getByRole('button', { name: '분석 중...' })).toBeDisabled();
  });
});
