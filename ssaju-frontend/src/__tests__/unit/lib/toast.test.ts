/**
 * toastUtils 테스트
 *
 * 커버리지 대상: src/lib/toast.ts (0% → 100%)
 */

import { toastUtils } from '@/lib/toast';

// sonner 모킹
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    loading: jest.fn().mockReturnValue('toast-id-123'),
    dismiss: jest.fn(),
  },
}));

const { toast } = jest.requireMock('sonner');

describe('toastUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('기본 duration(3000ms)으로 성공 토스트 표시', () => {
      toastUtils.success('저장 완료');

      expect(toast.success).toHaveBeenCalledWith('저장 완료', { duration: 3000 });
    });

    it('커스텀 duration 적용', () => {
      toastUtils.success('저장 완료', { duration: 5000 });

      expect(toast.success).toHaveBeenCalledWith('저장 완료', { duration: 5000 });
    });
  });

  describe('error', () => {
    it('기본 duration(4000ms)으로 에러 토스트 표시', () => {
      toastUtils.error('오류 발생');

      expect(toast.error).toHaveBeenCalledWith('오류 발생', { duration: 4000 });
    });

    it('커스텀 duration 적용', () => {
      toastUtils.error('오류 발생', { duration: 6000 });

      expect(toast.error).toHaveBeenCalledWith('오류 발생', { duration: 6000 });
    });
  });

  describe('warning', () => {
    it('기본 duration(3000ms)으로 경고 토스트 표시', () => {
      toastUtils.warning('로그인 필요');

      expect(toast.warning).toHaveBeenCalledWith('로그인 필요', { duration: 3000 });
    });
  });

  describe('info', () => {
    it('기본 duration(3000ms)으로 정보 토스트 표시', () => {
      toastUtils.info('분석 시작됩니다');

      expect(toast.info).toHaveBeenCalledWith('분석 시작됩니다', { duration: 3000 });
    });
  });

  describe('loading', () => {
    it('로딩 토스트 표시 후 ID 반환', () => {
      const id = toastUtils.loading('분석 중...');

      expect(toast.loading).toHaveBeenCalledWith('분석 중...');
      expect(id).toBe('toast-id-123');
    });
  });

  describe('dismiss', () => {
    it('id 없이 호출 시 전체 토스트 제거', () => {
      toastUtils.dismiss();

      expect(toast.dismiss).toHaveBeenCalledWith();
    });

    it('id로 특정 토스트 제거', () => {
      toastUtils.dismiss('toast-id-123');

      expect(toast.dismiss).toHaveBeenCalledWith('toast-id-123');
    });

    it('숫자 id로 특정 토스트 제거', () => {
      toastUtils.dismiss(42);

      expect(toast.dismiss).toHaveBeenCalledWith(42);
    });
  });
});
