'use client';

import React from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _info: React.ErrorInfo) {}

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-night-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-night-800 rounded-2xl p-8 flex flex-col items-center gap-6 text-center">
            <div className="text-4xl">⚠️</div>
            <div className="flex flex-col gap-2">
              <h1 className="text-white font-bold text-xl">
                오류가 발생했습니다
              </h1>
              {this.state.error?.message && (
                <p className="text-night-600 text-sm leading-relaxed break-words">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-star-500 text-night-900 font-semibold text-sm hover:bg-star-400 transition-colors"
              >
                다시 시도
              </button>
              <Link
                href="/"
                className="flex-1 px-4 py-2.5 rounded-xl bg-night-700 text-star-400 font-semibold text-sm hover:bg-night-600 transition-colors text-center border border-night-600"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-Order Component: 컴포넌트를 ErrorBoundary로 감싸 반환
 *
 * @example
 * const SafeMyComponent = withErrorBoundary(MyComponent);
 */
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
): React.ComponentType<T> {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );

  const displayName = Component.displayName ?? Component.name ?? 'Component';
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

  return WrappedComponent;
}
