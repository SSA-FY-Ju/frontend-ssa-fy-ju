'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DialogTitle } from '@/components/ui/dialog';
import { ModalShell } from '@/components/common/ModalShell/ModalShell';
import type { View, AuthModalProps } from './AuthModal.types';
import { SelectView } from './SelectView';
import { LoginView } from './LoginView';
import { SignupView } from './SignupView';

/**
 * 인증 모달의 뼈대: 뷰 전환 상태와 공통 프레임(배경 장식·헤더·닫기/뒤로)만 갖는다.
 *
 * 폼 입력 상태를 여기 두지 않는 이유: 이전에는 3개 뷰의 상태 12개가 전부
 * 이 컴포넌트에 있어서, 키 입력 1번마다 563줄 전체(안 보이는 뷰 분기·장식
 * 레이어 포함)가 리렌더됐다. 입력 상태는 각 뷰(LoginView/SignupView) 안에
 * 지역화해서 타이핑 리렌더 범위를 해당 뷰로 한정한다.
 *
 * 뷰를 전환하면 이전 뷰가 언마운트되므로 입력값·에러가 자동 초기화된다.
 */
export function AuthModal({ isOpen, onClose, defaultTab }: AuthModalProps) {
  const setLoginError = useAuthStore((s) => s.setLoginError);
  const [view, setView] = useState<View>(defaultTab ?? 'select');

  useEffect(() => {
    if (isOpen) {
      setView(defaultTab ?? 'select');
      setLoginError(null);
    }
  }, [isOpen, defaultTab, setLoginError]);

  const goTo = (v: View) => {
    setLoginError(null);
    setView(v);
  };

  return (
    <ModalShell
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      maxWidth={420}
      borderRadius={32}
    >
        {/* ── 배경 레이어 ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(22,14,50,0.97) 0%, rgba(8,5,24,0.99) 100%)',
        }} />
        {/* 테두리 */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 32,
          border: '1px solid rgba(139,92,246,0.25)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 100px rgba(0,0,0,0.5), 0 0 120px rgba(88,28,220,0.12)',
          pointerEvents: 'none',
        }} />

        {/* 상단 빛줄기 */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.7), rgba(139,92,246,1), rgba(167,139,250,0.7), transparent)',
        }} />

        {/* 배경 glow orbs */}
        <div aria-hidden="true" style={{ position: 'absolute', top: -100, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(79,70,229,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* 별빛 파티클 */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 22, left: 28, color: 'rgba(167,139,250,0.3)', fontSize: 9, pointerEvents: 'none' }}>✦</div>
        <div aria-hidden="true" style={{ position: 'absolute', top: 44, right: 52, color: 'rgba(167,139,250,0.18)', fontSize: 7, pointerEvents: 'none' }}>★</div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 48, right: 28, color: 'rgba(99,102,241,0.22)', fontSize: 9, pointerEvents: 'none' }}>✦</div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 80, left: 22, color: 'rgba(167,139,250,0.15)', fontSize: 6, pointerEvents: 'none' }}>●</div>

        <div style={{ position: 'relative', padding: '36px 32px 32px' }}>

          {/* 닫기 */}
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.25)', fontSize: 19, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
          >×</button>

          {/* 뒤로가기 */}
          {view !== 'select' && (
            <button
              onClick={() => goTo('select')}
              aria-label="뒤로"
              style={{
                position: 'absolute', top: 18, left: 18,
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.25)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
            >←</button>
          )}

          {/* ── 헤더 ── */}
          <div style={{ textAlign: 'center', marginBottom: view === 'select' ? 32 : 24 }}>
            {/* 아이콘 */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 60, height: 60, borderRadius: 20, marginBottom: 16,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(79,70,229,0.2) 100%)',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 0 32px rgba(109,40,217,0.25), 0 0 64px rgba(109,40,217,0.1)',
            }}>
              <span style={{ fontSize: 26, filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.6))' }}>✦</span>
            </div>

            <DialogTitle asChild>
              <h2 id="auth-modal-title" style={{
                fontSize: view === 'select' ? '1.4rem' : '1.2rem',
                fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em',
                textShadow: '0 0 24px rgba(167,139,250,0.3)',
              }}>
                {view === 'select' ? 'SSAju 시작하기' : view === 'login' ? '로그인' : '회원가입'}
              </h2>
            </DialogTitle>

            {view === 'select' && (
              <p style={{ fontSize: 13.5, color: 'rgba(196,181,253,0.4)', lineHeight: 1.7, letterSpacing: '0.01em' }}>
                별자리 분석을 시작하려면<br/>로그인 또는 회원가입이 필요합니다
              </p>
            )}
          </div>

          {view === 'select' && <SelectView onLogin={() => goTo('login')} onSignup={() => goTo('signup')} />}
          {view === 'login' && <LoginView onClose={onClose} onGoSignup={() => goTo('signup')} />}
          {view === 'signup' && <SignupView onClose={onClose} onGoLogin={() => goTo('login')} />}
        </div>
    </ModalShell>
  );
}
