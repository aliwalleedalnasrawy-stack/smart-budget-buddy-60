import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020617 0%, #040C1A 50%, #020617 100%)' }}>

      {[...Array(24)].map((_, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
            background: i % 2 === 0 ? '#D4A017' : '#00FF7F',
            left: `${5 + (i * 4.1) % 90}%`, top: `${5 + (i * 7.3) % 90}%`,
            opacity: 0.25 + (i % 4) * 0.1,
          }}
          animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.8, 1] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: (i % 5) * 0.4 }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
        className="relative mb-10"
      >
        <motion.div
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(145deg, #0F172A, #1E293B)',
              boxShadow: '0 0 50px rgba(212,160,23,0.35), 0 0 100px rgba(212,160,23,0.12)',
              border: '1px solid rgba(212,160,23,0.25)',
            }}>
            <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
              <rect x="8" y="26" width="52" height="32" rx="7" fill="#D4A017" opacity="0.92"/>
              <rect x="8" y="33" width="52" height="7" fill="#92700A" opacity="0.7"/>
              <rect x="38" y="41" width="15" height="11" rx="3.5" fill="#020617"/>
              <circle cx="45.5" cy="46.5" r="3" fill="#D4A017"/>
              <path d="M 17 26 L 17 19 Q 17 12 24 12 L 52 12 Q 56 12 56 17 L 56 26"
                fill="none" stroke="#D4A017" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M 41 8 L 44 1 M 34 6 L 34 -1 M 27 8 L 24 1"
                stroke="#00FF7F" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-3 rounded-[2.8rem]"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, #D4A017 20%, transparent 40%, #00FF7F 60%, transparent 80%)',
              opacity: 0.28,
              mask: 'radial-gradient(circle, transparent 62%, black 63%)',
              WebkitMask: 'radial-gradient(circle, transparent 62%, black 63%)',
            }}
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
          className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#00FF7F', boxShadow: '0 0 16px #00FF7F' }}
        >
          <TrendingUp size={15} className="text-slate-950" strokeWidth={3}/>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.65 }}
        className="text-center px-8"
      >
        <h1 className="text-4xl font-black mb-3 leading-tight"
          style={{ color: '#D4A017', textShadow: '0 0 30px rgba(212,160,23,0.45)' }}>
          مرحباً بك، علي
        </h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-lg font-semibold tracking-widest"
          style={{ color: '#00FF7F', textShadow: '0 0 12px rgba(0,255,127,0.4)' }}
        >
          دليلك إلى الحرية المالية
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 1.3, duration: 1.1, ease: 'easeInOut' }}
        className="absolute bottom-16 w-52 h-0.5 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, #D4A017 40%, #00FF7F 60%, transparent)' }}
      />
    </div>
  );
};
