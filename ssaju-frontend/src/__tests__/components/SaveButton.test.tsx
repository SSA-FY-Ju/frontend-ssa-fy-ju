import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveButton } from '@/components/results/SaveButton';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/hooks/useSave', () => ({
  useSave: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/auth/LoginModal', () => ({
  LoginModal: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="login-modal" /> : null,
}));

import { useAuthStore } from '@/stores/authStore';
import { useSave } from '@/hooks/useSave';
import { useAuth } from '@/hooks/useAuth';

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseSave = useSave as jest.MockedFunction<typeof useSave>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const defaultAuthHook = {
  loginWithKakao: jest.fn(),
  loginWithGoogle: jest.fn(),
  isLoading: false,
  loginError: null,
};

describe('SaveButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockUseAuth as jest.Mock).mockReturnValue(defaultAuthHook);
  });

  describe('when logged in', () => {
    beforeEach(() => {
      (mockUseAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: { isLoggedIn: boolean }) => unknown) =>
        selector({ isLoggedIn: true })
      );
    });

    it('shows "이 결과 저장하기" button', () => {
      (mockUseSave as jest.Mock).mockReturnValue({ save: jest.fn(), isSaving: false });
      render(<SaveButton analysisType="CAREER_TIMING" />);
      expect(screen.getByRole('button', { name: '이 결과 저장하기' })).toBeInTheDocument();
    });

    it('calls save() when save button is clicked', async () => {
      const save = jest.fn();
      (mockUseSave as jest.Mock).mockReturnValue({ save, isSaving: false });
      const user = userEvent.setup();
      render(<SaveButton analysisType="CAREER_TIMING" />);
      await user.click(screen.getByRole('button', { name: '이 결과 저장하기' }));
      expect(save).toHaveBeenCalledTimes(1);
    });

    it('disables save button and sets aria-busy=true when isSaving=true', () => {
      (mockUseSave as jest.Mock).mockReturnValue({ save: jest.fn(), isSaving: true });
      render(<SaveButton analysisType="CAREER_TIMING" />);
      const button = screen.getByRole('button', { name: '저장 중...' });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('when not logged in', () => {
    beforeEach(() => {
      (mockUseAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: { isLoggedIn: boolean }) => unknown) =>
        selector({ isLoggedIn: false })
      );
      (mockUseSave as jest.Mock).mockReturnValue({ save: jest.fn(), isSaving: false });
    });

    it('shows "결과를 저장하려면 로그인해주세요" button', () => {
      render(<SaveButton analysisType="CAREER_TIMING" />);
      expect(screen.getByRole('button', { name: '결과를 저장하려면 로그인해주세요' })).toBeInTheDocument();
    });

    it('opens LoginModal when login button is clicked', async () => {
      const user = userEvent.setup();
      render(<SaveButton analysisType="CAREER_TIMING" />);
      expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '결과를 저장하려면 로그인해주세요' }));
      expect(screen.getByTestId('login-modal')).toBeInTheDocument();
    });
  });
});
