/**
 * MSW 브라우저 서비스 워커 설정
 * 개발 환경에서 백엔드 없이 API 목업 사용
 */

import { setupWorker } from 'msw/browser';
import { careerHandlers } from './handlers/career';
import { companyHandlers } from './handlers/company';
import { feedbackHandlers } from './handlers/feedback';
import { authHandlers } from './handlers/auth';

export const worker = setupWorker(
  ...careerHandlers,
  ...companyHandlers,
  ...feedbackHandlers,
  ...authHandlers,
);
