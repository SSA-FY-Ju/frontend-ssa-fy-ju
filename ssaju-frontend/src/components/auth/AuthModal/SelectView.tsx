'use client';

interface SelectViewProps {
  onLogin: () => void;
  onSignup: () => void;
}

/** 로그인/회원가입 선택 화면 - 상태 없는 순수 뷰 */
export function SelectView({ onLogin, onSignup }: SelectViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* 로그인 버튼 */}
      <button
        onClick={onLogin}
        style={{
          width: '100%', padding: '0 20px', height: 64, borderRadius: 16,
          border: '1px solid rgba(139,92,246,0.45)',
          background: 'linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(79,70,229,0.2) 100%)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
          position: 'relative', overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.75)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(109,40,217,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* 아이콘 */}
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>🔑</div>
        {/* 텍스트 */}
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e9d5ff', letterSpacing: '-0.01em' }}>로그인</div>
          <div style={{ fontSize: 12, color: 'rgba(196,181,253,0.45)', marginTop: 1 }}>기존 계정으로 계속하기</div>
        </div>
        <span style={{ color: 'rgba(167,139,250,0.4)', fontSize: 18 }}>›</span>
      </button>

      {/* 회원가입 버튼 */}
      <button
        onClick={onSignup}
        style={{
          width: '100%', padding: '0 20px', height: 64, borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.09)',
          background: 'rgba(255,255,255,0.04)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          transition: 'transform 0.2s, border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>✨</div>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.01em' }}>회원가입</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>새 계정 만들기</div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>›</span>
      </button>

      {/* 구분선 + 약관 */}
      <div style={{ marginTop: 6, textAlign: 'center' }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.16)', lineHeight: 1.7 }}>
          계속하면{' '}
          <span style={{ color: 'rgba(167,139,250,0.5)', cursor: 'pointer' }}>이용약관</span>
          {' '}및{' '}
          <span style={{ color: 'rgba(167,139,250,0.5)', cursor: 'pointer' }}>개인정보처리방침</span>
          에 동의하는 것으로 간주합니다
        </p>
      </div>
    </div>
  );
}
