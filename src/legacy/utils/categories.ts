import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'salary',        name: 'راتب',    icon: 'Wallet',         color: '#00FF7F' },
  { id: 'investment',    name: 'استثمار', icon: 'TrendingUp',     color: '#22C55E' },
  { id: 'freelance',     name: 'عمل حر',  icon: 'Briefcase',      color: '#4ADE80' },
  { id: 'food',          name: 'طعام',    icon: 'UtensilsCrossed',color: '#F59E0B' },
  { id: 'transport',     name: 'مواصلات', icon: 'Car',            color: '#3B82F6' },
  { id: 'housing',       name: 'سكن',     icon: 'Home',           color: '#8B5CF6' },
  { id: 'health',        name: 'صحة',     icon: 'Heart',          color: '#EC4899' },
  { id: 'shopping',      name: 'تسوق',    icon: 'ShoppingBag',    color: '#A855F7' },
  { id: 'bills',         name: 'فواتير',  icon: 'Zap',            color: '#EF4444' },
  { id: 'entertainment', name: 'ترفيه',   icon: 'Music',          color: '#6366F1' },
  { id: 'education',     name: 'تعليم',   icon: 'BookOpen',       color: '#0EA5E9' },
  { id: 'savings_cat',   name: 'مدخرات',  icon: 'PiggyBank',      color: '#D4A017' },
  { id: 'other',         name: 'أخرى',    icon: 'MoreHorizontal', color: '#6B7280' },
];

export const INCOME_IDS = ['salary', 'investment', 'freelance'];
export const SAVING_IDS = ['savings_cat'];
export const SYSTEM_IDS = [...INCOME_IDS, ...SAVING_IDS];

export const AVAILABLE_ICONS = [
  'Wallet','TrendingUp','Briefcase','UtensilsCrossed','Coffee','Car','Home','Heart',
  'ShoppingBag','Zap','Music','BookOpen','PiggyBank','MoreHorizontal','Stethoscope',
  'Plane','Gamepad2','GraduationCap','DollarSign',
];

export const AVAILABLE_COLORS = [
  '#00FF7F','#22C55E','#4ADE80','#F59E0B','#EF4444','#3B82F6',
  '#8B5CF6','#EC4899','#A855F7','#6366F1','#0EA5E9','#D4A017',
  '#6B7280','#14B8A6','#F97316',
];

export const getCategoryColor = (pct: number): string => {
  if (pct >= 90) return '#EF4444';
  if (pct >= 50) return '#F59E0B';
  return '#3B82F6';
};
