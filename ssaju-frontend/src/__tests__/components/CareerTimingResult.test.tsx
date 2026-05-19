/**
 * CareerTimingResult 컴포넌트 테스트 (T064)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CareerTimingResult } from '@/components/results/CareerTimingResult';
import type { CareerTimingResult as CareerTimingResultType } from '@/types/api';

const mockResult: CareerTimingResultType = {
  favoredPeriod: '2025년 상반기',
  confidenceScore: 82,
  reasoning: '상반기 취업이 유리합니다.',
};

describe('CareerTimingResult', () => {
  it('채용 운이 좋은 시기 표시', () => {
    render(<CareerTimingResult result={mockResult} />);
    expect(screen.getByText('2025년 상반기')).toBeInTheDocument();
  });

  it('신뢰도 퍼센트 표시', () => {
    render(<CareerTimingResult result={mockResult} />);
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('분석 근거 텍스트 표시', () => {
    render(<CareerTimingResult result={mockResult} />);
    expect(screen.getByText('상반기 취업이 유리합니다.')).toBeInTheDocument();
  });

  it('신뢰도 진행 바 표시', () => {
    render(<CareerTimingResult result={mockResult} />);
    const meter = screen.getByRole('meter');
    expect(meter).toBeInTheDocument();
  });
});
