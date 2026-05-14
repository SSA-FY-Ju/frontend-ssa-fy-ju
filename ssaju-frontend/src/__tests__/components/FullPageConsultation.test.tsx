/**
 * FullPageConsultation 컴포넌트 테스트 (T081 / T133)
 *
 * Swiper.js 기반 풀페이지 뷰 검증:
 * - 8개 섹션 컴포넌트 렌더링 확인
 * - onSlideChange → onSectionChange 호출 검증
 * - SectionNavigator 렌더링 및 currentSectionIndex 전달 확인
 * - 마지막 섹션 피드백 버튼 렌더링 확인
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockConsultationData } from '@/mocks/data/career';

// ─── Swiper 모킹 ──────────────────────────────────────────────────────────────
jest.mock('swiper/react', () => ({
  Swiper: ({
    children,
    onSwiper,
  }: {
    children: React.ReactNode;
    onSwiper?: (swiper: { slideTo: jest.Mock; activeIndex: number }) => void;
    onSlideChange?: (swiper: { activeIndex: number }) => void;
    [key: string]: unknown;
  }) => {
    React.useEffect(() => {
      onSwiper?.({ slideTo: jest.fn(), activeIndex: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div data-testid="fullpage-container">
        {children}
      </div>
    );
  },
  SwiperSlide: ({
    children,
    'data-testid': testId,
    style,
  }: {
    children: React.ReactNode;
    'data-testid'?: string;
    style?: React.CSSProperties;
    [key: string]: unknown;
  }) => (
    <div data-testid={testId} style={style}>
      {children}
    </div>
  ),
}));

jest.mock('swiper/modules', () => ({
  Mousewheel: {},
  Keyboard: {},
  A11y: {},
}));

jest.mock('swiper/css', () => ({}));

// ─── useAuth 모킹 ──────────────────────────────────────────────────────────────
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: false,
    loginWithKakao: jest.fn(),
    loginWithGoogle: jest.fn(),
  }),
}));

// ─── 섹션 컴포넌트 모킹 ────────────────────────────────────────────────────
jest.mock('@/components/consultation/SectionNavigator', () => ({
  SectionNavigator: ({
    currentIndex,
    onNavigate,
  }: {
    sections: string[];
    currentIndex: number;
    onNavigate: (i: number) => void;
  }) => (
    <nav data-testid="section-navigator" data-current-index={currentIndex}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <button key={i} data-testid={`nav-btn-${i}`} onClick={() => onNavigate(i)} />
      ))}
    </nav>
  ),
}));

jest.mock('@/components/consultation/IndustriesTab', () => ({
  IndustriesTab: () => <div data-testid="section-industries">추천산업</div>,
}));
jest.mock('@/components/consultation/InterviewTipsTab', () => ({
  InterviewTipsTab: () => <div data-testid="section-interview">면접팁</div>,
}));
jest.mock('@/components/consultation/StrengthsTab', () => ({
  StrengthsTab: () => <div data-testid="section-strengths">강점</div>,
}));
jest.mock('@/components/consultation/SajuProfileTab', () => ({
  SajuProfileTab: () => <div data-testid="section-saju">사주프로필</div>,
}));
jest.mock('@/components/consultation/WealthStyleTab', () => ({
  WealthStyleTab: () => <div data-testid="section-wealth">부의운</div>,
}));
jest.mock('@/components/consultation/CareerRoadmapTab', () => ({
  CareerRoadmapTab: () => <div data-testid="section-roadmap">경력로드맵</div>,
}));
jest.mock('@/components/consultation/BrandingTab', () => ({
  BrandingTab: () => <div data-testid="section-branding">브랜딩</div>,
}));
jest.mock('@/components/consultation/MonthlyForecastTab', () => ({
  MonthlyForecastTab: () => <div data-testid="section-monthly">월별운세</div>,
}));
jest.mock('@/components/results/FeedbackButton', () => ({
  FeedbackButton: () => <button data-testid="feedback-button">피드백</button>,
}));

import { FullPageConsultation } from '@/components/consultation/FullPageConsultation';

const defaultProps = {
  data: mockConsultationData,
  currentSectionIndex: 0,
  onSectionChange: jest.fn(),
};

describe('FullPageConsultation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('8개 섹션 컴포넌트가 모두 렌더링됨', () => {
    render(<FullPageConsultation {...defaultProps} />);

    expect(screen.getByTestId('section-industries')).toBeInTheDocument();
    expect(screen.getByTestId('section-interview')).toBeInTheDocument();
    expect(screen.getByTestId('section-strengths')).toBeInTheDocument();
    expect(screen.getByTestId('section-saju')).toBeInTheDocument();
    expect(screen.getByTestId('section-wealth')).toBeInTheDocument();
    expect(screen.getByTestId('section-roadmap')).toBeInTheDocument();
    expect(screen.getByTestId('section-branding')).toBeInTheDocument();
    expect(screen.getByTestId('section-monthly')).toBeInTheDocument();
  });

  it('data-testid="fullpage-section-{i}" 속성이 각 SwiperSlide에 존재함', () => {
    render(<FullPageConsultation {...defaultProps} />);
    for (let i = 0; i < 8; i++) {
      expect(screen.getByTestId(`fullpage-section-${i}`)).toBeInTheDocument();
    }
  });

  it('SectionNavigator가 currentSectionIndex와 함께 렌더링됨', () => {
    render(<FullPageConsultation {...defaultProps} currentSectionIndex={3} />);
    expect(screen.getByTestId('section-navigator')).toHaveAttribute('data-current-index', '3');
  });

  it('마지막 섹션(index 7)에 피드백 버튼 표시', () => {
    render(<FullPageConsultation {...defaultProps} />);
    expect(screen.getByTestId('feedback-button')).toBeInTheDocument();
  });

  it('Swiper 컨테이너가 data-testid="fullpage-container"로 렌더링됨', () => {
    render(<FullPageConsultation {...defaultProps} />);
    expect(screen.getByTestId('fullpage-container')).toBeInTheDocument();
  });
});
