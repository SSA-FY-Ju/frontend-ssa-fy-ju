import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * useQueryClient()를 쓰는 훅(useAuth, useCareerTiming, useDeleteHistory,
 * useFeedback, useSave 등)을 renderHook으로 테스트할 때 필요한 공용 wrapper.
 * 없으면 "No QueryClient set, use QueryClientProvider to set one" 에러가 난다.
 */
export function QueryClientWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
