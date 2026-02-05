
import React, { useState } from 'react';
import { AuditTask, TaskStatus, UserRole, DocumentRequest } from '../types';
import {
  ArrowRight, Calendar, UserPlus, CheckCircle2,
  ChevronDown, Flag, History, MessageSquarePlus, ShieldAlert,
  FileText, Upload, Users, Send, Check, Info, ListChecks, Paperclip, Activity,
  PlusCircle, FolderOpen, UserCheck, X, Clock, Eye, AlertCircle,
  Target, Pause, Play, Download
} from 'lucide-react';

interface TaskDetailsViewProps {
  task: AuditTask;
  userRole: UserRole;
  docRequests: DocumentRequest[];
  onBack: () => void;
  onAssign: (taskId: string, auditorId: string) => void;
  onUpdateStatus?: (taskId: string, status: TaskStatus, progress?: number) => void;
  onAssignLiaison?: (taskId: string, liaisonId: string) => void;
  onRequestDoc?: (request: Partial<DocumentRequest>) => void;
}

const LIAISON_OFFICERS = [
  { id: 'LIO-01', name: 'أ. منصور الصاعدي', dept: 'إدارة التحول الرقمي' },
  { id: 'LIO-02', name: 'أ. خلود الحربي', dept: 'إدارة تقنية المعلومات' },
  { id: 'LIO-03', name: 'أ. فيصل الرشيدي', dept: 'الإدارة القانونية' },
];

const AVAILABLE_AUDITORS = [
  { id: 'AUD-101', name: 'م. سارة المولد' },
  { id: 'AUD-102', name: 'أ. فهد الحربي' },
  { id: 'AUD-103', name: 'أ. ريم القحطاني' },
  { id: 'AUD-200', name: 'شهد الحربي' },
];

const TaskDetailsView: React.FC<TaskDetailsViewProps> = ({
  task, userRole, docRequests, onBack, onAssign,
  onUpdateStatus, onAssignLiaison, onRequestDoc
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [showDocForm, setShowDocForm] = useState(false);
  const [docReq, setDocReq] = useState({ title: '', description: '', dueDate: '' });
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [finalReportUploaded, setFinalReportUploaded] = useState(true);
  const [finalReportApproved, setFinalReportApproved] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const isAuditor = userRole === UserRole.AUDITOR;
  const isDeptManager = userRole === UserRole.DEPT_MANAGER;
  const isGeneralDirector = userRole === UserRole.GENERAL_DIRECTOR;

  const currentLiaison = LIAISON_OFFICERS.find(l => l.id === task.liaisonId);
  const currentAuditor = AVAILABLE_AUDITORS.find(a => a.id === task.assignedTo);

  const tabs = [
    { id: 'summary', label: 'الملخص', icon: <Info size={16} /> },
    { id: 'requests', label: 'طلبات المستندات', icon: <FolderOpen size={16} /> },
    { id: 'notes', label: 'ملاحظات المراجعة', icon: <MessageSquarePlus size={16} /> },
    { id: 'attachments', label: 'المرفقات', icon: <Paperclip size={16} /> },
    { id: 'recommendations', label: 'التوصيات', icon: <ListChecks size={16} /> },
    { id: 'timeline', label: 'الخط الزمني', icon: <History size={16} /> },
  ];

  const handleStatusUpdate = (status: TaskStatus) => {
    if (!isAuditor) return;
    let progress = task.progress;
    if (status === TaskStatus.COMPLETED) progress = 100;
    if (status === TaskStatus.IN_PROGRESS && progress === 0) progress = 10;
    if (onUpdateStatus) onUpdateStatus(task.id, status, progress);
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuditor || !task.liaisonId) return;
    if (onRequestDoc) {
      onRequestDoc({ ...docReq, taskId: task.id });
      setShowDocForm(false);
      setDocReq({ title: '', description: '', dueDate: '' });
    }
  };

  const handleApproveFinalReport = () => {
    if (!isGeneralDirector || !finalReportUploaded || finalReportApproved) return;
    setShowApprovalModal(true);
  };

  const confirmApproval = () => {
    setFinalReportApproved(true);
    setShowApprovalModal(false);
  };

  const handleExportTimeline = () => {
    // Timeline data
    const timelineData = [
      { date: '2024-03-15 | 02:30 م', action: 'تم اعتماد التقرير النهائي', performer: 'مدير عام المراجعة الداخلية' },
      { date: '2024-03-14 | 11:15 ص', action: 'تم تحديث التقرير', performer: 'المراجع' },
      { date: '2024-03-13 | 03:45 م', action: 'تم الرد على ملاحظة المدير', performer: 'المراجع' },
      { date: '2024-03-12 | 09:20 ص', action: 'تم طلب مستندات إضافية', performer: 'المراجع' },
      { date: '2024-03-11 | 01:00 م', action: 'تمت إضافة ملاحظة جديدة من المدير', performer: 'مدير عام المراجعة الداخلية' },
      { date: '2024-03-10 | 10:30 ص', action: 'تم الاطلاع على المستندات من قبل مدير عام المراجعة الداخلية', performer: 'مدير عام المراجعة الداخلية' },
      { date: '2024-03-08 | 02:15 م', action: 'تم رفع مستندات داعمة', performer: 'المراجع' },
      { date: '2024-03-05 | 10:00 ص', action: 'بدء العمل الميداني والتدقيق', performer: 'المراجع' },
    ];

    // Create CSV content
    const headers = ['التاريخ والوقت', 'الإجراء', 'من قام بالإجراء'];
    const csvContent = [
      headers.join(','),
      ...timelineData.map(row => `"${row.date}","${row.action}","${row.performer}"`)
    ].join('\n');

    // Create and download file
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `timeline_${task.id}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'مكتملة';
      case TaskStatus.IN_PROGRESS: return 'قيد التنفيذ';
      case TaskStatus.DELAYED: return 'متأخرة';
      case TaskStatus.PENDING: return 'بانتظار الإسناد';
      case TaskStatus.PAUSED: return 'موقوفة مؤقتًا';
      default: return status;
    }
  };


  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT': return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black border border-blue-100">مرسل</span>;
      case 'IN_PROGRESS': return <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[9px] font-black border border-amber-100">قيد التجهيز</span>;
      case 'RECEIVED': return <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[9px] font-black border border-green-100">تم الاستلام</span>;
      default: return null;
    }
  };

  return (
    <div className="animate-fadeIn space-y-8 pb-20 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#008767] shadow-sm transition-all hover:bg-slate-50">
          <ArrowRight size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">تفاصيل المهمة الرقابية</h2>
          <p className="text-slate-400 text-sm font-bold flex items-center gap-2">رقم المرجعية: <span className="text-[#008767] font-black">#{task.id}</span></p>
        </div>


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">


          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-black transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-[#008767] text-white shadow-lg shadow-green-900/10'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#008767]'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 min-h-[500px]">
            {activeTab === 'summary' && (
              <div className="space-y-10 animate-fadeIn text-right">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div><p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-wider">نوع المراجعة</p><p className="text-sm font-black text-slate-800">{task.type}</p></div>
                  <div><p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-wider">الإدارة المعنية</p><p className="text-sm font-black text-slate-800">{task.department}</p></div>
                  <div><p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-wider">تاريخ التنفيذ</p><p className="text-sm font-black text-slate-800">{task.startDate}</p></div>
                  <div><p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-wider">الموعد النهائي</p><p className="text-sm font-black text-slate-800">{task.endDate}</p></div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Target size={18} className="text-[#008767]" /> النطاق والمستهدفات الرقابية
                  </h4>
                  <div className="bg-slate-50/50 p-8 rounded-[32px] text-[14px] font-bold text-slate-500 leading-relaxed border border-slate-100 shadow-inner">
                    {task.description}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-6 animate-fadeIn">
                {/* قسم التحكم العلوي للطلبات */}
                <div className="flex items-center justify-between bg-slate-50/80 p-6 rounded-[28px] border border-slate-100 shadow-sm">
                  <div>
                    <h4 className="text-lg font-black text-slate-800">إدارة طلبات المستندات</h4>
                    <p className="text-[11px] text-slate-400 font-bold">إجمالي الوثائق المطلوبة لهذه المهمة: {docRequests.length}</p>
                  </div>
                  {isAuditor && task.liaisonId && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDocForm(true)}
                        className="flex items-center gap-2 bg-[#008767] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all"
                      >
                        <PlusCircle size={16} />طلب مستند
                      </button>
                    </div>
                  )}
                  {isAuditor && !task.liaisonId && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-[10px] font-black border border-amber-100">
                      <AlertCircle size={14} /> يجب تعيين ضابط اتصال أولاً لتفعيل الطلبات
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  {docRequests.map(req => (
                    <div key={req.id} className="p-6 border border-slate-50 bg-slate-50/30 rounded-3xl flex items-center justify-between group hover:border-[#008767]/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-white rounded-2xl text-slate-400 shadow-sm"><FileText size={20} /></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-800">{req.title}</p>
                            {getDocStatusBadge(req.status)}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">تاريخ الاستحقاق: {req.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-300 hover:text-[#008767] transition-all"><Eye size={18} /></button>
                      </div>
                    </div>
                  ))}
                  {docRequests.length === 0 && (
                    <div className="p-20 text-center text-slate-300 flex flex-col items-center gap-4">
                      <FolderOpen size={48} className="opacity-10" />
                      <p className="font-bold text-sm">لا توجد طلبات مستندات حالية لهذه المهمة.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6 animate-fadeIn">
                <h4 className="text-md font-black text-slate-800 mb-2">ملاحظات ونتائج التدقيق الميداني</h4>
                <textarea
                  rows={10}
                  readOnly={!isAuditor}
                  className={`w-full bg-slate-50 border border-slate-100 rounded-[32px] p-8 text-sm font-bold text-slate-600 outline-none focus:border-[#008767] transition-all shadow-inner ${!isAuditor ? 'cursor-default' : ''}`}
                  placeholder={isAuditor ? "ابدأ بتدوين ملاحظاتك هنا..." : "لا توجد ملاحظات مسجلة."}
                ></textarea>
                {isAuditor && (
                  <div className="flex justify-end">
                    <button className="bg-[#008767] text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all">حفظ الملاحظات</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="space-y-6 animate-fadeIn">
                <h4 className="text-md font-black text-slate-800 mb-6">مرفقات ووثائق المهمة</h4>

                {/* Section 1: Final Audit Report */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-black text-slate-800">تقرير المراجعة النهائي</h5>
                          {finalReportApproved && (
                            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-[9px] font-black border border-green-200">
                              <CheckCircle2 size={12} /> معتمد
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">التقرير الرسمي الختامي للمهمة الرقابية</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAuditor && !finalReportApproved && (
                        <button
                          onClick={() => setFinalReportUploaded(true)}
                          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-100 transition-all border border-blue-100"
                        >
                          <Upload size={14} /> رفع التقرير
                        </button>
                      )}
                      {isGeneralDirector && finalReportUploaded && !finalReportApproved && (
                        <button
                          onClick={handleApproveFinalReport}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-green-700 transition-all shadow-md"
                        >
                          <CheckCircle2 size={14} /> اعتماد التقرير النهائي
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                    <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 font-bold text-xs">{finalReportUploaded ? 'تقرير_المراجعة_النهائي.pdf' : 'لم يتم رفع التقرير النهائي بعد'}</p>
                  </div>
                </div>

                {/* Section 2: Supporting Documents */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Paperclip size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-slate-800">المستندات الداعمة</h5>
                        <p className="text-[10px] text-slate-400 font-bold">الوثائق والمرفقات العامة للمهمة</p>
                      </div>
                    </div>
                    {isAuditor && (
                      <button className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-amber-100 transition-all border border-amber-100">
                        <Upload size={14} /> رفع مستند
                      </button>
                    )}
                  </div>
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                    <Paperclip size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 font-bold text-xs">لا توجد مستندات داعمة مرفقة</p>
                  </div>
                </div>

                {/* Section 3: Recommendation Supporting Documents */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <ListChecks size={20} className="text-green-600" />
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-slate-800">مستندات داعمة للتوصيات</h5>
                        <p className="text-[10px] text-slate-400 font-bold">الوثائق المرتبطة بالتوصيات والإجراءات التصحيحية</p>
                      </div>
                    </div>
                    {isAuditor && (
                      <button className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-green-100 transition-all border border-green-100">
                        <Upload size={14} /> رفع مستند
                      </button>
                    )}
                  </div>
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                    <ListChecks size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 font-bold text-xs">لا توجد مستندات داعمة للتوصيات</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-black text-slate-800">التوصيات والإجراءات التصحيحية</h5>
                  {isGeneralDirector && (
                    <button className="flex items-center gap-2 text-[#008767] font-black text-xs hover:underline transition-all">
                      <PlusCircle size={14} /> إضافة توصية
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-700">تحديث معايير أمن المعلومات والوصول السحابي</p>
                    <span className="text-[10px] font-black px-3 py-1 bg-blue-100 text-blue-600 rounded-full">مقترحة</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full" dir="rtl">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-right px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">التاريخ والوقت</th>
                        <th className="text-right px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">الإجراء</th>
                        <th className="text-right px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">من قام بالإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {/* Row 1: Final Report Approved */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">2024-03-15 | 02:30 م</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-600" />
                            تم اعتماد التقرير النهائي
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">مدير عام المراجعة الداخلية</td>
                      </tr>

                      {/* Row 2: Report Updated */}
                      <tr className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">2024-03-14 | 11:15 ص</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-blue-600" />
                            تم تحديث التقرير
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">المراجع</td>
                      </tr>

                      {/* Row 3: Response to Director's Note */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">2024-03-13 | 03:45 م</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800">
                          <div className="flex items-center gap-2">
                            <MessageSquarePlus size={16} className="text-purple-600" />
                            تم الرد على ملاحظة المدير
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">المراجع</td>
                      </tr>

                      {/* Row 4: Additional Documents Requested */}
                      <tr className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">2024-03-12 | 09:20 ص</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800">
                          <div className="flex items-center gap-2">
                            <Send size={16} className="text-orange-600" />
                            تم طلب مستندات إضافية
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">المراجع</td>
                      </tr>

                      {/* Row 5: Director Added Note */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">2024-03-11 | 01:00 م</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800">
                          <div className="flex items-center gap-2">
                            <MessageSquarePlus size={16} className="text-amber-600" />
                            تمت إضافة ملاحظة جديدة
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">مدير عام المراجعة الداخلية</td>
                      </tr>

                      {/* Row 6: Director Reviewed Documents */}
                      <tr className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">2024-03-10 | 10:30 ص</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800">
                          <div className="flex items-center gap-2">
                            <Eye size={16} className="text-indigo-600" />
                            تم الاطلاع على المستندات
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">مدير عام المراجعة الداخلية</td>
                      </tr>

                      {/* Row 7: Supporting Documents Uploaded */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">2024-03-08 | 02:15 م</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800">
                          <div className="flex items-center gap-2">
                            <Upload size={16} className="text-cyan-600" />
                            تم رفع مستندات داعمة
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">المراجع</td>
                      </tr>

                      {/* Row 8: Initial Event */}
                      <tr className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">2024-03-05 | 10:00 ص</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800">
                          <div className="flex items-center gap-2">
                            <Play size={16} className="text-[#008767]" />
                            بدء العمل الميداني والتدقيق
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">المراجع</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleExportTimeline}
                    className="flex items-center gap-2 bg-[#008767] text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all"
                  >
                    <Download size={16} />
                    تحميل التتبع الزمني
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Escalation Progress Bar */}
          {/* Escalation Progress Bar */}
          {(() => {
            const start = new Date(task.startDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Hardcoded to level 2 for demonstration
            const level: number = 2;

            const width = level === 0 ? '25%' : level === 1 ? '50%' : level === 2 ? '66%' : '100%';
            const color = level === 0 ? 'bg-emerald-500' : level === 1 ? 'bg-amber-400' : level === 2 ? 'bg-orange-500' : 'bg-red-500';

            // Time Remaining Logic
            const nextThreshold = (level + 1) * 5;
            const remaining = Math.max(0, nextThreshold - diffDays);

            let message = '';
            if (level === 0) message = `متبقي ${remaining} أيام على التصعيد الأول`;
            else if (level === 1) message = `متبقي ${remaining} أيام على التصعيد الثاني`;
            else if (level === 2) {
              if (remaining > 0) {
                message = `تم الوصول إلى التصعيد الثاني • متبقي ${remaining} أيام على التصعيد الثالث`;
              } else {
                message = 'تم الوصول إلى التصعيد الثاني';
              }
            }
            else message = 'تم الوصول إلى أعلى مستوى تصعيد';

            const colorText = level === 0 ? 'text-emerald-600' : level === 1 ? 'text-amber-600' : level === 2 ? 'text-orange-600' : 'text-red-600';

            return (
              <div className="w-full">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-visible relative" title={`حالة التصعيد: مستوى ${level}`}>
                  <div className={`h-full rounded-full ${color} transition-all duration-1000 relative`} style={{ width }}>
                    {/* Circular marker at the end of filled portion */}
                    <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${color} border-2 border-white shadow-md`}></div>
                  </div>
                </div>
                <p className={`text-[10px] font-black mt-2 text-right ${colorText} transition-colors`}>{message}</p>
              </div>
            );
          })()}
          {/* Dept Manager - Assignment */}
          {isDeptManager && (
            <div className="bg-white p-8 rounded-[32px] border border-[#008767]/20 shadow-md shadow-green-900/5 space-y-4">
              <h4 className="text-sm font-black text-[#008767] flex items-center gap-2">
                <UserPlus size={18} /> إسناد المهمة لمراجع
              </h4>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed">قم باختيار المراجع المناسب لتنفيذ هذه المهمة الرقابية.</p>
              <div className="relative">
                <select
                  value={task.assignedTo || ""}
                  onChange={(e) => {
                    onAssign(task.id, e.target.value);
                    setAssignmentSuccess(true);
                    setTimeout(() => setAssignmentSuccess(false), 3000);
                  }}
                  className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-4 pl-10 text-xs font-black text-slate-700 outline-none focus:border-[#008767]"
                >
                  <option value="" disabled>-- اختر المراجع --</option>
                  {AVAILABLE_AUDITORS.map(auditor => (
                    <option key={auditor.id} value={auditor.id}>{auditor.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
              {assignmentSuccess && <p className="text-[10px] font-black text-green-600 text-center animate-pulse">تم إسناد المهمة بنجاح</p>}
            </div>
          )}

          {/* General Director - Simple Pause/Resume Button */}
          {isGeneralDirector && (
            <button
              onClick={() => {
                if (task.status === TaskStatus.PAUSED) {
                  // Resume task
                  if (onUpdateStatus) {
                    onUpdateStatus(task.id, TaskStatus.IN_PROGRESS, task.progress);
                  }
                } else {
                  // Pause immediately without dialog
                  if (onUpdateStatus) {
                    onUpdateStatus(task.id, TaskStatus.PAUSED, task.progress);
                  }
                }
              }}
              disabled={task.status === TaskStatus.COMPLETED}
              className="w-full bg-slate-100 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
            >
              {task.status === TaskStatus.PAUSED ? (
                <>
                  <Play size={14} />
                  استئناف
                </>
              ) : (
                <>
                  <Pause size={14} />
                  إيقاف مؤقت
                </>
              )}
            </button>
          )}

          {/* Assigned Reviewer Display */}
          {currentAuditor && (
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <UserCheck size={18} className="text-[#008767]" /> المراجع
              </h4>


              <div className="w-full px-4 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-black border border-emerald-100 text-center">
                شهد الحربي
              </div>
            </div>
          )}

          {/* Liaison Assignment Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-[#008767]" /> ضابط اتصال الإدارة
            </h4>

            {isAuditor ? (
              <>
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">يجب تعيين ضابط اتصال لتفعيل طلبات المستندات.</p>
                <div className="relative">
                  <select
                    value={task.liaisonId || ""}
                    onChange={(e) => onAssignLiaison?.(task.id, e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-4 pl-10 text-xs font-black text-slate-700 outline-none focus:border-[#008767] shadow-sm transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- إسناد ضابط اتصال --</option>
                    {LIAISON_OFFICERS.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </>
            ) : (
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed">ضابط الاتصال المعني بمتابعة الطلبات:</p>
            )}

            {currentLiaison && (
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-3xl flex items-center gap-3 animate-fadeIn">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-700 text-xs shadow-inner">{currentLiaison.name.charAt(0)}</div>
                <div className="text-right">
                  <p className="text-[12px] font-black text-blue-800">{currentLiaison.name}</p>
                  <span className="text-[10px] font-bold text-blue-500">{currentLiaison.dept}</span>
                </div>
              </div>
            )}
          </div>

          {/* Execution Progress */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-[#008767]" /> حالة المهمة
              </h4>
              <span className={`px-4 py-1.5 rounded-full text-[11px] font-black ${task.status === TaskStatus.COMPLETED ? 'bg-green-50 text-green-700' :
                task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {getStatusText(task.status)}
              </span>
            </div>

            {isAuditor && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusUpdate(TaskStatus.IN_PROGRESS)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all ${task.status === TaskStatus.IN_PROGRESS
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600'
                    }`}
                >
                  <Clock size={14} /> قيد التنفيذ
                </button>
                <button
                  onClick={() => handleStatusUpdate(TaskStatus.COMPLETED)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all ${task.status === TaskStatus.COMPLETED
                    ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-900/10'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-green-200 hover:text-green-600'
                    }`}
                >
                  <CheckCircle2 size={14} /> اكتمال
                </button>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                <span>نسبة الإنجاز</span>
                <span className="text-slate-800">{task.progress}%</span>
              </div>
              <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${task.progress === 100 ? 'bg-green-500' : 'bg-[#008767]'}`}
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Document Request Modal (Full Form) */}
      {showDocForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[600px] overflow-hidden animate-slideUp">
            <div className="bg-[#008767] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Send size={20} className="rotate-180" />
                <h3 className="text-lg font-black"> طلب مستند </h3>
              </div>
              <button onClick={() => setShowDocForm(false)} className="hover:rotate-90 transition-all bg-white/10 p-2 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleDocSubmit} className="p-8 space-y-4 text-right">
              <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 flex items-center gap-4 mb-2 shadow-inner">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Users size={20} /></div>
                <div>
                  <span className="text-[10px] font-black opacity-60 block uppercase tracking-widest">المستلم الرئيسي</span>
                  <span className="text-sm font-black">{currentLiaison?.name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">مسمى الوثيقة المطلوبة</label>
                <input type="text" required value={docReq.title} onChange={e => setDocReq({ ...docReq, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm shadow-inner transition-all" placeholder="ادخل مسمى المستند المطلوب..." />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">موعد التسليم الأقصى</label>
                <input type="date" required value={docReq.dueDate} onChange={e => setDocReq({ ...docReq, dueDate: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm shadow-inner transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">التفاصيل / المبررات</label>
                <textarea rows={5} value={docReq.description} onChange={e => setDocReq({ ...docReq, description: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm resize-none shadow-inner transition-all" placeholder="يرجى تزويدنا بكافة الملفات المتعلقة بـ..."></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#008767] text-white py-3 rounded-2xl text-sm font-black shadow-lg shadow-green-900/20 hover:bg-[#00664d] hover:scale-[1.02] active:scale-95 transition-all">إرسال الطلب</button>
                <button type="button" onClick={() => setShowDocForm(false)} className="px-8 py-3 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={(e) => {
          if (e.target === e.currentTarget) setShowApprovalModal(false);
        }}>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[500px] overflow-hidden animate-slideUp">
            <div className="bg-[#008767] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert size={20} />
                <h3 className="text-lg font-black">تأكيد اعتماد التقرير</h3>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="hover:rotate-90 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6 text-right" dir="rtl">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                <AlertCircle size={24} className="text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-black text-slate-800 mb-2">هل أنت متأكد من اعتماد التقرير النهائي؟</p>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    بعد الاعتماد لن يمكن استبدال التقرير أو تعديله. سيتم قفل المستند بشكل نهائي.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={confirmApproval}
                  className="flex-1 bg-green-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  اعتماد التقرير
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TaskDetailsView;
