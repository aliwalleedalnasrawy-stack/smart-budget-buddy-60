import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, Calendar, Award } from 'lucide-react';
import { Transaction, Category } from '../../types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  totalExpenses: number;
}

// Neon palette: Electric Purple, Neon Green, Vivid Orange + extras
const NEON_COLORS = [
  '#A855F7', // electric purple
  '#00FF7F', // neon green
  '#FB923C', // vivid orange
  '#22D3EE', // cyan
  '#F472B6', // hot pink
  '#FACC15', // yellow
  '#60A5FA', // blue
  '#F87171', // red
];

const f = (n: number, sym: string) => `${Math.round(n).toLocaleString('ar-IQ')} ${sym}`;

export const Statistics = ({ transactions, categories, currencySymbol, totalExpenses }: Props) => {
  const expenseByCat = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return Object.entries(map)
      .map(([id, value]) => {
        const cat = categories.find(c => c.id === id);
        return { id, name: cat?.name ?? id, value, color: cat?.color };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const pieData = expenseByCat.map((d, i) => ({
    ...d,
    fill: NEON_COLORS[i % NEON_COLORS.length],
  }));

  const topCategory = pieData[0];
  const dayOfMonth = new Date().getDate();
  const dailyAverage = totalExpenses / dayOfMonth;

  const renderLabel = (entry: any) => {
    const pct = totalExpenses > 0 ? (entry.value / totalExpenses) * 100 : 0;
    if (pct < 6) return '';
    return `${pct.toFixed(0)}%`;
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto space-y-4" style={{ background: '#000000', minHeight: '100dvh' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">الإحصائيات</h1>
        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>تحليل بصري لأنماط إنفاقك هذا الشهر</p>
      </motion.div>

      {/* Main Pie Chart Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl p-5"
        style={{
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">توزيع الإنفاق حسب الفئات</p>
          <span className="text-[10px] px-2 py-1 rounded-full" style={{
            background: 'rgba(168,85,247,0.12)', color: '#C084FC',
            border: '1px solid rgba(168,85,247,0.25)',
          }}>
            {pieData.length} فئة
          </span>
        </div>

        {pieData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-60">
            <TrendingDown size={36} style={{ color: '#6B7280' }} />
            <p className="text-xs mt-3" style={{ color: '#6B7280' }}>لا توجد مصاريف هذا الشهر بعد</p>
          </div>
        ) : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <defs>
                  {pieData.map((d, i) => (
                    <filter key={i} id={`glow-${i}`}>
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  ))}
                </defs>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={105}
                  paddingAngle={3}
                  label={renderLabel}
                  labelLine={false}
                  isAnimationActive
                  animationBegin={150}
                  animationDuration={900}
                >
                  {pieData.map((d, i) => (
                    <Cell
                      key={d.id}
                      fill={d.fill}
                      stroke="#000000"
                      strokeWidth={2}
                      style={{ filter: `drop-shadow(0 0 6px ${d.fill}88)` }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(2,6,23,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(v: number) => f(v, currencySymbol)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        {pieData.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.slice(0, 8).map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center gap-2 text-xs"
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: d.fill, boxShadow: `0 0 6px ${d.fill}` }} />
                <span className="truncate text-white/80">{d.name}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Insights Stack */}
      <div className="space-y-3">
        {topCategory && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(168,85,247,0.15)',
                boxShadow: '0 0 18px rgba(168,85,247,0.35)',
              }}>
              <Award size={22} style={{ color: '#C084FC' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px]" style={{ color: '#6B7280' }}>أعلى فئة إنفاق</p>
              <p className="text-sm font-bold text-white truncate">{topCategory.name}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#C084FC' }}>
                {f(topCategory.value, currencySymbol)}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(0,255,127,0.12)',
              boxShadow: '0 0 18px rgba(0,255,127,0.3)',
            }}>
            <Calendar size={22} style={{ color: '#00FF7F' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px]" style={{ color: '#6B7280' }}>المعدل اليومي للإنفاق</p>
            <p className="text-sm font-bold text-white">
              {f(dailyAverage, currencySymbol)}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>
              على مدار {dayOfMonth} يوم من الشهر
            </p>
          </div>
        </motion.div>

        {/* Detailed list */}
        {pieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
            <p className="text-sm font-bold text-white mb-3">تفصيل الفئات</p>
            <div className="space-y-2.5">
              {pieData.map((d, i) => {
                const pct = totalExpenses > 0 ? (d.value / totalExpenses) * 100 : 0;
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{
                          background: d.fill, boxShadow: `0 0 6px ${d.fill}`,
                        }}/>
                        <span className="text-white font-medium">{d.name}</span>
                      </div>
                      <span className="font-bold" style={{ color: d.fill }}>
                        {f(d.value, currencySymbol)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ background: d.fill, boxShadow: `0 0 6px ${d.fill}88` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
