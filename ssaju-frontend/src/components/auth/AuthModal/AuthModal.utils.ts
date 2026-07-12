import type { CSSProperties } from 'react';
import { ApiError } from '@/lib/api/client';

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(139,92,246,0.2)',
  background: 'rgba(255,255,255,0.03)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  boxSizing: 'border-box',
  letterSpacing: '0.01em',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'rgba(196,181,253,0.5)',
  marginBottom: 7,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

export function toUserMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.errorCode) {
      case 'UNAUTHORIZED':
      case 'INVALID_CREDENTIALS':
        return '비밀번호가 올바르지 않습니다.';
      case 'USER_NOT_FOUND':
        return '등록되지 않은 이메일입니다.';
      case 'EMAIL_ALREADY_EXISTS':
      case 'DUPLICATE_EMAIL':
        return '이미 사용 중인 이메일입니다.';
      case 'VALIDATION_FAILED':
        return '입력값을 다시 확인해주세요.';
      default:
        return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }
  if (err instanceof Error && (err.message.includes('fetch') || err.message.includes('Failed'))) {
    return '네트워크 오류가 발생했습니다.';
  }
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}
