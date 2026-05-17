/**
 * PageExitModal 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageExitModal } from '@/components/common/PageExitModal';
import { useAuthStore } from '@/stores/authStore';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

const mockOpenLoginModal = jest.fn();

function renderModal(isOpen: boolean, overrides?: {
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  onLoginAndStay?: () => void;
}) {
  return render(
    <PageExitModal
      isOpen={isOpen}
      onConfirmExit={overrides?.onConfirmExit ?? jest.fn()}
      onCancelExit={overrides?.onCancelExit ?? jest.fn()}
      onLoginAndStay={overrides?.onLoginAndStay ?? jest.fn()}
    />,
  );
}

describe('PageExitModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockUseAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: { openLoginModal: () => void }) => unknown) =>
        selector({ openLoginModal: mockOpenLoginModal }),
    );
  });

  it('isOpen=false이면 null을 반환함', () => {
    const { container } = renderModal(false);
    expect(container.firstChild).toBeNull();
  });

  it('isOpen=true이면 모달을 렌더링함', () => {
    renderModal(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('role="dialog"과 aria-modal="true" 속성을 가짐', () => {
    renderModal(true);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('"지금 로그인하기" 클릭 시 openLoginModal과 onLoginAndStay가 호출됨', () => {
    const onLoginAndStay = jest.fn();
    renderModal(true, { onLoginAndStay });
    fireEvent.click(screen.getByRole('button', { name: '지금 로그인하기' }));
    expect(mockOpenLoginModal).toHaveBeenCalledTimes(1);
    expect(onLoginAndStay).toHaveBeenCalledTimes(1);
  });

  it('"계속 보기" 클릭 시 onCancelExit가 호출됨', () => {
    const onCancelExit = jest.fn();
    renderModal(true, { onCancelExit });
    fireEvent.click(screen.getByRole('button', { name: '계속 보기' }));
    expect(onCancelExit).toHaveBeenCalledTimes(1);
  });

  it('"그냥 나가기" 클릭 시 onConfirmExit가 호출됨', () => {
    const onConfirmExit = jest.fn();
    renderModal(true, { onConfirmExit });
    fireEvent.click(screen.getByRole('button', { name: '그냥 나가기' }));
    expect(onConfirmExit).toHaveBeenCalledTimes(1);
  });
});
