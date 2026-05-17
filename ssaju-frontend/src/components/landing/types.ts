export type PageState = 'landing' | 'chat' | 'service';

export interface UserInput {
  birthDate: string;
  birthTime: string;
  selectedService?: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY' | 'FEEDBACK';
}
