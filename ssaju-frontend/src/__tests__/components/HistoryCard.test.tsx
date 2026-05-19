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
    sajuResultId: 'saju-002',
    recommendedIndustries: [
      { industryName: 'IT/소프트웨어', reason: '적합합니다', recommendedRoles: ['개발자'] },
    ],
    interviewTips: [],
    strengths: [],
    sajuProfile: {
      dayMaster: '丙',
      personality: '밝은 성격',
      oHangDistribution: {},
      sipShinDistribution: {},
    },
    wealthStyle: {
      incomeSource: '기술직',
      financialAdvice: '저축',
      investmentStyle: '안정형',
      additionalIncome: '프리랜서',
    },
    careerRoadmap: { shortTerm: '기초', midTerm: '성장', longTerm: '목표' },
    branding: { suitColor: '네이비', imageStyle: '클린', hairMakeup: '자연스럽게', powerKeywords: [] },
    monthlyForecasts: [],
  },
  createdAt: new Date('2025-02-10').getTime(),
};

const mockCompatibilityRecord: AnalysisRecord = {
  recordId: 'record-003',
  userId: 'user-001',
  analysisType: 'COMPATIBILITY',
  data: {
    sajuResultId: 'saju-003',
    companyName: '삼성전자',
    compatibilityScore: 87,
    confidenceLevel: 'HIGH',
    sipShinScore: 85,
    oHangScore: 90,
    jijangGanScore: 80,
    leadershipScore: 88,
    jobMatchCards: [],
    monthlyForecasts: [],
    careerMilestone: { shortTerm: '입사', midTerm: '성장', longTerm: '리더' },
    recommendation: '높은 궁합입니다.',
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

  it('CONSULTATION 카드: 첫 번째 추천 산업명 표시', () => {
    render(
      <HistoryCard
        record={mockConsultationRecord}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />,
    );

    expect(screen.getByText('AI 컨설팅')).toBeInTheDocument();
    expect(screen.getByText('IT/소프트웨어')).toBeInTheDocument();
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
