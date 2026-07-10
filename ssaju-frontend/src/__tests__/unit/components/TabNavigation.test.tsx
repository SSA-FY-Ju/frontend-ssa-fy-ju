/**
 * TabNavigation 컴포넌트 테스트 (T081)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabNavigation, TAB_LABELS } from '@/components/navigation/TabNavigation';

describe('TabNavigation', () => {
  const onSelect = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('8개 탭 렌더링', () => {
    render(<TabNavigation selectedIndex={0} onSelect={onSelect} />);
    TAB_LABELS.forEach((label) => {
      expect(screen.getByRole('tab', { name: new RegExp(label) })).toBeInTheDocument();
    });
  });

  it('첫 번째 탭이 기본 선택 상태', () => {
    render(<TabNavigation selectedIndex={0} onSelect={onSelect} />);
    expect(screen.getByRole('tab', { name: /추천산업/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('세 번째 탭 선택 시 aria-selected 변경', () => {
    render(<TabNavigation selectedIndex={2} onSelect={onSelect} />);
    expect(screen.getByRole('tab', { name: /강점/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /추천산업/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('탭 클릭 시 onSelect 호출', () => {
    render(<TabNavigation selectedIndex={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('tab', { name: /면접팁/ }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('활성 탭에 ★ 표시', () => {
    render(<TabNavigation selectedIndex={0} onSelect={onSelect} />);
    const activeTab = screen.getByRole('tab', { name: /추천산업/ });
    expect(activeTab.textContent).toContain('★');
  });
});
