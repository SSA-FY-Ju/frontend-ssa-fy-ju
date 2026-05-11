/**
 * 커리어 분석 목업 데이터
 */

import type { CareerTimingResult, ConsultationData } from '@/types/api';

export const mockCareerTimingResult: CareerTimingResult = {
  sajuResultId: 'mock-saju-result-001',
  h1Period: '2025년 상반기',
  h2Period: '2026년 하반기',
  h1Confidence: 82,
  h2Confidence: 65,
  recommendation:
    '귀하의 사주를 분석한 결과, 2025년 상반기가 취업 활동에 가장 유리한 시기입니다. 특히 IT 및 금융 분야에서 좋은 기회가 예상됩니다.',
};

export const mockConsultationData: ConsultationData = {
  sajuResultId: 'mock-saju-result-001',
  careerPath:
    '데이터 기반 의사결정 역할이 적합합니다. 분석적 사고와 창의성을 결합한 프로덕트 매니저나 데이터 사이언티스트 직무를 추천합니다.',
  timing: '2025년 3-6월이 이직/취업 최적 시기입니다. 목(木) 운이 강해 새로운 시작에 유리합니다.',
  marketTrend:
    'AI/ML 분야와 핀테크 산업이 성장 중입니다. 클라우드 컴퓨팅과 데이터 엔지니어링 스킬의 수요가 높습니다.',
  skillGap:
    'Python 및 SQL 심화 학습이 필요합니다. 클라우드 자격증(AWS/GCP)이 경쟁력 향상에 도움이 됩니다.',
  networkStrategy:
    '업계 컨퍼런스 참가와 LinkedIn 활동을 강화하세요. 오픈소스 프로젝트 기여가 포트폴리오에 유리합니다.',
  riskManagement:
    '현재 직장 유지하며 부업 프로젝트로 경험을 쌓는 것을 추천합니다. 급격한 변화보다 단계적 전환이 안전합니다.',
  psychologicalPrepare:
    '거절에 대한 멘탈 관리가 중요합니다. 매주 2-3개 지원을 목표로 꾸준히 진행하세요.',
  alternativePlans:
    '희망 직무 외에 데이터 분석가, UX 리서처 등 인접 직무도 고려해보세요. 스타트업 경험도 장기적으로 가치 있습니다.',
};
