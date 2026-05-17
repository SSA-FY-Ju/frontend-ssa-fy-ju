/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ExpiredResultModal } from '@/components/modal/ExpiredResultModal';

// Mock modules
jest.mock('next/navigation');

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('ExpiredResultModal', () => {
  const mockPush = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
  });

  it('should render when isOpen=true', () => {
    render(
      <ExpiredResultModal isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText(/분석 결과가 만료/)).toBeInTheDocument();
    expect(screen.getByText(/24시간 후 자동 삭제되는 임시 결과/)).toBeInTheDocument();
  });

  it('should not render when isOpen=false', () => {
    const { container } = render(
      <ExpiredResultModal isOpen={false} onClose={mockOnClose} />
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('should redirect to /survey when button clicked', async () => {
    render(
      <ExpiredResultModal isOpen={true} onClose={mockOnClose} />
    );

    const button = screen.getByRole('button', { name: /새 분석 시작/ });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith('/survey');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when close button clicked', () => {
    render(
      <ExpiredResultModal isOpen={true} onClose={mockOnClose} />
    );

    const closeButton = screen.getByRole('button', { name: /닫기/ });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when overlay clicked', () => {
    const { container } = render(
      <ExpiredResultModal isOpen={true} onClose={mockOnClose} />
    );

    const overlay = container.querySelector('div[class*="bg-black"]');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should not close modal when modal content clicked', () => {
    const { container } = render(
      <ExpiredResultModal isOpen={true} onClose={mockOnClose} />
    );

    const modalContent = container.querySelector('div[class*="bg-white"]');
    if (modalContent) {
      fireEvent.click(modalContent);
      // onClose should not be called when clicking inside modal content
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });
});
