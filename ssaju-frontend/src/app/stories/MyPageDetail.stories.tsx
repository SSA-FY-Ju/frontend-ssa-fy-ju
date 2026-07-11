import type { Meta, StoryObj } from '@storybook/nextjs';
import { http, HttpResponse, delay } from 'msw';
import AnalysisDetailPage from '../my-page/[id]/page';
import { apiSuccess, apiError } from '@/mocks/handlers';
import { buildAnalysisRecordResponse } from '@/mocks/fixtures';

function navigationFor(type: string) {
  return {
    pathname: '/my-page/1',
    query: { type },
    segments: [['id', '1']] as [string, string][],
  };
}

const meta: Meta<typeof AnalysisDetailPage> = {
  title: '페이지/마이페이지 상세',
  component: AnalysisDetailPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof AnalysisDetailPage>;

export const Timing: Story = {
  name: '관운 분석',
  parameters: {
    nextjs: { navigation: navigationFor('TIMING') },
    msw: {
      handlers: [
        http.get('/api/mypage/analyses/:id', () =>
          HttpResponse.json(apiSuccess(buildAnalysisRecordResponse('TIMING'))),
        ),
      ],
    },
  },
};

export const Consultation: Story = {
  name: 'AI 컨설팅',
  parameters: {
    nextjs: { navigation: navigationFor('CONSULTATION') },
    msw: {
      handlers: [
        http.get('/api/mypage/analyses/:id', () =>
          HttpResponse.json(apiSuccess(buildAnalysisRecordResponse('CONSULTATION'))),
        ),
      ],
    },
  },
};

export const Compatibility: Story = {
  name: '기업 궁합',
  parameters: {
    nextjs: { navigation: navigationFor('COMPATIBILITY') },
    msw: {
      handlers: [
        http.get('/api/mypage/analyses/:id', () =>
          HttpResponse.json(apiSuccess(buildAnalysisRecordResponse('COMPATIBILITY'))),
        ),
      ],
    },
  },
};

/** 상세 조회 중 */
export const Loading: Story = {
  name: '로딩 중',
  parameters: {
    nextjs: { navigation: navigationFor('TIMING') },
    msw: {
      handlers: [
        http.get('/api/mypage/analyses/:id', async () => {
          await delay('infinite');
        }),
      ],
    },
  },
};

/** 상세 조회 실패 */
export const Error: Story = {
  name: '에러',
  parameters: {
    nextjs: { navigation: navigationFor('TIMING') },
    msw: {
      handlers: [
        http.get('/api/mypage/analyses/:id', () =>
          HttpResponse.json(apiError('NOT_FOUND', '기록을 찾을 수 없습니다.'), { status: 404 }),
        ),
      ],
    },
  },
};
