/**\n * 파일 역할: 랜딩 플로우에서 공통으로 사용하는 상태/입력 타입을 정의합니다.\n */

export type PageState = 'landing' | 'chat' | 'service';

export interface UserInput {
  birthDate: string;
  birthTime: string;
  selectedService?: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY' | 'FEEDBACK';
}
