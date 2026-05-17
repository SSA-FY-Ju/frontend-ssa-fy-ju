/**
 * services/auth/oauth.ts 단위 테스트
 * Note: sessionStorage는 jest setup.ts에서 jest.fn()으로 모킹됨
 */

// crypto.subtle.digest은 jsdom 환경에서 미지원 → 모킹
const mockDigest = jest.fn().mockResolvedValue(new Uint8Array(32).buffer);
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    },
    subtle: { digest: mockDigest },
  },
  writable: true,
});

import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  validateState,
  clearOAuthStorage,
} from '@/services/auth/oauth';

describe('generateCodeVerifier', () => {
  it('43자 이상의 문자열을 반환함', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
  });

  it('URL-safe base64 문자만 포함함 (+, /, = 없음)', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).not.toContain('+');
    expect(verifier).not.toContain('/');
    expect(verifier).not.toContain('=');
  });

  it('매 호출마다 다른 값을 생성함', () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    expect(v1).not.toBe(v2);
  });
});

describe('generateCodeChallenge', () => {
  it('verifier로부터 code challenge를 생성함', async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    expect(typeof challenge).toBe('string');
    expect(challenge.length).toBeGreaterThan(0);
    expect(challenge).not.toContain('+');
    expect(challenge).not.toContain('/');
    expect(challenge).not.toContain('=');
  });

  it('같은 verifier에서 항상 같은 challenge를 생성함', async () => {
    const verifier = 'test-verifier-12345678901234567890123456789012';
    const c1 = await generateCodeChallenge(verifier);
    const c2 = await generateCodeChallenge(verifier);
    expect(c1).toBe(c2);
  });
});

describe('generateState', () => {
  it('비어있지 않은 문자열을 반환함', () => {
    const state = generateState();
    expect(state.length).toBeGreaterThan(0);
  });

  it('알파벳과 숫자만 포함함', () => {
    const state = generateState();
    expect(state).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('매 호출마다 다른 값을 생성함', () => {
    const s1 = generateState();
    const s2 = generateState();
    expect(s1).not.toBe(s2);
  });
});

describe('validateState', () => {
  beforeEach(() => jest.clearAllMocks());

  it('저장된 state와 일치하면 true 반환', () => {
    // sessionStorage.getItem은 jest.fn()으로 모킹됨 — 반환값 설정
    (sessionStorage.getItem as jest.Mock).mockReturnValue('test-state-123');
    expect(validateState('test-state-123')).toBe(true);
  });

  it('저장된 state와 불일치하면 false 반환', () => {
    (sessionStorage.getItem as jest.Mock).mockReturnValue('correct-state');
    expect(validateState('wrong-state')).toBe(false);
  });

  it('sessionStorage에 state가 없으면 false 반환', () => {
    (sessionStorage.getItem as jest.Mock).mockReturnValue(null);
    expect(validateState('some-state')).toBe(false);
  });
});

describe('clearOAuthStorage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('oauth_code_verifier를 삭제함', () => {
    clearOAuthStorage();
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('oauth_code_verifier');
  });

  it('oauth_state를 삭제함', () => {
    clearOAuthStorage();
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('oauth_state');
  });
});
