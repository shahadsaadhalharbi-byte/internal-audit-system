
import React from 'react';
import { UserRole } from '../types';
import { UserPlus, Shield, UserCheck, MoreVertical } from 'lucide-react';

const UserManagement: React.FC = () => {
  const users = [
    { id: '1', name: 'أحمد علي', role: UserRole.AUDITOR, status: 'ACTIVE' },
    { id: '2', name: 'سارة خالد', role: UserRole.DEPT_MANAGER, status: 'ACTIVE' },
    { id: '3', name: 'محمد حسن', role: UserRole.LIAISON_OFFICER, status: 'INACTIVE' },
    { id: '4', name: 'نورة سليمان', role: UserRole.DATA_ENTRY, status: 'ACTIVE' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">إدارة المستخدمين والصلاحيات</h2>
        <button className="bg-[#008767] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#00664d] transition-all flex items-center gap-2">
          <UserPlus size={18} />
          إضافة مستخدم جديد
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">الموظف</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">الدور الوظيفي</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">الحالة</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[#008767] text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800">{u.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                    <Shield size={14} className="text-[#008767]" />
                    {u.role}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status === 'ACTIVE' ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded"><UserCheck size={18} /></button>
                    <button className="p-1 text-slate-400 hover:bg-slate-100 rounded"><MoreVertical size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
