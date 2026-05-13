/**
 * FullPageConsultation 컴포넌트 테스트 (T081)
 *
 * transform: translateY 기반 풀페이지 스크롤 뷰 검증:
 * - 8개 섹션 컴포넌트 렌더링 확인
 * - overflow-hidden 컨테이너 + will-change-transform 래퍼
 * - 수직 중앙 정렬 (flex justify-center)
 * - 마지막 섹션 저장/초기화 버튼
 * - nav 버튼 클릭 → rAF 호출 (700ms 슬라이드 시작)
 * - prefers-reduced-motion: 즉시 이동 (rAF 없음)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockConsultationData } from '@/mocks/data/career';

// ─── window.matchMedia 모킹 ────────────────────────────────────────────────
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockReturnValue({
      matches,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
};

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

// ─── requestAnimationFrame 모킹 ──────────────────────────────────────────
const mockRaf = jest.fn((_cb: FrameRequestCallback) => 1);

describe('FullPageConsultation', () => {
  beforeAll(() => {
    mockMatchMedia(false);
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: mockRaf,
    });
  });

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

  it('8개 섹션 div가 data-testid="fullpage-section-{i}"로 렌더링됨', () => {
    render(<FullPageConsultation {...defaultProps} />);
    for (let i = 0; i < 8; i++) {
      expect(screen.getByTestId(`fullpage-section-${i}`)).toBeInTheDocument();
    }
  });

  it('컨테이너가 overflow-hidden, 래퍼가 will-change-transform 가짐', () => {
    render(<FullPageConsultation {...defaultProps} />);
    expect(screen.getByTestId('fullpage-container').classList.contains('overflow-hidden')).toBe(true);
    expect(screen.getByTestId('fullpage-wrapper').classList.contains('will-change-transform')).toBe(true);
  });

  it('각 섹션이 flex justify-center 클래스 가짐 (수직 중앙 정렬)', () => {
    render(<FullPageConsultation {...defaultProps} />);
    const section0 = screen.getByTestId('fullpage-section-0');
    expect(section0.classList.contains('flex')).toBe(true);
    expect(section0.classList.contains('justify-center')).toBe(true);
  });

  it('SectionNavigator가 currentSectionIndex와 함께 렌더링됨', () => {
    render(<FullPageConsultation {...defaultProps} currentSectionIndex={3} />);
    expect(screen.getByTestId('section-navigator')).toHaveAttribute('data-current-index', '3');
  });

  it('마지막 섹션(index 7)에 피드백 버튼 표시', () => {
    render(<FullPageConsultation {...defaultProps} />);
    expect(screen.getByTestId('feedback-button')).toBeInTheDocument();
  });

  it('isLoggedIn=true → 저장 버튼 표시', () => {
    render(<FullPageConsultation {...defaultProps} isLoggedIn={true} />);
    expect(screen.getByText('이 결과 저장하기')).toBeInTheDocument();
  });

  it('isLoggedIn=false → 로그인 안내 표시', () => {
    render(<FullPageConsultation {...defaultProps} isLoggedIn={false} />);
    expect(screen.getByText(/결과를 저장하려면 로그인/)).toBeInTheDocument();
  });

  it('"새 분석 시작하기" 버튼 클릭 → onReset 호출', () => {
    const onReset = jest.fn();
    render(<FullPageConsultation {...defaultProps} onReset={onReset} />);
    fireEvent.click(screen.getByText('새 분석 시작하기'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('nav 버튼 클릭 → requestAnimationFrame 호출 (700ms 슬라이드 시작)', () => {
    render(<FullPageConsultation {...defaultProps} />);
    screen.getByTestId('nav-btn-2').click();
    expect(mockRaf).toHaveBeenCalled();
  });

  it('prefers-reduced-motion: true → rAF 없이 즉시 translateY 설정', () => {
    mockMatchMedia(true);
    render(<FullPageConsultation {...defaultProps} />);
    mockRaf.mockClear();
    screen.getByTestId('nav-btn-3').click();
    expect(mockRaf).not.toHaveBeenCalled();
    // wrapper transform이 즉시 설정됨
    const wrapper = screen.getByTestId('fullpage-wrapper');
    expect(wrapper.style.transform).toContain('translateY');
    mockMatchMedia(false);
  });
});
