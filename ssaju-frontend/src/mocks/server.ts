/**
 * MSW 서버 설정 (테스트 환경)
 */

import { setupServer } from 'msw/node';
import { careerHandlers } from './handlers/career';
import { companyHandlers } from './handlers/company';
import { feedbackHandlers } from './handlers/feedback';
import { authHandlers } from './handlers/auth';
import { mypageHandlers } from './handlers/mypage';

export const server = setupServer(
  ...careerHandlers,
  ...companyHandlers,
  ...feedbackHandlers,
  ...authHandlers,
  ...mypageHandlers,
);
