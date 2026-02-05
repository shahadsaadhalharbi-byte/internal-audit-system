
import React from 'react';
import { User, AuditTask, TaskStatus, UserRole, AnnualPlan } from '../types';
import {
  TrendingUp, CheckCircle, Clock, AlertTriangle,
  CheckCircle2, ShieldAlert,
  FileText, ListChecks, Flag, ArrowLeftRight,
  ChevronLeft, LayoutGrid, ClipboardList, Timer,
  ExternalLink,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';
import { DEPARTMENTS } from '../constants';

interface DashboardProps {
  tasks: AuditTask[];
  user: User;
}

const MOCK_PLANS: AnnualPlan[] = [
  { id: 'P1', year: 1446, status: 'APPROVED', tasksCount: 24, coverage: 'نطاق كامل', date: '2024-03-01', department: 'إدارة التحول الرقمي' },
  { id: 'P2', year: 1446, status: 'APPROVED', tasksCount: 15, coverage: 'نطاق تشغيلي', date: '2024-02-15', department: 'إدارة الموارد البشرية' },
  { id: 'P5', year: 1446, status: 'UNDER_REVIEW', tasksCount: 32, coverage: 'نطاق بيئي شامل', date: '2024-03-05', department: 'إدارة الرقابة الصحية' },
  { id: 'P10', year: 1446, status: 'DRAFT', tasksCount: 11, coverage: 'نطاق الصيانة', date: '2024-03-10', department: 'إدارة الصيانة' }
];

const Dashboard: React.FC<DashboardProps> = ({ tasks, user }) => {
  const isGeneralDirector = user.role === UserRole.GENERAL_DIRECTOR;
  const isAuditor = user.role === UserRole.AUDITOR;

  const [expanded, setExpanded] = React.useState(false);

  // Initialize selectedDept: General Director defaults to 'ALL', others to their own department
  const [selectedDept, setSelectedDept] = React.useState<string>(
    isGeneralDirector ? 'ALL' : (user.department || 'ALL')
  );

  // Filter Tasks
  const filteredTasks = tasks.filter(t =>
    selectedDept === 'ALL' ? true : t.department === selectedDept
  );

  // Filter Plans (Mock Data)
  const filteredPlans = MOCK_PLANS.filter(p =>
    selectedDept === 'ALL' ? true : p.department === selectedDept
  );

  const pendingPlans = filteredPlans.filter(p => p.status === 'UNDER_REVIEW');

  const stats = [
    {
      label: isGeneralDirector && selectedDept === 'ALL' ? 'إجمالي الخطط' : 'المهام المرتبطة بالخطة',
      value: isGeneralDirector && selectedDept === 'ALL' ? filteredPlans.length : filteredTasks.length,
      icon: <LayoutGrid size={22} className="text-[#008767]" />,
      color: 'bg-green-50'
    },
    {
      label: 'المهام الجارية',
      value: filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      icon: <Clock size={22} className="text-blue-600" />,
      color: 'bg-blue-50'
    },
    {
      label: 'المهام المكتملة',
      value: filteredTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      icon: <CheckCircle size={22} className="text-emerald-600" />,
      color: 'bg-emerald-50'
    },
    {
      label: 'المهام المتأخرة',
      value: filteredTasks.filter(t => t.status === TaskStatus.DELAYED).length,
      icon: <AlertTriangle size={22} className="text-red-600" />,
      color: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-10 animate-fadeIn text-right" dir="rtl">
      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">لوحة التحكم والمؤشرات</h2>
          <p className="text-slate-400 text-xs font-bold mt-1">
            {selectedDept === 'ALL' ? 'نظرة عامة على أداء كافة الإدارات' : `مؤشرات الأداء - ${selectedDept}`}
          </p>
        </div>

        {isGeneralDirector && (
          <div className="relative min-w-[220px] bg-white rounded-xl border border-slate-200 shadow-sm">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full appearance-none bg-transparent py-3 pr-10 pl-4 text-xs font-black text-slate-700 outline-none cursor-pointer"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d === 'جميع الإدارات' ? 'ALL' : d}>{d}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-start text-right relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mb-6 shadow-inner`}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-[12px] font-black mb-1 uppercase tracking-tight">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">

        {/* Section 1: Dynamic Central Box */}
        {isGeneralDirector ? (
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                  <Clock size={20} className="text-amber-500" /> خطط سنوية بانتظار الاعتماد
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">يرجى مراجعة البرامج الرقابية المرفوعة من الإدارات لاعتمادها نهائياً.</p>
              </div>
              <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-[11px] font-black border border-amber-100">{pendingPlans.length} طلبات معلقة</span>
            </div>
            <div className="divide-y divide-slate-50">
              {pendingPlans.map((plan) => (
                <div key={plan.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="font-black text-[16px] text-slate-800">خطة المراجعة لعام {plan.year}هـ - {plan.department}</p>
                      <p className="text-[12px] text-slate-400 font-bold mt-1">تاريخ الرفع: {plan.date} | عدد البرامج: {plan.tasksCount} برنامج</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="bg-[#008767] text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all">
                      مراجعة واعتماد
                    </button>
                  </div>
                </div>
              ))}
              {pendingPlans.length === 0 && (
                <div className="p-20 text-center text-slate-300 font-bold flex flex-col items-center gap-4">
                  <CheckCircle2 size={48} className="opacity-10" />
                  <p>لا توجد خطط بانتظار الاعتماد حالياً.</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <ClipboardList size={20} className="text-[#008767]" /> آخر المهام المسندة
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredTasks.slice(0, 3).map((task, idx) => (
                <div key={idx} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#008767]">
                      <Flag size={20} />
                    </div>
                    <div>
                      <p className="font-black text-[15px] text-slate-800">{task.title}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-1">رقم المهمة: #{task.id} | الإدارة: {task.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 text-[10px] font-black rounded-full border ${task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                      {task.status}
                    </span>
                    <ChevronLeft size={18} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isGeneralDirector && (
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-slideUp">
            <div className="p-8 border-b border-slate-50 bg-slate-50/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <LayoutGrid size={24} className="text-[#008767]" /> تتبع سير الخطط والبرامج الرقابية
                </h3>
                <p className="text-[12px] text-slate-400 font-bold mt-1">ملخص شامل لحالة كل خطة، سير الإجراءات، وتوزيع المهام داخلها.</p>
              </div>
              <button className="text-[#008767] font-black text-xs flex items-center gap-2 hover:underline">
                عرض التقارير التفصيلية <ExternalLink size={14} />
              </button>
            </div>

            <div className="p-6">
              {/* Annual Plan Accordion Card */}
              <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
                <div
                  onClick={() => setExpanded(!expanded)}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {/* Title & Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#008767] shadow-inner">
                      <Target size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">الخطة السنوية لعام 1446هـ</h3>
                      <p className="text-xs text-slate-400 font-bold mt-1">
                        إجمالي المهام: {filteredTasks.length} | التغطية: {filteredPlans.length} إدارات
                      </p>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="flex items-center gap-8">
                    {/* Overall Progress */}
                    <div className="hidden md:flex flex-col items-end gap-1.5 min-w-[200px]">
                      <div className="w-full flex justify-between text-[11px] font-black text-slate-400 mb-1">
                        <span>نسبة الإنجاز العام</span>
                        <span className="text-[#008767]">{Math.round((filteredTasks.filter(t => t.status === 'COMPLETED').length / (filteredTasks.length || 1)) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#008767] rounded-full transition-all duration-1000"
                          style={{ width: `${Math.round((filteredTasks.filter(t => t.status === 'COMPLETED').length / (filteredTasks.length || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Expanded Departments List */}
                {expanded && (
                  <div className="border-t border-slate-100 bg-slate-50/30 p-4 space-y-3 animate-slideDown">
                    {filteredPlans.map(plan => (
                      <div key={plan.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-[#008767]/30 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">

                        <div className="flex items-center gap-4 min-w-[250px]">
                          <div className="w-2 h-10 bg-slate-200 rounded-full group-hover:bg-[#008767] transition-colors"></div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{plan.department}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">عدد المهام: {plan.tasksCount}</p>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="flex flex-col items-center gap-1.5 min-w-[180px]">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${plan.status === 'APPROVED' ? 'bg-[#008767] w-full' : 'bg-amber-400 w-2/3'}`}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400">
                            {plan.status === 'APPROVED' ? 'مرحلة التنفيذ' : 'مرحلة الاعتماد'}
                          </span>
                        </div>

                        {/* Status Chips */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="مكتملة"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" title="جارية"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" title="متأخرة"></div>
                            <span className="text-[10px] font-bold text-slate-500 mr-1">توزيع المهام</span>
                          </div>
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black border ${plan.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                              plan.status === 'UNDER_REVIEW' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                            {plan.status === 'APPROVED' ? 'معتمدة' : plan.status === 'UNDER_REVIEW' ? 'بانتظار الاعتماد' : 'مسودة'}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!isAuditor && (
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-inner">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">التصعيدات والمخاطر الحرجة</h3>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">تنبيهات حول المهام المتأخرة أو الحالات التي تتطلب تدخلاً إدارياً.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-[13px]">
                <thead>
                  <tr className="text-slate-400 font-black border-b border-slate-50 uppercase tracking-widest text-[10px]">
                    <th className="pb-4 px-2">رقم المهمة</th>
                    <th className="pb-4 px-2">الإدارة المعنية</th>
                    <th className="pb-4 px-2">نوع الخطر</th>
                    <th className="pb-4 px-2">الحالة</th>
                    <th className="pb-4 px-2">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-6 px-2 font-black text-[#008767]">#AUD-902</td>
                    <td className="py-6 px-2 font-bold text-slate-700">إدارة المشاريع العامة</td>
                    <td className="py-6 px-2 text-red-500 font-black italic">تجاوز الموعد النهائي</td>
                    <td className="py-6 px-2 text-red-600 font-black">متأخرة جداً</td>
                    <td className="py-6 px-2">
                      <button className="text-slate-400 hover:text-red-500 transition-all"><ArrowLeftRight size={18} /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
