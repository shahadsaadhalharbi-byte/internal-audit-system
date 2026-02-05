
import React, { useState } from 'react';
import { RegulatoryRequest, User, UserRole, TaskStatus, TaskType } from '../types';
import {
  Gavel,
  Plus,
  X,
  Send,
  Search,
  Building2,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Eye,
  FileText,
  History,
  Info,
  ClipboardPlus,
  MessageSquareShare,
  FileSignature,
  Building,
  ChevronLeft,
  ArrowRight,
  Check,
  Target,
  Paperclip,
  Activity
} from 'lucide-react';
import { DEPARTMENTS } from '../constants';

interface RegulatoryEntitiesViewProps {
  user: User;
}

const MOCK_REG_REQUESTS: RegulatoryRequest[] = [
  {
    id: 'REG-001',
    senderEntity: 'هيئة الرقابة ومكافحة الفساد',
    notificationType: 'بلاغ إداري',
    mainTopic: 'مراجعة عقود الصيانة ببلدية العوالي',
    note: 'يرجى تزويدنا بكافة المرفقات الفنية الخاصة بالعقد رقم 1445-092 متمثلة في محاضر الاستلام النهائي وتقارير الإنجاز الشهرية المعتمدة من الاستشاري.',
    date: '2024-03-12',
    status: 'PROCESSING'
  },
  {
    id: 'REG-002',
    senderEntity: 'ديوان المظالم',
    notificationType: 'طلب إفادة',
    mainTopic: 'دعوى رقم 1290 لسنة 1445هـ',
    note: 'طلب مرئيات الإدارة حول الإجراءات المتبعة في الترسية والتحقق من التزام اللجنة بالأنظمة واللوائح المعمول بها.',
    date: '2024-03-10',
    status: 'NEW'
  }
];

const RegulatoryEntitiesView: React.FC<RegulatoryEntitiesViewProps> = ({ user }) => {
  const [requests, setRequests] = useState<RegulatoryRequest[]>(MOCK_REG_REQUESTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RegulatoryRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  const [activeAction, setActiveAction] = useState<'NONE' | 'CREATE_TASK' | 'REQUEST_INFO' | 'PREPARE_RESPONSE'>('NONE');
  const [successMsg, setSuccessMsg] = useState('');

  const isLiaison = user.role === UserRole.LIAISON_OFFICER;
  const isDirector = user.role === UserRole.GENERAL_DIRECTOR;

  const [formData, setFormData] = useState({
    senderEntity: '',
    notificationType: '',
    mainTopic: '',
    note: ''
  });

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: RegulatoryRequest = {
      id: `REG-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      ...formData,
      date: new Date().toISOString().split('T')[0],
      status: 'NEW'
    };
    setRequests([newReq, ...requests]);
    setShowAddModal(false);
    setFormData({ senderEntity: '', notificationType: '', mainTopic: '', note: '' });
  };

  const handleActionComplete = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
      setActiveAction('NONE');
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100 flex items-center gap-1.5"><ArrowUpRight size={12} /> {isDirector ? 'محال للمراجعة' : 'تم الإرسال للمدير'}</span>;
      case 'PROCESSING': return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black border border-amber-100 flex items-center gap-1.5"><Clock size={12} /> قيد المعالجة</span>;
      case 'CLOSED': return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black border border-green-100 flex items-center gap-1.5"><CheckCircle2 size={12} /> مكتمل</span>;
      default: return null;
    }
  };

  const filteredRequests = requests.filter(r =>
    r.senderEntity.includes(searchTerm) || r.mainTopic.includes(searchTerm)
  );

  const renderDetails = () => {
    if (!selectedRequest) return null;

    const detailTabs = [
      { id: 'summary', label: 'الملخص', icon: <Info size={16} /> },
      { id: 'attachments', label: 'المرفقات', icon: <Paperclip size={16} /> },
      { id: 'timeline', label: 'الخط الزمني', icon: <History size={16} /> },
    ];

    return (
      <div className="animate-fadeIn space-y-8 pb-20 text-right">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setSelectedRequest(null); setActiveAction('NONE'); }}
              className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#008767] shadow-sm transition-all hover:bg-slate-50"
            >
              <ArrowRight size={22} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">تفاصيل البلاغ الرقابي</h2>
              <p className="text-slate-400 text-sm font-bold flex items-center gap-2">رقم المرجعية: <span className="text-[#008767] font-black">#{selectedRequest.id}</span></p>
            </div>
          </div>
          {getStatusBadge(selectedRequest.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
              {detailTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-[13px] font-black transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-[#008767] text-white shadow-lg shadow-green-900/10'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#008767]'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12 min-h-[500px] flex flex-col justify-between">
              <div>
                {activeTab === 'summary' && (
                  <div className="space-y-12 animate-fadeIn">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                      <div>
                        <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-wider">الجهة المرسلة</p>
                        <p className="text-sm font-black text-slate-800">{selectedRequest.senderEntity}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-wider">نوع البلاغ</p>
                        <p className="text-sm font-black text-slate-800">{selectedRequest.notificationType}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-wider">تاريخ الورود</p>
                        <p className="text-sm font-black text-slate-800">{selectedRequest.date}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-wider">الأولوية</p>
                        <p className="text-sm font-black text-amber-600">عالية</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-lg font-black text-slate-800 flex items-center gap-3">
                        <Target size={20} className="text-[#008767]" /> تفاصيل البلاغ والاحتياجات الرقابية
                      </h4>
                      <div className="bg-slate-50/50 p-10 rounded-[40px] text-[15px] font-bold text-slate-600 leading-relaxed border border-slate-100 shadow-inner">
                        <p className="font-black text-slate-800 mb-4 text-lg">{selectedRequest.mainTopic}</p>
                        {selectedRequest.note}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isDirector && (
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <h4 className="text-xs font-black text-[#008767] flex items-center gap-2 mb-6">
                    <ClipboardPlus size={16} /> إجراءات المدير العام المتاحة
                  </h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => setActiveAction('CREATE_TASK')}
                      className="bg-green-50 text-[#008767] border border-green-100 px-6 py-4 rounded-2xl flex items-center gap-3 hover:bg-[#008767] hover:text-white transition-all shadow-sm group min-w-[200px]"
                    >
                      <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <ClipboardPlus size={18} className="text-[#008767]" />
                      </div>
                      <span className="text-xs font-black">إنشاء مهمة رقابية</span>
                    </button>

                    <button
                      onClick={() => setActiveAction('REQUEST_INFO')}
                      className="bg-green-50 text-[#008767] border border-green-100 px-6 py-4 rounded-2xl flex items-center gap-3 hover:bg-[#008767] hover:text-white transition-all shadow-sm group min-w-[200px]"
                    >
                      <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <MessageSquareShare size={18} className="text-[#008767]" />
                      </div>
                      <span className="text-xs font-black">جمع معلومات</span>
                    </button>

                    <button
                      onClick={() => setActiveAction('PREPARE_RESPONSE')}
                      className="bg-green-50 text-[#008767] border border-green-100 px-6 py-4 rounded-2xl flex items-center gap-3 hover:bg-[#008767] hover:text-white transition-all shadow-sm group min-w-[200px]"
                    >
                      <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <FileSignature size={18} className="text-[#008767]" />
                      </div>
                      <span className="text-xs font-black">إعداد رد رسمي</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="space-y-4 text-right">
                <h4 className="text-xs font-black flex items-center gap-2 text-slate-600 uppercase tracking-wider">
                  <Activity size={16} className="text-slate-400" /> حالة المعالجة الحالية
                </h4>
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">الحالة الرسمية</p>
                  <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2.5 rounded-full text-xs font-black border border-amber-100">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    بانتظار الإجراء الإداري
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeAction !== 'NONE' && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[500px] overflow-hidden animate-slideUp">
              <div className="bg-[#008767] p-8 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeAction === 'CREATE_TASK' && <ClipboardPlus size={20} />}
                  {activeAction === 'REQUEST_INFO' && <MessageSquareShare size={20} />}
                  {activeAction === 'PREPARE_RESPONSE' && <FileSignature size={20} />}
                  <h3 className="text-lg font-black tracking-tight">إكمال إجراء المدير العام</h3>
                </div>
                <button onClick={() => setActiveAction('NONE')} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
              </div>

              <div className="p-10 space-y-6">
                {successMsg ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-4 animate-fadeIn">
                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200"><Check size={32} /></div>
                    <p className="font-black text-green-700 text-sm">{successMsg}</p>
                  </div>
                ) : (
                  <>
                    {activeAction === 'CREATE_TASK' && (
                      <div className="space-y-6 text-right">
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">الإدارة المكلفة</label>
                          <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-[#008767] font-bold text-sm">
                            {DEPARTMENTS.slice(1).map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <button onClick={() => handleActionComplete('تم إنشاء المهمة وإسنادها بنجاح')} className="w-full bg-[#008767] text-white py-4.5 rounded-[22px] text-sm font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all">اعتماد المهمة</button>
                      </div>
                    )}

                    {activeAction === 'REQUEST_INFO' && (
                      <div className="space-y-6 text-right">
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">الإدارة المعنية</label>
                          <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-[#008767] font-bold text-sm">
                            {DEPARTMENTS.slice(1).map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">تفاصيل الطلب</label>
                          <textarea rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 outline-none focus:border-[#008767] font-bold text-sm resize-none" placeholder="اكتب ما تحتاجه من الإدارة..."></textarea>
                        </div>
                        <button onClick={() => handleActionComplete('تم إرسال طلب المعلومات للإدارة')} className="w-full bg-[#008767] text-white py-4.5 rounded-[22px] text-sm font-black shadow-lg shadow-green-900/10 transition-all">إرسال الاستفسار</button>
                      </div>
                    )}

                    {activeAction === 'PREPARE_RESPONSE' && (
                      <div className="space-y-6 text-right">
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">نص الرد الرسمي</label>
                          <textarea rows={8} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 outline-none focus:border-[#008767] font-bold text-sm resize-none leading-relaxed" placeholder="اكتب الرد المعتمد للجهة الرقابية..."></textarea>
                        </div>
                        <button onClick={() => handleActionComplete('تم اعتماد الرد الرسمي وإرساله للجهة')} className="w-full bg-[#008767] text-white py-4.5 rounded-[22px] text-sm font-black shadow-lg shadow-green-900/10 transition-all">اعتماد وإرسال الرد</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (selectedRequest) {
    return renderDetails();
  }

  return (
    <div className="space-y-8 animate-fadeIn text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
        {isLiaison && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#008767] text-white px-8 py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={18} />
            إنشاء طلب جديد
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث في الجهات أو المواضيع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pr-12 pl-4 text-sm font-bold outline-none focus:border-[#008767] shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50">
              <tr className="text-slate-400 font-black text-[11px] uppercase tracking-wider">
                <th className="px-8 py-5">رقم المرجع</th>
                <th className="px-8 py-5">الجهة الرقابية</th>
                <th className="px-8 py-5">الموضوع الأساسي</th>
                <th className="px-8 py-5">النوع</th>
                <th className="px-8 py-5">الحالة</th>
                <th className="px-8 py-5 text-center">إدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedRequest(req)}>
                  <td className="px-8 py-6">
                    <span className="font-black text-slate-400 text-xs tracking-widest">#{req.id.split('-')[1]}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><Building2 size={16} /></div>
                      <span className="font-black text-slate-800 text-[13px]">{req.senderEntity}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-[220px]">
                    <p className="font-bold text-slate-700 text-xs line-clamp-1">{req.mainTopic}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 italic">{req.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{req.notificationType}</span>
                  </td>
                  <td className="px-8 py-6">{getStatusBadge(req.status)}</td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="p-2 text-slate-300 hover:text-[#008767] transition-all"
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
      </div>

      {showAddModal && isLiaison && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[650px] overflow-hidden animate-slideUp">
            <div className="bg-[#008767] p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plus size={24} />
                <h3 className="text-xl font-black tracking-tight">إنشاء بلاغ جهة رقابية جديد</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="hover:rotate-90 transition-all bg-white/10 p-2 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRequest} className="p-10 space-y-6 text-right max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">الجهة المرسلة (الرقابية)</label>
                  <input
                    type="text"
                    required
                    value={formData.senderEntity}
                    onChange={e => setFormData({ ...formData, senderEntity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-[#008767] font-bold text-sm shadow-inner transition-all"
                    placeholder="مثل: هيئة الرقابة، ديوان المظالم..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">نوع البلاغ / الطلب</label>
                  <select
                    required
                    value={formData.notificationType}
                    onChange={e => setFormData({ ...formData, notificationType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-[#008767] font-bold text-sm cursor-pointer shadow-inner transition-all"
                  >
                    <option value="" disabled>-- اختر النوع --</option>
                    <option value="بلاغ إداري">بلاغ إداري</option>
                    <option value="طلب إفادة">طلب إفادة</option>
                    <option value="تظلم موظف">تظلم موظف</option>
                    <option value="مراجعة دورية">مراجعة دورية</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">الموضوع الأساسي</label>
                  <input
                    type="text"
                    required
                    value={formData.mainTopic}
                    onChange={e => setFormData({ ...formData, mainTopic: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-[#008767] font-bold text-sm shadow-inner transition-all"
                    placeholder="عنوان موجز للطلب..."
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-[#008767] text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-green-900/10 hover:bg-[#00664d] transition-all active:scale-[0.98]"
                >
                  إرسال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryEntitiesView;
