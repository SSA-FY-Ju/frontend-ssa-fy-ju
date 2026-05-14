import { render, screen } from '@testing-library/react';
import { ConsultationLoading } from '@/components/results/ConsultationLoading';

describe('ConsultationLoading', () => {
  it('renders loading text content', () => {
    render(<ConsultationLoading />);
    expect(screen.getByText('AI 분석 중입니다...')).toBeInTheDocument();
  });

  it('renders a live region with accessible label indicating analysis in progress', () => {
    render(<ConsultationLoading />);
    const container = document.querySelector('[aria-live="polite"]');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'AI 분석 중입니다...');
  });

  it('renders a visual loading animation element', () => {
    render(<ConsultationLoading />);
    // The star spinner is aria-hidden, the progress bar container is always present
    const progressBar = document.querySelector('[style*="animation"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders the decorative star icon as aria-hidden', () => {
    render(<ConsultationLoading />);
    const star = screen.getByText('★');
    expect(star).toHaveAttribute('aria-hidden', 'true');
  });
});
