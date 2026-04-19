import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard as Edit2, Check, X, Plus, Trash2 } from 'lucide-react';
import { Category, Transaction } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { getCategoryColor, AVAILABLE_ICONS, AVAILABLE_COLORS, INCOME_IDS, SAVING_IDS } from '../../utils/categories';

interface Props {
  categories: Category[];
  transactions: Transaction[];
  currencySymbol: string;
  onUpdate: (cat: Category) => void;
  onAdd: (cat: Omit<Category, 'id'>) => void;
  onDelete: (id: string) => void;
  onFilterTransactions: (id: string) => void;
}

const SYSTEM_IDS = [...INCOME_IDS, ...SAVING_IDS];

export const Categories = ({
  categories, transactions, currencySymbol,
  onUpdate, onAdd, onDelete, onFilterTransactions,
}: Props) => {
  const [editing, setEditing]   = useState<string | null>(null);
  const [limitInput, setLimit]  = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [addType, setAddType]   = useState<'expense' | 'income'>('expense');
  const [newName, setNewName]   = useState('');
  const [newIcon, setNewIcon]   = useState('MoreHorizontal');
  const [newColor, setNewColor] = useState('#F59E0B');

  const spend = (id: string) =>
    transactions.filter(t => t.category === id && t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const earned = (id: string) =>
    transactions.filter(t => t.category === id && t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const incCats = categories.filter(c => INCOME_IDS.includes(c.id) || (c.custom && c.color === '#00FF7F'));
  const expCats = categories.filter(c => !INCOME_IDS.includes(c.id) && c.id !== 'savings_cat' && !(c.custom && c.color === '#00FF7F'));

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd({
      name: newName.trim(),
      icon: newIcon,
      color: addType === 'income' ? '#00FF7F' : newColor,
      custom: true,
    });
    setNewName(''); setNewIcon('MoreHorizontal'); setNewColor('#F59E0B'); setShowAdd(false);
  };

  const CategoryCard = (cat: Category) => {
    const isIncome = INCOME_IDS.includes(cat.id) || (cat.custom && cat.color === '#00FF7F');
    const spent  = spend(cat.id);
    const income = earned(cat.id);
    const pct    = !isIncome && cat.limit ? Math.min((spent / cat.limit) * 100, 100) : null;
    const bc     = pct !== null ? getCategoryColor(pct) : cat.color;
    const isEd   = editing === cat.id;
    const isDel  = cat.custom && !SYSTEM_IDS.includes(cat.id);

    return (
      <motion.div key={cat.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-2xl p-4"
        style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => onFilterTransactions(cat.id)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
            <CategoryIcon name={cat.icon} size={22} color={cat.color} />
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm text-white">{cat.name}</p>
              <div className="flex items-center gap-1">
                {isDel && (
                  <button onClick={() => onDelete(cat.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <Trash2 size={11} style={{ color: '#EF4444' }} />
                  </button>
                )}
                <button onClick={() => isEd ? setEditing(null) : (setEditing(cat.id), setLimit(cat.limit?.toString() ?? ''))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {isEd
                    ? <X size={11} style={{ color: '#EF4444' }} />
                    : <Edit2 size={11} style={{ color: '#6B7280' }} />
                  }
                </button>
              </div>
            </div>

            {isEd ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 mt-1.5">
                <input type="number" value={limitInput} onChange={e => setLimit(e.target.value)}
                  placeholder="حد الإنفاق" inputMode="decimal" autoFocus
                  className="flex-1 bg-transparent text-white text-sm outline-none px-3 py-1.5 rounded-xl"
                  style={{ border: '1px solid rgba(212,160,23,0.35)', direction: 'ltr' }} />
                <span className="text-xs" style={{ color: '#D4A017' }}>{currencySymbol}</span>
                <button onClick={() => {
                    const l = parseFloat(limitInput);
                    onUpdate({ ...cat, limit: isNaN(l) || l <= 0 ? undefined : l });
                    setEditing(null);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,255,127,0.12)' }}>
                  <Check size={13} style={{ color: '#00FF7F' }} />
                </button>
              </motion.div>
            ) : pct !== null ? (
              <>
                <div className="flex justify-between text-[10px] mb-1" style={{ color: '#6B7280' }}>
                  <span>{spent.toLocaleString('ar-IQ')} {currencySymbol}</span>
                  <span style={{ color: bc }}>{pct.toFixed(0)}%{pct >= 90 ? ' ⚠' : ''}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }} className="h-full rounded-full"
                    style={{ background: bc, boxShadow: `0 0 6px ${bc}55` }} />
                </div>
              </>
            ) : isIncome ? (
              <p className="text-xs font-bold" style={{ color: '#00FF7F' }}>
                إجمالي الدخل: {income.toLocaleString('ar-IQ')} {currencySymbol}
              </p>
            ) : (
              <p className="text-xs" style={{ color: '#374151' }}>
                {spent > 0 ? `${spent.toLocaleString('ar-IQ')} ${currencySymbol}` : 'لا إنفاق بعد'}
                {cat.id !== 'savings_cat' && (
                  <span style={{ color: '#4B5563' }}> — ✏ لتعيين حد</span>
                )}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white">إدارة الفئات</h2>
        <button onClick={() => setShowAdd(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={{ background: showAdd ? 'rgba(212,160,23,0.15)' : 'rgba(0,255,127,0.1)',
            color: showAdd ? '#D4A017' : '#00FF7F',
            border: showAdd ? '1px solid rgba(212,160,23,0.3)' : '1px solid rgba(0,255,127,0.2)' }}>
          <Plus size={15} strokeWidth={2.5} />
          {showAdd ? 'إلغاء' : 'فئة جديدة'}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(212,160,23,0.2)' }}>
              <p className="text-sm font-bold text-white mb-4">إضافة فئة جديدة</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['expense', 'income'] as const).map(t => (
                  <button key={t} onClick={() => setAddType(t)}
                    className="py-2.5 rounded-xl text-xs font-bold"
                    style={{
                      background: addType === t ? (t === 'income' ? 'rgba(0,255,127,0.12)' : 'rgba(239,68,68,0.12)') : 'rgba(255,255,255,0.04)',
                      color: addType === t ? (t === 'income' ? '#00FF7F' : '#EF4444') : '#6B7280',
                      border: addType === t ? `1px solid ${t === 'income' ? 'rgba(0,255,127,0.3)' : 'rgba(239,68,68,0.3)'}` : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    {t === 'income' ? 'دخل' : 'مصروف'}
                  </button>
                ))}
              </div>

              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="اسم الفئة" maxLength={20}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none mb-4 placeholder-gray-700"
                style={{ background: 'rgba(2,6,23,0.7)', border: '1px solid rgba(255,255,255,0.08)' }} />

              <p className="text-xs mb-2 font-semibold" style={{ color: '#9CA3AF' }}>اختر أيقونة</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {AVAILABLE_ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewIcon(ic)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: newIcon === ic ? 'rgba(212,160,23,0.2)' : 'rgba(255,255,255,0.04)',
                      border: newIcon === ic ? '1.5px solid #D4A017' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <CategoryIcon name={ic} size={16} color={newIcon === ic ? '#D4A017' : '#6B7280'} />
                  </button>
                ))}
              </div>

              {addType === 'expense' && (
                <>
                  <p className="text-xs mb-2 font-semibold" style={{ color: '#9CA3AF' }}>اختر لون</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {AVAILABLE_COLORS.map(c => (
                      <button key={c} onClick={() => setNewColor(c)}
                        className="w-7 h-7 rounded-lg"
                        style={{
                          background: c,
                          border: newColor === c ? '2.5px solid white' : '2px solid transparent',
                          boxShadow: newColor === c ? `0 0 8px ${c}` : 'none',
                        }} />
                    ))}
                  </div>
                </>
              )}

              <button onClick={handleAdd} disabled={!newName.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: newName.trim() ? 'linear-gradient(135deg,#D4A017,#F59E0B)' : 'rgba(212,160,23,0.1)',
                  color: newName.trim() ? '#020617' : '#4B5563',
                }}>
                <Plus size={15} /> إضافة الفئة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: '#00FF7F' }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#00FF7F' }} /> فئات الدخل
      </p>
      <div className="space-y-3 mb-5">
        <AnimatePresence>{incCats.map(CategoryCard)}</AnimatePresence>
      </div>

      <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: '#EF4444' }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#EF4444' }} /> فئات المصاريف
      </p>
      <div className="space-y-3">
        <AnimatePresence>{expCats.map(CategoryCard)}</AnimatePresence>
      </div>

      <div className="mt-5 p-4 rounded-2xl text-xs leading-relaxed"
        style={{ background: 'rgba(212,160,23,0.04)', border: '1px solid rgba(212,160,23,0.1)' }}>
        <p className="font-semibold mb-1" style={{ color: '#D4A017' }}>نصيحة</p>
        <p style={{ color: '#6B7280' }}>اضغط على أيقونة الفئة لتصفية المعاملات. اضغط ✏ لتعيين حد. الفئات المخصصة يمكن حذفها.</p>
      </div>
    </div>
  );
};
