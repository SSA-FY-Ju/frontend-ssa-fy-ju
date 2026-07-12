export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKakaoLogin: () => void;
  onGoogleLogin: () => void;
  isLoading?: boolean;
  error?: string | null;
}
