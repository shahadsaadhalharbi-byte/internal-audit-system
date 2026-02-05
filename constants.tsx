
import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  FileCheck,
  ListChecks,
  Bell,
  BarChart3,
  History,
  LogOut,
  Megaphone,
  Gavel,
  Users,
  Settings,
  Paperclip,
  PlusCircle,
  FolderOpen,
  MessageSquare,
  Activity,
  Building
} from 'lucide-react';
import { UserRole } from './types';

export const COLORS = {
  primary: '#008767',
  secondary: '#8bc34a',
  accent: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  background: '#f8fafc'
};

export const DEPARTMENTS = [
  'جميع الإدارات',
  'إدارة التحول الرقمي',
  'إدارة الموارد البشرية',
  'إدارة تقنية المعلومات',
  'إدارة الأسواق',
  'الإدارة المالية',
  'إدارة الرقابة الصحية'
];

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.GENERAL_DIRECTOR]: 'مدير عام المراجعة الداخلية',
  [UserRole.DEPT_MANAGER]: 'مدير إدارة',
  [UserRole.AUDITOR]: 'مراجع',
  [UserRole.DATA_ENTRY]: 'مدخل بيانات',
  [UserRole.LIAISON_OFFICER]: 'ضابط اتصال',
  [UserRole.SYSTEM_ADMIN]: 'مسؤول النظام'
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} />, roles: Object.values(UserRole) },

  { id: 'annual-plan', label: 'الخطة السنوية', icon: <ClipboardList size={20} />, roles: [UserRole.GENERAL_DIRECTOR, UserRole.DEPT_MANAGER, UserRole.DATA_ENTRY, UserRole.SYSTEM_ADMIN] },

  { id: 'tasks-oversight', label: 'المهام', icon: <ShieldCheck size={20} />, roles: [UserRole.AUDITOR, UserRole.DEPT_MANAGER, UserRole.GENERAL_DIRECTOR, UserRole.DATA_ENTRY] },

  // الجهات الرقابية - متاحة للمدير العام وضابط الاتصال (المنشئ)
  { id: 'regulatory-entities', label: 'الجهات الرقابية', icon: <Gavel size={20} />, roles: [UserRole.GENERAL_DIRECTOR, UserRole.LIAISON_OFFICER, UserRole.SYSTEM_ADMIN] },

  { id: 'reports', label: 'التقارير', icon: <FileCheck size={20} />, roles: [UserRole.GENERAL_DIRECTOR, UserRole.DEPT_MANAGER, UserRole.AUDITOR] },

  { id: 'doc-requests', label: 'طلبات المستندات', icon: <FolderOpen size={20} />, roles: [UserRole.AUDITOR, UserRole.LIAISON_OFFICER] },

  { id: 'notifications', label: 'الإشعارات', icon: <Bell size={20} />, roles: Object.values(UserRole) },

  { id: 'awareness', label: 'رسائل التوعية', icon: <Megaphone size={20} />, roles: [UserRole.GENERAL_DIRECTOR, UserRole.SYSTEM_ADMIN] },

  { id: 'logout', label: 'تسجيل الخروج', icon: <LogOut size={20} />, roles: Object.values(UserRole) }
];
