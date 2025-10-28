
export type ScorePart = number | 'ABS' | null;

export interface ScoreBreakdown {
  firstCA: ScorePart;
  secondCA: ScorePart;
  exam: ScorePart;
}

export type Scores = Record<string, ScoreBreakdown>;

export interface Student {
  id: string;
  name: string;
  photo?: string;
  scores: Scores;
  totalAttendance: number;
  remark?: string;
}

export interface Result {
  studentId: string;
  name: string;
  total: number;
  average: number;
  position: number;
  remark?: string;
}