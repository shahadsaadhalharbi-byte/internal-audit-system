
import React, { useState } from 'react';
import { AuditTask, TaskStatus, UserRole } from '../types';
import {
  Filter,
  ShieldAlert,
  ChevronLeft,
  Plus,
  X,
  FileText
} from 'lucide-react';

interface TaskListProps {
  tasks: AuditTask[];
  userRole?: UserRole;
  onSelectTask: (taskId: string) => void;
  onAddTask: (task: Partial<AuditTask>) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, userRole, onSelectTask, onAddTask }) => {
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    endDate: ''
  });

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-100';
      case TaskStatus.DELAYED: return 'bg-red-50 text-red-700 border-red-100';
      case TaskStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'مكتملة';
      case TaskStatus.IN_PROGRESS: return 'قيد التنفيذ';
      case TaskStatus.DELAYED: return 'متأخرة';
      case TaskStatus.PENDING: return 'بانتظار الإسناد';
      default: return status;
    }
  };

  const isDeptManager = userRole === UserRole.DEPT_MANAGER;
  const isDataEntry = userRole === UserRole.DATA_ENTRY;

  const handleSubmitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.endDate) return;
    onAddTask(newTask);
    setShowAddForm(false);
    setNewTask({ title: '', description: '', endDate: '' });
  };

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

          <div className="relative min-w-[200px]">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-xs font-black text-slate-700 outline-none focus:border-[#008767] shadow-sm cursor-pointer transition-all"
            >
              <option value="ALL">جميع حالات المهام</option>
              {Object.values(TaskStatus).map(s => <option key={s} value={s}>{getStatusText(s)}</option>)}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[600px] overflow-hidden animate-slideUp">
            <div className="bg-[#008767] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <h3 className="text-lg font-black">{isDataEntry ? 'إدخال مهمة رقابية جديدة' : 'طلب مهمة إضافية'}</h3>
              </div>
              <button onClick={() => setShowAddForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitNewTask} className="p-8 space-y-6 text-right">
              <div>
                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">عنوان المهمة</label>
                <input type="text" required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-sm" placeholder="عنوان المهمة..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-[#008767] text-white py-4 rounded-2xl text-sm font-black">حفظ المهمة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filteredTasks.length > 0 ? filteredTasks.map(task => (
          <div key={task.id} onClick={() => onSelectTask(task.id)} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-[#008767] cursor-pointer transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-[#008767]"><ShieldAlert size={18} /></div>
              <div><h3 className="font-black text-slate-800 text-[14px]">{task.title}</h3><p className="text-[10px] text-slate-400 font-bold">{task.department}</p></div>
            </div>
            <div className="flex items-center gap-6">
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${getStatusStyle(task.status)}`}>{getStatusText(task.status)}</span>
              <ChevronLeft size={16} className="text-slate-300" />
            </div>
          </div>
        )) : <div className="p-20 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">لا توجد مهام حالياً.</div>}
      </div>
    </div>
  );
};

export default TaskList;
