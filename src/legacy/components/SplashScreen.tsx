import { useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/app-logo-transparent.png';

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
      className="fixed inset-0 flex flex-col items-center justify-center z-50 px-6"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Logo as pure icon — no frame, no background, only programmatic glow */}
      <motion.img
        src={logo}
        alt="ميزانيتي الذكية"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        draggable={false}
        className="select-none pointer-events-none"
        style={{
          width: '120px',
          height: '120px',
          objectFit: 'contain',
          background: 'transparent',
          borderRadius: '50%',
          boxShadow:
            '0 0 60px 20px rgba(138, 43, 226, 0.5), 0 0 120px 40px rgba(138, 43, 226, 0.25)',
        }}
      />

      {/* Texts — slide up from below */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.9, ease: 'easeOut' }}
        className="text-center font-bold text-xl sm:text-2xl md:text-3xl leading-tight"
        style={{
          marginTop: '40px',
          color: '#C9A961',
          letterSpacing: '0.02em',
          textShadow: '0 0 24px rgba(201, 169, 97, 0.25)',
        }}
      >
        مرحباً بك في تطبيق ميزانيتي الذكية
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8, ease: 'easeOut' }}
        className="text-center text-xs sm:text-sm font-light tracking-[0.3em] mt-3"
        style={{ color: 'rgba(201, 169, 97, 0.7)' }}
      >
        دليلك إلى الحرية المالية
      </motion.p>
    </motion.div>
  );
};
