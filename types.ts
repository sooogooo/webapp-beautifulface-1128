export interface AestheticScores {
  eyes: number;
  cheeks: number;
  lips: number;
  brows: number;
  jawline: number;
  symmetry: number;
  total: number;
}

export interface AnalysisResult {
  scores: AestheticScores;
  summary: string;
}

export interface ReportData {
  generatedImage: string; // Base64 of the AI generated poster
  analysis: AnalysisResult; // Structured data for charts
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}