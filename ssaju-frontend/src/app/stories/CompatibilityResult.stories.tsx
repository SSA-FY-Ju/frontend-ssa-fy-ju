import type { Meta, StoryObj } from '@storybook/nextjs';
import CompatibilityResultPage from '../compatibility/result/page';
import { analysisCache } from '@/lib/analysisCache';
import { mockCompatibilityResult } from '@/mocks/fixtures';

const RESULT_ID = 'demo-compat-1';

function seedCache() {
  analysisCache.set('compatibility', mockCompatibilityResult);
  sessionStorage.setItem('ssaju_compat_company', '네이버');
}

const meta: Meta<typeof CompatibilityResultPage> = {
  title: '페이지/기업 궁합 결과',
  component: CompatibilityResultPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      seedCache();
      return <Story />;
    },
  ],
};
export default meta;

type Story = StoryObj<typeof CompatibilityResultPage>;

/** 정상 결과 화면 (아직 피드백을 제출하지 않은 상태) */
export const Default: Story = {
  name: '기본 결과',
  parameters: {
    sessionState: { sajuResultId: RESULT_ID, feedbackGivenIds: [] },
  },
};

/** 이미 피드백을 제출한 상태 — 피드백 유도 UI가 노출되지 않음 */
export const FeedbackAlreadySubmitted: Story = {
  name: '피드백 제출 완료',
  parameters: {
    sessionState: { sajuResultId: RESULT_ID, feedbackGivenIds: [`${RESULT_ID}_COMPATIBILITY`] },
  },
};

/**
 * 헤더 "처음으로" 버튼으로 페이지 이탈 시도 + 피드백 미제출
 * → 이탈 전 피드백 모달이 자동으로 열리는 상태
 */
export const ExitFeedbackPrompt: Story = {
  name: '이탈 시 피드백 유도',
  parameters: {
    sessionState: {
      sajuResultId: RESULT_ID,
      feedbackGivenIds: [],
      exitRequestPending: true,
    },
  },
};
