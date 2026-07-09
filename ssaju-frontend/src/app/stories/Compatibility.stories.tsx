import type { Meta, StoryObj } from '@storybook/nextjs';
import { http, HttpResponse, delay } from 'msw';
import { within, userEvent } from 'storybook/test';
import CompatibilityPage from '../compatibility/page';
import { apiError } from '@/mocks/handlers';

const meta: Meta<typeof CompatibilityPage> = {
  title: '페이지/기업 궁합',
  component: CompatibilityPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof CompatibilityPage>;

const DIRECT_INPUT_PLACEHOLDER = '기업명을 직접 입력하세요';
const SUBMIT_LABEL = '궁합 분석 시작하기';

async function fillDirectInputAndSubmit(canvasElement: HTMLElement, companyName = '네이버') {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByText('목록에 없는 기업이라면?'));
  await userEvent.type(await canvas.findByPlaceholderText(DIRECT_INPUT_PLACEHOLDER), companyName);
  await userEvent.click(canvas.getByText(SUBMIT_LABEL));
}

/** 기본 폼 — 기업명 자동완성 입력 화면 */
export const Idle: Story = { name: '기본 폼' };

/** "목록에 없는 기업이라면?" 클릭 → 기업명 직접 입력 모드 */
export const DirectInputMode: Story = {
  name: '직접 입력 모드',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('목록에 없는 기업이라면?'));
  },
};

/** 폼 제출 후 분석 진행 중 */
export const Loading: Story = {
  name: '분석 진행 중',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/company/compatibility', async () => {
          await delay('infinite');
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => fillDirectInputAndSubmit(canvasElement),
};

/** 폼 제출 후 API 에러 — 폼 화면에 에러 메시지가 함께 표시됨 */
export const SubmitError: Story = {
  name: '제출 에러',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/company/compatibility', () =>
          HttpResponse.json(apiError('SERVER_ERROR', '궁합 분석 중 오류가 발생했습니다.'), { status: 500 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => fillDirectInputAndSubmit(canvasElement),
};

/** 설립일자 조회 실패(404/COMPANY_NOT_FOUND) → 설립일 직접 입력 화면으로 전환 */
export const FoundingDateNeeded: Story = {
  name: '설립일 입력 필요',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/company/compatibility', () =>
          HttpResponse.json(apiError('COMPANY_NOT_FOUND', '설립일자를 조회할 수 없습니다.'), { status: 404 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => fillDirectInputAndSubmit(canvasElement, '존재하지않는기업'),
};
