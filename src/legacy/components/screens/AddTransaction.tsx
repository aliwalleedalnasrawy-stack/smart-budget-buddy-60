import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Plus, PiggyBank, Trash2 } from 'lucide-react';
import { Transaction, TransactionType, Category, SavingPot } from '../../types';
import { CategoryIcon } from '../CategoryIcon';

interface Props {
  categories: Category[]; currencySymbol: string;
  pots: SavingPot[];
  onAdd: (tx: Omit<Transaction, 'id' | 'month'>) => void;
  onAddPot: (pot: Omit<SavingPot, 'id' | 'createdAt'>) => void;
  onDeletePot: (id: string) => void;
  onDone: () => void;
}

export const AddTransaction = ({ categories, currencySymbol, pots, onAdd, onAddPot, onDeletePot, onDone }: Props) => {
  const [name, setName]       = useState('');
  const [amount, setAmount]   = useState('');
  const [type, setType]       = useState<TransactionType>('expense');
  const [category, setCat]    = useState('');
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote]       = useState('');
  const [pot, setPot]         = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [showNewPot, setShowNewPot] = useState(false);
  const [newPotName, setNewPotName] = useState('');
  const [newPotTarget, setNewPotTarget] = useState('');

  const availCats = categories.filter(c => {
    if (type === 'income')  return ['salary','investment','freelance'].includes(c.id) || (c.custom && c.color === '#00FF7F');
    if (type === 'saving')  return c.id === 'savings_cat';
    return !['salary','investment','freelance','savings_cat'].includes(c.id) && !(c.custom && c.color === '#00FF7F');
  });

  const selCat = categories.find(c => c.id === category);
  const canSave = parseFloat(amount) > 0 && !!category;

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0 || !category) return;
    onAdd({
      name: name.trim() || undefined,
      amount: n,
      type,
      category,
      date,
      note: note || undefined,
      pot: type === 'saving' && pot ? pot : undefined,
    });
    onDone();
  };

  const handleAddPot = () => {
    if (!newPotName.trim()) return;
    const target = parseFloat(newPotTarget);
    onAddPot({
      name: newPotName.trim(),
      target: !isNaN(target) && target > 0 ? target : undefined,
      color: '#D4A017',
      icon: 'PiggyBank',
    });
    setNewPotName(''); setNewPotTarget(''); setShowNewPot(false);
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

          {/* Type selector first (controls available categories) */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>نوع المعاملة</label>
            <div className="grid grid-cols-3 gap-2">
              {typeOpts.map(({ v, l, c }) => (
                <motion.button key={v} whileTap={{ scale: 0.94 }}
                  onClick={() => { setType(v); setCat(''); setPot(''); }}
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

          {/* 1. Name */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>الاسم</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="مثال: راتب أيار، فاتورة الكهرباء..." maxLength={40} autoFocus
              className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none placeholder-gray-700"
              style={{ background: 'rgba(2,6,23,0.7)', border: '1.5px solid rgba(255,255,255,0.08)' }}/>
          </div>

          {/* 2. Amount */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>المبلغ</label>
            <div className="flex items-center gap-3 rounded-2xl px-4 py-4"
              style={{ background: 'rgba(2,6,23,0.7)', border: '1.5px solid rgba(212,160,23,0.22)' }}>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0" min="0" inputMode="decimal"
                className="flex-1 bg-transparent text-white text-3xl font-black outline-none text-right"
                style={{ direction: 'ltr' }}/>
              <span className="text-xl font-bold" style={{ color: '#D4A017' }}>{currencySymbol}</span>
            </div>
          </div>

          {/* 3. Category */}
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

          {/* Savings Pots — only for saving type */}
          {type === 'saving' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#D4A017' }}>
                  <PiggyBank size={13}/> صندوق الادخار
                </label>
                <button onClick={() => setShowNewPot(p => !p)}
                  className="text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                  style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.25)' }}>
                  <Plus size={11}/> صندوق جديد
                </button>
              </div>

              <AnimatePresence>
                {showNewPot && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-2">
                    <div className="rounded-xl p-3 space-y-2"
                      style={{ background: 'rgba(2,6,23,0.7)', border: '1px solid rgba(212,160,23,0.2)' }}>
                      <input type="text" value={newPotName} onChange={e => setNewPotName(e.target.value)}
                        placeholder="اسم الصندوق (مثال: حج، سيارة)" maxLength={30}
                        className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none placeholder-gray-700"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}/>
                      <input type="number" value={newPotTarget} onChange={e => setNewPotTarget(e.target.value)}
                        placeholder="الهدف (اختياري)" inputMode="decimal"
                        className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none placeholder-gray-700"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', direction: 'ltr' }}/>
                      <button onClick={handleAddPot} disabled={!newPotName.trim()}
                        className="w-full py-2 rounded-lg text-xs font-bold"
                        style={{
                          background: newPotName.trim() ? 'linear-gradient(135deg,#D4A017,#F59E0B)' : 'rgba(212,160,23,0.1)',
                          color: newPotName.trim() ? '#020617' : '#4B5563',
                        }}>
                        إنشاء الصندوق
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {pots.length === 0 && !showNewPot ? (
                <p className="text-xs text-center py-3" style={{ color: '#4B5563' }}>
                  لا توجد صناديق بعد. أنشئ صندوقاً لتنظيم مدخراتك.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {pots.map(p => (
                    <div key={p.id} className="relative">
                      <button onClick={() => setPot(pot === p.id ? '' : p.id)}
                        className="w-full flex items-center gap-2 p-3 rounded-xl text-right"
                        style={{
                          background: pot === p.id ? 'rgba(212,160,23,0.15)' : 'rgba(2,6,23,0.5)',
                          border: pot === p.id ? '1.5px solid #D4A017' : '1px solid rgba(255,255,255,0.06)',
                        }}>
                        <PiggyBank size={14} style={{ color: pot === p.id ? '#D4A017' : '#6B7280' }}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate"
                            style={{ color: pot === p.id ? '#D4A017' : '#E5E7EB' }}>{p.name}</p>
                          {p.target && (
                            <p className="text-[9px]" style={{ color: '#6B7280' }}>
                              هدف: {p.target.toLocaleString('ar-IQ')}
                            </p>
                          )}
                        </div>
                      </button>
                      <button onClick={() => { onDeletePot(p.id); if (pot === p.id) setPot(''); }}
                        className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.9)' }}>
                        <Trash2 size={9} style={{ color: '#fff' }}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Date */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>التاريخ</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none"
              style={{ background: 'rgba(2,6,23,0.7)', border: '1.5px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}/>
          </div>

          {/* 5. Description */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#9CA3AF' }}>الوصف (اختياري)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="أضف وصفاً..."
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
