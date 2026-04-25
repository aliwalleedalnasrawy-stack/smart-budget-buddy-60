import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Trash2, Undo2, Search, Archive as ArchiveIcon, List } from 'lucide-react';
import { Transaction, Category, ArchivedMonth } from '../../types';
import { CategoryIcon } from '../CategoryIcon';

interface Props {
  transactions: Transaction[]; categories: Category[];
  currencySymbol: string; filterCategory?: string;
  archivedMonths?: ArchivedMonth[];
  onDelete: (id: string) => void; onUndo: (tx: Transaction) => void;
}

export const Transactions = ({ transactions, categories, currencySymbol, filterCategory, archivedMonths = [], onDelete, onUndo }: Props) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'saving'>('all');
  const [catFilter] = useState(filterCategory ?? 'all');
  const [view, setView] = useState<'current' | 'archive'>('current');
  const [deleted, setDeleted] = useState<Transaction | null>(null);
  const [undo, setUndo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const archivedTx = useMemo(
    () => archivedMonths.flatMap(m => m.transactions.map(t => ({ ...t, _monthLabel: m.label }))),
    [archivedMonths]
  );
  const sourceTx = view === 'archive' ? archivedTx : transactions;

  const del = (tx: Transaction) => {
    onDelete(tx.id); setDeleted(tx); setUndo(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setUndo(false); setDeleted(null); }, 5000);
  };

  const doUndo = () => {
    if (deleted) { onUndo(deleted); setDeleted(null); setUndo(false); if (timer.current) clearTimeout(timer.current); }
  };

  const typeAr = (t: string) => t === 'income' ? 'دخل' : t === 'expense' ? 'مصروف' : 'مدخرات';
  const typeClr = (t: string) => t === 'income' ? '#00FF7F' : t === 'saving' ? '#D4A017' : '#EF4444';

  const list = sourceTx.filter(tx => {
    const cat = categories.find(c => c.id === tx.category);
    return (!search || cat?.name.includes(search) || tx.note?.includes(search) || tx.amount.toString().includes(search))
      && (filter === 'all' || tx.type === filter)
      && (catFilter === 'all' || tx.category === catFilter);
  });

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto">
      {filterCategory && filterCategory !== 'all' ? (
        <div className="mb-4">
          <h2 className="text-xl font-black text-white">
            {categories.find(c => c.id === filterCategory)?.name ?? 'الفئة'}
          </h2>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            {list.length} عملية ضمن هذه الفئة
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white">
            {view === 'archive' ? 'الأرشيف' : 'المعاملات'}
          </h2>
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => setView('current')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: view === 'current' ? 'rgba(212,160,23,0.15)' : 'transparent',
                color: view === 'current' ? '#D4A017' : '#6B7280',
                boxShadow: view === 'current' ? '0 0 8px rgba(212,160,23,0.3)' : 'none',
              }}>
              <List size={13}/> الحالي
            </button>
            <button onClick={() => setView('archive')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: view === 'archive' ? 'rgba(168,85,247,0.15)' : 'transparent',
                color: view === 'archive' ? '#A855F7' : '#6B7280',
                boxShadow: view === 'archive' ? '0 0 8px rgba(168,85,247,0.3)' : 'none',
              }}>
              <ArchiveIcon size={13}/> الأرشيف
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-3"
        style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Search size={15} style={{ color: '#4B5563' }}/>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-700"/>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {(['all', 'income', 'expense', 'saving'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{
              background: filter === f ? 'rgba(212,160,23,0.12)' : 'rgba(15,23,42,0.7)',
              color: filter === f ? '#D4A017' : '#4B5563',
              border: filter === f ? '1px solid rgba(212,160,23,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}>
            {f === 'all' ? 'الكل' : typeAr(f)}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-white font-semibold">لا توجد معاملات</p>
          <p className="text-sm mt-1" style={{ color: '#374151' }}>أضف معاملتك من زر +</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {list.map(tx => (
              <TxCard key={tx.id} tx={tx}
                cat={categories.find(c => c.id === tx.category)}
                color={typeClr(tx.type)} currencySymbol={currencySymbol}
                typeAr={typeAr} onDelete={() => del(tx)}/>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {undo && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto rounded-2xl flex items-center justify-between px-5 py-4 z-50"
            style={{ background: '#1E293B', border: '1px solid rgba(212,160,23,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center gap-3">
              <Trash2 size={15} style={{ color: '#EF4444' }}/>
              <p className="text-sm text-white">تم حذف المعاملة</p>
            </div>
            <button onClick={doUndo}
              className="flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017' }}>
              <Undo2 size={13}/> تراجع
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TxCard = ({ tx, cat, color, currencySymbol, typeAr, onDelete }: {
  tx: Transaction; cat: Category | undefined; color: string;
  currencySymbol: string; typeAr: (t: string) => string; onDelete: () => void;
}) => {
  const [off, setOff] = useState(0);
  const [gone, setGone] = useState(false);

  const end = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -72) { setGone(true); setTimeout(onDelete, 180); }
    else setOff(0);
  };

  return (
    <motion.div layout initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: gone ? 0 : 1, x: gone ? -100 : 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
      className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-center justify-end px-5 rounded-2xl"
        style={{ background: '#EF4444' }}>
        <Trash2 size={18} className="text-white"/>
      </div>
      <motion.div drag="x" dragConstraints={{ right: 0, left: -110 }} dragElastic={0.08}
        onDragEnd={end} onDrag={(_, i) => setOff(i.offset.x)}
        className="relative flex items-center gap-3 p-4 rounded-2xl cursor-grab active:cursor-grabbing"
        style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.06)',
          x: off < 0 ? off : 0, touchAction: 'pan-y',
        }}>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${cat?.color ?? '#6B7280'}15`, border: `1px solid ${cat?.color ?? '#6B7280'}28` }}>
          <CategoryIcon name={cat?.icon ?? 'MoreHorizontal'} size={20} color={cat?.color ?? '#6B7280'}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {tx.name?.trim() || tx.note?.trim() || cat?.name || tx.category}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${color}18`, color }}>
              {typeAr(tx.type)}
            </span>
            {cat?.name && (tx.name?.trim() || tx.note?.trim()) && (
              <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: `${cat.color}14`, color: cat.color }}>
                {cat.name}
              </span>
            )}
            <span className="text-[10px]" style={{ color: '#6B7280' }}>{tx.date}</span>
          </div>
          {tx.note && tx.name?.trim() && (
            <p className="text-xs mt-0.5 truncate" style={{ color: '#4B5563' }}>{tx.note}</p>
          )}
        </div>
        <p className="text-base font-black flex-shrink-0" style={{ color }}>
          {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('ar-IQ')}
          <span className="text-[10px] font-normal"> {currencySymbol}</span>
        </p>
      </motion.div>
    </motion.div>
  );
};
