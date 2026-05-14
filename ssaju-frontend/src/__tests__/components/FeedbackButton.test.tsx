import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackButton } from '@/components/results/FeedbackButton';

jest.mock('@/components/modals/FeedbackModal', () => ({
  FeedbackModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="feedback-modal">
      <button onClick={onClose}>닫기</button>
    </div>
  ),
}));

describe('FeedbackButton', () => {
  it('renders button with aria-haspopup="dialog"', () => {
    render(<FeedbackButton feedbackType="CAREER_TIMING" />);
    const button = screen.getByRole('button', { name: '이 결과에 대해 의견을 알려주세요' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('does not show FeedbackModal initially', () => {
    render(<FeedbackButton feedbackType="CAREER_TIMING" />);
    expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument();
  });

  it('opens FeedbackModal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<FeedbackButton feedbackType="CAREER_TIMING" />);
    await user.click(screen.getByRole('button', { name: '이 결과에 대해 의견을 알려주세요' }));
    expect(screen.getByTestId('feedback-modal')).toBeInTheDocument();
  });

  it('closes FeedbackModal when close button inside modal is clicked', async () => {
    const user = userEvent.setup();
    render(<FeedbackButton feedbackType="CAREER_TIMING" />);
    await user.click(screen.getByRole('button', { name: '이 결과에 대해 의견을 알려주세요' }));
    expect(screen.getByTestId('feedback-modal')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument();
  });
});
