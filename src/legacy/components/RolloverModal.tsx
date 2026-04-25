import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, TrendingUp, X, Sparkles } from 'lucide-react';
import { getMonthLabel } from '../utils/storage';

interface Props {
  open: boolean;
  previousMonth: string;
  leftover: number;
  currencySymbol: string;
  onChoose: (choice: 'saving' | 'income' | 'ignore') => void;
}

export const RolloverModal = ({ open, previousMonth, leftover, currencySymbol, onChoose }: Props) => {
  const monthLabel = getMonthLabel(previousMonth);
  const positive = leftover > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="w-full max-w-md rounded-3xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #0F172A 0%, #020617 100%)',
              border: '1px solid rgba(212,160,23,0.25)',
              boxShadow: '0 0 40px rgba(212,160,23,0.2), 0 20px 60px rgba(0,0,0,0.6)',
            }}>
            {/* Glow accent */}
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-30 pointer-events-none"
              style={{ background: positive ? 'radial-gradient(circle, #D4A017, transparent 70%)' : 'radial-gradient(circle, #EF4444, transparent 70%)' }} />

            <button onClick={() => onChoose('ignore')}
              className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={15} className="text-gray-400" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} style={{ color: '#D4A017' }} />
              <span className="text-xs font-bold tracking-wide" style={{ color: '#D4A017' }}>شهر جديد</span>
            </div>

            <h2 className="text-xl font-black text-white mb-1">انتهى شهر {monthLabel}</h2>
            <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>
              {positive
                ? `رائع! تبقى لك رصيد قدره `
                : `لديك عجز قدره `}
              <span className="font-black" style={{ color: positive ? '#00FF7F' : '#EF4444' }}>
                {Math.abs(leftover).toLocaleString('ar-IQ')} {currencySymbol}
              </span>
              {positive ? '. كيف تريد التصرف به؟' : '. ابدأ الشهر الجديد بحذر.'}
            </p>

            {positive ? (
              <div className="space-y-2.5">
                <button onClick={() => onChoose('saving')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(212,160,23,0.2)' }}>
                    <PiggyBank size={20} style={{ color: '#D4A017' }} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold text-white">إضافة كادخار</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>يحفظ المبلغ في حصالة الشهر الجديد</p>
                  </div>
                </button>

                <button onClick={() => onChoose('income')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(0,255,127,0.08)', border: '1px solid rgba(0,255,127,0.25)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,255,127,0.15)' }}>
                    <TrendingUp size={20} style={{ color: '#00FF7F' }} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold text-white">إضافة كدخل جديد</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>يضاف لميزانية الشهر الحالي</p>
                  </div>
                </button>

                <button onClick={() => onChoose('ignore')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <X size={20} className="text-gray-400" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold text-white">بدء من الصفر</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>يبقى الرصيد محفوظاً في الأرشيف فقط</p>
                  </div>
                </button>
              </div>
            ) : (
              <button onClick={() => onChoose('ignore')}
                className="w-full p-4 rounded-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #D4A017, #F59E0B)' }}>
                ابدأ شهر جديد
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
