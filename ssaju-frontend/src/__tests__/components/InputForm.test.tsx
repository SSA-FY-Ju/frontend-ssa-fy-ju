/**
 * InputForm 컴포넌트 테스트 (T036)
 *
 * 커버리지 대상:
 * - 폼 렌더링
 * - 날짜/시간 입력 필드 동작
 * - 검증 에러 메시지 표시
 * - 유효 입력 시 onSubmit 호출
 * - 시간 미입력 시 12:00 기본값 적용
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputForm } from '@/components/forms/InputForm';

describe('InputForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('폼 요소가 올바르게 렌더링됨', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    expect(screen.getByLabelText(/생년월일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/태어난 시간/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '분석하기' })).toBeInTheDocument();
  });

  it('안내 문구 표시됨', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    expect(screen.getByText('시간이 미상인 경우 정오(12:00)로 분석합니다')).toBeInTheDocument();
  });

  it('생년월일 미입력 시 폼 직접 제출하면 에러 메시지 표시', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    // 버튼은 disabled 상태이므로 폼을 직접 submit
    fireEvent.submit(screen.getByRole('form'));

    expect(screen.getByRole('alert')).toHaveTextContent('생년월일을 입력해주세요.');
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('잘못된 날짜 형식 입력 시 에러 메시지 표시', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/생년월일/), {
      target: { value: '10/10/1990' },
    });
    fireEvent.click(screen.getByRole('button', { name: '분석하기' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      '생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD)',
    );
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('잘못된 시간 형식 입력 시 에러 메시지 표시', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/생년월일/), {
      target: { value: '1990-10-10' },
    });
    fireEvent.change(screen.getByLabelText(/태어난 시간/), {
      target: { value: '25:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: '분석하기' }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts.some((el) => el.textContent?.includes('HH:mm'))).toBe(true);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('유효한 날짜와 시간 입력 시 onSubmit 호출', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/생년월일/), {
      target: { value: '1990-10-10' },
    });
    fireEvent.change(screen.getByLabelText(/태어난 시간/), {
      target: { value: '14:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: '분석하기' }));

    expect(mockSubmit).toHaveBeenCalledWith('1990-10-10', '14:30');
  });

  it('시간 미입력 시 기본값 12:00으로 onSubmit 호출', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/생년월일/), {
      target: { value: '1990-10-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: '분석하기' }));

    expect(mockSubmit).toHaveBeenCalledWith('1990-10-10', '12:00');
  });

  it('isLoading=true 시 버튼 비활성화 및 텍스트 변경', () => {
    render(<InputForm onSubmit={mockSubmit} isLoading={true} />);

    // 날짜 입력 후에도 로딩 중이면 버튼 disabled
    fireEvent.change(screen.getByLabelText(/생년월일/), {
      target: { value: '1990-10-10' },
    });

    const button = screen.getByRole('button', { name: '분석 중...' });
    expect(button).toBeDisabled();
  });

  it('생년월일 미입력 시 버튼 비활성화', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    const button = screen.getByRole('button', { name: '분석하기' });
    expect(button).toBeDisabled();
  });

  it('생년월일 입력 후 버튼 활성화', () => {
    render(<InputForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/생년월일/), {
      target: { value: '1990-10-10' },
    });

    const button = screen.getByRole('button', { name: '분석하기' });
    expect(button).not.toBeDisabled();
  });
});
