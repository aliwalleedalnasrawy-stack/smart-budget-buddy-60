import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote as QuoteIcon, RefreshCw } from 'lucide-react';
import { getRandomQuote, Quote } from '../utils/quotes';

interface Props {
  compact?: boolean;
}

export const WisdomQuote = ({ compact = false }: Props) => {
  const [quote, setQuote] = useState<Quote>(getRandomQuote);
  const [k, setK] = useState(0);

  const refresh = () => { setQuote(getRandomQuote()); setK(p => p + 1); };

  if (compact) {
    return (
      <div className="rounded-2xl p-4"
        style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.14)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={k}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
            className="flex items-start gap-3">
            <QuoteIcon size={16} style={{ color: '#D4A017', marginTop: '2px', flexShrink: 0 }}/>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed text-gray-200 mb-1.5">{quote.text}</p>
              <p className="text-[10px] font-semibold" style={{ color: '#D4A017' }}>— {quote.author}</p>
            </div>
            <button onClick={refresh}
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-white/5 transition-colors"
              style={{ color: '#4B5563' }}>
              <RefreshCw size={12}/>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(212,160,23,0.12)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)' }}>
          <QuoteIcon size={17} style={{ color: '#D4A017' }}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-2" style={{ color: '#D4A017' }}>حكمة اليوم</p>
          <AnimatePresence mode="wait">
            <motion.div key={k}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <p className="text-sm leading-relaxed text-gray-200 mb-2">{quote.text}</p>
              <p className="text-xs font-bold" style={{ color: '#00FF7F' }}>— {quote.author}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <button onClick={refresh}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-white/5 transition-colors"
          style={{ color: '#4B5563' }}>
          <RefreshCw size={13}/>
        </button>
      </div>
    </div>
  );
};
