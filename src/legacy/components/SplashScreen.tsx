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
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden px-6"
      style={{ background: '#000000' }}
    >
      {/* Floating logo with animated neon pulse halo */}
      <div className="relative flex items-center justify-center" style={{ marginBottom: 'clamp(40px, 8vh, 80px)' }}>
        {/* Outer slow purple pulse */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.25, 0.6, 0.25], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 'min(95vw, 520px)',
            height: 'min(95vw, 520px)',
            background:
              'radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(139,92,246,0.15) 40%, rgba(0,0,0,0) 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Inner faster blue pulse (offset rhythm) */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.4, 0.85, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 'min(75vw, 400px)',
            height: 'min(75vw, 400px)',
            background:
              'radial-gradient(circle, rgba(59,130,246,0.65) 0%, rgba(59,130,246,0.2) 45%, rgba(0,0,0,0) 72%)',
            filter: 'blur(30px)',
            mixBlendMode: 'screen',
          }}
        />
        {/* Transparent logo overlay — floats over pure black */}
        <motion.img
          src={logo}
          alt="ميزانيتي الذكية"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative object-contain select-none pointer-events-none"
          draggable={false}
          style={{
            width: 'min(72vw, 380px)',
            height: 'min(72vw, 380px)',
            background: 'transparent',
            filter:
              'drop-shadow(0 0 22px rgba(139,92,246,0.7)) drop-shadow(0 0 44px rgba(59,130,246,0.5))',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.9, ease: 'easeOut' }}
        className="text-center max-w-full"
      >
        <h1
          className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 leading-tight tracking-wide break-words"
          style={{
            color: '#FFFFFF',
            textShadow: '0 0 20px rgba(139,92,246,0.4), 0 0 40px rgba(59,130,246,0.25)',
            letterSpacing: '0.02em',
          }}
        >
          مرحباً بك في تطبيق ميزانيتي الذكية
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="text-xs sm:text-sm md:text-base font-light tracking-[0.3em]"
          style={{ color: 'rgba(186,200,255,0.75)' }}
        >
          دليلك إلى الحرية المالية
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
