/**
 * LoadingProgress 컴포넌트 테스트
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingProgress } from '@/components/results/LoadingProgress';

describe('LoadingProgress', () => {
  it('전달된 message 텍스트를 렌더링함', () => {
    render(<LoadingProgress message="AI 분석 중..." />);
    expect(screen.getByText('AI 분석 중...')).toBeInTheDocument();
  });

  it('message prop이 없으면 기본값 "분석 중..."을 표시함', () => {
    render(<LoadingProgress />);
    expect(screen.getByText('분석 중...')).toBeInTheDocument();
  });

  it('로딩 인디케이터 요소(aria-label)가 렌더링됨', () => {
    render(<LoadingProgress message="처리 중..." />);
    const container = screen.getByLabelText('처리 중...');
    expect(container).toBeInTheDocument();
  });

  it('aria-live="polite" 속성을 가짐', () => {
    render(<LoadingProgress message="분석 중..." />);
    const container = screen.getByLabelText('분석 중...');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});
