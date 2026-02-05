
import React, { useState } from 'react';
import { DocumentRequest, User, UserRole } from '../types';
import {
  FolderOpen, FileText, Clock, CheckCircle2,
  AlertCircle, Upload, Eye, Search, Filter,
  Send, Calendar, Download, Paperclip, X
} from 'lucide-react';

interface DocRequestsViewProps {
  requests: DocumentRequest[];
  user: User;
  onUpdateStatus: (requestId: string, status: DocumentRequest['status']) => void;
}

const DocRequestsView: React.FC<DocRequestsViewProps> = ({ requests, user, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DocumentRequest['status']>('ALL');
  const [selectedReq, setSelectedReq] = useState<DocumentRequest | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const isLiaison = user.role === UserRole.LIAISON_OFFICER;
  const isAuditor = user.role === UserRole.AUDITOR;

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DocumentRequest['status']) => {
    switch (status) {
      case 'SENT': return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100 flex items-center gap-1.5"><Send size={12} /> بانتظار الرد</span>;
      case 'IN_PROGRESS': return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black border border-amber-100 flex items-center gap-1.5"><Clock size={12} /> جاري التجهيز</span>;
      case 'RECEIVED': return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black border border-green-100 flex items-center gap-1.5"><CheckCircle2 size={12} /> تم الاستلام</span>;
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReq) {
      onUpdateStatus(selectedReq.id, 'RECEIVED');
      setShowUploadModal(false);
      setSelectedReq(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">إدارة طلبات المستندات</h2>
          <p className="text-slate-500 font-bold text-sm">
            {isLiaison ? 'استقبل طلبات المراجعين وزودهم بالوثائق المطلوبة.' : 'تتبع حالة المستندات المطلوبة من الجهات المعنية.'}
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="بحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold outline-none focus:border-[#008767] shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-black text-slate-600 outline-none focus:border-[#008767] shadow-sm"
          >
            <option value="ALL">كل الحالات</option>
            <option value="SENT">بانتظار الرد</option>
            <option value="IN_PROGRESS">جاري التجهيز</option>
            <option value="RECEIVED">تم الاستلام</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50">
              <tr className="text-slate-400 font-black text-[11px] uppercase tracking-wider">
                <th className="px-8 py-5">رقم الطلب</th>
                <th className="px-8 py-5">عنوان المستند</th>
                <th className="px-8 py-5">تاريخ الاستحقاق</th>
                <th className="px-8 py-5">الحالة</th>
                <th className="px-8 py-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6 font-black text-slate-400 text-xs">#{req.id.split('-')[1]}</td>
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800 text-sm">{req.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 line-clamp-1">{req.description}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                      <Calendar size={14} className="text-slate-300" />
                      {req.dueDate}
                    </div>
                  </td>
                  <td className="px-8 py-6">{getStatusBadge(req.status)}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      {isLiaison && req.status !== 'RECEIVED' && (
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setShowUploadModal(true);
                          }}
                          className="flex items-center gap-2 bg-[#008767] text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-[#00664d] shadow-md shadow-green-900/10 transition-all"
                        >
                          <Upload size={14} /> تزويد المستند
                        </button>
                      )}
                      {req.status === 'RECEIVED' && (
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-all" title="تحميل الملف">
                          <Download size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="p-2 text-slate-400 hover:text-[#008767] transition-all" title="عرض التفاصيل"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRequests.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-bold flex flex-col items-center gap-4">
            <FolderOpen size={48} className="opacity-10" />
            <p>لا توجد طلبات مستندات مطابقة للبحث.</p>
          </div>
        )}
      </div>

      {/* Upload Modal for Liaison */}
      {showUploadModal && selectedReq && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 p-6 backdrop-blur-sm animate-fadeIn" onClick={(e) => {
          if (e.target === e.currentTarget) setShowUploadModal(false);
        }}>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[550px] overflow-hidden animate-slideUp">
            <div className="bg-[#008767] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload size={20} />
                <h3 className="text-lg font-black">تزويد مستند رقابي</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="hover:rotate-90 transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-black mb-1">المستند المطلوب:</p>
                <p className="text-sm font-black text-slate-800">{selectedReq.title}</p>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:border-[#008767] hover:bg-green-50/30 transition-all group cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-[#008767] transition-all">
                  <Paperclip size={32} />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-700">اضغط لاختيار الملف أو اسحب الملف هنا</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">يدعم PDF, Word, Excel (بحد أقصى 50 ميجابايت)</p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-wider">ملاحظات إضافية</label>
                <textarea rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#008767] font-bold text-xs" placeholder="اكتب أي ملاحظات حول الملف المرفق..."></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-[#008767] text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all">تأكيد الإرسال للمراجع</button>
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Sidebar / Overlay */}
      {selectedReq && !showUploadModal && (
        <div className="fixed top-0 bottom-0 left-0 h-screen w-full max-w-[750px] bg-white shadow-2xl z-[70] animate-slideLeft flex flex-col border-r border-slate-100">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800">تفاصيل طلب المستند</h3>
            <button onClick={() => setSelectedReq(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">الحالة الحالية</label>
              {getStatusBadge(selectedReq.status)}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
                <h4 className="font-black text-slate-800">{selectedReq.title}</h4>
              </div>
              <p className="text-sm font-bold text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {selectedReq.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">تاريخ الطلب</p>
                <p className="text-xs font-black text-slate-800">2024-03-01</p>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl">
                <p className="text-[10px] font-black text-red-400 uppercase mb-1">موعد التسليم</p>
                <p className="text-xs font-black text-red-600">{selectedReq.dueDate}</p>
              </div>
            </div>
          </div>
          {isLiaison && selectedReq.status !== 'RECEIVED' && (
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full bg-[#008767] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-900/10 hover:bg-[#00664d] transition-all"
              >
                بدء تزويد المستند الآن
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocRequestsView;
