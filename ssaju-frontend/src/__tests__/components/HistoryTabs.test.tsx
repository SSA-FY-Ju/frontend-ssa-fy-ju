import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryTabs } from '@/components/history/HistoryTabs';

type AnalysisTab = 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

const TAB_LABELS: { id: AnalysisTab; label: string }[] = [
  { id: 'CAREER_TIMING', label: '관운 분석' },
  { id: 'CONSULTATION', label: 'AI 컨설팅' },
  { id: 'COMPATIBILITY', label: '기업 궁합' },
];

describe('HistoryTabs', () => {
  it('renders all three tab options', () => {
    render(<HistoryTabs activeTab="CAREER_TIMING" onTabChange={jest.fn()} />);
    TAB_LABELS.forEach(({ label }) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('calls onTabChange with correct type when a tab is clicked', async () => {
    const onTabChange = jest.fn();
    const user = userEvent.setup();
    render(<HistoryTabs activeTab="CAREER_TIMING" onTabChange={onTabChange} />);

    await user.click(screen.getByRole('button', { name: 'AI 컨설팅' }));
    expect(onTabChange).toHaveBeenCalledWith('CONSULTATION');

    await user.click(screen.getByRole('button', { name: '기업 궁합' }));
    expect(onTabChange).toHaveBeenCalledWith('COMPATIBILITY');

    await user.click(screen.getByRole('button', { name: '관운 분석' }));
    expect(onTabChange).toHaveBeenCalledWith('CAREER_TIMING');
  });

  it('applies active styling class to the active tab', () => {
    render(<HistoryTabs activeTab="CONSULTATION" onTabChange={jest.fn()} />);
    const activeButton = screen.getByRole('button', { name: 'AI 컨설팅' });
    const inactiveButton = screen.getByRole('button', { name: '관운 분석' });

    // Active tab has border-b-2 and text-star-400 classes
    expect(activeButton.className).toContain('border-b-2');
    expect(activeButton.className).toContain('border-star-400');

    // Inactive tab does not have active border class
    expect(inactiveButton.className).not.toContain('border-b-2');
  });

  it('only the active tab has the active border styling', () => {
    render(<HistoryTabs activeTab="COMPATIBILITY" onTabChange={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    const activeButtons = buttons.filter((btn) => btn.className.includes('border-b-2'));
    expect(activeButtons).toHaveLength(1);
    expect(activeButtons[0]).toHaveTextContent('기업 궁합');
  });
});
