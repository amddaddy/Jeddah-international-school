

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

export type Rating = 'A' | 'B' | 'C' | 'D' | 'E' | '';

export interface Student {
  id:string;
  schoolId: string; // Link student to a specific school
  classId: string; // e.g., "SS 1-A"
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
  stream?: 'Science' | 'Art' | 'Commerce';
  affectiveDomain?: Record<string, Rating>;
  psychomotorSkills?: Record<string, Rating>;
}

export interface Result {
  studentId: string;
  name: string;
  total: number;
  average: number;
  position: number;
  remark?: string;
  stream?: 'Science' | 'Art' | 'Commerce';
}

export interface School {
  id: string;
  name: string;
  email: string; // Contact email for the school
  address: string;
  contactInfo: string;
  logo: string;
  principalSignature?: string; // Added signature field
  status: 'active' | 'suspended';
  subscriptionExpiry?: string;
  dateRegistered: string;
}

export interface ReportCardTemplateSettings {
  reportTitle: string; // New field for custom report title
  fontFamily: 'Arial' | 'Times New Roman' | 'Verdana';
  showGradeAnalysis: boolean;
  showQRCode: boolean;
  showClassPosition: boolean;
  showPromotionStatus: boolean;
  // These overrides are now derived from the School object, but kept for template specific tweaks if needed
  schoolName?: string; 
  schoolAddress?: string;
  contactInfo?: string;
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

// --- AUTHENTICATION & USER MANAGEMENT ---

export type Role = 'dev_admin' | 'admin' | 'teacher';

export type Permission =
  | 'manage_students'
  | 'manage_subjects'
  | 'manage_fees'
  | 'enter_scores'
  | 'generate_invoices'
  | 'record_payments'
  | 'finalize_reports'
  | 'customize_templates'
  | 'view_dashboard'
  | 'view_guide'
  | 'view_access_control'
  | 'dev_admin_tools';

export type Permissions = Record<Permission, boolean>;

export interface User {
  id: string;
  schoolId: string; // Link user to a school. 'global' for dev_admin.
  name: string;
  email: string;
  password?: string; 
  role: Role;
  permissions: Permissions;
}