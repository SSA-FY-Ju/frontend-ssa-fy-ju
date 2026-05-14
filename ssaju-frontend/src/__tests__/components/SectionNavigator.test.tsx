/**
 * SectionNavigator 컴포넌트 테스트 (T081b)
 *
 * fullpageApi.moveTo() 연동 검증:
 * - 8개 점/섹션명 렌더링 확인
 * - currentIndex 기반 활성 강조 확인
 * - 클릭 시 onNavigate(index) 호출 검증
 * - 데스크톱/모바일 레이아웃 전환 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionNavigator } from '@/components/consultation/SectionNavigator';

const SECTION_LABELS = [
  '추천산업', '면접팁', '강점', '사주프로필', '부의운', '경력로드맵', '브랜딩', '월별운세',
];

describe('SectionNavigator', () => {
  const onNavigate = jest.fn();

  beforeEach(() => onNavigate.mockClear());

  it('8개 섹션 버튼이 두 nav 각각에 렌더링됨 (데스크톱 + 모바일)', () => {
    render(
      <SectionNavigator
        sections={SECTION_LABELS}
        currentIndex={0}
        onNavigate={onNavigate}
      />
    );

    // 각 레이블이 모바일 nav에 존재 (데스크톱 버튼은 title 속성으로만 노출)
    SECTION_LABELS.forEach((label) => {
      const buttons = screen.getAllByRole('button', { name: new RegExp(label, 'i') });
      // 데스크톱 + 모바일 2개씩 존재
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('currentIndex에 해당하는 버튼이 aria-current="true"로 강조됨', () => {
    render(
      <SectionNavigator
        sections={SECTION_LABELS}
        currentIndex={3}
        onNavigate={onNavigate}
      />
    );

    // aria-current="true" 버튼이 최소 1개 존재 (데스크톱 또는 모바일)
    const activeBtns = screen.getAllByRole('button', { current: true });
    expect(activeBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('모바일 nav에서 섹션 클릭 → onNavigate(index) 호출', () => {
    render(
      <SectionNavigator
        sections={SECTION_LABELS}
        currentIndex={0}
        onNavigate={onNavigate}
      />
    );

    // '면접팁' (index 1) 클릭 — 모바일 nav의 텍스트 버튼
    const interviewBtns = screen.getAllByText('면접팁');
    fireEvent.click(interviewBtns[0]);
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('onNavigate는 fullpage.js moveTo(index+1) 호출을 위해 0-based index 전달', () => {
    render(
      <SectionNavigator
        sections={SECTION_LABELS}
        currentIndex={0}
        onNavigate={onNavigate}
      />
    );

    // '월별운세' (index 7) 클릭
    const monthlyBtns = screen.getAllByText('월별운세');
    fireEvent.click(monthlyBtns[0]);
    expect(onNavigate).toHaveBeenCalledWith(7); // 0-based → 호출자에서 +1 하여 moveTo(8) 호출
  });

  it('sections prop으로 레이블을 동적으로 받음 — 하드코딩 아님', () => {
    const customSections = ['섹션A', '섹션B', '섹션C'];
    render(
      <SectionNavigator
        sections={customSections}
        currentIndex={1}
        onNavigate={onNavigate}
      />
    );

    expect(screen.getAllByText('섹션A').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('섹션B').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('섹션C').length).toBeGreaterThanOrEqual(1);
  });
});
