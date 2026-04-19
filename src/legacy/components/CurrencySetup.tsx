import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { Currency } from '../types';

export const CurrencySetup = ({ onComplete }: { onComplete: (c: Currency, sym: string) => void }) => {
  const [selected, setSelected] = useState<Currency>('IQD');
  const [custom, setCustom] = useState('');

  const opts = [
    { value: 'IQD' as Currency, label: 'الدينار العراقي', sym: 'د.ع', flag: '🇮🇶' },
    { value: 'USD' as Currency, label: 'الدولار الأمريكي', sym: '$',   flag: '🇺🇸' },
    { value: 'custom' as Currency, label: 'عملة مخصصة',    sym: '?',   flag: '🌐' },
  ];

  const canGo = selected !== 'custom' || custom.trim().length > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-6" style={{ background: '#020617' }}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)',
              boxShadow: '0 0 30px rgba(212,160,23,0.3)', border: '1px solid rgba(212,160,23,0.25)' }}>
            <Globe size={36} style={{ color: '#D4A017' }}/>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">اختر عملتك</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>سيتم استخدامها في جميع أنحاء التطبيق</p>
        </div>

        <div className="space-y-3 mb-6">
          {opts.map(o => (
            <motion.button key={o.value} whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(o.value)}
              className="w-full flex items-center justify-between p-4 rounded-2xl transition-all"
              style={{
                background: selected === o.value ? 'rgba(212,160,23,0.1)' : 'rgba(15,23,42,0.8)',
                border: selected === o.value ? '1.5px solid #D4A017' : '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: selected === o.value ? '0 0 16px rgba(212,160,23,0.15)' : 'none',
              }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{o.flag}</span>
                <div className="text-right">
                  <p className="font-semibold text-white text-sm">{o.label}</p>
                  <p className="text-xs" style={{ color: '#D4A017' }}>{o.sym}</p>
                </div>
              </div>
              {selected === o.value && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#D4A017' }}>
                  <Check size={13} className="text-slate-950" strokeWidth={3}/>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {selected === 'custom' && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-6">
            <input type="text" value={custom} onChange={e => setCustom(e.target.value)}
              placeholder="رمز العملة (مثال: EUR)" maxLength={5} autoFocus
              className="w-full p-4 rounded-2xl text-white text-center text-lg font-semibold outline-none"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1.5px solid rgba(212,160,23,0.4)' }}/>
          </motion.div>
        )}

        <motion.button whileTap={{ scale: 0.97 }} onClick={() => canGo && onComplete(selected, custom)}
          disabled={!canGo}
          className="w-full py-4 rounded-2xl font-bold text-lg"
          style={{
            background: canGo ? 'linear-gradient(135deg, #D4A017, #F59E0B)' : 'rgba(212,160,23,0.2)',
            color: canGo ? '#020617' : '#555',
            boxShadow: canGo ? '0 0 24px rgba(212,160,23,0.3)' : 'none',
          }}>
          ابدأ الآن
        </motion.button>
      </motion.div>
    </div>
  );
};
