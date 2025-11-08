
export type ScorePart = number | 'ABS' | null;

export interface ScoreBreakdown {
  firstCA: ScorePart;
  secondCA: ScorePart;
  exam: ScorePart;
}

export type Scores = Record<string, ScoreBreakdown>;

export interface Payment {
  id: string;
  receiptNo: string;
  date: string;
  invoiceNo: string;
  totalBill: number;
  amountPaid: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD' | '';
  processedBy: string;
}

export interface FeeItem {
  id: string;
  name: string;
  amount: number;
  type: 'required' | 'optional';
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  studentId: string;
  feeItems: FeeItem[];
  totalRequired: number;
  totalOptional: number;
  totalAmount: number;
}

export interface Student {
  id:string;
  name: string;
  admissionNo?: string;
  gender?: 'Male' | 'Female' | '';
  dob?: string;
  parentName?: string;
  photo?: string;
  scores: Scores;
  totalAttendance: number;
  remark?: string;
  payments?: Payment[];
  invoices?: Invoice[];
}

export interface Result {
  studentId: string;
  name: string;
  total: number;
  average: number;
  position: number;
  remark?: string;
}

export interface SchoolInfo {
  schoolName: string;
  schoolAddress: string;
  contactInfo: string;
}

export interface ReportCardTemplateSettings extends SchoolInfo {
  fontFamily: 'Arial' | 'Times New Roman' | 'Verdana';
  showGradeAnalysis: boolean;
  showQRCode: boolean;
  showClassPosition: boolean;
  showPromotionStatus: boolean;
}

export interface SubjectReportTemplateSettings {
  showSummary: boolean;
  showPerformanceIndicators: boolean;
  showPerformanceBar: boolean;
}

export interface BroadsheetTemplateSettings {
  showSubjectAverage: boolean;
  showHighestScore: boolean;
  showLowestScore: boolean;
}

export interface TemplateSettings {
  reportCard: ReportCardTemplateSettings;
  subjectWise: SubjectReportTemplateSettings;
  broadsheet: BroadsheetTemplateSettings;
}

export type Role = 'admin' | 'teacher' | 'student' | 'parent';

export type Permission = 
  | 'dashboard'
  | 'setup'
  | 'templates'
  | 'scores'
  | 'invoicing'
  | 'payments'
  | 'reports'
  | 'guide'
  | 'access_control';

export type Permissions = Record<Role, Record<Permission, boolean>>;

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be a hash
  role: Role;
}
