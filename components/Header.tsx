
import React from 'react';
import { User, UserRole } from '../types';
import { Bell, Search, ChevronDown, User as UserIcon } from 'lucide-react';
import { ROLE_LABELS } from '../constants';

interface HeaderProps {
  user: User;
  onRoleChange: (role: UserRole) => void;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onRoleChange }) => {
  // الحصول على أول حرف من الاسم لعرضه كرمز
  const userInitial = user.name ? user.name.charAt(0) : 'م';

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
      
      {/* جهة اليمين: البحث وتبديل الأدوار */}
      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="بحث سريع..."
            className="w-full bg-slate-50 border border-slate-50 focus:bg-white focus:border-[#008767]/20 rounded-2xl py-2.5 pr-11 pl-4 outline-none text-[12px] font-bold transition-all shadow-sm"
          />
        </div>

        <div className="relative group">
          <select 
            value={user.role}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="appearance-none bg-slate-50 border border-slate-100 rounded-xl py-2 px-10 text-[11px] font-black text-slate-500 outline-none cursor-pointer focus:border-[#008767] transition-all"
          >
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* جهة اليسار: معلومات المستخدم والتنبيهات */}
      <div className="flex items-center gap-6">
        <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
          <Bell size={22} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-4 pl-2 border-r-0">
          <div className="text-left">
            <p className="text-[13px] font-black text-slate-900 leading-tight">{ROLE_LABELS[user.role]}</p>
            <p className="text-[11px] text-[#008767] font-bold mt-0.5">{user.name}</p>
          </div>
          <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 border border-slate-100 overflow-hidden shadow-sm">
             <span className="text-[16px] font-black">{userInitial}</span>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
