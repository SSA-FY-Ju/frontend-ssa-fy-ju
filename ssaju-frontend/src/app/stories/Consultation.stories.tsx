import type { Meta, StoryObj } from '@storybook/nextjs';
import { http, HttpResponse, delay } from 'msw';
import ConsultationPage from '../consultation/page';
import { apiSuccess, apiError } from '@/mocks/handlers';
import { mockConsultationData } from '@/mocks/fixtures';

const meta: Meta<typeof ConsultationPage> = {
  title: '페이지/AI 컨설팅',
  component: ConsultationPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ConsultationPage>;

/** 진입 시 자동으로 상담이 시작되어 결과가 표시되는 정상 흐름 */
export const Result: Story = {
  name: '결과',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/career/consultation', () => HttpResponse.json(apiSuccess(mockConsultationData))),
      ],
    },
  },
};

/** 상담 진행 중 — 응답이 오지 않는 상태를 고정 */
export const Loading: Story = {
  name: '로딩 중',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/career/consultation', async () => {
          await delay('infinite');
        }),
      ],
    },
  },
};

/** 상담 API 실패 */
export const Error: Story = {
  name: '에러',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/career/consultation', () =>
          HttpResponse.json(apiError('SERVER_ERROR', '상담 생성 중 오류가 발생했습니다.'), { status: 500 }),
        ),
      ],
    },
  },
};

/**
 * 이미 피드백을 제출한 상태로 결과를 조회하는 경우.
 * 넛지/피드백 유도 UI가 노출되지 않는다.
 * (useConsultation이 응답의 consultationId로 sajuResultId를 덮어쓰므로
 *  mockConsultationData.consultationId 값과 동일한 키를 미리 넣어둔다)
 */
export const ResultFeedbackAlreadySubmitted: Story = {
  name: '피드백 제출 완료',
  parameters: {
    sessionState: {
      feedbackGivenIds: [`${mockConsultationData.consultationId}_CONSULTATION`],
    },
    msw: {
      handlers: [
        http.post('/api/career/consultation', () => HttpResponse.json(apiSuccess(mockConsultationData))),
      ],
    },
  },
};
