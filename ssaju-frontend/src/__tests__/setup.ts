/**
 * Jest 테스트 환경 설정 (공통)
 *
 * Features:
 * - localStorage/sessionStorage 모킹
 * - Zustand 상태 초기화
 *
 * Note: MSW setup은 각 테스트 파일에서 직접 임포트
 * (MSW 2.x ESM 호환성 문제로 분리)
 */

import '@testing-library/jest-dom';

// localStorage 및 sessionStorage 모킹
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// 테스트 전에 모든 모크 초기화
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});
