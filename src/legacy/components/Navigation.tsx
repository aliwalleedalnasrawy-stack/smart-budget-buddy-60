import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, PlusCircle, Tags, ChartPie, type LucideProps } from 'lucide-react';
import { type FC } from 'react';
import { Screen } from '../types';

const ITEMS: { screen: Screen; label: string; Icon: FC<LucideProps>; glow: string }[] = [
  { screen: 'dashboard',    label: 'الرئيسية',    Icon: LayoutDashboard, glow: '#D4A017' },
  { screen: 'transactions', label: 'المعاملات',   Icon: ArrowLeftRight,  glow: '#22D3EE' },
  { screen: 'add',          label: 'إضافة',       Icon: PlusCircle,      glow: '#D4A017' },
  { screen: 'categories',   label: 'الفئات',      Icon: Tags,            glow: '#A855F7' },
  { screen: 'stats',        label: 'الإحصائيات',  Icon: ChartPie,        glow: '#22C55E' },
];

export const Navigation = ({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-40"
    style={{ background: 'rgba(2,6,23,0.96)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(212,160,23,0.15)' }}>
    <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
      {ITEMS.map(({ screen, label, Icon, glow }) => {
        const active = current === screen;
        const isAdd  = screen === 'add';

        if (isAdd) return (
          <motion.button key={screen} whileTap={{ scale: 0.88 }}
            onClick={() => onNavigate(screen)}
            className="relative -top-5 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F59E0B)',
              boxShadow: '0 0 22px rgba(212,160,23,0.55), 0 4px 16px rgba(0,0,0,0.4)' }}>
            <Icon size={26} strokeWidth={2.5} style={{ color: '#020617' }} />
          </motion.button>
        );

        return (
          <motion.button key={screen} whileTap={{ scale: 0.88 }}
            onClick={() => onNavigate(screen)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative px-1 min-w-0">
            {active && (
              <motion.div layoutId="nav-pill"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ background: glow, boxShadow: `0 0 8px ${glow}` }} />
            )}
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8}
              style={{
                color: active ? glow : '#4B5563',
                filter: active ? `drop-shadow(0 0 6px ${glow}aa)` : 'none',
              }} />
            <span className="text-[10px] font-semibold truncate max-w-full"
              style={{
                color: active ? glow : '#4B5563',
                textShadow: active ? `0 0 6px ${glow}66` : 'none',
              }}>{label}</span>
          </motion.button>
        );
      })}
    </div>
  </nav>
);
