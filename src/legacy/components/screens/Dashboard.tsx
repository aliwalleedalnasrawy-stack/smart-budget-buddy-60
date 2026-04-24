import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, Wallet, ChevronLeft } from 'lucide-react';
import { WisdomQuote } from '../WisdomQuote';
import { Screen, AppSettings, Transaction, Category } from '../../types';
import { getCategoryColor } from '../../utils/categories';

interface Props {
  totalIncome: number; totalExpenses: number; totalSavings: number; netBalance: number;
  recommendedSavings: number; savingsProgress: number; spendingProgress: number;
  currentTransactions: Transaction[]; categories: Category[];
  settings: AppSettings; currencySymbol: string;
  onNavigate: (s: Screen) => void;
  currentMonth: string;
}

const f = (n: number, sym: string) => `${n.toLocaleString('ar-IQ')} ${sym}`;

const monthLabels: Record<string, string> = {
  '01': 'كانون الثاني', '02': 'شباط', '03': 'آذار', '04': 'نيسان',
  '05': 'أيار', '06': 'حزيران', '07': 'تموز', '08': 'آب',
  '09': 'أيلول', '10': 'تشرين الأول', '11': 'تشرين الثاني', '12': 'كانون الأول',
};

const getMonthYearDisplay = (monthStr: string) => {
  if (!monthStr || monthStr.length < 7) return '';
  const year = monthStr.substring(0, 4);
  const month = monthStr.substring(5, 7);
  return `${monthLabels[month] || ''} ${year}`;
};

export const Dashboard = ({
  totalIncome, totalExpenses, totalSavings, netBalance,
  recommendedSavings, savingsProgress, spendingProgress, currentTransactions,
  categories, settings, currencySymbol, onNavigate, currentMonth,
}: Props) => {
  const [showTip, setShowTip] = useState(false);
  const monthYearDisplay = useMemo(() => getMonthYearDisplay(currentMonth), [currentMonth]);

  // AI Advisor: dynamic tip based on expense ratio vs income (treated as monthly budget)
  const advisor = (() => {
    const ratio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    if (totalIncome === 0) {
      return {
        tone: 'neutral' as const,
        color: '#94A3B8',
        glow: 'rgba(148,163,184,0.45)',
        title: 'ابدأ رحلتك المالية',
        msg: 'أضف مصادر دخلك لتبدأ رحلتك المالية مع علي الذكي!',
      };
    }
    if (ratio < 50) return {
      tone: 'good' as const, color: '#00FF7F', glow: 'rgba(0,255,127,0.55)',
      title: 'أداء مالي مذهل',
      msg: 'أداء مالي مذهل! أنت تسير بخطى ثابتة نحو هدفك الادخاري لهذا الشهر.',
    };
    if (ratio <= 80) return {
      tone: 'mid' as const, color: '#3B82F6', glow: 'rgba(59,130,246,0.55)',
      title: 'توازن جيد',
      msg: "توازن جيد، لكن راقب مصروفاتك في فئة 'الكماليات' لضمان الاستمرارية.",
    };
    return {
      tone: 'warn' as const, color: '#EF4444', glow: 'rgba(239,68,68,0.6)',
      title: 'تنبيه ميزانية',
      msg: 'تنبيه: ميزانيتك تقترب من النفاد. قلل الإنفاق الآن لتجنب العجز المالي.',
    };
  })();

  const tip = () => advisor.msg;

  const savingsBarColor = () => {
    if (savingsProgress >= 100) return '#00FF7F';
    if (savingsProgress >= 50)  return '#F59E0B';
    return '#EF4444';
  };

  const spendingBarColor = () => {
    if (spendingProgress > 80) return '#EF4444';
    if (spendingProgress >= 50) return '#F59E0B';
    return '#00FF7F';
  };

  const topExpenses = (() => {
    const map: Record<string, number> = {};
    currentTransactions.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, spent]) => {
      const cat = categories.find(c => c.id === id);
      const pct = cat?.limit ? Math.min((spent / cat.limit) * 100, 100) : null;
      return { id, cat, spent, pct };
    });
  })();

  const recent = currentTransactions.slice(0, 3);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto space-y-4">

      {/* Cleaned Header: Avatar+Greeting (side) + Quote (center/horizontal) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4">

        <button onClick={() => onNavigate('profile')}
          className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            background: settings.avatarUrl ? `url(${settings.avatarUrl}) center/cover` : 'linear-gradient(135deg, #D4A017, #F59E0B)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: '2px solid rgba(212,160,23,0.5)',
            boxShadow: '0 0 14px rgba(212,160,23,0.3)',
          }}>
          {!settings.avatarUrl && <span className="text-slate-950 font-black text-base">ع</span>}
        </button>

        <div className="flex-shrink-0">
          <p className="text-sm font-black text-white leading-tight">مرحباً، علي</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#6B7280', fontWeight: 300, letterSpacing: '0.3px' }}>
            {monthYearDisplay}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <WisdomQuote compact={true}/>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(140deg, #0F172A 0%, #061022 100%)',
          border: '1px solid rgba(212,160,23,0.2)',
          boxShadow: '0 0 50px rgba(212,160,23,0.07)',
        }}>
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #D4A017, transparent)' }}/>
        <p className="text-sm mb-0.5" style={{ color: '#6B7280' }}>الرصيد الصافي</p>
        <motion.p
          key={netBalance}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black mb-1"
          style={{ color: netBalance >= 0 ? '#00FF7F' : '#EF4444',
            textShadow: `0 0 24px ${netBalance >= 0 ? 'rgba(0,255,127,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
          {f(netBalance, currencySymbol)}
        </motion.p>
        <p className="text-xs mb-5" style={{ color: '#374151' }}>الدخل − المصاريف − المدخرات</p>

        <div className="grid grid-cols-3 gap-2">
          {([
            { label: 'الدخل', val: totalIncome, Icon: TrendingUp, c: '#00FF7F' },
            { label: 'المصاريف', val: totalExpenses, Icon: TrendingDown, c: '#EF4444' },
            { label: 'المدخرات', val: totalSavings, Icon: PiggyBank, c: '#D4A017' },
          ] as const).map(({ label, val, Icon, c }) => (
            <div key={label} className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Icon size={13} style={{ color: c }}/>
              <p className="text-sm font-bold text-white mt-1">{val.toLocaleString('ar-IQ')}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#4B5563' }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dual Progress: Spending (top) + Savings (bottom) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 space-y-5"
        style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Spending Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-white">خط الإنفاق العام</p>
            <span className="text-xs font-bold" style={{ color: spendingBarColor() }}>
              استهلاك الميزانية: {spendingProgress.toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-xs mb-2" style={{ color: '#6B7280' }}>
            <span>المنفق: {f(totalExpenses, currencySymbol)}</span>
            <span>من الدخل: {f(totalIncome, currencySymbol)}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${spendingProgress}%` }}
              transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${spendingBarColor()}, ${spendingBarColor()}bb)`,
                boxShadow: `0 0 10px ${spendingBarColor()}55` }}/>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }}/>

        {/* Savings Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-white">المستشار الذكي للادخار</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>هدف الـ 20% من الدخل</p>
            </div>
            <button onClick={() => setShowTip(p => !p)}
              className="text-xs px-3 py-1 rounded-lg font-semibold"
              style={{ background: 'rgba(212,160,23,0.1)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.2)' }}>
              {showTip ? 'إخفاء' : 'نصيحة'}
            </button>
          </div>

          <div className="flex justify-between text-xs mb-2" style={{ color: '#6B7280' }}>
            <span>الفعلي: {f(totalSavings, currencySymbol)}</span>
            <span>المستهدف: {f(recommendedSavings, currencySymbol)}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${savingsProgress}%` }}
              transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${savingsBarColor()}, ${savingsBarColor()}bb)`,
                boxShadow: `0 0 10px ${savingsBarColor()}55` }}/>
          </div>
          <p className="text-xs mt-2 font-bold" style={{ color: savingsBarColor() }}>
            {savingsProgress.toFixed(0)}% من الهدف
          </p>

          {showTip && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 rounded-xl text-xs leading-relaxed"
              style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.14)', color: '#E5E7EB' }}>
              {tip()}
            </motion.div>
          )}
        </div>
      </motion.div>

      {topExpenses.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-bold text-white mb-4">أعلى فئات الإنفاق</p>
          <div className="space-y-3">
            {topExpenses.map(({ id, cat, spent, pct }) => {
              const bc = pct !== null ? getCategoryColor(pct) : '#3B82F6';
              return (
                <div key={id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white font-medium">{cat?.name ?? id}</span>
                    <span style={{ color: bc }}>{f(spent, currencySymbol)}</span>
                  </div>
                  {cat?.limit && (
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: bc, boxShadow: `0 0 6px ${bc}70` }}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {recent.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">آخر المعاملات</p>
            <button onClick={() => onNavigate('transactions')}
              className="flex items-center gap-1 text-xs" style={{ color: '#D4A017' }}>
              عرض الكل <ChevronLeft size={12}/>
            </button>
          </div>
          <div className="space-y-2">
            {recent.map(tx => {
              const cat = categories.find(c => c.id === tx.category);
              const color = tx.type === 'income' ? '#00FF7F' : tx.type === 'saving' ? '#D4A017' : '#EF4444';
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cat?.color ?? '#6B7280'}18` }}>
                    <Wallet size={14} style={{ color: cat?.color ?? '#6B7280' }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{tx.name || cat?.name || tx.category}</p>
                    <p className="text-[10px]" style={{ color: '#374151' }}>{tx.date}</p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0" style={{ color }}>
                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('ar-IQ')}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
