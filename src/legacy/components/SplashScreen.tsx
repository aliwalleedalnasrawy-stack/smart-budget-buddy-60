import { useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/app-logo.png';

export const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden px-4"
      style={{ background: '#000000' }}
    >
      {/* Outer animated neon halo */}
      <div className="relative flex items-center justify-center mb-8">
        <motion.div
          aria-hidden
          initial={{ opacity: 0.4, scale: 0.9 }}
          animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full"
          style={{
            width: 'min(78vw, 360px)',
            height: 'min(78vw, 360px)',
            background:
              'radial-gradient(circle, rgba(212,160,23,0.55) 0%, rgba(0,255,127,0.25) 45%, rgba(0,0,0,0) 72%)',
            filter: 'blur(22px)',
          }}
        />
        <motion.img
          src={logo}
          alt="ميزانيتي الذكية"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative object-contain"
          style={{
            width: 'min(72vw, 360px)',
            height: 'min(72vw, 360px)',
            imageRendering: 'auto',
            filter:
              'drop-shadow(0 0 22px rgba(212,160,23,0.85)) drop-shadow(0 0 44px rgba(0,255,127,0.45))',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="text-center px-4 max-w-full"
      >
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 leading-tight break-words"
          style={{ color: '#D4A017', textShadow: '0 0 30px rgba(212,160,23,0.45)' }}
        >
          مرحباً بك في تطبيق ميزانيتي الذكية
        </h1>
        <p
          className="text-sm sm:text-base md:text-lg font-semibold tracking-widest"
          style={{ color: '#00FF7F', textShadow: '0 0 12px rgba(0,255,127,0.4)' }}
        >
          دليلك إلى الحرية المالية
        </p>
      </motion.div>
    </motion.div>
  );
};
