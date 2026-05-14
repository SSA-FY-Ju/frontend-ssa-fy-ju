/**
 * ErrorMessage 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from '@/components/errors/ErrorMessage';

describe('ErrorMessage', () => {
  it('에러 메시지 텍스트를 렌더링함', () => {
    render(<ErrorMessage message="서버 오류가 발생했습니다" />);
    expect(screen.getByText('서버 오류가 발생했습니다')).toBeInTheDocument();
  });

  it('role="alert" 속성을 가짐', () => {
    render(<ErrorMessage message="오류" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('onRetry가 제공되면 재시도 버튼을 렌더링함', () => {
    render(<ErrorMessage message="오류" onRetry={jest.fn()} />);
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('onRetry가 없으면 재시도 버튼을 렌더링하지 않음', () => {
    render(<ErrorMessage message="오류" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('커스텀 retryLabel이 버튼 텍스트로 표시됨', () => {
    render(<ErrorMessage message="오류" onRetry={jest.fn()} retryLabel="재시도" />);
    expect(screen.getByRole('button', { name: '재시도' })).toBeInTheDocument();
  });

  it('재시도 버튼 클릭 시 onRetry가 호출됨', () => {
    const onRetry = jest.fn();
    render(<ErrorMessage message="오류" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
