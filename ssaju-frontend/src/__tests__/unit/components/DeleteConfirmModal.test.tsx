import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmModal } from '@/components/history/DeleteConfirmModal';

const defaultProps = {
  recordId: 'rec-123',
  onConfirm: jest.fn(),
  onClose: jest.fn(),
  isDeleting: false,
};

describe('DeleteConfirmModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when recordId is null', () => {
    const { container } = render(
      <DeleteConfirmModal {...defaultProps} recordId={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when recordId is provided', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('기록 삭제')).toBeInTheDocument();
    expect(screen.getByText(/정말 삭제하시겠습니까/)).toBeInTheDocument();
  });

  it('has role="dialog" and aria-modal="true"', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onConfirm with the recordId when confirm button is clicked', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(onConfirm).toHaveBeenCalledWith('rec-123');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons and shows "삭제 중..." when isDeleting=true', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);
    expect(screen.getByRole('button', { name: '삭제 중...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} onClose={onClose} />);
    // The backdrop is the aria-hidden div behind the modal content
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
