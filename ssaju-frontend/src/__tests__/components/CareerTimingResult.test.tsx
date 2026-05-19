/**
 * CareerTimingResult 컴포넌트 테스트 (T064)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CareerTimingResult } from '@/components/results/CareerTimingResult';
import type { CareerTimingResult as CareerTimingResultType } from '@/types/api';

const mockResult: CareerTimingResultType = {
  sajuResultId: 'saju-001',
  h1Period: '2025년 상반기',
  h2Period: '2026년 하반기',
  h1Confidence: 82,
  h2Confidence: 65,
  recommendation: '상반기 취업이 유리합니다.',
};

describe('CareerTimingResult', () => {
  it('H1 신뢰도가 높으면 H1 권장 표시', () => {
    render(<CareerTimingResult result={mockResult} />);
    expect(screen.getByText(/H1 권장/)).toBeInTheDocument();
  });

  it('H2 신뢰도가 높으면 H2 권장 표시', () => {
    render(
      <CareerTimingResult
        result={{ ...mockResult, h1Confidence: 40, h2Confidence: 85 }}
      />,
    );
    expect(screen.getByText(/H2 권장/)).toBeInTheDocument();
  });

  it('분석 근거 텍스트 표시', () => {
    render(<CareerTimingResult result={mockResult} />);
    expect(screen.getByText('상반기 취업이 유리합니다.')).toBeInTheDocument();
  });

  it('신뢰도 진행 바 2개 표시 (H1, H2)', () => {
    render(<CareerTimingResult result={mockResult} />);
    // role="meter"로 확인
    const meters = screen.getAllByRole('meter');
    expect(meters).toHaveLength(2);
  });
});
