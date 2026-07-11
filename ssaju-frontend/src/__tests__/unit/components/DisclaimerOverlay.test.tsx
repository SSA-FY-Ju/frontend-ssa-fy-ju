/**
 * DisclaimerOverlay 컴포넌트 테스트
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';

describe('DisclaimerOverlay', () => {
  it('isVisible=false이면 null을 반환함', () => {
    const { container } = render(
      <DisclaimerOverlay isVisible={false} isFading={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('isVisible=true이면 오버레이를 렌더링함', () => {
    render(<DisclaimerOverlay isVisible={true} isFading={false} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('role="alert"과 aria-live="assertive" 속성을 가짐', () => {
    render(<DisclaimerOverlay isVisible={true} isFading={false} />);
    const overlay = screen.getByRole('alert');
    expect(overlay).toHaveAttribute('aria-live', 'assertive');
  });

  it('isFading=true이면 opacity:0 스타일이 적용됨', () => {
    render(<DisclaimerOverlay isVisible={true} isFading={true} />);
    const overlay = screen.getByRole('alert');
    expect(overlay).toHaveStyle({ opacity: 0 });
  });

  it('고지 문구 텍스트를 포함함', () => {
    render(<DisclaimerOverlay isVisible={true} isFading={false} />);
    expect(
      screen.getByText('본 사주는 재미로 보는 것이니 참고만 바랍니다'),
    ).toBeInTheDocument();
  });
});
