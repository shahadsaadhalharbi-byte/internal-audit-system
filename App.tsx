
import React, { useState, useMemo } from 'react';
import { User, UserRole, AuditTask, TaskStatus, TaskType, DocumentRequest, AnnualPlan } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AnnualPlanView from './components/AnnualPlanView';
import TaskList from './components/TaskList';
import PlanBasedTaskList from './components/PlanBasedTaskList';
import TaskDetailsView from './components/TaskDetailsView';
import UserManagement from './components/UserManagement';
import AwarenessCenter from './components/AwarenessCenter';
import EmployeeVoice from './components/EmployeeVoice';
import DocRequestsView from './components/DocRequestsView';
import RegulatoryEntitiesView from './components/RegulatoryEntitiesView';
import { DEPARTMENTS } from './constants';
import { Building2 } from 'lucide-react';

const INITIAL_USER: User = {
  id: 'USER-001',
  name: 'المستخدم التجريبي',
  role: UserRole.GENERAL_DIRECTOR,
  department: 'الإدارة العامة للمراجعة'
};

const INITIAL_MOCK_PLANS: AnnualPlan[] = [
  { id: 'PLAN-1446', year: 1446, status: 'APPROVED', tasksCount: 3, department: 'الإدارة العامة للمراجعة', coverage: '85%', date: '2024-01-01', title: 'خطة المراجعة السنوية 1446' },
  { id: 'PLAN-1445', year: 1445, status: 'APPROVED', tasksCount: 1, department: 'الإدارة العامة للمراجعة', coverage: '90%', date: '2023-01-01', title: 'خطة المراجعة السنوية 1445' }
];

const INITIAL_MOCK_TASKS: AuditTask[] = [
  { id: 'SH-101', title: 'مراجعة أنظمة الدفع الإلكتروني', description: 'التأكد من أمان بوابات الدفع وتوافقها مع معايير البنك المركزي السعودي.', type: TaskType.AUDIT, status: TaskStatus.IN_PROGRESS, startDate: '2024-03-01', endDate: '2024-04-15', assignedTo: 'AUD-200', department: 'إدارة التحول الرقمي', year: 1446, progress: 45, planId: 'PLAN-1446' },
  { id: 'SH-102', title: 'تدقيق عقود السحابة الحكومية', description: 'مراجعة بنود اتفاقيات مستوى الخدمة (SLA) مع مزود الخدمة السحابية.', type: TaskType.AUDIT, status: TaskStatus.PENDING, startDate: '2024-03-10', endDate: '2024-05-20', assignedTo: 'AUD-200', department: 'إدارة تقنية المعلومات', year: 1446, progress: 0, planId: 'PLAN-1446' },
  { id: 'DT-1', title: 'أتمتة إجراءات الرقابة الميدانية', description: 'تحويل كافة النماذج الورقية إلى نماذج رقمية تفاعلية مع ربطها بنظام الخرائط.', type: TaskType.AUDIT, status: TaskStatus.IN_PROGRESS, startDate: '2024-01-15', endDate: '2024-03-30', assignedTo: 'AUD-101', department: 'إدارة التحول الرقمي', year: 1446, progress: 75, planId: 'PLAN-1446' },
  { id: 'T1', title: 'مراجعة عقود النظافة 1446', description: 'التأكد من التزام المقاول ببنود العقد وحصره للمخالفات البيئية.', type: TaskType.AUDIT, status: TaskStatus.COMPLETED, startDate: '2024-01-01', endDate: '2024-02-15', assignedTo: 'AUD-103', department: 'إدارة الرقابة الصحية', year: 1445, progress: 100, planId: 'PLAN-1445' }
];

const INITIAL_DOC_REQUESTS: DocumentRequest[] = [
  { id: 'REQ-1', taskId: 'SH-101', title: 'سجلات العمليات المالية - فبراير', description: 'كافة العمليات التي تمت عبر بوابة الدفع في شهر فبراير 2024.', dueDate: '2024-03-15', status: 'SENT' },
  { id: 'REQ-2', taskId: 'DT-1', title: 'تقارير الحضور والانصراف الميدانية', description: 'كشوفات التوقيع الميداني للمراقبين في بلدية العوالي.', dueDate: '2024-03-10', status: 'IN_PROGRESS' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [selectedDept, setSelectedDept] = useState<string>(DEPARTMENTS[0]);
  const [tasks, setTasks] = useState<AuditTask[]>(INITIAL_MOCK_TASKS);
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>(INITIAL_DOC_REQUESTS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentUser(prev => ({
      ...prev,
      name: newRole === UserRole.AUDITOR ? 'شهد الحربي' : newRole === UserRole.LIAISON_OFFICER ? 'منصور الصاعدي' : 'المستخدم التجريبي',
      role: newRole,
      department: newRole === UserRole.DEPT_MANAGER ? 'إدارة التحول الرقمي' :
        newRole === UserRole.LIAISON_OFFICER ? 'إدارة الرقابة الصحية' : 'الإدارة العامة للمراجعة'
    }));
    setActiveTab('dashboard');
    setSelectedTaskId(null);
  };

  const handleUpdateDocStatus = (requestId: string, status: DocumentRequest['status']) => {
    setDocRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status } : req
    ));
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus, progress?: number) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus, progress: progress !== undefined ? progress : t.progress } : t
    ));
  };

  const handleAssignLiaison = (taskId: string, liaisonId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, liaisonId } : t
    ));
  };

  const handleRequestDoc = (request: Partial<DocumentRequest>) => {
    const newReq: DocumentRequest = {
      id: `REQ-${Date.now()}`,
      taskId: request.taskId || '',
      title: request.title || 'طلب مستند',
      description: request.description || '',
      dueDate: request.dueDate || '',
      status: 'SENT'
    };
    setDocRequests(prev => [newReq, ...prev]);
  };

  const handleAssignTask = (taskId: string, auditorId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, assignedTo: auditorId, status: TaskStatus.IN_PROGRESS, progress: 10 } : t
    ));
  };

  const filteredTasks = useMemo(() => {
    if (currentUser.role === UserRole.DEPT_MANAGER) return tasks.filter(task => task.department === currentUser.department);
    if (currentUser.role === UserRole.AUDITOR) return tasks.filter(task => task.assignedTo === 'AUD-200');
    if (selectedDept === DEPARTMENTS[0]) return tasks;
    return tasks.filter(task => task.department === selectedDept);
  }, [selectedDept, currentUser.role, currentUser.department, tasks]);

  const currentTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);
  const taskRequests = useMemo(() => docRequests.filter(r => r.taskId === selectedTaskId), [docRequests, selectedTaskId]);

  const renderContent = () => {
    if (activeTab === 'tasks-oversight' && selectedTaskId && currentTask) {
      return (
        <TaskDetailsView
          task={currentTask}
          userRole={currentUser.role}
          docRequests={taskRequests}
          onBack={() => setSelectedTaskId(null)}
          onAssign={handleAssignTask}
          onUpdateStatus={handleUpdateTaskStatus}
          onAssignLiaison={handleAssignLiaison}
          onRequestDoc={handleRequestDoc}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard tasks={filteredTasks} user={currentUser} />;
      case 'annual-plan': return <AnnualPlanView tasks={tasks} user={currentUser} />;
      case 'tasks-oversight': return <PlanBasedTaskList tasks={filteredTasks} plans={INITIAL_MOCK_PLANS} userRole={currentUser.role} onSelectTask={setSelectedTaskId} onAddTask={() => { }} />;
      case 'regulatory-entities': return <RegulatoryEntitiesView user={currentUser} />;
      case 'awareness': return <AwarenessCenter user={currentUser} />;
      case 'surveys': return <EmployeeVoice user={currentUser} />;
      case 'doc-requests': return <DocRequestsView requests={docRequests} user={currentUser} onUpdateStatus={handleUpdateDocStatus} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-300 animate-fadeIn">
            <Building2 className="w-20 h-20 opacity-10 mb-6" />
            <p className="text-xl font-black text-slate-400">هذه الشاشة قيد التطوير</p>
          </div>
        );
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when tab changes
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-cairo" dir="rtl">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        fixed lg:relative
        w-[280px] lg:w-[320px]
        bg-white flex-shrink-0 z-50 lg:z-30
        shadow-xl shadow-slate-200/50 border-l border-slate-100
        h-full
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} userRole={currentUser.role} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#fbfcfd]">
        <Header
          user={currentUser}
          onRoleChange={handleRoleChange}
          toggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-[1300px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
