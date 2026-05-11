/**
 * Jest 테스트 환경 설정
 *
 * Features:
 * - MSW (Mock Service Worker) 자동 활성화
 * - localStorage/sessionStorage 모킹
 * - Zustand 상태 초기화
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
