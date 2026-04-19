import {
  Wallet, TrendingUp, Briefcase, UtensilsCrossed, Coffee,
  Stethoscope, Car, Home, Heart, ShoppingBag, Zap, Music,
  BookOpen, PiggyBank, MoreHorizontal, Plane, Gamepad2,
  GraduationCap, DollarSign, type LucideProps,
} from 'lucide-react';
import { type FC } from 'react';

const ICONS: Record<string, FC<LucideProps>> = {
  Wallet, TrendingUp, Briefcase, UtensilsCrossed, Coffee,
  Stethoscope, Car, Home, Heart, ShoppingBag, Zap, Music,
  BookOpen, PiggyBank, MoreHorizontal, Plane, Gamepad2,
  GraduationCap, DollarSign,
};

export const CategoryIcon = ({ name, size = 20, color = '#9CA3AF', strokeWidth = 1.8 }: {
  name: string; size?: number; color?: string; strokeWidth?: number;
}) => {
  const Icon = ICONS[name] ?? MoreHorizontal;
  return <Icon size={size} strokeWidth={strokeWidth} style={{ color }} />;
};
