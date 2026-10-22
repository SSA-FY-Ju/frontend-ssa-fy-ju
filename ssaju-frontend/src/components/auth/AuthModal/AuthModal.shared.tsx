'use client';

import type { CSSProperties } from 'react';

/** 로그인·회원가입 뷰가 공유하는 에러 배너 */
export function ErrorBanner({ message, style }: { message: string; style?: CSSProperties }) {
  return (
    <div style={{
      padding: '11px 15px', borderRadius: 12,
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
      fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8,
      ...style,
    }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>⚠</span>
      {message}
    </div>
  );
}

/** 회원가입 뷰의 이메일 확인 완료 배너 */
export function SuccessBanner({ message }: { message: string }) {
  return (
    <div style={{
      padding: '11px 15px', borderRadius: 12,
      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.28)',
      fontSize: 13, color: '#86efac', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>✓</span>
      {message}
    </div>
  );
}

/** 로그인·회원가입 뷰가 공유하는 그라디언트 제출 버튼 */
export function SubmitButton({
  submitting,
  label,
  busyLabel,
  style,
}: {
  submitting: boolean;
  label: string;
  busyLabel: string;
  style?: CSSProperties;
}) {
  return (
    <button type="submit" disabled={submitting} style={{
      padding: '14px', borderRadius: 14, border: 'none',
      background: submitting
        ? 'rgba(109,40,217,0.4)'
        : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
      color: '#fff', fontSize: 15, fontWeight: 700,
      cursor: submitting ? 'not-allowed' : 'pointer',
      transition: 'transform 0.15s, box-shadow 0.15s',
      letterSpacing: '-0.01em',
      boxShadow: submitting ? 'none' : '0 4px 20px rgba(109,40,217,0.4)',
      ...style,
    }}
      onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(109,40,217,0.5)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = submitting ? 'none' : '0 4px 20px rgba(109,40,217,0.4)'; }}>
      {submitting ? busyLabel : label}
    </button>
  );
}

/** 뷰 하단의 "다른 뷰로 전환" 텍스트 링크 */
export function ViewSwitchLink({
  question,
  action,
  onClick,
}: {
  question: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
      {question}{' '}
      <button type="button" onClick={onClick}
        style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.65)', cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 600 }}>
        {action}
      </button>
    </p>
  );
}
