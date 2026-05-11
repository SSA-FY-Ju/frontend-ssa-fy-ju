/**
 * 환경 변수 검증 및 설정
 *
 * Required env vars:
 * - NEXT_PUBLIC_API_BASE_URL: API 서버 주소
 * - NEXT_PUBLIC_OAUTH_REDIRECT_URI: OAuth 콜백 URI
 */

interface EnvConfig {
  apiBaseUrl: string;
  oauthRedirectUri: string;
}

// 환경 변수 검증
function validateEnv(): EnvConfig {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const oauthRedirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;

  // 필수 환경 변수 검증
  if (!apiBaseUrl) {
    throw new Error(
      'Environment variable NEXT_PUBLIC_API_BASE_URL is not set. ' +
        'Please add it to .env.local or set it as an environment variable.',
    );
  }

  if (!oauthRedirectUri) {
    throw new Error(
      'Environment variable NEXT_PUBLIC_OAUTH_REDIRECT_URI is not set. ' +
        'Please add it to .env.local or set it as an environment variable.',
    );
  }

  return {
    apiBaseUrl,
    oauthRedirectUri,
  };
}

// 개발 환경에서만 검증 수행 (빌드 시간에 오류 방지)
let env: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!env) {
    env = validateEnv();
  }
  return env;
}

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  oauthRedirectUri:
    process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
};
