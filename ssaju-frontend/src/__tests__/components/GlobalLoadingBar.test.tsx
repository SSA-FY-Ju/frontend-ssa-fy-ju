/**
 * GlobalLoadingBar 컴포넌트 단위 테스트
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { GlobalLoadingBar } from '@/components/common/GlobalLoadingBar';

jest.mock('@/stores/errorStore', () => ({
  useErrorStore: jest.fn(),
}));

import { useErrorStore } from '@/stores/errorStore';

function mockStore(isLoading: boolean) {
  (useErrorStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { isLoading: boolean }) => unknown) => selector({ isLoading }),
  );
}

describe('GlobalLoadingBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('isLoading=false 일 때 progressbar가 렌더링되지 않음', () => {
    mockStore(false);
    render(<GlobalLoadingBar />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('isLoading=true 일 때 progressbar가 렌더링됨', () => {
    mockStore(true);
    render(<GlobalLoadingBar />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('progressbar에 aria 속성이 있음', () => {
    mockStore(true);
    render(<GlobalLoadingBar />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('isLoading 전환 후 500ms 뒤 progressbar가 사라짐', () => {
    mockStore(true);
    const { rerender } = render(<GlobalLoadingBar />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    mockStore(false);
    rerender(<GlobalLoadingBar />);
    // 아직 500ms 전이라 보임
    act(() => jest.advanceTimersByTime(400));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    // 500ms 후 숨겨짐
    act(() => jest.advanceTimersByTime(200));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
