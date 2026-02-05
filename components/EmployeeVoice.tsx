
import React, { useState } from 'react';
import { User, EmployeeVoiceReport } from '../types';
import { Shield, MessageSquare, Plus, Clock, Eye, AlertCircle } from 'lucide-react';

const MOCK_REPORTS: EmployeeVoiceReport[] = [
  { id: 'R1', title: 'ملاحظة حول توزيع المهام الميدانية', content: 'نلاحظ عدم وجود عدالة في توزيع الجولات التفتيشية بين فرق الصباح والمساء...', date: '2024-03-01', status: 'ANALYZING', isAnonymous: true },
  { id: 'R2', title: 'اقتراح لتحسين أتمتة التقارير', content: 'نقترح إضافة خاصية التوقيع الإلكتروني مباشرة من التطبيق الميداني لتوفير الوقت...', date: '2024-03-05', status: 'NEW', isAnonymous: false }
];

interface EmployeeVoiceProps {
  user: User;
}

const EmployeeVoice: React.FC<EmployeeVoiceProps> = ({ user }) => {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-[#008767] rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4">صوت الموظف</h2>
          <p className="text-[#8bc34a] font-bold text-lg mb-6 max-w-2xl">
            شاركنا اقتراحاتك، تظلماتك، أو ملاحظاتك بسرية تامة لتعزيز بيئة العمل والنزاهة المؤسسية.
          </p>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-[#008767] px-8 py-3 rounded-xl font-black hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة مشاركة جديدة
          </button>
        </div>
        <Shield size={200} className="absolute -left-10 -bottom-10 text-white/10 rotate-12" />
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl animate-fadeIn">
          <h3 className="text-xl font-bold text-slate-800 mb-6">مشاركة جديدة</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الموضوع</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-[#008767]"
                placeholder="مثلاً: اقتراح تحسين إجراءات..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">التفاصيل</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-[#008767] h-32"
                placeholder="اكتب رسالتك هنا بكل شفافية..."
              ></textarea>
            </div>
            <div className="flex items-center gap-4 py-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-[#008767]" />
                <span className="text-sm font-bold text-slate-600">إرسال كـ (مجهول) للهوية</span>
              </label>
              <div className="flex items-center gap-1 text-amber-600 text-xs bg-amber-50 px-3 py-1 rounded-full font-bold">
                <AlertCircle size={14} />
                سيتم تشفير هويتك تماماً
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-[#008767] text-white font-black rounded-xl hover:bg-[#00664d]"
              >
                إرسال المشاركة
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map(report => (
          <div key={report.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <MessageSquare size={18} className="text-[#008767]" />
                </div>
                <span className="text-xs font-bold text-slate-400">{report.date}</span>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                report.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {report.status === 'NEW' ? 'جديدة' : 'جاري التحليل'}
              </span>
            </div>
            <h4 className="font-bold text-slate-800 mb-2">{report.title}</h4>
            <p className="text-slate-500 text-sm line-clamp-3 mb-6">{report.content}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield size={14} />
                {report.isAnonymous ? 'هوية مشفرة' : 'الهوية معلنة'}
              </div>
              <button className="text-[#008767] text-xs font-bold hover:underline flex items-center gap-1">
                <Eye size={14} />
                متابعة الردود
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeVoice;
