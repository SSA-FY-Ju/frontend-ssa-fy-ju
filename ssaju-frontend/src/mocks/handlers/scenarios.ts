/**
 * MSW 에러/타임아웃 시나리오 핸들러 (T124)
 *
 * 기본 핸들러 대신 테스트에서 server.use()로 override해 사용.
 *
 * 사용 예:
 *   server.use(errorScenarios.careerTimingTimeout)
 *   server.use(errorScenarios.invalidDateFormat)
 */

import { http, HttpResponse, delay } from 'msw';

export const errorScenarios = {
  /** 관운 분석 — 5초 타임아웃 */
  careerTimingTimeout: http.post('/api/career/timing', async () => {
    await delay(5500);
    return HttpResponse.json(
      { success: false, data: null, error: { code: 'TIMEOUT', message: '요청 시간이 초과되었습니다.', requestId: 'mock-timeout' }, timestamp: Date.now() },
      { status: 408 },
    );
  }),

  /** 관운 분석 — 잘못된 날짜 형식 */
  invalidDateFormat: http.post('/api/career/timing', async () => {
    await delay(200);
    return HttpResponse.json(
      { success: false, data: null, error: { code: 'INVALID_DATE_FORMAT', message: '유효하지 않은 날짜 형식입니다.', requestId: 'mock-invalid-date' }, timestamp: Date.now() },
      { status: 400 },
    );
  }),

  /** AI 컨설팅 — 20초 타임아웃 */
  consultationTimeout: http.post('/api/career/consultation', async () => {
    await delay(20500);
    return HttpResponse.json(
      { success: false, data: null, error: { code: 'TIMEOUT', message: 'AI 분석 요청 시간이 초과되었습니다.', requestId: 'mock-timeout' }, timestamp: Date.now() },
      { status: 408 },
    );
  }),

  /** 기업 궁합 — 기업 미발견 */
  companyNotFound: http.post('/api/company/compatibility', async () => {
    await delay(300);
    return HttpResponse.json(
      { success: false, data: null, error: { code: 'COMPANY_NOT_FOUND', message: '해당 기업 정보를 찾을 수 없습니다.', requestId: 'mock-not-found' }, timestamp: Date.now() },
      { status: 404 },
    );
  }),

  /** 네트워크 에러 시뮬레이션 */
  networkError: http.post('/api/career/timing', () => {
    return HttpResponse.error();
  }),

  /** 서버 에러 (500) */
  serverError: http.post('/api/career/timing', async () => {
    await delay(200);
    return HttpResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.', requestId: 'mock-500' }, timestamp: Date.now() },
      { status: 500 },
    );
  }),
};
