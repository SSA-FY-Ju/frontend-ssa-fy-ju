import { http, HttpResponse } from 'msw';

/**
 * MSW 요청 핸들러
 *
 * 로컬 개발 중 실제 백엔드 없이 API 응답을 흉내낼 때 여기에 핸들러를 추가한다.
 * Storybook과 앱 로컬 개발(NEXT_PUBLIC_API_MOCKING=enabled) 모두 이 handlers를 공유한다.
 */
export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
