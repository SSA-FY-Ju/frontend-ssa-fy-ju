/**
 * MSW 브라우저 서비스 워커 설정
 */

import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { careerHandlers } from './handlers/career';
import { companyHandlers } from './handlers/company';
import { feedbackHandlers } from './handlers/feedback';

export const worker = setupWorker(...authHandlers, ...careerHandlers, ...companyHandlers, ...feedbackHandlers);
