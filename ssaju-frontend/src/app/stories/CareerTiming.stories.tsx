import type { Meta, StoryObj } from '@storybook/nextjs';
import { http, HttpResponse, delay } from 'msw';
import CareerTimingPage from '../career-timing/page';
import { apiSuccess, apiError } from '@/mocks/handlers';
import { mockCareerTimingResult } from '@/mocks/fixtures';

const meta: Meta<typeof CareerTimingPage> = {
  title: '페이지/관운 분석',
  component: CareerTimingPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof CareerTimingPage>;

/** 진입 시 자동으로 분석이 시작되어 결과가 표시되는 정상 흐름 */
export const Result: Story = {
  name: '결과',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/career/timing', () => HttpResponse.json(apiSuccess(mockCareerTimingResult))),
      ],
    },
  },
};

/** 분석 진행 중 — 응답이 오지 않는 상태를 고정 */
export const Loading: Story = {
  name: '로딩 중',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/career/timing', async () => {
          await delay('infinite');
        }),
      ],
    },
  },
};

/** 분석 API 실패 */
export const Error: Story = {
  name: '에러',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/career/timing', () =>
          HttpResponse.json(apiError('SERVER_ERROR', '분석 중 오류가 발생했습니다.'), { status: 500 }),
        ),
      ],
    },
  },
};

/**
 * birthDate가 아직 준비되지 않아 자동 분석이 시작되지 못한 상태.
 * phase가 'idle'로 3초 이상 머물면 수동 재시도 버튼이 노출된다.
 */
export const AutoStartPendingWithRetry: Story = {
  name: '자동 시작 대기 (재시도 버튼 노출)',
  parameters: {
    sessionState: { birthDate: null },
    msw: { handlers: [] },
  },
};
