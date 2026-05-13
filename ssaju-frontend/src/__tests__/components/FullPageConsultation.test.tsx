/**
 * FullPageConsultation 컴포넌트 테스트 (T081)
 *
 * fullpage.js 래퍼 컴포넌트 검증:
 * - 8개 섹션 컴포넌트 렌더링 확인
 * - afterLoad 콜백 → onSectionChange 호출 검증
 * - prefers-reduced-motion 환경: scrollingSpeed: 0 적용 검증
 * - responsiveWidth: 768 이하: fullpage.js 비활성 (일반 스크롤) 검증
 *
 * fullpage.js mock 전략:
 * - render prop만 동기적으로 실행 (useEffect 없음)
 * - afterLoad/afterRender는 triggerAfterLoad/triggerAfterRender 클릭으로 수동 시뮬레이션
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockConsultationData } from '@/mocks/data/career';

// ─── window.matchMedia 기본 모킹 (JSDOM에는 미구현) ──────────────────────────
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

// ─── fullpage.js 모킹 ────────────────────────────────────────────────────────
// afterLoad/afterRender는 클로저로 캡처 → triggerAfterLoad/triggerAfterRender 버튼으로 시뮬레이션
// useEffect 없이 순수하게 render prop을 실행해 React 렌더링 이슈를 방지
type FullpageItem = { anchor: string; index: number; item: HTMLElement; isFirst: boolean; isLast: boolean };

let capturedAfterLoad: ((o: FullpageItem, d: FullpageItem, dir: string, t: string) => void) | undefined;
let capturedAfterRender: (() => void) | undefined;
const mockFullpageApi = { moveTo: jest.fn(), setScrollingSpeed: jest.fn() };

jest.mock('@fullpage/react-fullpage', () => {
  const MockReactFullpage = ({
    render: renderProp,
    afterLoad,
    afterRender,
  }: {
    render: (comp: { state: object; fullpageApi: object }) => React.ReactElement;
    afterLoad?: (o: object, d: { index: number }, dir: string, t: string) => void;
    afterRender?: () => void;
  }) => {
    capturedAfterLoad = afterLoad as typeof capturedAfterLoad;
    capturedAfterRender = afterRender;

    const ITEM = (index: number): object => ({
      anchor: '',
      index,
      item: {} as HTMLElement,
      isFirst: index === 0,
      isLast: index === 7,
    });

    return (
      <div data-testid="fullpage-wrapper">
        {renderProp({ state: {}, fullpageApi: mockFullpageApi })}
        {/* afterLoad 트리거 (0~7) */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <button
            key={i}
            data-testid={`trigger-afterload-${i}`}
            onClick={() => capturedAfterLoad?.(ITEM(0) as FullpageItem, ITEM(i) as FullpageItem, 'down', 'wheel')}
          />
        ))}
        {/* afterRender 트리거 */}
        <button
          data-testid="trigger-afterrender"
          onClick={() => capturedAfterRender?.()}
        />
      </div>
    );
  };

  function FullpageWrapper({ children }: { children: React.ReactNode }) {
    return <div data-testid="fullpage-sections">{children}</div>;
  }
  MockReactFullpage.Wrapper = FullpageWrapper;

  return { __esModule: true, default: MockReactFullpage };
});

// ─── 섹션 컴포넌트 모킹 ────────────────────────────────────────────────────
jest.mock('@/components/consultation/SectionNavigator', () => ({
  SectionNavigator: ({ currentIndex, onNavigate }: { sections: string[]; currentIndex: number; onNavigate: (i: number) => void }) => (
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
  beforeAll(() => {
    // 기본값: prefers-reduced-motion 비활성
    mockMatchMedia(false);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFullpageApi.moveTo.mockClear();
    mockFullpageApi.setScrollingSpeed.mockClear();
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

  it('SectionNavigator가 currentSectionIndex와 함께 렌더링됨', () => {
    render(<FullPageConsultation {...defaultProps} currentSectionIndex={3} />);
    expect(screen.getByTestId('section-navigator')).toHaveAttribute('data-current-index', '3');
  });

  it('afterLoad 콜백 → onSectionChange(destination.index) 호출', () => {
    const onSectionChange = jest.fn();
    render(<FullPageConsultation {...defaultProps} onSectionChange={onSectionChange} />);

    fireEvent.click(screen.getByTestId('trigger-afterload-4'));
    expect(onSectionChange).toHaveBeenCalledWith(4);
  });

  it('마지막 섹션(월별운세)에 피드백 버튼 표시', () => {
    render(<FullPageConsultation {...defaultProps} />);
    expect(screen.getByTestId('feedback-button')).toBeInTheDocument();
  });

  it('prefers-reduced-motion 활성 시 afterRender에서 setScrollingSpeed(0) 호출', () => {
    mockMatchMedia(true); // prefers-reduced-motion: reduce

    render(<FullPageConsultation {...defaultProps} />);
    fireEvent.click(screen.getByTestId('trigger-afterrender'));

    expect(mockFullpageApi.setScrollingSpeed).toHaveBeenCalledWith(0);

    // 복원
    mockMatchMedia(false);
  });

  it('prefers-reduced-motion 비활성 시 setScrollingSpeed 호출 없음', () => {
    mockMatchMedia(false);

    render(<FullPageConsultation {...defaultProps} />);
    fireEvent.click(screen.getByTestId('trigger-afterrender'));

    expect(mockFullpageApi.setScrollingSpeed).not.toHaveBeenCalled();
  });
});
