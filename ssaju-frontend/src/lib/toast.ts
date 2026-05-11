/**
 * 전역 토스트 유틸리티
 *
 * Sonner 라이브러리를 사용한 토스트 알림 래퍼
 */

import { toast } from 'sonner';

export const toastUtils = {
  /**
   * 성공 메시지 표시
   */
  success: (message: string, options?: { duration?: number }) => {
    toast.success(message, { duration: options?.duration || 3000 });
  },

  /**
   * 에러 메시지 표시
   */
  error: (message: string, options?: { duration?: number }) => {
    toast.error(message, { duration: options?.duration || 4000 });
  },

  /**
   * 경고 메시지 표시
   */
  warning: (message: string, options?: { duration?: number }) => {
    toast.warning(message, { duration: options?.duration || 3000 });
  },

  /**
   * 정보 메시지 표시
   */
  info: (message: string, options?: { duration?: number }) => {
    toast.info(message, { duration: options?.duration || 3000 });
  },

  /**
   * 로딩 상태 표시 (dismiss 함수 반환)
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * 토스트 메시지 제거
   */
  dismiss: (id?: string | number) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  },
};
