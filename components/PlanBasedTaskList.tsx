
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AuditTask, TaskStatus, UserRole, AnnualPlan } from '../types';
import {
    Filter,
    ShieldAlert,
    ChevronLeft,
    ChevronDown,
    Plus,
    X,
    FileText,
    Calendar,
    ListChecks,
    Paperclip
} from 'lucide-react';
import { DEPARTMENTS } from '../constants';

interface PlanBasedTaskListProps {
    tasks: AuditTask[];
    plans: AnnualPlan[];
    userRole?: UserRole;
    onSelectTask: (taskId: string) => void;
    onAddTask: (task: Partial<AuditTask>) => void;
}

const PlanBasedTaskList: React.FC<PlanBasedTaskListProps> = ({
    tasks,
    plans,
    userRole,
    onSelectTask,
    onAddTask
}) => {
    const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('PLAN-1446');
    const [selectedDept, setSelectedDept] = useState<string>('ALL');
    const [showAddForm, setShowAddForm] = useState(false);
    const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
    const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        endDate: '',
        startDate: '',
        taskType: '',
        department: '',
        planId: '',
        priority: 'متوسطة'
    });

    const isGeneralDirector = userRole === UserRole.GENERAL_DIRECTOR;

    // Filter tasks based on status and department
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const matchesStatus = filter === 'ALL' || t.status === filter;
            const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;
            return matchesStatus && matchesDept;
        });
    }, [tasks, filter, selectedDept]);

    // Group tasks by plan
    const tasksByPlan = useMemo(() => {
        const grouped = new Map<string, AuditTask[]>();

        // Initialize with all plans
        plans.forEach(plan => {
            grouped.set(plan.id, []);
        });

        // Add an "unassigned" group for tasks without a plan
        grouped.set('unassigned', []);

        // Group filtered tasks
        filteredTasks.forEach(task => {
            const planId = task.planId || 'unassigned';
            const existing = grouped.get(planId) || [];
            grouped.set(planId, [...existing, task]);
        });

        return grouped;
    }, [filteredTasks, plans]);

    const getStatusStyle = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.COMPLETED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case TaskStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-100';
            case TaskStatus.DELAYED: return 'bg-red-50 text-red-700 border-red-100';
            case TaskStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100';
            case TaskStatus.PAUSED: return 'bg-orange-50 text-orange-700 border-orange-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
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

    const getPlanStats = (planTasks: AuditTask[]) => {
        const total = planTasks.length;
        const completed = planTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
        const delayed = planTasks.filter(t => t.status === TaskStatus.DELAYED).length;
        return { total, completed, delayed };
    };

    const isDeptManager = userRole === UserRole.DEPT_MANAGER;
    const isDataEntry = userRole === UserRole.DATA_ENTRY;

    const handleSubmitNewTask = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!newTask.title || !newTask.endDate || !newTask.taskType || !newTask.department || !newTask.startDate || !newTask.planId) return;

        // If Dept Manager, status matches "Requested" (mapped to PENDING for now)
        const taskPayload = {
            ...newTask,
            status: TaskStatus.PENDING
        };

        onAddTask(taskPayload);
        setShowAddForm(false);
        setNewTask({
            title: '',
            description: '',
            endDate: '',
            startDate: '',
            taskType: '',
            department: '',
            planId: '',
            priority: 'متوسطة'
        });
    };

    const togglePlan = (planId: string) => {
        setExpandedPlanId(expandedPlanId === planId ? null : planId);
    };

    const renderTaskCard = (task: AuditTask) => (
        <div
            key={task.id}
            onClick={(e) => {
                e.stopPropagation();
                onSelectTask(task.id);
            }}
            className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-[#008767] cursor-pointer transition-all hover:shadow-sm group"
        >
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-[#008767] group-hover:bg-[#008767] group-hover:text-white transition-colors">
                    <ShieldAlert size={16} />
                </div>
                <div>
                    <h4 className="font-black text-slate-800 text-[13px]">{task.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{task.department}</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${getStatusStyle(task.status)}`}>
                    {getStatusText(task.status)}
                </span>
                <ChevronLeft size={16} className="text-slate-300 group-hover:text-[#008767] transition-colors" />
            </div>
        </div>
    );

    // Get visible plans (plans with tasks after filtering)
    const visiblePlans = useMemo(() => {
        const visible: Array<{ plan: AnnualPlan | null; tasks: AuditTask[] }> = [];

        plans.forEach(plan => {
            const planTasks = tasksByPlan.get(plan.id) || [];
            // Show plan if it has tasks matching filters
            if (planTasks.length > 0) {
                visible.push({ plan, tasks: planTasks });
            }
        });

        // Add unassigned tasks if any
        const unassignedTasks = tasksByPlan.get('unassigned') || [];
        if (unassignedTasks.length > 0) {
            visible.push({ plan: null, tasks: unassignedTasks });
        }

        return visible;
    }, [plans, tasksByPlan]);

    return (
        <div className="space-y-6 animate-fadeIn text-right" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    {(isDeptManager || isDataEntry) && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 bg-[#008767] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Plus size={16} />
                            {isDataEntry ? 'إضافة مهمة جديدة' : 'طلب مهمة إضافية'}
                        </button>
                    )}

                    <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200">
                        {/* Department Selector */}
                        {!isDeptManager && (
                            <>
                                <div className="relative min-w-[150px]">
                                    <select
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        className="w-full appearance-none bg-transparent py-2.5 pr-10 pl-4 text-xs font-black text-slate-700 outline-none cursor-pointer"
                                    >
                                        <option value="ALL">جميع الإدارات</option>
                                        {DEPARTMENTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>

                                <div className="w-[1px] h-6 bg-slate-200"></div>
                            </>
                        )}

                        {/* Status Filter */}
                        <div className="relative min-w-[150px]">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="w-full appearance-none bg-transparent py-2.5 pr-10 pl-4 text-xs font-black text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="ALL">جميع حالات المهام</option>
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{getStatusText(s)}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <ListChecks size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddForm && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[600px] overflow-hidden animate-slideUp">
                        <div className="bg-[#008767] p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText size={20} />
                                <h3 className="text-lg font-black">{isDataEntry ? 'إدخال مهمة رقابية جديدة' : 'طلب مهمة إضافية'}</h3>
                            </div>
                            <button onClick={() => setShowAddForm(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmitNewTask} className="p-8 space-y-6 text-right max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Row 1: Plan & Type */}
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">الخطة السنوية <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={newTask.planId}
                                        onChange={e => setNewTask({ ...newTask, planId: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm cursor-pointer"
                                    >
                                        <option value="" disabled>-- اختر الخطة السنوية --</option>
                                        {plans.map(plan => (
                                            <option key={plan.id} value={plan.id}>{plan.title || `خطة عام ${plan.year}هـ`}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">نوع المهمة <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={newTask.taskType}
                                        onChange={e => setNewTask({ ...newTask, taskType: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm cursor-pointer"
                                    >
                                        <option value="" disabled>-- اختر نوع المهمة --</option>
                                        <option value="مراجعة">مراجعة</option>
                                        <option value="متابعة">متابعة</option>
                                        <option value="توعوية">توعوية</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">الإدارة المعنية <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={newTask.department}
                                        onChange={e => setNewTask({ ...newTask, department: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm cursor-pointer"
                                    >
                                        <option value="" disabled>-- اختر الإدارة --</option>
                                        {DEPARTMENTS.slice(1).map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Row 2: Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">عنوان المهمة <span className="text-red-500">*</span></label>
                                    <input type="text" required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm" placeholder="عنوان المهمة..." />
                                </div>

                                {/* Row 3: Dates */}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">تاريخ البدء <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={newTask.startDate}
                                        onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">الموعد النهائي <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={newTask.endDate}
                                        onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm cursor-pointer"
                                    />
                                </div>

                                {/* Row 4: Priority & Attachments */}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">الأولوية</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm cursor-pointer"
                                    >
                                        <option value="منخفضة">منخفضة</option>
                                        <option value="متوسطة">متوسطة</option>
                                        <option value="عالية">عالية</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">المرفقات</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="task-attachment"
                                            onChange={() => { }} // Placeholder logic for now
                                        />
                                        <label htmlFor="task-attachment" className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all font-bold text-slate-500 text-xs">
                                            <Paperclip size={16} /> إرفاق ملف
                                        </label>
                                    </div>
                                </div>

                                {/* Row 5: Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">نطاق / وصف المهمة</label>
                                    <textarea
                                        rows={3}
                                        value={newTask.description}
                                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm resize-none"
                                        placeholder="وصف مختصر للمهمة..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-50">
                                <button type="submit" className="flex-1 bg-[#008767] text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all transform hover:scale-[1.02] active:scale-95">
                                    {isDataEntry ? 'حفظ المهمة' : 'إرسال'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <div className="flex flex-col gap-4">
                {(isGeneralDirector || isDataEntry) ? (
                    visiblePlans.length > 0 ? (
                        visiblePlans.map(({ plan, tasks: planTasks }) => {
                            const planId = plan?.id || 'unassigned';
                            const isExpanded = expandedPlanId === planId;
                            const stats = getPlanStats(planTasks);

                            return (
                                <div key={planId} className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all hover:border-[#008767]/30">
                                    <div
                                        onClick={() => togglePlan(planId)}
                                        className="p-6 cursor-pointer hover:bg-slate-50/50 transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-[#008767]/10 rounded-lg flex items-center justify-center text-[#008767]">
                                                        <ListChecks size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-slate-800 text-[15px]">
                                                            {plan?.title || `خطة ${plan?.year || 'غير محددة'}`}
                                                        </h3>
                                                        {plan && (
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                                                                    <Calendar size={12} />
                                                                    <span>السنة: {plan.year}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 mr-[52px]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">المهام:</span>
                                                        <span className="text-[11px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                                                            {stats.total}
                                                        </span>
                                                    </div>

                                                    {stats.completed > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase">مكتملة:</span>
                                                            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                {stats.completed}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {stats.delayed > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-red-600 uppercase">متأخرة:</span>
                                                            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                                                                {stats.delayed}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50/30 animate-fadeIn p-4 space-y-2">
                                            {Object.entries(
                                                planTasks.reduce((acc, task) => {
                                                    const dept = task.department || 'Non-Departmental';
                                                    if (!acc[dept]) acc[dept] = [];
                                                    acc[dept].push(task);
                                                    return acc;
                                                }, {} as Record<string, AuditTask[]>)
                                            ).map(([dept, rawTasks]) => {
                                                const tasks = rawTasks as AuditTask[];
                                                return (
                                                    <div key={dept} className="mb-6 last:mb-0">
                                                        <div
                                                            onClick={isDataEntry ? () => setExpandedDepts(prev => ({ ...prev, [dept]: !(prev[dept] ?? true) })) : undefined}
                                                            className={`flex items-center justify-between gap-3 mb-4 px-2 pt-4 ${isDataEntry ? 'cursor-pointer hover:bg-slate-50/50 rounded-lg transition-colors p-2' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-1.5 h-5 bg-[#008767] rounded-full shadow-sm shadow-green-500/20"></div>
                                                                <h3 className="font-black text-slate-700 text-sm flex items-center gap-2">
                                                                    <span className="text-slate-400 font-bold text-xs">خطة المراجعة السنوية {plan?.year || 1446}هـ</span>
                                                                    <span className="text-slate-300">-</span>
                                                                    <span className="text-[#008767]">{dept}</span>
                                                                </h3>
                                                            </div>
                                                            {isDataEntry && (
                                                                <ChevronDown size={18} className={`text-slate-400 transition-transform ${expandedDepts[dept] ?? true ? 'rotate-180' : ''}`} />
                                                            )}
                                                        </div>

                                                        {(!isDataEntry || (expandedDepts[dept] ?? true)) && (
                                                            <div className="space-y-3 px-1 animate-slideDown">
                                                                {tasks.map(task => renderTaskCard(task))}
                                                            </div>
                                                        )}
                                                        <div className="border-b border-slate-50 mt-8 mx-6"></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-20 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
                            {filter === 'ALL' ? 'لا توجد خطط أو مهام حالياً.' : 'لا توجد مهام تطابق الفلتر المحدد.'}
                        </div>
                    )
                ) : (
                    filteredTasks.length > 0 ? (
                        <div className="space-y-4">
                            {filteredTasks.map(task => renderTaskCard(task))}
                        </div>
                    ) : (
                        <div className="p-20 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
                            {filter === 'ALL' ? 'لا توجد مهام حالياً.' : 'لا توجد مهام تطابق الفلتر المحدد.'}
                        </div>
                    )
                )}
            </div>
        </div >
    );
};

export default PlanBasedTaskList;
