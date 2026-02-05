
import React from 'react';
import { UserRole } from '../types';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  const getLabel = (item: typeof NAV_ITEMS[0]) => {
    if (item.id === 'tasks-oversight') {
      return userRole === UserRole.AUDITOR ? 'مهامي' : 'إدارة المهام';
    }
    return item.label;
  };

  return (
    <aside className="w-full h-full flex flex-col bg-white overflow-hidden border-l border-slate-100">
      <div className="pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Amanah Logo - Local File */}
        <div className="mb-6 sm:mb-8 w-full flex justify-center items-center">
          <img
            src="/logo.jpg"
            alt="شعار أمانة منطقة المدينة المنورة"
            className="h-20 sm:h-24 lg:h-32 w-auto object-contain transition-transform duration-300 hover:scale-105"
            style={{
              imageRendering: 'crisp-edges',
              WebkitPrintColorAdjust: 'exact'
            }}
            loading="eager"
            onError={(e) => {
              // Fallback to external URL if local file fails
              e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/ar/5/5a/Madinah_Municipality_logo.png";
            }}
          />
        </div>

        <div className="space-y-1">
          <h1 className="text-base sm:text-lg lg:text-[20px] font-black text-[#008767] leading-tight tracking-tight">
            نظام المراجعة الداخلية
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
        {filteredNav.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                ? 'bg-[#008767] text-white shadow-lg shadow-green-900/10 scale-[1.02]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#008767]'
              }`}
          >
            <div className="flex-1 text-right">
              <span className={`text-[14px] ${activeTab === item.id ? 'font-black' : 'font-bold'}`}>
                {getLabel(item)}
              </span>
            </div>
            <div className={`${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-[#008767]'} ml-0 mr-3 transition-transform group-hover:scale-110`}>
              {item.icon}
            </div>
          </button>
        ))}
      </nav>

      <div className="p-6">
        {/* الحاشية السفلية فارغة بناءً على طلب حذف النصوص الرمادية */}
      </div>
    </aside>
  );
};

export default Sidebar;
