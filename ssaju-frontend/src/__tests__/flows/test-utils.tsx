import { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * 사용자 흐름(flow) 테스트 전용 공용 Provider.
 *
 * 왜 필요한가:
 * - useAuth, useMyPage, useCareerTiming 등 흐름 테스트가 렌더링하는 실제
 *   페이지/훅들은 내부적으로 @tanstack/react-query의 useQuery/useMutation을
 *   쓰고, 이 훅들은 useQueryClient()로 컨텍스트에서 QueryClient를 찾는다.
 * - QueryClientProvider 없이 렌더링하면 "No QueryClient set, use
 *   QueryClientProvider to set one" 런타임 에러로 렌더 자체가 실패한다.
 *
 * 스토리북(.storybook/preview.tsx)의 전역 decorator와 같은 역할을 하는
 * Jest용 버전이라고 보면 된다 — 다만 스토리북은 UI 프리뷰용이고 이건
 * 테스트 어서션까지 도는 실제 렌더 트리라는 점이 다르다.
 *
 * retry: false로 끄는 이유: 기본값(3회 재시도 + 지수 백오프)이 켜져 있으면
 * mockRejectedValueOnce로 실패를 흉내낸 테스트가 재시도 때문에 실제로는
 * 여러 번 호출되거나, waitFor가 재시도 대기 시간만큼 느려진다.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  // 테스트(it)마다 새 QueryClient를 만들어야 한다 — 캐시를 테스트 간에
  // 공유하면 앞 테스트의 성공/실패 응답이 뒷 테스트에 그대로 남아
  // (staleTime 때문에) 실제 API 호출 없이 캐시된 값을 반환해버릴 수 있다.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * @testing-library/react의 render()를 AppProviders로 감싸서 호출하는 헬퍼.
 * 컴포넌트를 렌더링하는 모든 흐름 테스트는 render() 대신 이걸 쓴다.
 *
 * renderHook()으로 훅만 단독 렌더링할 때는 이 함수 대신
 * `renderHook(() => useX(), { wrapper: AppProviders })`처럼
 * AppProviders를 직접 wrapper로 넘긴다 (auth.flow.test.tsx의
 * "logout() 호출" 테스트 참고).
 */
export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: AppProviders });
}
