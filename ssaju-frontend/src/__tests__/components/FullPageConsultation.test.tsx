/**
 * FullPageConsultation 컴포넌트 테스트 (T081)
 *
 * CSS scroll-snap 기반 풀페이지 뷰 검증:
 * - 8개 섹션 컴포넌트 렌더링 확인
 * - IntersectionObserver → onSectionChange 호출 검증
 * - prefers-reduced-motion: behavior 'instant' 적용 검증
 * - handleNavigate → container.scrollTo 호출 검증
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
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

// ─── IntersectionObserver 모킹 ─────────────────────────────────────────────
type IOCallback = (entries: IntersectionObserverEntry[]) => void;
const intersectionCallbacks: Map<Element, IOCallback> = new Map();

class MockIntersectionObserver {
  private callback: IOCallback;
  constructor(callback: IOCallback) {
    this.callback = callback;
  }
  observe(el: Element) {
    intersectionCallbacks.set(el, this.callback);
  }
  unobserve(el: Element) {
    intersectionCallbacks.delete(el);
  }
  disconnect() {
    intersectionCallbacks.clear();
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

/** 특정 요소가 뷰포트에 진입했다고 시뮬레이션 */
function triggerIntersection(el: Element, isIntersecting: boolean) {
  const callback = intersectionCallbacks.get(el);
  if (callback) {
    callback([{ isIntersecting, target: el } as IntersectionObserverEntry]);
  }
}

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

// ─── requestAnimationFrame 모킹 ───────────────────────────────────────────────
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
    intersectionCallbacks.clear();
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

  it('SectionNavigator가 currentSectionIndex와 함께 렌더링됨', () => {
    render(<FullPageConsultation {...defaultProps} currentSectionIndex={3} />);
    expect(screen.getByTestId('section-navigator')).toHaveAttribute('data-current-index', '3');
  });

  it('IntersectionObserver 진입 → onSectionChange(index) 호출', () => {
    const onSectionChange = jest.fn();
    render(<FullPageConsultation {...defaultProps} onSectionChange={onSectionChange} />);

    // 4번째 섹션(index 3)이 뷰포트에 진입
    const section3 = screen.getByTestId('fullpage-section-3');
    triggerIntersection(section3, true);

    expect(onSectionChange).toHaveBeenCalledWith(3);
  });

  it('마지막 섹션(index 7)에 피드백 버튼 표시', () => {
    render(<FullPageConsultation {...defaultProps} />);
    expect(screen.getByTestId('feedback-button')).toBeInTheDocument();
  });

  it('풀페이지 컨테이너에 scroll-snap-type: y mandatory 스타일 적용', () => {
    render(<FullPageConsultation {...defaultProps} />);
    const container = screen.getByTestId('fullpage-container');
    expect(container.style.scrollSnapType).toBe('y mandatory');
  });

  it('각 섹션에 scroll-snap-align: start 스타일 적용', () => {
    render(<FullPageConsultation {...defaultProps} />);
    const section0 = screen.getByTestId('fullpage-section-0');
    expect(section0.style.scrollSnapAlign).toBe('start');
  });

  it('nav 버튼 클릭 → requestAnimationFrame 호출 (700ms 애니메이션 시작)', () => {
    render(<FullPageConsultation {...defaultProps} />);
    // nav 버튼 클릭 (index 2)
    const navBtn = screen.getByTestId('nav-btn-2');
    navBtn.click();
    expect(mockRaf).toHaveBeenCalled();
  });

  it('prefers-reduced-motion: true → requestAnimationFrame 호출 없이 즉시 스크롤', () => {
    mockMatchMedia(true); // reduce motion ON
    render(<FullPageConsultation {...defaultProps} />);
    mockRaf.mockClear();
    const navBtn = screen.getByTestId('nav-btn-3');
    navBtn.click();
    expect(mockRaf).not.toHaveBeenCalled();
    mockMatchMedia(false); // 원복
  });
});
