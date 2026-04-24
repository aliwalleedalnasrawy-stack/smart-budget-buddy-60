import { useEffect } from 'react';
import logo from '@/assets/app-logo-transparent.png';

export const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 px-6"
      style={{ backgroundColor: '#000000' }}
    >
      <img
        src={logo}
        alt="ميزانيتي الذكية"
        draggable={false}
        className="select-none pointer-events-none"
        style={{
          width: '200px',
          height: 'auto',
          objectFit: 'contain',
          background: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.6))',
        }}
      />

      <h1
        className="text-center font-bold text-xl sm:text-2xl md:text-3xl leading-tight"
        style={{
          marginTop: '50px',
          color: '#FFFFFF',
          letterSpacing: '0.02em',
        }}
      >
        مرحباً بك في تطبيق ميزانيتي الذكية
      </h1>

      <p
        className="text-center text-xs sm:text-sm font-light tracking-[0.3em] mt-3"
        style={{ color: '#B0B0B0' }}
      >
        دليلك إلى الحرية المالية
      </p>
    </div>
  );
};
