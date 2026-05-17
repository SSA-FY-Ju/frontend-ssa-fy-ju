import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // fetch 폴리필 (MSW 2.x + jsdom 환경)
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/setup.ts', // 테스트 파일이 아닌 설정 파일
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
    // Next.js 페이지·API 라우트는 서버 컨텍스트가 필요 → 단위 테스트 제외
    '!src/app/**',
    // MSW 목 핸들러 — 테스트 인프라 코드, 소스 코드 아님
    '!src/mocks/**',
    // TypeScript 타입 선언만 포함된 파일 — 실행 가능한 코드 없음
    '!src/types/api.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
};

// Next.js의 기본 설정을 확장하되, transformIgnorePatterns를 재정의
async function jestConfig() {
  const nextJestConfig = await createJestConfig(config)();
  return {
    ...nextJestConfig,
    // MSW 2.x ESM 패키지들을 변환 대상에 포함
    transformIgnorePatterns: [
      '/node_modules/(?!(msw|@mswjs|undici|rettime|is-network-error|outvariant|@open-draft|@bundled-es-modules)/)',
    ],
    // *.test.ts(x) / *.spec.ts(x) 파일만 테스트로 인식 (setup.ts 제외)
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    // nextJest가 collectCoverageFrom을 재정의할 수 있으므로 명시적 재설정
    collectCoverageFrom: config.collectCoverageFrom,
    coverageThreshold: config.coverageThreshold,
  };
}

export default jestConfig;
