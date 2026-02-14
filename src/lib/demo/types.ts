export type TaskStatus =
  | 'draft'
  | 'criteria_ready'
  | 'criteria_locked'
  | 'calibration_uploaded'
  | 'calibrated'
  | 'submissions_uploaded'
  | 'grading_done';

export type CriterionCategory = '立意' | '结构' | '语言' | '扣分项' | '文体' | '其他';

export interface Criterion {
  id: string;
  enabled: boolean;
  category: CriterionCategory;
  text: string; // Yes/No Question
}

export interface CalibrationSample {
  paperId: string;      // CAL-001...
  scoreHuman: number;   // 0..40
  grader: string;       // Name
  timestamp: number;    // ms
  previewUrl: string;   // Placeholder URL
  status: 'ok' | 'warning' | 'error';
}

export interface CalibrationMetrics {
  mae: number;
  rmse: number;
  pearson: number;
  spearman: number;
  bandAcc: number;
  reviewRate: number;
}

export interface CalibrationRun {
  status: 'idle' | 'running' | 'done' | 'failed';
  progress: number;  // 0..100
  logs: string[];
  metrics?: CalibrationMetrics;
  modelVersion?: string; // v1.0
}

export type SubmissionStatus = 'pending' | 'running' | 'done' | 'failed';

export interface Submission {
  paperId: string;       // SUB-0001...
  previewUrl: string;
  status: SubmissionStatus;
  scoreModel?: number;   // 0..40
  scoreFinal?: number;   // After manual review
  band?: '一等' | '二等' | '三等' | '四等';
  riskFlags?: string[];  // Low confidence, etc.
}

export interface CriterionResult {
  criterionId: string;
  result: '是' | '否';
  confidence: number; // 0..1
  evidence: string;   // Text excerpt
}

export interface PaperJudgement {
  paperId: string;
  criteriaResults: CriterionResult[];
  scoreExplain: {
    topFactors: string[]; // 5 items
    summary: string;      // Summary text
  };
  review?: {
    overridden: boolean;
    reason: string;
    reviewer: string;   // Reviewer-1
    updatedAt: number;
  };
}
