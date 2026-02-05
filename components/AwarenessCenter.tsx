
import React, { useState } from 'react';
import { User } from '../types';
import { geminiService } from '../services/geminiService';
import { Send, Sparkles, Loader2, Calendar, Target, CheckCircle2 } from 'lucide-react';

const AwarenessCenter: React.FC<{ user: User }> = ({ user }) => {
  const [topic, setTopic] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAiSuggest = async () => {
    if (!topic) return;
    setLoading(true);
    const result = await geminiService.suggestAwarenessMessage(topic);
    setAiResult(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">مركز الرسائل التوعوية</h2>
          <p className="text-slate-500">نشر ثقافة الالتزام والنزاهة لموظفي الأمانة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Send size={20} className="text-[#008767]" />
            إنشاء رسالة جديدة
          </h3>

          <div className="space-y-4">
            <div className="relative group">
              <Sparkles className="absolute left-3 top-3 text-[#008767] opacity-50 group-hover:opacity-100 transition-opacity" size={18} />
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="أدخل موضوعاً للحصول على اقتراح ذكي (مثلاً: أمانة التعامل مع الملفات)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-10 outline-none focus:border-[#008767] text-sm"
              />
              <button 
                onClick={handleAiSuggest}
                disabled={loading || !topic}
                className="absolute left-1 top-1 bottom-1 px-4 bg-[#008767] text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-all flex items-center gap-1"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                اقتراح ذكي
              </button>
            </div>

            <div>
              <textarea 
                value={aiResult}
                onChange={(e) => setAiResult(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 outline-none focus:border-[#008767] h-64 text-sm leading-relaxed"
                placeholder="محتوى الرسالة..."
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Target size={12} />
                  الجهة المستهدفة
                </label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-[#008767]">
                  <option>جميع المنسوبين</option>
                  <option>مدراء الإدارات</option>
                  <option>المراقبين الميدانيين</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar size={12} />
                  تاريخ النشر
                </label>
                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-[#008767]" />
              </div>
            </div>

            <button className="w-full bg-[#008767] text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-[#008767]/20 hover:shadow-[#008767]/40 transition-all active:scale-95">
              إرسال الرسالة التوعوية
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">أحدث الرسائل المرسلة</h3>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400">منذ {i * 2} أيام</span>
                <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                  <CheckCircle2 size={10} />
                  تم الإرسال
                </span>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">أهمية سرية بيانات التفتيش</h4>
              <p className="text-slate-500 text-xs line-clamp-2">نود التأكيد على ضرورة الالتزام بالمعايير الأمنية عند رفع الملفات الميدانية وعدم تداولها خارج الأطر الرسمية...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AwarenessCenter;
