/**
 * 컨설팅 탭 컴포넌트 테스트 (T082)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndustriesTab } from '@/components/consultation/IndustriesTab';
import { InterviewTipsTab } from '@/components/consultation/InterviewTipsTab';
import { StrengthsTab } from '@/components/consultation/StrengthsTab';
import { BrandingTab } from '@/components/consultation/BrandingTab';
import { CareerRoadmapTab } from '@/components/consultation/CareerRoadmapTab';
import { WealthStyleTab } from '@/components/consultation/WealthStyleTab';
import { MonthlyCalendar } from '@/components/visualization/MonthlyCalendar';
import { mockConsultationData } from '@/mocks/data/career';

// Recharts 모킹
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Cell: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
}));

describe('IndustriesTab', () => {
  it('산업 목록 렌더링', () => {
    render(<IndustriesTab industries={mockConsultationData.recommendedIndustries} />);
    expect(screen.getByText('IT/소프트웨어')).toBeInTheDocument();
    expect(screen.getByText('핀테크')).toBeInTheDocument();
  });

  it('추천 직무 태그 표시', () => {
    render(<IndustriesTab industries={mockConsultationData.recommendedIndustries} />);
    expect(screen.getByText('프로덕트 매니저')).toBeInTheDocument();
  });
});

describe('InterviewTipsTab', () => {
  it('팁 목록 번호와 함께 표시', () => {
    render(<InterviewTipsTab tips={mockConsultationData.interviewTips} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(mockConsultationData.interviewTips.length);
  });
});

describe('StrengthsTab', () => {
  it('강점 목록 렌더링', () => {
    render(<StrengthsTab strengths={mockConsultationData.strengths} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(mockConsultationData.strengths.length);
  });
});

describe('BrandingTab', () => {
  it('파워 키워드 태그 표시', () => {
    render(<BrandingTab branding={mockConsultationData.branding} />);
    mockConsultationData.branding.powerKeywords.forEach((kw) => {
      expect(screen.getByText(kw)).toBeInTheDocument();
    });
  });
});

describe('CareerRoadmapTab', () => {
  it('3단계 로드맵 레이블 표시', () => {
    render(<CareerRoadmapTab roadmap={mockConsultationData.careerRoadmap} />);
    expect(screen.getByText('단기 (0-2년)')).toBeInTheDocument();
    expect(screen.getByText('중기 (3-5년)')).toBeInTheDocument();
    // 레이블과 내용 모두에 "최종 목표"가 있을 수 있으므로 getAllByText 사용
    expect(screen.getAllByText(/최종 목표/).length).toBeGreaterThanOrEqual(1);
  });
});

describe('WealthStyleTab', () => {
  it('부의운 4개 필드 표시', () => {
    render(<WealthStyleTab wealthStyle={mockConsultationData.wealthStyle} />);
    expect(screen.getByText('주요 소득원')).toBeInTheDocument();
    expect(screen.getByText('재무 조언')).toBeInTheDocument();
    expect(screen.getByText('투자 성향')).toBeInTheDocument();
    expect(screen.getByText('추가 수입')).toBeInTheDocument();
  });
});

describe('MonthlyCalendar', () => {
  it('1~4월 기본 표시', () => {
    render(<MonthlyCalendar forecasts={mockConsultationData.monthlyForecasts} />);
    expect(screen.getByText('1월')).toBeInTheDocument();
    expect(screen.getByText('4월')).toBeInTheDocument();
  });

  it('다음 분기 버튼으로 5~8월로 이동', () => {
    render(<MonthlyCalendar forecasts={mockConsultationData.monthlyForecasts} />);
    fireEvent.click(screen.getByRole('button', { name: '다음 분기' }));
    expect(screen.getByText('5월')).toBeInTheDocument();
    expect(screen.getByText('8월')).toBeInTheDocument();
  });

  it('이전 분기 버튼 비활성화 (첫 분기)', () => {
    render(<MonthlyCalendar forecasts={mockConsultationData.monthlyForecasts} />);
    expect(screen.getByRole('button', { name: '이전 분기' })).toBeDisabled();
  });
});
