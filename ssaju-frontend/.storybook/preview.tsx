import type { Preview } from '@storybook/nextjs'
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers';
import { useAuthStore } from '../src/stores/authStore';
import { useSessionStore } from '../src/stores/sessionStore';
import StarryBackground from '../src/components/landing/StarryBackground';
import '../src/app/globals.css';
import '../src/styles/landing.css';

initialize({ onUnhandledRequest: 'bypass' });

// 가드(useAuthGuard/useRouteGuard)를 통과시키기 위한 기본 인증/세션 상태.
// 스토리별로 parameters.authState / parameters.sessionState 로 덮어쓸 수 있다.
const defaultAuthState = {
  isLoggedIn: true,
  isAuthReady: true,
  _hasHydrated: true,
  user: { userId: 'u1', email: 'user@example.com', name: '홍길동' },
};

const defaultSessionState = {
  birthDate: '1998-05-01',
  birthTime: '09:30',
  selectedService: 'career-timing',
  _hasHydrated: true,
  feedbackGivenIds: [] as string[],
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    msw: { handlers },
    // 프로젝트 전체가 App Router(app/) 기준이므로 next/navigation 목(useRouter 등)이
    // App Router 모드로 초기화되도록 고정한다. (기본값 false면 Pages Router로 목킹되어
    // useRouter/usePathname 호출 시 "router mocks not available" 에러가 발생한다)
    nextjs: { appDirectory: true },
  },
  loaders: [mswLoader],
  decorators: [
    (Story, context) => {
      useAuthStore.setState({ ...defaultAuthState, ...context.parameters.authState });
      useSessionStore.setState({ ...defaultSessionState, ...context.parameters.sessionState });

      const [queryClient] = useState(
        () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
      );

      return (
        <QueryClientProvider client={queryClient}>
          <StarryBackground />
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;