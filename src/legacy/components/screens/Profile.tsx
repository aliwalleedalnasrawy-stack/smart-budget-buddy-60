import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Download, FileText, Trash2, AlertTriangle, User } from 'lucide-react';
import { Transaction, Category, AppSettings, ArchivedMonth } from '../../types';
import { exportToCSV, exportToPDF } from '../../utils/export';
import { getCurrentMonth } from '../../utils/storage';

interface Props {
  settings: AppSettings;
  transactions: Transaction[];
  categories: Category[];
  archivedMonths: ArchivedMonth[];
  totalIncome: number; totalExpenses: number; totalSavings: number; netBalance: number;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  onReset: () => void;
  onNavigate: (s: 'profile') => void;
}

export const Profile = ({
  settings, transactions, categories, archivedMonths,
  totalIncome, totalExpenses, totalSavings, netBalance,
  onUpdateSettings, onReset,
}: Props) => {
  const [showReset, setShowReset] = useState(false);
  const [confirm, setConfirm] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const month = getCurrentMonth();
  const sym = settings.currency === 'IQD' ? 'د.ع' : settings.currency === 'USD' ? '$' : settings.customSymbol;
  const canReset = confirm === 'حذف';

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => onUpdateSettings({ avatarUrl: r.result as string });
    r.readAsDataURL(f);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto">
      <h2 className="text-xl font-black text-white mb-6">الملف الشخصي</h2>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 mb-4 flex flex-col items-center"
        style={{ background: 'linear-gradient(140deg, rgba(15,23,42,0.9), rgba(7,15,31,0.9))',
          border: '1px solid rgba(212,160,23,0.15)' }}>
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              background: settings.avatarUrl
                ? 'transparent'
                : 'linear-gradient(135deg, #D4A017, #F59E0B)',
              backgroundImage: settings.avatarUrl ? 'url(' + settings.avatarUrl + ')' : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: '3px solid rgba(212,160,23,0.5)',
              boxShadow: '0 0 22px rgba(212,160,23,0.3)',
            }}>
            {!settings.avatarUrl && <span className="text-4xl font-black text-slate-950">ع</span>}
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 left-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#D4A017', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            <Camera size={13} className="text-slate-950" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
        </div>
        <h3 className="text-2xl font-black mb-1" style={{ color: '#D4A017' }}>مرحباً بك، علي</h3>
        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>دليلك إلى الحرية المالية</p>
        <div className="px-5 py-2 rounded-full text-sm font-semibold"
          style={{ background: 'rgba(0,255,127,0.07)', color: '#00FF7F', border: '1px solid rgba(0,255,127,0.18)' }}>
          العملة: {sym}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-2xl p-5 mb-4"
        style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm font-bold text-white mb-1">تصدير البيانات</p>
        <p className="text-xs mb-4" style={{ color: '#4B5563' }}>يشمل الشهر الحالي وجميع الأشهر المحفوظة</p>
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => exportToCSV(transactions, categories, settings, month, archivedMonths)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl"
            style={{ background: 'rgba(0,255,127,0.05)', border: '1px solid rgba(0,255,127,0.15)' }}>
            <Download size={22} style={{ color: '#00FF7F' }} />
            <span className="text-sm font-semibold" style={{ color: '#00FF7F' }}>تصدير CSV</span>
            <span className="text-[10px]" style={{ color: '#4B5563' }}>جدول بيانات</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => exportToPDF(transactions, categories, settings, month,
              { income: totalIncome, expenses: totalExpenses, savings: totalSavings, net: netBalance },
              archivedMonths)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl"
            style={{ background: 'rgba(212,160,23,0.05)', border: '1px solid rgba(212,160,23,0.15)' }}>
            <FileText size={22} style={{ color: '#D4A017' }} />
            <span className="text-sm font-semibold" style={{ color: '#D4A017' }}>تصدير PDF</span>
            <span className="text-[10px]" style={{ color: '#4B5563' }}>تقرير طباعة</span>
          </motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(239,68,68,0.08)' }}>
        <p className="text-sm font-bold text-white mb-1">منطقة الخطر</p>
        <p className="text-xs mb-4" style={{ color: '#4B5563' }}>هذا الإجراء لا يمكن التراجع عنه</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowReset(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold"
          style={{ background: 'rgba(239,68,68,0.07)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.18)' }}>
          <Trash2 size={15} /> إعادة ضبط التطبيق
        </motion.button>
      </motion.div>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}
            onClick={() => { setShowReset(false); setConfirm(''); }} />
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-sm rounded-3xl p-6"
            style={{ background: '#0F172A', border: '1px solid rgba(239,68,68,0.28)' }}>
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                <AlertTriangle size={28} style={{ color: '#EF4444' }} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">تأكيد إعادة الضبط</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                اكتب <span style={{ color: '#EF4444', fontWeight: 700 }}>"حذف"</span> للتأكيد
              </p>
            </div>
            <input type="text" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder='اكتب "حذف"' autoFocus
              className="w-full text-center py-3 rounded-2xl text-white text-base outline-none mb-4"
              style={{ background: 'rgba(2,6,23,0.8)',
                border: canReset ? '1.5px solid #EF4444' : '1.5px solid rgba(255,255,255,0.1)' }} />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setShowReset(false); setConfirm(''); }}
                className="py-3 rounded-2xl font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#6B7280' }}>إلغاء</button>
              <button onClick={() => canReset && onReset()} disabled={!canReset}
                className="py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: canReset ? '#EF4444' : 'rgba(239,68,68,0.1)',
                  color: canReset ? '#fff' : '#4B5563' }}>
                <Trash2 size={13} /> حذف كل شيء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
