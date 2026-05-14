/**
 * ConsultationScrollView 컴포넌트 테스트 (T081b)
 *
 * 8개 섹션 렌더링 및 스크롤 UX 검증
 */

import { render, screen } from '@testing-library/react';
import { ConsultationScrollView } from '@/components/consultation/ConsultationScrollView';
import { mockConsultationData } from '@/mocks/data/career';

// useSectionObserver 모킹
jest.mock('@/hooks/useSectionObserver', () => ({
  useSectionObserver: () => ({
    stableRefs: Array(8).fill(jest.fn()),
    visibleSections: Array(8).fill(true), // 테스트에서는 모두 가시화
    activeSectionIndex: 0,
    scrollToSection: jest.fn(),
  }),
}));

// 하위 섹션 컴포넌트 간단 모킹
jest.mock('@/components/consultation/IndustriesTab', () => ({
  IndustriesTab: () => <div data-testid="section-industries">추천산업 컨텐츠</div>,
}));
jest.mock('@/components/consultation/InterviewTipsTab', () => ({
  InterviewTipsTab: () => <div data-testid="section-interview">면접팁 컨텐츠</div>,
}));
jest.mock('@/components/consultation/StrengthsTab', () => ({
  StrengthsTab: () => <div data-testid="section-strengths">강점 컨텐츠</div>,
}));
jest.mock('@/components/consultation/SajuProfileTab', () => ({
  SajuProfileTab: () => <div data-testid="section-saju">사주프로필 컨텐츠</div>,
}));
jest.mock('@/components/consultation/WealthStyleTab', () => ({
  WealthStyleTab: () => <div data-testid="section-wealth">부의운 컨텐츠</div>,
}));
jest.mock('@/components/consultation/CareerRoadmapTab', () => ({
  CareerRoadmapTab: () => <div data-testid="section-roadmap">경력로드맵 컨텐츠</div>,
}));
jest.mock('@/components/consultation/BrandingTab', () => ({
  BrandingTab: () => <div data-testid="section-branding">브랜딩 컨텐츠</div>,
}));
jest.mock('@/components/consultation/MonthlyForecastTab', () => ({
  MonthlyForecastTab: () => <div data-testid="section-monthly">월별운세 컨텐츠</div>,
}));
jest.mock('@/components/consultation/SectionNavigator', () => ({
  SectionNavigator: ({ onNavigate }: { onNavigate: (i: number) => void }) => (
    <nav data-testid="section-navigator">
      {['추천산업', '면접팁', '강점', '사주프로필', '부의운', '경력로드맵', '브랜딩', '월별운세'].map(
        (label, i) => (
          <button key={label} onClick={() => onNavigate(i)}>
            {label}
          </button>
        )
      )}
    </nav>
  ),
}));

describe('ConsultationScrollView', () => {
  it('8개 섹션이 모두 렌더링됨', () => {
    render(<ConsultationScrollView data={mockConsultationData} />);

    expect(screen.getByTestId('section-industries')).toBeInTheDocument();
    expect(screen.getByTestId('section-interview')).toBeInTheDocument();
    expect(screen.getByTestId('section-strengths')).toBeInTheDocument();
    expect(screen.getByTestId('section-saju')).toBeInTheDocument();
    expect(screen.getByTestId('section-wealth')).toBeInTheDocument();
    expect(screen.getByTestId('section-roadmap')).toBeInTheDocument();
    expect(screen.getByTestId('section-branding')).toBeInTheDocument();
    expect(screen.getByTestId('section-monthly')).toBeInTheDocument();
  });

  it('SectionNavigator가 렌더링됨', () => {
    render(<ConsultationScrollView data={mockConsultationData} />);
    expect(screen.getByTestId('section-navigator')).toBeInTheDocument();
  });

  it('각 섹션에 aria-label 속성 존재', () => {
    render(<ConsultationScrollView data={mockConsultationData} />);
    expect(screen.getByRole('region', { name: '추천산업' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '월별운세' })).toBeInTheDocument();
  });

  it('SectionNavigator 버튼이 섹션 이름으로 렌더링됨', () => {
    render(<ConsultationScrollView data={mockConsultationData} />);
    // 데스크톱·모바일 두 네비게이터가 렌더링되므로 getAllByText 사용
    expect(screen.getAllByText('추천산업').length).toBeGreaterThan(0);
    expect(screen.getAllByText('경력로드맵').length).toBeGreaterThan(0);
    expect(screen.getAllByText('월별운세').length).toBeGreaterThan(0);
  });
});
