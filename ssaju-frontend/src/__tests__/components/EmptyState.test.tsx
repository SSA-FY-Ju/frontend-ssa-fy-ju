import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/history/EmptyState';

// Next.js Link renders as an anchor in tests
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('EmptyState', () => {
  it('renders empty state message', () => {
    render(<EmptyState />);
    expect(screen.getByText(/아직 분석 기록이 없습니다/)).toBeInTheDocument();
    expect(screen.getByText(/지금 분석을 시작해보세요/)).toBeInTheDocument();
  });

  it('renders action link element pointing to career-timing page', () => {
    render(<EmptyState />);
    const link = screen.getByRole('link', { name: '분석 시작하기' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/career-timing');
  });
});
