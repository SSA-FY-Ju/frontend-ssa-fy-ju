'use client';

import { DialogTitle } from '@/components/ui/dialog';
import { ModalShell } from '@/components/common/ModalShell/ModalShell';
import type { LoginModalProps } from './LoginModal.types';
import { KakaoIcon, GoogleIcon } from './LoginModal.icons';

export function LoginModal({
  isOpen,
  onClose,
  onKakaoLogin,
  onGoogleLogin,
  isLoading = false,
  error = null,
}: LoginModalProps) {
  return (
    <ModalShell
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      maxWidth={460}
      borderRadius={28}
      cardStyle={{
        background: 'linear-gradient(160deg, rgba(30,20,60,0.97) 0%, rgba(12,8,30,0.98) 100%)',
        border: '1px solid rgba(139,92,246,0.3)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset, 0 32px 80px rgba(0,0,0,0.35), 0 0 80px rgba(109,40,217,0.15)',
      }}
    >
        {/* 상단 그라디언트 선 */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(139,92,246,0.8), rgba(99,102,241,0.6), transparent)',
        }} />

        {/* 배경 glow 장식 */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute',
          bottom: -60,
          left: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* 별빛 장식 */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 20, left: 24, color: 'rgba(167,139,250,0.25)', fontSize: 10, pointerEvents: 'none' }}>✦</div>
        <div aria-hidden="true" style={{ position: 'absolute', top: 36, right: 48, color: 'rgba(167,139,250,0.15)', fontSize: 8, pointerEvents: 'none' }}>★</div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 60, right: 20, color: 'rgba(99,102,241,0.2)', fontSize: 10, pointerEvents: 'none' }}>✦</div>

        <div style={{ padding: '36px 28px 32px' }}>
          {/* 닫기 */}
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 30,
              height: 30,
              borderRadius: 9,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >
            ×
          </button>

          {/* 헤더 */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {/* 로고 아이콘 */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(79,70,229,0.15) 100%)',
              border: '1px solid rgba(139,92,246,0.35)',
              marginBottom: 18,
              boxShadow: '0 0 24px rgba(109,40,217,0.2)',
            }}>
              <span style={{ fontSize: 24 }}>✦</span>
            </div>
            <DialogTitle asChild>
              <h2
                id="login-modal-title"
                style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}
              >
                SSAju 시작하기
              </h2>
            </DialogTitle>
            <p style={{ fontSize: 13, color: 'rgba(196,181,253,0.5)', lineHeight: 1.6 }}>
              소셜 계정으로 간편하게 시작하세요
            </p>
          </div>

          {/* 에러 */}
          {error && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: 13,
              color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          {/* 소셜 버튼 */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
            {/* 카카오 — 공식 스펙 */}
            <button
              onClick={onKakaoLogin}
              disabled={isLoading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 12px',
                borderRadius: 12,
                border: 'none',
                background: '#FEE500',
                color: '#191919',
                fontSize: 14,
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'filter 0.15s, transform 0.15s',
                letterSpacing: '-0.01em',
                position: 'relative',
              }}
              onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.filter = 'brightness(0.95)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            >
              <KakaoIcon />
              카카오로 계속하기
            </button>

            {/* 구글 — 공식 스펙 */}
            <button
              onClick={onGoogleLogin}
              disabled={isLoading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.96)',
                color: '#3c3c3c',
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'filter 0.15s, transform 0.15s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.filter = 'brightness(0.97)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            >
              <GoogleIcon />
              Google로 계속하기
            </button>
          </div>

          {isLoading && (
            <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'rgba(196,181,253,0.4)' }}>
              로그인 중...
            </p>
          )}

          {/* 하단 안내 */}
          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.18)', lineHeight: 1.6 }}>
            로그인 시 <span style={{ color: 'rgba(167,139,250,0.5)' }}>이용약관</span> 및 <span style={{ color: 'rgba(167,139,250,0.5)' }}>개인정보처리방침</span>에 동의한 것으로 간주합니다.
          </p>
        </div>
    </ModalShell>
  );
}
