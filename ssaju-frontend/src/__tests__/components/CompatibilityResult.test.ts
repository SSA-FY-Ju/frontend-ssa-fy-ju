/**
 * 기업 궁합 결과 컴포넌트 테스트 (T092)
 *
 * CompatibilityScore, JobMatchingCards 렌더링 검증
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { CompatibilityScore } from '@/components/visualization/CompatibilityScore';
import { JobMatchingCards } from '@/components/visualization/JobMatchingCards';
import type { JobMatchCard } from '@/types/api';

// Recharts 모킹 (jsdom 환경)
jest.mock('recharts', () => ({
  RadialBarChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'radial-bar-chart' }, children),
  RadialBar: () => React.createElement('div', { 'data-testid': 'radial-bar' }),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'responsive-container' }, children),
}));

const mockScoreProps = {
  score: 78,
  confidenceLevel: 'HIGH' as const,
  sipShinScore: 82,
  oHangScore: 75,
  jijangGanScore: 70,
  leadershipScore: 85,
};

const mockJobCards: JobMatchCard[] = [
  {
    jobTitle: '소프트웨어 엔지니어',
    score: 88,
    reason: '논리적 분석 능력이 뛰어납니다.',
    recommendation: '강력 추천',
    isRecommended: true,
  },
  {
    jobTitle: '마케터',
    score: 52,
    reason: '대외 커뮤니케이션과 다소 맞지 않습니다.',
    recommendation: '주의',
    isRecommended: false,
  },
];

describe('CompatibilityScore', () => {
  it('종합 점수 78 표시', () => {
    render(React.createElement(CompatibilityScore, mockScoreProps));
    expect(screen.getByText('78')).toBeInTheDocument();
  });

  it('신뢰도 "높음" 표시 (HIGH)', () => {
    render(React.createElement(CompatibilityScore, mockScoreProps));
    expect(screen.getByText('높음')).toBeInTheDocument();
  });

  it('4개 점수 항목 라벨 표시', () => {
    render(React.createElement(CompatibilityScore, mockScoreProps));
    expect(screen.getByText('십신 궁합')).toBeInTheDocument();
    expect(screen.getByText('오행 궁합')).toBeInTheDocument();
    expect(screen.getByText('지장간 궁합')).toBeInTheDocument();
    expect(screen.getByText('리더십 매칭')).toBeInTheDocument();
  });

  it('각 점수값 표시', () => {
    render(React.createElement(CompatibilityScore, mockScoreProps));
    expect(screen.getByText('82점')).toBeInTheDocument();
    expect(screen.getByText('75점')).toBeInTheDocument();
    expect(screen.getByText('70점')).toBeInTheDocument();
    expect(screen.getByText('85점')).toBeInTheDocument();
  });

  it('신뢰도 LOW → "낮음" 표시', () => {
    render(
      React.createElement(CompatibilityScore, {
        ...mockScoreProps,
        confidenceLevel: 'LOW',
      }),
    );
    expect(screen.getByText('낮음')).toBeInTheDocument();
  });

  it('신뢰도 MEDIUM → "보통" 표시', () => {
    render(
      React.createElement(CompatibilityScore, {
        ...mockScoreProps,
        confidenceLevel: 'MEDIUM',
      }),
    );
    expect(screen.getByText('보통')).toBeInTheDocument();
  });
});

describe('JobMatchingCards', () => {
  it('직무 카드 2개 렌더링', () => {
    render(React.createElement(JobMatchingCards, { cards: mockJobCards }));
    expect(screen.getByText('소프트웨어 엔지니어')).toBeInTheDocument();
    expect(screen.getByText('마케터')).toBeInTheDocument();
  });

  it('직무별 점수 표시', () => {
    render(React.createElement(JobMatchingCards, { cards: mockJobCards }));
    expect(screen.getByText('88 / 100')).toBeInTheDocument();
    expect(screen.getByText('52 / 100')).toBeInTheDocument();
  });

  it('추천 뱃지 표시', () => {
    render(React.createElement(JobMatchingCards, { cards: mockJobCards }));
    expect(screen.getByText('강력 추천')).toBeInTheDocument();
    expect(screen.getByText('주의')).toBeInTheDocument();
  });

  it('직무별 이유 텍스트 표시', () => {
    render(React.createElement(JobMatchingCards, { cards: mockJobCards }));
    expect(screen.getByText('논리적 분석 능력이 뛰어납니다.')).toBeInTheDocument();
    expect(screen.getByText('대외 커뮤니케이션과 다소 맞지 않습니다.')).toBeInTheDocument();
  });

  it('빈 카드 배열 시 아무것도 렌더링하지 않음', () => {
    const { container } = render(React.createElement(JobMatchingCards, { cards: [] }));
    expect(container.firstChild?.childNodes).toHaveLength(0);
  });
});
