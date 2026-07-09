'use client';

import { ReactNode, useEffect, useState } from 'react';

const isMockingEnabled =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

/**
 * 로컬 개발에서 NEXT_PUBLIC_API_MOCKING=enabled 일 때만 MSW 워커를 구동한다.
 * 프로덕션 빌드에서는 isMockingEnabled가 항상 false이므로 동적 import 자체가
 * 실행되지 않아 msw 관련 코드가 프로덕션 번들에 포함되지 않는다.
 */
export function MockingProvider({ children }: { children: ReactNode }): React.ReactElement | null {
  const [ready, setReady] = useState(!isMockingEnabled);

  useEffect(() => {
    if (!isMockingEnabled) return;

    let cancelled = false;
    import('@/mocks/browser').then(({ worker }) =>
      worker.start({ onUnhandledRequest: 'bypass' }),
    ).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
