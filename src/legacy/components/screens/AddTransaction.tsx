import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { Transaction, TransactionType, Category } from '../../types';
import { CategoryIcon } from '../CategoryIcon';

interface Props {
  categories: Category[]; currencySymbol: string;
  onAdd: (tx: Omit<Transaction, 'id' | 'month'>) => void; onDone: () => void;
}

export const AddTransaction = ({ categories, currencySymbol, onAdd, onDone }: Props) => {
  const [amount, setAmount]   = useState('');
  const [type, setType]       = useState<TransactionType>('expense');
  const [category, setCat]    = useState('');
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote]       = useState('');
  const [catOpen, setCatOpen] = useState(false);

  const availCats = categories.filter(c => {
    if (type === 'income')  return ['salary','investment','freelance'].includes(c.id);
    if (type === 'saving')  return c.id === 'savings_cat';
    return !['salary','investment','freelance','savings_cat'].includes(c.id);
  });

  const selCat = categories.find(c => c.id === category);
  const canSave = parseFloat(amount) > 0 && !!category;

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0 || !category) return;
    onAdd({ amount: n, type, category, date, note: note || undefined });
    onDone();
  };

  const typeOpts: { v: TransactionType; l: string; c: string }[] = [
    { v: 'income',  l: 'دخل',    c: '#00FF7F' },
    { v: 'expense', l: 'مصروف', c: '#EF4444' },
    { v: 'saving',  l: 'مدخرات', c: '#D4A017' },
  ];

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-black text-white mb-6">إضافة معاملة</h2>

        <div className="rounded-3xl p-6 space-y-5"
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>

          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>المبلغ</label>
            <div className="flex items-center gap-3 rounded-2xl px-4 py-4"
              style={{ background: 'rgba(2,6,23,0.7)', border: '1.5px solid rgba(212,160,23,0.22)' }}>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0" min="0" inputMode="decimal" autoFocus
                className="flex-1 bg-transparent text-white text-3xl font-black outline-none text-right"
                style={{ direction: 'ltr' }}/>
              <span className="text-xl font-bold" style={{ color: '#D4A017' }}>{currencySymbol}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>نوع المعاملة</label>
            <div className="grid grid-cols-3 gap-2">
              {typeOpts.map(({ v, l, c }) => (
                <motion.button key={v} whileTap={{ scale: 0.94 }}
                  onClick={() => { setType(v); setCat(''); }}
                  className="py-3.5 rounded-2xl text-sm font-bold transition-all"
                  style={{
                    background: type === v ? `${c}15` : 'rgba(2,6,23,0.5)',
                    color: type === v ? c : '#4B5563',
                    border: type === v ? `1.5px solid ${c}45` : '1.5px solid rgba(255,255,255,0.06)',
                    boxShadow: type === v ? `0 0 14px ${c}20` : 'none',
                  }}>
                  {l}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>الفئة</label>
            <button onClick={() => setCatOpen(p => !p)}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl"
              style={{
                background: 'rgba(2,6,23,0.7)',
                border: category ? '1.5px solid rgba(212,160,23,0.3)' : '1.5px solid rgba(255,255,255,0.08)',
              }}>
              <ChevronDown size={15} style={{ color: '#4B5563', transform: catOpen ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }}/>
              {selCat ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{selCat.name}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${selCat.color}20` }}>
                    <CategoryIcon name={selCat.icon} size={15} color={selCat.color}/>
                  </div>
                </div>
              ) : (
                <span className="text-sm" style={{ color: '#374151' }}>اختر الفئة</span>
              )}
            </button>

            {catOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                className="mt-2 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(7,15,31,0.97)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="p-3 grid grid-cols-3 gap-2">
                  {availCats.map(cat => (
                    <motion.button key={cat.id} whileTap={{ scale: 0.92 }}
                      onClick={() => { setCat(cat.id); setCatOpen(false); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
                      style={{
                        background: category === cat.id ? `${cat.color}15` : 'rgba(255,255,255,0.03)',
                        border: category === cat.id ? `1px solid ${cat.color}40` : '1px solid transparent',
                      }}>
                      <CategoryIcon name={cat.icon} size={20} color={cat.color}/>
                      <span className="text-[10px] text-center font-medium"
                        style={{ color: category === cat.id ? cat.color : '#6B7280' }}>
                        {cat.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>التاريخ</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none"
              style={{ background: 'rgba(2,6,23,0.7)', border: '1.5px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}/>
          </div>

          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>ملاحظة (اختياري)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="أضف ملاحظة..."
              className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none placeholder-gray-700"
              style={{ background: 'rgba(2,6,23,0.7)', border: '1.5px solid rgba(255,255,255,0.08)' }}/>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={submit} disabled={!canSave}
            className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
            style={{
              background: canSave ? 'linear-gradient(135deg, #D4A017, #F59E0B)' : 'rgba(212,160,23,0.12)',
              color: canSave ? '#020617' : '#4B5563',
              boxShadow: canSave ? '0 0 24px rgba(212,160,23,0.28)' : 'none',
            }}>
            <Check size={19} strokeWidth={3}/>
            حفظ المعاملة
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
