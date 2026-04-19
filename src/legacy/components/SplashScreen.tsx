import { useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/app-logo.png';

export const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{ background: '#000000' }}
    >
      <motion.img
        src={logo}
        alt="ميزانيتي الذكية"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="w-48 h-48 md:w-60 md:h-60 mb-8 object-contain"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="text-center px-8"
      >
        <h1
          className="text-3xl md:text-4xl font-black mb-2"
          style={{ color: '#D4A017', textShadow: '0 0 30px rgba(212,160,23,0.45)' }}
        >
          مرحباً بك، علي
        </h1>
        <p
          className="text-base md:text-lg font-semibold tracking-widest"
          style={{ color: '#00FF7F', textShadow: '0 0 12px rgba(0,255,127,0.4)' }}
        >
          دليلك إلى الحرية المالية
        </p>
      </motion.div>
    </motion.div>
  );
};
