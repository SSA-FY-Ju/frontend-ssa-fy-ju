// 파일 크기 예외: Kakao·Google OAuth URL 생성, PKCE 코드 생성, state CSRF 방지가
// 하나의 OAuth 흐름을 구성. 분리 시 PKCE 공유 유틸 의존성이 복잡해짐
/**
 * OAuth 소셜 로그인 유틸리티
 *
 * 지원: Kakao, Google
 * 방식: PKCE 플로우 (보안)
 * 기기 감지: 768px 기준 팝업/리다이렉트 자동 선택
 */

const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || '';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const OAUTH_REDIRECT_URI =
  process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

/**
 * PKCE code verifier 생성 (43-128자 랜덤 문자열)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * PKCE code challenge 생성 (SHA-256 해시)
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * OAuth state 파라미터 생성 (CSRF 방지)
 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * 카카오 OAuth URL 생성
 */
export async function getKakaoAuthUrl(): Promise<string> {
  const state = generateState();
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  // PKCE verifier를 sessionStorage에 저장 (콜백에서 사용)
  sessionStorage.setItem('oauth_code_verifier', verifier);
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: OAUTH_REDIRECT_URI,
    response_type: 'code',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

/**
 * 구글 OAuth URL 생성
 */
export async function getGoogleAuthUrl(): Promise<string> {
  const state = generateState();
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  sessionStorage.setItem('oauth_code_verifier', verifier);
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * OAuth state 검증
 */
export function validateState(receivedState: string): boolean {
  const savedState = sessionStorage.getItem('oauth_state');
  return savedState === receivedState;
}

/**
 * OAuth 임시 데이터 정리
 */
export function clearOAuthStorage(): void {
  sessionStorage.removeItem('oauth_code_verifier');
  sessionStorage.removeItem('oauth_state');
}
