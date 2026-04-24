import { useEffect } from 'react';
import logo from '@/assets/app-logo-transparent.png';

export const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 px-6 overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      <style>{`
        @keyframes splashPulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 18px rgba(147, 51, 234, 0.45))
                    drop-shadow(0 0 32px rgba(147, 51, 234, 0.25));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 36px rgba(168, 85, 247, 0.75))
                    drop-shadow(0 0 64px rgba(147, 51, 234, 0.45));
            transform: scale(1.03);
          }
        }
        @keyframes splashLogoIn {
          0%   { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splashTextIn {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashShine {
          0%   { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
          20%  { opacity: 0.9; }
          100% { transform: translateX(150%) skewX(-20deg); opacity: 0; }
        }
        .splash-logo-wrap {
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          will-change: transform, filter, opacity;
          animation:
            splashLogoIn 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards,
            splashPulseGlow 3.6s ease-in-out 1.1s infinite;
        }
        .splash-logo-img {
          width: 200px;
          height: auto;
          object-fit: contain;
          background: transparent;
          will-change: transform, filter;
        }
        .splash-shine {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          border-radius: 24px;
          mask-image: url(${logo});
          -webkit-mask-image: url(${logo});
          mask-size: contain;
          -webkit-mask-size: contain;
          mask-repeat: no-repeat;
          -webkit-mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-position: center;
        }
        .splash-shine::after {
          content: '';
          position: absolute;
          top: -20%;
          left: 0;
          width: 40%;
          height: 140%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.55) 50%,
            rgba(255, 255, 255, 0) 70%,
            transparent 100%
          );
          filter: blur(2px);
          animation: splashShine 1.6s cubic-bezier(0.4, 0, 0.2, 1) 1.4s 1 forwards;
          opacity: 0;
        }
        .splash-text-1 {
          opacity: 0;
          will-change: transform, opacity;
          animation: splashTextIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 1.6s forwards;
        }
        .splash-text-2 {
          opacity: 0;
          will-change: transform, opacity;
          animation: splashTextIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 1.9s forwards;
        }
      `}</style>

      <div className="splash-logo-wrap">
        <img
          src={logo}
          alt="ميزانيتي الذكية"
          draggable={false}
          className="splash-logo-img select-none pointer-events-none"
        />
        <span className="splash-shine" />
      </div>

      <h1
        className="splash-text-1 text-center font-bold text-xl sm:text-2xl md:text-3xl leading-tight"
        style={{
          marginTop: '50px',
          color: '#FFFFFF',
          letterSpacing: '0.02em',
        }}
      >
        مرحباً بك في تطبيق ميزانيتي الذكية
      </h1>

      <p
        className="splash-text-2 text-center text-xs sm:text-sm font-light tracking-[0.3em] mt-3"
        style={{ color: '#B0B0B0' }}
      >
        دليلك إلى الحرية المالية
      </p>
    </div>
  );
};
