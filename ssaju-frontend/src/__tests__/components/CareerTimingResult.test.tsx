/**
 * CareerTimingResult 컴포넌트 테스트 (T064)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    render(
      <CareerTimingResult
        result={mockResult}
        isLoggedIn={false}
      />,
    );
    expect(screen.getByText(/H1 권장/)).toBeInTheDocument();
  });

  it('H2 신뢰도가 높으면 H2 권장 표시', () => {
    render(
      <CareerTimingResult
        result={{ ...mockResult, h1Confidence: 40, h2Confidence: 85 }}
        isLoggedIn={false}
      />,
    );
    expect(screen.getByText(/H2 권장/)).toBeInTheDocument();
  });

  it('분석 근거 텍스트 표시', () => {
    render(
      <CareerTimingResult result={mockResult} isLoggedIn={false} />,
    );
    expect(screen.getByText('상반기 취업이 유리합니다.')).toBeInTheDocument();
  });

  it('비로그인 시 로그인 안내 표시', () => {
    render(
      <CareerTimingResult result={mockResult} isLoggedIn={false} />,
    );
    expect(screen.getByText(/결과를 저장하려면 로그인/)).toBeInTheDocument();
    expect(screen.queryByText('이 결과 저장하기')).not.toBeInTheDocument();
  });

  it('로그인 시 저장 버튼 표시', () => {
    render(
      <CareerTimingResult result={mockResult} isLoggedIn={true} />,
    );
    expect(screen.getByRole('button', { name: '이 결과 저장하기' })).toBeInTheDocument();
  });

  it('저장 버튼 클릭 시 onSave 호출', () => {
    const onSave = jest.fn();
    render(
      <CareerTimingResult result={mockResult} isLoggedIn={true} onSave={onSave} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '이 결과 저장하기' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('피드백 버튼 클릭 시 onFeedback 호출', () => {
    const onFeedback = jest.fn();
    render(
      <CareerTimingResult result={mockResult} isLoggedIn={false} onFeedback={onFeedback} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /의견을 알려주세요/ }));
    expect(onFeedback).toHaveBeenCalledTimes(1);
  });

  it('신뢰도 진행 바 2개 표시 (H1, H2)', () => {
    render(
      <CareerTimingResult result={mockResult} isLoggedIn={false} />,
    );
    // role="meter"로 확인
    const meters = screen.getAllByRole('meter');
    expect(meters).toHaveLength(2);
  });
});
