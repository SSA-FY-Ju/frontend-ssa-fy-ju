/**
 * MSW 브라우저 서비스 워커 설정
 *
 * - 분석 3종(관운/컨설팅/궁합): mock 데이터 사용
 * - 인증/피드백: 실제 API 사용 (핸들러 없음 → bypass)
 */

/**
 * MSW 브라우저 서비스 워커 설정
 *
 * - 기업 궁합(company): mock 데이터 사용
 * - 관운·컨설팅·마이페이지·인증·피드백: 실제 API 사용 (핸들러 없음 → bypass)
 */

import { setupWorker } from 'msw/browser';
import { companyHandlers } from './handlers/company';

export const worker = setupWorker(...companyHandlers);
