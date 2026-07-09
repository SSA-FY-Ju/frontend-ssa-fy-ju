import type { Meta, StoryObj } from '@storybook/nextjs';
import SelectPage from '../select/page';

const meta: Meta<typeof SelectPage> = {
  title: '페이지/서비스 선택',
  component: SelectPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof SelectPage>;

/** 로그인 상태 (전역 기본값) — 서비스 선택 화면 노출 */
export const LoggedIn: Story = { name: '로그인 상태' };

/** 비로그인 상태 — 가드가 isAllowed=false를 반환해 페이지가 null을 렌더링 */
export const LoggedOut: Story = {
  name: '비로그인 상태',
  parameters: {
    authState: { isLoggedIn: false },
  },
};
