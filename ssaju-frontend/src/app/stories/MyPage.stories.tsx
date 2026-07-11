import type { Meta, StoryObj } from '@storybook/nextjs';
import { http, HttpResponse, delay } from 'msw';
import MyPage from '../my-page/page';
import { apiSuccess, apiError } from '@/mocks/handlers';
import { mockMyPageAnalyses, buildMyPageData } from '@/mocks/fixtures';

const meta: Meta<typeof MyPage> = {
  title: '페이지/마이페이지',
  component: MyPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof MyPage>;

/** 분석 기록이 여러 건 있는 정상 상태 */
export const WithHistory: Story = {
  name: '기록 있음',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/mypage', () => HttpResponse.json(apiSuccess(buildMyPageData(mockMyPageAnalyses)))),
      ],
    },
  },
};

/** 분석 기록이 하나도 없는 상태 — EmptyState 노출 */
export const Empty: Story = {
  name: '빈 기록',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/mypage', () => HttpResponse.json(apiSuccess(buildMyPageData([])))),
      ],
    },
  },
};

/** 목록 로딩 중 — 스켈레톤 노출 상태를 고정 */
export const Loading: Story = {
  name: '로딩 중',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/mypage', async () => {
          await delay('infinite');
        }),
      ],
    },
  },
};

/** 최초 로드 실패 — 에러 메시지 + 다시 시도 버튼 노출 */
export const Error: Story = {
  name: '에러',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/mypage', () =>
          HttpResponse.json(apiError('SERVER_ERROR', '기록을 불러오지 못했습니다.'), { status: 500 }),
        ),
      ],
    },
  },
};
