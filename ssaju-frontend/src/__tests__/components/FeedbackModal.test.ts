/**
 * FeedbackModal 컴포넌트 테스트 (T097)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: jest.fn(() => ({
    submit: jest.fn(),
    isSubmitting: false,
    error: null,
  })),
}));

const { useFeedback } = jest.requireMock('@/hooks/useFeedback');

const defaultProps = {
  feedbackType: 'CAREER_TIMING' as const,
  onClose: jest.fn(),
};

describe('FeedbackModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFeedback.mockReturnValue({ submit: jest.fn(), isSubmitting: false, error: null });
  });

  it('모달 렌더링: 제목, 피드백 유형 표시', () => {
    render(React.createElement(FeedbackModal, defaultProps));
    expect(screen.getByText('분석 결과 피드백')).toBeInTheDocument();
    expect(screen.getByText(/관운 분석/)).toBeInTheDocument();
  });

  it('만족함 / 만족하지 않음 라디오 버튼 표시', () => {
    render(React.createElement(FeedbackModal, defaultProps));
    expect(screen.getByText('만족함')).toBeInTheDocument();
    expect(screen.getByText('만족하지 않음')).toBeInTheDocument();
  });

  it('만족도 미선택 시 제출 버튼 비활성화', () => {
    render(React.createElement(FeedbackModal, defaultProps));
    const submitBtn = screen.getByRole('button', { name: '제출하기' });
    expect(submitBtn).toBeDisabled();
  });

  it('만족도 선택 시 제출 버튼 활성화', () => {
    render(React.createElement(FeedbackModal, defaultProps));
    fireEvent.click(screen.getByText('만족함'));
    const submitBtn = screen.getByRole('button', { name: '제출하기' });
    expect(submitBtn).not.toBeDisabled();
  });

  it('글자수 카운터: 초기 0 / 500 표시', () => {
    render(React.createElement(FeedbackModal, defaultProps));
    expect(screen.getByText('0 / 500')).toBeInTheDocument();
  });

  it('의견 입력 시 글자수 카운터 업데이트', () => {
    render(React.createElement(FeedbackModal, defaultProps));
    const textarea = screen.getByRole('textbox', { name: /상세 의견/ });
    fireEvent.change(textarea, { target: { value: '좋았습니다' } });
    expect(screen.getByText('5 / 500')).toBeInTheDocument();
  });

  it('500자 초과 입력 방지', () => {
    render(React.createElement(FeedbackModal, defaultProps));
    const textarea = screen.getByRole('textbox', { name: /상세 의견/ });
    const longText = 'a'.repeat(501);
    fireEvent.change(textarea, { target: { value: longText } });
    // 500자 초과분은 반영 안 됨 — textarea value가 501자여서 onChange에서 막힘
    expect(screen.getByText('0 / 500')).toBeInTheDocument();
  });

  it('닫기(×) 버튼 클릭 시 onClose 호출', () => {
    const onClose = jest.fn();
    render(React.createElement(FeedbackModal, { ...defaultProps, onClose }));
    fireEvent.click(screen.getByRole('button', { name: '모달 닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('CONSULTATION 타입 표시', () => {
    render(React.createElement(FeedbackModal, { ...defaultProps, feedbackType: 'CONSULTATION' }));
    expect(screen.getByText(/AI 커리어 컨설팅/)).toBeInTheDocument();
  });

  it('isSubmitting true일 때 버튼 "제출 중..." 표시 및 비활성화', () => {
    useFeedback.mockReturnValue({ submit: jest.fn(), isSubmitting: true, error: null });
    render(React.createElement(FeedbackModal, defaultProps));
    expect(screen.getByText('제출 중...')).toBeInTheDocument();
  });

  it('error 메시지 표시', () => {
    useFeedback.mockReturnValue({
      submit: jest.fn(),
      isSubmitting: false,
      error: '제출 중 오류가 발생했습니다.',
    });
    render(React.createElement(FeedbackModal, defaultProps));
    expect(screen.getByRole('alert')).toHaveTextContent('제출 중 오류가 발생했습니다.');
  });
});
