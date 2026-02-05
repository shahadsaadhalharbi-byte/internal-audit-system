
export enum UserRole {
  GENERAL_DIRECTOR = 'GENERAL_DIRECTOR', // مدير الإدارة العامة للمراجعة
  DEPT_MANAGER = 'DEPT_MANAGER', // مدير الإدارة (مدراء الإدارات)
  AUDITOR = 'AUDITOR', // عضو فريق المراجعة (المراجع)
  DATA_ENTRY = 'DATA_ENTRY', // مدخل بيانات
  LIAISON_OFFICER = 'LIAISON_OFFICER', // ضابط اتصال
  SYSTEM_ADMIN = 'SYSTEM_ADMIN' // مدير النظام
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  REJECTED = 'REJECTED',
  PAUSED = 'PAUSED'
}

export enum TaskType {
  AUDIT = 'AUDIT', // مراجعة
  INSPECTION = 'INSPECTION', // تفتيشية
  AWARENESS = 'AWARENESS' // توعوية
}

export interface AuditTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  assignedTo: string; // User ID
  department: string;
  year: number;
  progress: number;
  liaisonId?: string;
  planId?: string; // Link to AnnualPlan
}

export interface DocumentRequest {
  id: string;
  taskId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'SENT' | 'IN_PROGRESS' | 'RECEIVED';
  attachmentUrl?: string;
}

export interface AnnualPlan {
  id: string;
  year: number;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  tasksCount: number;
  department: string;
  coverage: string;
  date: string;
  title?: string;
  documentUrl?: string;
}

export interface EmployeeVoiceReport {
  id: string;
  title: string;
  content: string;
  date: string;
  status: 'NEW' | 'ANALYZING';
  isAnonymous: boolean;
}

export interface RegulatoryRequest {
  id: string;
  senderEntity: string;
  notificationType: string;
  mainTopic: string;
  note: string;
  date: string;
  status: 'NEW' | 'PROCESSING' | 'CLOSED';
}
