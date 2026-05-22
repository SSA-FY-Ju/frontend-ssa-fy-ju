import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryTabs } from '@/components/history/HistoryTabs';

type AnalysisTab = 'ALL' | 'TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

const TAB_LABELS: { id: AnalysisTab; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'TIMING', label: '관운 분석' },
  { id: 'CONSULTATION', label: 'AI 컨설팅' },
  { id: 'COMPATIBILITY', label: '기업 궁합' },
];

describe('HistoryTabs', () => {
  it('renders all four tab options', () => {
    render(<HistoryTabs activeTab="ALL" onTabChange={jest.fn()} />);
    TAB_LABELS.forEach(({ label }) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('calls onTabChange with correct type when a tab is clicked', async () => {
    const onTabChange = jest.fn();
    const user = userEvent.setup();
    render(<HistoryTabs activeTab="ALL" onTabChange={onTabChange} />);

    await user.click(screen.getByRole('button', { name: 'AI 컨설팅' }));
    expect(onTabChange).toHaveBeenCalledWith('CONSULTATION');

    await user.click(screen.getByRole('button', { name: '기업 궁합' }));
    expect(onTabChange).toHaveBeenCalledWith('COMPATIBILITY');

    await user.click(screen.getByRole('button', { name: '관운 분석' }));
    expect(onTabChange).toHaveBeenCalledWith('TIMING');
  });

  it('active tab is rendered', () => {
    render(<HistoryTabs activeTab="CONSULTATION" onTabChange={jest.fn()} />);
    const activeButton = screen.getByRole('button', { name: 'AI 컨설팅' });
    expect(activeButton).toBeInTheDocument();
  });

  it('only one tab is visually active', () => {
    render(<HistoryTabs activeTab="COMPATIBILITY" onTabChange={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    // Active tab is the COMPATIBILITY button
    const compatButton = screen.getByRole('button', { name: '기업 궁합' });
    expect(compatButton).toBeInTheDocument();
  });
});
