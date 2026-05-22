/**
 * HistoryCard 컴포넌트 테스트 (T112)
 *
 * - 카드 렌더링 테스트
 * - 삭제 버튼 클릭 시 onDelete 호출 확인
 * - 카드 클릭 시 onView 호출 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryCard } from '@/components/history/HistoryCard';
import type { MyPageAnalysisSummary } from '@/types/api';

const mockTimingSummary: MyPageAnalysisSummary = {
  id: 1,
  type: 'TIMING',
  birthDate: '1990-05-15',
  createdAt: '2025-01-15T10:00:00Z',
  favoredPeriod: 'H1',
  confidenceScore: 82,
};

const mockConsultationSummary: MyPageAnalysisSummary = {
  id: 2,
  type: 'CONSULTATION',
  birthDate: '1990-05-15',
  createdAt: '2025-02-10T10:00:00Z',
  favoredPeriod: 'H2',
  confidenceScore: 88,
};

const mockCompatibilitySummary: MyPageAnalysisSummary = {
  id: 3,
  type: 'COMPATIBILITY',
  birthDate: '1992-03-20',
  createdAt: '2025-03-01T10:00:00Z',
};

describe('HistoryCard', () => {
  it('TIMING 카드 렌더링: 관운 분석 뱃지 표시', () => {
    render(
      <HistoryCard
        summary={mockTimingSummary}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText('관운 분석')).toBeInTheDocument();
  });

  it('TIMING 카드: 상반기 유리와 신뢰도 표시', () => {
    render(
      <HistoryCard
        summary={mockTimingSummary}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText(/상반기 유리/)).toBeInTheDocument();
    expect(screen.getByText(/신뢰도 82%/)).toBeInTheDocument();
  });

  it('CONSULTATION 카드: AI 컨설팅 뱃지 및 하반기 유리 표시', () => {
    render(
      <HistoryCard
        summary={mockConsultationSummary}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText('AI 컨설팅')).toBeInTheDocument();
    expect(screen.getByText(/하반기 유리/)).toBeInTheDocument();
    expect(screen.getByText(/신뢰도 88%/)).toBeInTheDocument();
  });

  it('COMPATIBILITY 카드: 기업 궁합 뱃지 및 분석 완료 표시', () => {
    render(
      <HistoryCard
        summary={mockCompatibilitySummary}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText('기업 궁합')).toBeInTheDocument();
    expect(screen.getByText(/궁합 분석 완료/)).toBeInTheDocument();
  });

  it('생년월일이 한국어 형식으로 표시됨', () => {
    render(
      <HistoryCard
        summary={mockTimingSummary}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText(/1990년 05월 15일/)).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 onDelete 호출됨', () => {
    const onDelete = jest.fn();
    render(
      <HistoryCard
        summary={mockTimingSummary}
        onDelete={onDelete}
        onView={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '기록 삭제' }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('삭제 버튼 클릭 시 onView는 호출되지 않음', () => {
    const onDelete = jest.fn();
    const onView = jest.fn();
    render(
      <HistoryCard
        summary={mockTimingSummary}
        onDelete={onDelete}
        onView={onView}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '기록 삭제' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onView).not.toHaveBeenCalled();
  });

  it('카드 클릭 시 onView가 id와 type을 포함해 호출됨', () => {
    const onView = jest.fn();
    render(
      <HistoryCard
        summary={mockTimingSummary}
        onDelete={jest.fn()}
        onView={onView}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /관운/ }));
    expect(onView).toHaveBeenCalledWith('1', 'TIMING');
  });
});
