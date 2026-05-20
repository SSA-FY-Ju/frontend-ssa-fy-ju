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
import type { AnalysisRecord } from '@/types/api';

const mockCareerRecord: AnalysisRecord = {
  recordId: 'record-001',
  userId: 'user-001',
  analysisType: 'CAREER_TIMING',
  data: {
    favoredPeriod: '2025년 상반기',
    confidenceScore: 82,
    reasoning: '상반기가 유리합니다.',
  },
  createdAt: new Date('2025-01-15').getTime(),
};

const mockConsultationRecord: AnalysisRecord = {
  recordId: 'record-002',
  userId: 'user-001',
  analysisType: 'CONSULTATION',
  data: {
    analysisSummary: '경금 일주의 분석력이 강점입니다.',
    pivotPoints: [
      { month: '2025년 9월', type: 'LUCKY', score: 91, description: '관성이 활성화됩니다.' },
    ],
    warningMonths: ['2025년 6월'],
    warningDescription: '형충의 기운이 강합니다.',
  },
  createdAt: new Date('2025-02-10').getTime(),
};

const mockCompatibilityRecord: AnalysisRecord = {
  recordId: 'record-003',
  userId: 'user-001',
  analysisType: 'COMPATIBILITY',
  data: {
    potentialSynergy: 87,
    longTermStability: 82,
    actionableStrategy: {
      interviewKeywords: ['협업', '성장'],
      weaknessDefense: '강점으로 전환하세요.',
      bestTiming: { luckyDays: ['2월'] },
    },
  },
  createdAt: new Date('2025-03-01').getTime(),
};

describe('HistoryCard', () => {
  it('CAREER_TIMING 카드 렌더링: 분석 타입 뱃지 표시', () => {
    render(
      <HistoryCard
        record={mockCareerRecord}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText('관운 분석')).toBeInTheDocument();
  });

  it('CAREER_TIMING 카드: favoredPeriod와 신뢰도 표시', () => {
    render(
      <HistoryCard
        record={mockCareerRecord}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText(/2025년 상반기/)).toBeInTheDocument();
    expect(screen.getByText(/신뢰도 82%/)).toBeInTheDocument();
  });

  it('CONSULTATION 카드: 전환점 정보 표시', () => {
    render(
      <HistoryCard
        record={mockConsultationRecord}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText('AI 컨설팅')).toBeInTheDocument();
    expect(screen.getByText(/전환점/)).toBeInTheDocument();
  });

  it('COMPATIBILITY 카드: 기업명과 점수 표시', () => {
    render(
      <HistoryCard
        record={mockCompatibilityRecord}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText('기업 궁합')).toBeInTheDocument();
    expect(screen.getByText(/삼성전자/)).toBeInTheDocument();
    expect(screen.getByText(/87점/)).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 onDelete 호출됨', () => {
    const onDelete = jest.fn();
    render(
      <HistoryCard
        record={mockCareerRecord}
        onDelete={onDelete}
        onView={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '기록 삭제' }));
    expect(onDelete).toHaveBeenCalledWith('record-001');
  });

  it('삭제 버튼 클릭 시 onView는 호출되지 않음', () => {
    const onDelete = jest.fn();
    const onView = jest.fn();
    render(
      <HistoryCard
        record={mockCareerRecord}
        onDelete={onDelete}
        onView={onView}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '기록 삭제' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onView).not.toHaveBeenCalled();
  });

  it('카드 클릭 시 onView 호출됨', () => {
    const onView = jest.fn();
    render(
      <HistoryCard
        record={mockCareerRecord}
        onDelete={jest.fn()}
        onView={onView}
      />,
    );

    // role="button" 요소 클릭
    fireEvent.click(screen.getByRole('button', { name: /관운 분석/ }));
    expect(onView).toHaveBeenCalledWith('record-001');
  });
});
