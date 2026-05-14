/**
 * ErrorBoundary 컴포넌트 테스트
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '@/components/errors/ErrorBoundary';

// 렌더링 중 에러를 발생시키는 컴포넌트
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('테스트 에러');
  }
  return <div>정상 컨텐츠</div>;
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('에러가 없으면 자식 컴포넌트를 렌더링함', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('정상 컨텐츠')).toBeInTheDocument();
  });

  it('자식에서 에러 발생 시 에러 UI를 표시함', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
  });

  it('"다시 시도" 버튼을 표시함', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('"홈으로" 버튼을 표시함', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('link', { name: '홈으로' })).toBeInTheDocument();
  });

  it('fallback prop이 있으면 커스텀 fallback을 표시함', () => {
    render(
      <ErrorBoundary fallback={<div>커스텀 에러 UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('커스텀 에러 UI')).toBeInTheDocument();
  });
});

describe('withErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('HOC로 감싼 컴포넌트가 정상 렌더링됨', () => {
    const SafeComponent = withErrorBoundary(
      () => <div>안전한 컨텐츠</div>,
    );
    render(<SafeComponent />);
    expect(screen.getByText('안전한 컨텐츠')).toBeInTheDocument();
  });

  it('HOC로 감싼 컴포넌트에서 에러 발생 시 에러 UI를 표시함', () => {
    const SafeComponent = withErrorBoundary(
      () => { throw new Error('HOC 테스트 에러'); },
    );
    render(<SafeComponent />);
    expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
  });
});
