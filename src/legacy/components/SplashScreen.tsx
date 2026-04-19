import { useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/app-logo.jpg';

export const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020617 0%, #040C1A 50%, #020617 100%)' }}
    >
      <motion.img
        src={logo}
        alt="ميزانيتي الذكية"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] mb-8"
        style={{
          boxShadow: '0 0 60px rgba(168, 85, 247, 0.35), 0 0 120px rgba(59, 130, 246, 0.2)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
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
