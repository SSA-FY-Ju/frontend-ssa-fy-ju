import type { Meta, StoryObj } from '@storybook/nextjs';
import ChatPage from '../chat/page';

const meta: Meta<typeof ChatPage> = {
  title: '페이지/채팅 입력',
  component: ChatPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ChatPage>;

/** 서비스 선택 완료 후 진입 (sessionState.selectedService 전역 기본값) */
export const Default: Story = { name: '기본' };

/** 서비스 미선택 — useEffect가 /select로 리다이렉트하며 null 렌더링 */
export const NoServiceSelected: Story = {
  name: '서비스 미선택',
  parameters: {
    sessionState: { selectedService: null },
  },
};
