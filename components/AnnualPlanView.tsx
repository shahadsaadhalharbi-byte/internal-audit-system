
import React, { useState, useMemo } from 'react';
import { AuditTask, User, UserRole, AnnualPlan } from '../types';
import {
  FileText, Download, CheckCircle2,
  ArrowRight, MessageSquare, ChevronDown, ListChecks,
  Trash2, Edit3, LayoutGrid, Clock, Send, Activity, Plus, Filter, FileEdit, XCircle, RefreshCw, X, ShieldCheck, Target, List
} from 'lucide-react';

interface AuditProgram {
  id: string;
  title: string;
  objective: string;
  duration: string;
  priority: 'عالية' | 'متوسطة' | 'منخفضة';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

interface AnnualPlanViewProps {
  tasks: AuditTask[];
  user: User;
}

const INITIAL_PROGRAMS: Record<string, AuditProgram[]> = {
  'P1': [
    { id: 'PROG-1', title: 'مراجعة المشتريات والعقود', objective: 'التأكد من سلامة إجراءات الترسية والتعاقد', duration: '4 أسابيع', priority: 'عالية', quarter: 'Q1' },
    { id: 'PROG-2', title: 'فحص جرد المستودعات', objective: 'التحقق من مطابقة الجرد الفعلي للسجلات النظامية', duration: '3 أسابيع', priority: 'متوسطة', quarter: 'Q2' },
    { id: 'PROG-3', title: 'تدقيق المصروفات التشغيلية', objective: 'تقييم كفاءة الإنفاق ومطابقته للميزانية المعتمدة', duration: '6 أسابيع', priority: 'عالية', quarter: 'Q1' },
  ]
};

const AnnualPlanView: React.FC<AnnualPlanViewProps> = ({ tasks, user }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState<string>('الكل');
  const [statusFilter, setStatusFilter] = useState<string>('الكل');
  const [showAddPlanForm, setShowAddPlanForm] = useState(false);
  const [showAddProgramForm, setShowAddProgramForm] = useState(false);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  const [allPlans, setAllPlans] = useState<AnnualPlan[]>([
    { id: 'P1', year: 1446, status: 'APPROVED', tasksCount: 24, coverage: 'نطاق كامل', date: '2024-03-01', department: 'إدارة التحول الرقمي' },
    { id: 'P2', year: 1446, status: 'APPROVED', tasksCount: 15, coverage: 'نطاق تشغيلي', date: '2024-02-15', department: 'إدارة الموارد البشرية' },
    { id: 'P5', year: 1446, status: 'UNDER_REVIEW', tasksCount: 32, coverage: 'نطاق بيئي شامل', date: '2024-03-05', department: 'إدارة الرقابة الصحية' },
    { id: 'P7', year: 1446, status: 'UNDER_REVIEW', tasksCount: 14, coverage: 'نطاق أمن المعلومات', date: '2024-03-08', department: 'إدارة تقنية المعلومات' },
    { id: 'P10', year: 1446, status: 'DRAFT', tasksCount: 11, coverage: 'نطاق الصيانة الوقائية', date: '2024-03-10', department: 'إدارة الصيانة' }
  ]);

  const [planPrograms, setPlanPrograms] = useState<Record<string, AuditProgram[]>>(INITIAL_PROGRAMS);

  const [newPlan, setNewPlan] = useState<{
    year: number;
    department: string;
    coverage: string;
    title: string;
    file: File | null;
  }>({ year: 1446, department: '', coverage: '', title: '', file: null });
  const [newProgram, setNewProgram] = useState<Partial<AuditProgram>>({
    title: '', objective: '', duration: '', priority: 'متوسطة', quarter: 'Q1'
  });

  const isGeneralDirector = user.role === UserRole.GENERAL_DIRECTOR;
  const isDeptManager = user.role === UserRole.DEPT_MANAGER;
  const isDataEntry = user.role === UserRole.DATA_ENTRY;

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const plan: AnnualPlan = {
      id: `P${Date.now()}`,
      year: newPlan.year,
      status: 'DRAFT',
      tasksCount: 0,
      department: newPlan.department,
      coverage: newPlan.coverage,
      date: new Date().toISOString().split('T')[0],
      title: newPlan.title,
      documentUrl: newPlan.file ? URL.createObjectURL(newPlan.file) : undefined
    };
    setAllPlans([plan, ...allPlans]);
    setShowAddPlanForm(false);
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    const program: AuditProgram = {
      id: `PROG-${Date.now()}`,
      title: newProgram.title || '',
      objective: newProgram.objective || '',
      duration: newProgram.duration || '',
      priority: newProgram.priority as any || 'متوسطة',
      quarter: newProgram.quarter as any || 'Q1'
    };

    setPlanPrograms(prev => ({
      ...prev,
      [selectedPlanId]: [...(prev[selectedPlanId] || []), program]
    }));

    setAllPlans(prev => prev.map(p => p.id === selectedPlanId ? { ...p, tasksCount: (p.tasksCount || 0) + 1 } : p));

    setShowAddProgramForm(false);
    setNewProgram({ title: '', objective: '', duration: '', priority: 'متوسطة', quarter: 'Q1' });
  };

  const handleDeleteProgram = (planId: string, programId: string) => {
    setPlanPrograms(prev => ({
      ...prev,
      [planId]: prev[planId].filter(p => p.id !== programId)
    }));
    setAllPlans(prev => prev.map(p => p.id === planId ? { ...p, tasksCount: Math.max(0, (p.tasksCount || 0) - 1) } : p));
  };

  const displayedPlans = useMemo(() => {
    if (isDeptManager) {
      return allPlans.filter(plan =>
        plan.department === user.department && plan.status === 'APPROVED'
      );
    }
    return allPlans.filter(plan => {
      const matchesDept = deptFilter === 'الكل' || plan.department === deptFilter;
      const matchesStatus = statusFilter === 'الكل' || plan.status === statusFilter;
      return matchesDept && matchesStatus;
    });
  }, [deptFilter, statusFilter, isGeneralDirector, isDeptManager, isDataEntry, user.department, allPlans]);

  const currentPlan = useMemo(() => {
    if (selectedPlanId?.startsWith('GLOBAL_')) {
      const year = parseInt(selectedPlanId.split('_')[1]);
      return {
        id: selectedPlanId,
        year,
        title: `خطة المراجعة السنوية لعام ${year}هـ`,
        status: 'APPROVED',
        department: '', // Hidden in view
        coverage: 'شامل',
        tasksCount: 0,
        date: new Date().toISOString().split('T')[0]
      } as AnnualPlan;
    }
    return allPlans.find(p => p.id === selectedPlanId);
  }, [allPlans, selectedPlanId]);

  const currentPrograms = useMemo(() => {
    if (selectedPlanId?.startsWith('GLOBAL_')) {
      const year = parseInt(selectedPlanId.split('_')[1]);
      const plansForYear = allPlans.filter(p => p.year === year);
      let allProgs: AuditProgram[] = [];
      plansForYear.forEach(p => {
        if (planPrograms[p.id]) {
          allProgs = allProgs.concat(planPrograms[p.id]);
        }
      });
      return allProgs;
    }
    return selectedPlanId ? planPrograms[selectedPlanId] || [] : [];
  }, [planPrograms, selectedPlanId, allPlans]);

  const isGlobalView = selectedPlanId?.startsWith('GLOBAL_');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1.5"><CheckCircle2 size={14} /> معتمدة</span>;
      case 'UNDER_REVIEW': return <span className="bg-[#fff4d6] text-[#b38600] px-4 py-2 rounded-2xl text-[12px] font-black flex items-center gap-2 shadow-sm border border-[#ffeeba]"><RefreshCw size={14} className="animate-spin-slow" /> قيد المراجعة</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1.5"><XCircle size={14} /> مرفوضة</span>;
      case 'DRAFT': return <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1.5"><FileEdit size={14} /> مسودة</span>;
      default: return null;
    }
  };

  const renderDetailView = () => {
    if (!currentPlan) return null;

    return (
      <div className="space-y-8 animate-slideUp">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <button onClick={() => setSelectedPlanId(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-[#008767] rounded-2xl transition-all">
              <ArrowRight size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black text-slate-800">
                  {currentPlan.title || `خطة المراجعة السنوية لعام ${currentPlan.year}هـ`}
                </h3>
                {getStatusBadge(currentPlan.status)}
              </div>
              {!isGlobalView && (
                <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                  <ShieldCheck size={16} /> {currentPlan.department} • {currentPlan.coverage}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {isDataEntry && currentPlan.status === 'DRAFT' && (
              <button className="flex items-center gap-2 px-6 py-3 bg-[#008767] text-white rounded-2xl text-xs font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all">
                إرسال للمراجعة <Send size={16} className="rotate-180" />
              </button>
            )}
            <button
              onClick={() => currentPlan.documentUrl && window.open(currentPlan.documentUrl, '_blank')}
              disabled={!currentPlan.documentUrl}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all ${currentPlan.documentUrl
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'
                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                }`}
            >
              <Download size={18} /> {currentPlan.documentUrl ? 'عرض ملف الخطة' : 'لا يوجد ملف'}
            </button>
          </div>
        </div>

        {!isGlobalView && !isDataEntry && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4 text-[#008767]">
                <div className="p-3 bg-green-50 rounded-2xl"><List size={20} /></div>
                <h4 className="font-black text-sm text-slate-800">إجمالي المهام</h4>
              </div>
              <p className="text-3xl font-black text-slate-800">{currentPrograms.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4 text-blue-600">
                <div className="p-3 bg-blue-50 rounded-2xl"><LayoutGrid size={20} /></div>
                <h4 className="font-black text-sm text-slate-800">الأرباع المغطاة</h4>
              </div>
              <p className="text-3xl font-black text-slate-800">
                {new Set(currentPrograms.map(p => p.quarter)).size} / 4
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4 text-red-600">
                <div className="p-3 bg-red-50 rounded-2xl"><Target size={20} /></div>
                <h4 className="font-black text-sm text-slate-800">أولوية عالية</h4>
              </div>
              <p className="text-3xl font-black text-slate-800">
                {currentPrograms.filter(p => p.priority === 'عالية').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4 text-amber-600">
                <div className="p-3 bg-amber-50 rounded-2xl"><Clock size={20} /></div>
                <h4 className="font-black text-sm text-slate-800">متوسط التنفيذ</h4>
              </div>
            </div>
          </div>
        )}

        {
          !isGlobalView && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h4 className="text-lg font-black text-slate-800 flex items-center gap-3">
                  <FileText size={20} className="text-[#008767]" /> المهام التفصيلية
                </h4>
                {isDataEntry && currentPlan.status === 'DRAFT' && (
                  <button
                    onClick={() => setShowAddProgramForm(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#008767] text-white rounded-xl text-xs font-black hover:bg-[#00664d] shadow-lg shadow-green-900/10 transition-all"
                  >
                    <Plus size={16} /> إضافة مهام
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50/50">
                    <tr className="text-slate-400 font-black text-[11px] uppercase tracking-wider">
                      <th className="px-8 py-5">الموضوع الرقابي</th>
                      <th className="px-8 py-5 text-center">الربع</th>
                      <th className="px-8 py-5">الهدف الاستراتيجي</th>
                      <th className="px-8 py-5">المدة</th>
                      <th className="px-8 py-5">الأولوية</th>
                      {isDataEntry && currentPlan.status === 'DRAFT' && <th className="px-8 py-5 text-center">إدارة</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentPrograms.map(prog => (
                      <tr key={prog.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-800 text-sm">{prog.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">ID: {prog.id}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-black">{prog.quarter}</span>
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-500 font-bold max-w-[250px] leading-relaxed">{prog.objective}</td>
                        <td className="px-8 py-6 text-xs text-slate-400 font-bold">{prog.duration}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${prog.priority === 'عالية' ? 'bg-red-50 text-red-600 border border-red-100' :
                            prog.priority === 'متوسطة' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>{prog.priority}</span>
                        </td>
                        {isDataEntry && currentPlan.status === 'DRAFT' && (
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-2 text-slate-300 hover:text-[#008767] transition-all"><Edit3 size={16} /></button>
                              <button
                                onClick={() => handleDeleteProgram(currentPlan.id, prog.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        {!isGlobalView && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h4 className="text-md font-black text-slate-800 mb-6 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#008767]" /> ملاحظات وتوجيهات الإدارة
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4 items-start p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-[#008767] text-white rounded-xl flex items-center justify-center font-black text-xs shadow-sm">م</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-black text-slate-800">المدير العام للمراجعة</p>
                      <span className="text-[9px] font-black text-slate-300">منذ يومين</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed italic">"يرجى التأكد من شمولية الخطة لكافة مخاطر التحول الرقمي الجديدة لعام 1446هـ."</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h4 className="text-md font-black text-slate-800 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-[#008767]" /> المسار الإجرائي للخطة
              </h4>
              <div className="relative border-r-[2px] border-slate-100 mr-2 my-2 space-y-8">
                <div className="relative pr-8">
                  <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-[#008767] ring-4 ring-white shadow-sm"></div>
                  <div>
                    <p className="text-xs font-black text-slate-800">إنشاء مسودة الخطة</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">بواسطة: {user.name} | {currentPlan.date}</p>
                  </div>
                </div>

                <div className="relative pr-8 opacity-50">
                  <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white"></div>
                  <div>
                    <p className="text-xs font-black text-slate-800">مراجعة الإدارة العامة</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">قيد الانتظار</p>
                  </div>
                </div>

                <div className="relative pr-8 opacity-50">
                  <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white"></div>
                  <div>
                    <p className="text-xs font-black text-slate-800">الاعتماد النهائي</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">لم يبدأ بعد</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div >
    );
  };

  const renderGeneralDirectorView = () => {
    // Group plans by Year
    const plansByYear = displayedPlans.reduce((acc, plan) => {
      const y = plan.year;
      if (!acc[y]) acc[y] = [];
      acc[y].push(plan);
      return acc;
    }, {} as Record<number, AnnualPlan[]>);

    return (
      <div className="space-y-6">
        {Object.entries(plansByYear).map(([yearStr, rawPlans]) => {
          const plans = rawPlans as AnnualPlan[];
          const year = parseInt(yearStr);
          const isExpanded = expandedYear === year;
          const totalTasks = plans.reduce((sum, p) => sum + (p.tasksCount || 0), 0);

          return (
            <div key={year} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden transition-all shadow-sm hover:shadow-md">
              {/* Main Annual Plan Card Header */}
              <div
                onClick={() => setExpandedYear(isExpanded ? null : year)}
                className="p-6 cursor-pointer hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 border-r-[6px] border-r-[#008767]"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#008767]/10 flex items-center justify-center text-[#008767] shadow-inner">
                    <ListChecks size={32} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-800">خطة المراجعة السنوية {year}هـ</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">السنة المالية: {year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left md:text-right ml-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase">إجمالي المهام</p>
                    <p className="text-lg font-black text-slate-800">{totalTasks}</p>
                  </div>

                  {isGeneralDirector && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanId(`GLOBAL_${year}`);
                      }}
                      className="bg-[#008767] text-white px-6 py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all flex items-center gap-2"
                    >
                      <FileText size={16} /> عرض الخطة الإجمالية
                    </button>
                  )}

                  <ChevronDown size={24} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/30 p-8 space-y-4 animate-slideDown">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#008767] rounded-full"></div>
                    <h4 className="font-black text-slate-700 text-sm">الخطط التشغيلية للإدارات</h4>
                  </div>

                  {plans.map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all border-r-[6px] border-r-slate-200 hover:border-r-[#008767] group cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#008767] group-hover:bg-[#008767]/10 transition-colors shadow-inner">
                          <FileText size={28} />
                        </div>
                        <div>
                          <h3 className="font-black text-base text-slate-800">{plan.department}</h3>
                          <p className="text-[11px] text-slate-400 font-bold mt-1 flex items-center gap-2">
                            <ShieldCheck size={14} /> {plan.coverage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left md:text-right ml-4">
                          <p className="text-[10px] font-black text-slate-300 uppercase">المهام</p>
                          <p className="text-base font-black text-slate-800">{plan.tasksCount || 0}</p>
                        </div>
                        {getStatusBadge(plan.status)}
                        <button className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-[#008767] hover:text-white transition-all">
                          عرض
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {selectedPlanId ? renderDetailView() : (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-end gap-4">
            <div className="flex flex-wrap gap-3">
              {isDataEntry && (
                <button
                  onClick={() => setShowAddPlanForm(true)}
                  className="flex items-center gap-2 bg-[#008767] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all"
                >
                  <Plus size={18} />
                  إنشاء هيكل خطة جديد
                </button>
              )}

              {!isDeptManager && (
                <div className="relative min-w-[180px]">
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-2xl py-3 pr-10 pl-4 text-xs font-black text-slate-700 outline-none focus:border-[#008767] shadow-sm transition-all"
                  >
                    <option value="الكل">جميع الإدارات</option>
                    {Array.from(new Set(allPlans.map(p => p.department))).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(isGeneralDirector || isDataEntry) ? renderGeneralDirectorView() : displayedPlans.map((plan) => (
              <div key={plan.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all border-r-[6px] border-r-[#008767]">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-[#008767] shadow-inner">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-800">خطة المراجعة السنوية {plan.year}هـ</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-2">
                      <ShieldCheck size={14} /> {plan.department} • <Target size={14} /> {plan.coverage}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left md:text-right ml-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase">البرامج المدرجة</p>
                    <p className="text-lg font-black text-slate-800">{plan.tasksCount || 0}</p>
                  </div>
                  {getStatusBadge(plan.status)}
                  <button onClick={() => setSelectedPlanId(plan.id)} className="bg-[#008767] text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAddPlanForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[500px] overflow-hidden animate-slideUp">
            <div className="bg-[#008767] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <h3 className="text-lg font-black">إنشاء هيكل خطة جديدة</h3>
              </div>
              <button onClick={() => setShowAddPlanForm(false)} className="hover:rotate-90 transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreatePlan} className="p-8 space-y-6 text-right">
              <div>
                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">اسم الخطة</label>
                <input type="text" required value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm" placeholder="مثلاً: خطة المراجعة السنوية 2024" />
              </div>

              <div className="relative">
                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">ملف الخطة (PDF)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setNewPlan({ ...newPlan, file: e.target.files ? e.target.files[0] : null })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#008767] file:text-white hover:file:bg-[#00664d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">الإدارة المعنية</label>
                <input type="text" required value={newPlan.department} onChange={e => setNewPlan({ ...newPlan, department: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm" placeholder="مثلاً: إدارة تقنية المعلومات" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">النطاق الرقابي العام</label>
                <input type="text" required value={newPlan.coverage} onChange={e => setNewPlan({ ...newPlan, coverage: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm" placeholder="مثلاً: نطاق أمن البيانات والخصوصية" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-[#008767] text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all">تأكيد وحفظ كمسودة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddProgramForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[650px] overflow-hidden animate-slideUp">
            <div className="bg-[#008767] p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plus size={24} />
                <h3 className="text-xl font-black">إضافة مهمة للجدول</h3>
              </div>
              <button onClick={() => setShowAddProgramForm(false)} className="hover:rotate-90 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddProgram} className="p-10 space-y-6 text-right max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">موضوع المهمة الرقابية</label>
                  <input type="text" required value={newProgram.title} onChange={e => setNewProgram({ ...newProgram, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 outline-none focus:border-[#008767] font-bold text-sm shadow-inner" placeholder="اسم المهمة (مثلاً: مراجعة أنظمة الدفع)" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">الربع السنوي المستهدف</label>
                  <select required value={newProgram.quarter} onChange={e => setNewProgram({ ...newProgram, quarter: e.target.value as any })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 outline-none focus:border-[#008767] font-bold text-sm cursor-pointer shadow-inner">
                    <option value="Q1">الربع الأول (Q1)</option>
                    <option value="Q2">الربع الثاني (Q2)</option>
                    <option value="Q3">الربع الثالث (Q3)</option>
                    <option value="Q4">الربع الرابع (Q4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">أولوية المهمة</label>
                  <select required value={newProgram.priority} onChange={e => setNewProgram({ ...newProgram, priority: e.target.value as any })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 outline-none focus:border-[#008767] font-bold text-sm cursor-pointer shadow-inner">
                    <option value="منخفضة">منخفضة</option>
                    <option value="متوسطة">متوسطة</option>
                    <option value="عالية">عالية</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button type="submit" className="flex-1 bg-[#008767] text-white py-4 rounded-[20px] text-sm font-black shadow-xl shadow-green-900/10 hover:bg-[#00664d] hover:scale-[1.02] active:scale-95 transition-all">إدراج المهمة في الجدول</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualPlanView;
