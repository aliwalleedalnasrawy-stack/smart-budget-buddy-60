import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, TrendingDown, PiggyBank, Archive } from 'lucide-react';
import { ArchivedMonth, Category } from '../../types';
import { CategoryIcon } from '../CategoryIcon';

interface Props {
  archivedMonths: ArchivedMonth[];
  categories: Category[];
  currencySymbol: string;
}

const f = (n: number, sym: string) => n.toLocaleString('ar-IQ') + ' ' + sym;

export const ArchiveScreen = ({ archivedMonths, categories, currencySymbol }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (archivedMonths.length === 0) {
    return (
      <div className="pb-28 pt-4 px-4 max-w-lg mx-auto">
        <h2 className="text-xl font-black text-white mb-6">الأرشيف الشهري</h2>
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.15)' }}>
            <Archive size={32} style={{ color: '#D4A017' }} />
          </div>
          <p className="text-white font-bold text-lg mb-2">لا يوجد سجل بعد</p>
          <p className="text-sm" style={{ color: '#4B5563' }}>
            ستظهر هنا بيانات الأشهر السابقة تلقائياً
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto">
      <h2 className="text-xl font-black text-white mb-6">الأرشيف الشهري</h2>
      <div className="space-y-3">
        {archivedMonths.map((month) => {
          const open = expanded === month.month;
          return (
            <motion.div key={month.month} layout className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(15,23,42,0.85)',
                border: open ? '1px solid rgba(212,160,23,0.25)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              <button onClick={() => setExpanded(open ? null : month.month)}
                className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(212,160,23,0.1)' }}>
                    <Archive size={17} style={{ color: '#D4A017' }} />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-white">{month.label}</p>
                    <p className="text-xs" style={{ color: '#4B5563' }}>
                      {month.transactions.length} معاملة
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-black"
                      style={{ color: month.netBalance >= 0 ? '#00FF7F' : '#EF4444' }}>
                      {f(month.netBalance, currencySymbol)}
                    </p>
                    <p className="text-[10px]" style={{ color: '#374151' }}>الرصيد الصافي</p>
                  </div>
                  <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} style={{ color: '#4B5563' }} />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="grid grid-cols-3 gap-2 my-4">
                        {[
                          { label: 'الدخل',    val: month.totalIncome,   Icon: TrendingUp,  c: '#00FF7F' },
                          { label: 'المصاريف', val: month.totalExpenses, Icon: TrendingDown, c: '#EF4444' },
                          { label: 'المدخرات', val: month.totalSavings,  Icon: PiggyBank,   c: '#D4A017' },
                        ].map(({ label, val, Icon, c }) => (
                          <div key={label} className="rounded-xl p-3 text-center"
                            style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <Icon size={13} style={{ color: c }} className="mx-auto mb-1" />
                            <p className="text-xs font-bold text-white">{val.toLocaleString('ar-IQ')}</p>
                            <p className="text-[9px] mt-0.5" style={{ color: '#4B5563' }}>{label}</p>
                          </div>
                        ))}
                      </div>

                      {month.transactions.length > 0 && (
                        <div className="space-y-1">
                          {month.transactions.slice(0, 8).map(tx => {
                            const cat = categories.find(c => c.id === tx.category);
                            const color = tx.type === 'income' ? '#00FF7F' : tx.type === 'saving' ? '#D4A017' : '#EF4444';
                            return (
                              <div key={tx.id}
                                className="flex items-center gap-3 py-2 border-b last:border-0"
                                style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                  style={{ background: `${cat?.color ?? '#6B7280'}15` }}>
                                  <CategoryIcon name={cat?.icon ?? 'MoreHorizontal'} size={14} color={cat?.color ?? '#6B7280'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-white">{cat?.name ?? tx.category}</p>
                                  <p className="text-[10px]" style={{ color: '#374151' }}>{tx.date}</p>
                                </div>
                                <p className="text-xs font-bold flex-shrink-0" style={{ color }}>
                                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('ar-IQ')}
                                </p>
                              </div>
                            );
                          })}
                          {month.transactions.length > 8 && (
                            <p className="text-center text-xs pt-2" style={{ color: '#374151' }}>
                              +{month.transactions.length - 8} معاملة أخرى
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
