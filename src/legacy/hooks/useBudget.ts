import { useState, useEffect, useCallback } from 'react';
import { Transaction, Category, AppSettings, ArchivedMonth, SavingPot } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { INCOME_IDS, SAVING_IDS } from '../utils/categories';
import {
  loadTransactions, loadCategories, loadPots, loadSettings,
  clearAllData, getCurrentMonth, getMonthLabel,
} from '../utils/storage';

const MIGRATION_FLAG = 'ali_cloud_migrated_v1';

// Convert DB row -> app type
const mapTx = (r: any): Transaction => ({
  id: r.id, name: r.name ?? undefined, amount: Number(r.amount),
  type: r.tx_type, category: r.category, date: r.tx_date,
  note: r.note ?? undefined, month: r.month, pot: r.pot ?? undefined,
});
const mapCat = (r: any): Category => ({
  id: r.legacy_id || r.id, name: r.name, icon: r.icon, color: r.color,
  limit: r.category_limit != null ? Number(r.category_limit) : undefined,
  custom: r.custom,
});
const mapPot = (r: any): SavingPot => ({
  id: r.id, name: r.name, target: r.target_amount != null ? Number(r.target_amount) : undefined,
  color: r.color, icon: r.icon, createdAt: r.created_at,
});

export const useBudget = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [pots,         setPots]         = useState<SavingPot[]>([]);
  const [archives]                      = useState<ArchivedMonth[]>([]);
  const [settings,     setSettings]     = useState<AppSettings>({
    currency: 'IQD', customSymbol: '', setupDone: false, rolloverProcessed: '',
  });
  const [loaded, setLoaded] = useState(false);

  // Cache categories DB-id => uuid map for tx insertion
  const [catUuidMap, setCatUuidMap] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [tx, cats, pp, prof] = await Promise.all([
      supabase.from('transactions').select('*').order('tx_date', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('savings_pots').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    setTransactions((tx.data ?? []).map(mapTx));
    const catRows = cats.data ?? [];
    setCategories(catRows.map(mapCat));
    const m: Record<string, string> = {};
    catRows.forEach((r: any) => { m[r.legacy_id || r.id] = r.id; });
    setCatUuidMap(m);
    setPots((pp.data ?? []).map(mapPot));
    if (prof.data) {
      setSettings({
        currency: prof.data.currency as any,
        customSymbol: prof.data.custom_symbol || '',
        setupDone: prof.data.setup_done,
        rolloverProcessed: '',
        avatarUrl: prof.data.avatar_url || undefined,
      });
    }
    setLoaded(true);
  }, [userId]);

  // Auto-migrate localStorage on first login
  useEffect(() => {
    if (!userId) return;
    const flag = `${MIGRATION_FLAG}_${userId}`;
    if (localStorage.getItem(flag)) { refresh(); return; }

    (async () => {
      try {
        const localTx = loadTransactions();
        const localCats = loadCategories();
        const localPots = loadPots();
        const localSettings = loadSettings();

        // Settings to profile
        if (localSettings.setupDone) {
          await supabase.from('profiles').update({
            currency: localSettings.currency,
            custom_symbol: localSettings.customSymbol,
            setup_done: true,
          }).eq('user_id', userId);
        }

        // Custom categories
        const customCats = localCats.filter(c => c.custom);
        if (customCats.length) {
          await supabase.from('categories').insert(
            customCats.map(c => ({
              user_id: userId, legacy_id: c.id, name: c.name,
              icon: c.icon, color: c.color, custom: true,
              cat_type: INCOME_IDS.includes(c.id) ? 'income' : SAVING_IDS.includes(c.id) ? 'saving' : 'expense',
              category_limit: c.limit ?? null,
            }))
          );
        }

        // Pots
        if (localPots.length) {
          await supabase.from('savings_pots').insert(
            localPots.map(p => ({
              user_id: userId, name: p.name, color: p.color, icon: p.icon,
              target_amount: p.target ?? null,
            }))
          );
        }

        // Transactions
        if (localTx.length) {
          await supabase.from('transactions').insert(
            localTx.map(t => ({
              user_id: userId, name: t.name ?? null, amount: t.amount,
              tx_type: t.type, category: t.category, tx_date: t.date,
              note: t.note ?? null, month: t.month, pot: t.pot ?? null,
            }))
          );
        }

        localStorage.setItem(flag, '1');
      } catch (e) {
        console.error('Migration error:', e);
        localStorage.setItem(flag, '1'); // don't retry forever
      }
      await refresh();
    })();
  }, [userId, refresh]);

  // Realtime not strictly needed; we refresh after each mutation.

  const currentMonth        = getCurrentMonth();
  const currentTransactions = transactions.filter(t => t.month === currentMonth);
  const totalIncome         = currentTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses       = currentTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalSavings        = currentTransactions.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
  const netBalance          = totalIncome - totalExpenses - totalSavings;
  const recommendedSavings  = totalIncome * 0.2;
  const savingsProgress     = recommendedSavings > 0 ? Math.min((totalSavings / recommendedSavings) * 100, 100) : 0;
  const spendingProgress    = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;

  const allMonths = Array.from(new Set(transactions.map(t => t.month))).sort().reverse();

  const getArchivedMonths = useCallback((): ArchivedMonth[] => {
    return allMonths.filter(m => m !== currentMonth).map(m => {
      const txns = transactions.filter(t => t.month === m);
      const inc = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const sav = txns.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
      return { month: m, label: getMonthLabel(m), transactions: txns, totalIncome: inc, totalExpenses: exp, totalSavings: sav, netBalance: inc - exp - sav };
    });
  }, [allMonths, currentMonth, transactions]);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'month'>) => {
    if (!userId) return;
    const month = getCurrentMonth();
    await supabase.from('transactions').insert({
      user_id: userId, name: tx.name ?? null, amount: tx.amount,
      tx_type: tx.type, category: tx.category, tx_date: tx.date,
      note: tx.note ?? null, month, pot: tx.pot ?? null,
    });
    await refresh();
  }, [userId, refresh]);

  const deleteTransaction = useCallback(async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const undoDelete = useCallback(async (tx: Transaction) => {
    if (!userId) return;
    await supabase.from('transactions').insert({
      user_id: userId, name: tx.name ?? null, amount: tx.amount,
      tx_type: tx.type, category: tx.category, tx_date: tx.date,
      note: tx.note ?? null, month: tx.month, pot: tx.pot ?? null,
    });
    await refresh();
  }, [userId, refresh]);

  const updateCategory = useCallback(async (cat: Category) => {
    const uuid = catUuidMap[cat.id];
    if (!uuid) return;
    await supabase.from('categories').update({
      name: cat.name, icon: cat.icon, color: cat.color,
      category_limit: cat.limit ?? null,
    }).eq('id', uuid);
    await refresh();
  }, [catUuidMap, refresh]);

  const addCategory = useCallback(async (cat: Omit<Category, 'id'>) => {
    if (!userId) return;
    const cat_type = cat.color === '#00FF7F' ? 'income' : 'expense';
    await supabase.from('categories').insert({
      user_id: userId, name: cat.name, icon: cat.icon, color: cat.color,
      cat_type, custom: true, category_limit: cat.limit ?? null,
    });
    await refresh();
  }, [userId, refresh]);

  const deleteCategory = useCallback(async (id: string) => {
    const uuid = catUuidMap[id];
    if (!uuid) return;
    await supabase.from('categories').delete().eq('id', uuid);
    await refresh();
  }, [catUuidMap, refresh]);

  const addPot = useCallback(async (pot: Omit<SavingPot, 'id' | 'createdAt'>) => {
    if (!userId) return;
    await supabase.from('savings_pots').insert({
      user_id: userId, name: pot.name, color: pot.color, icon: pot.icon,
      target_amount: pot.target ?? null,
    });
    await refresh();
  }, [userId, refresh]);

  const deletePot = useCallback(async (id: string) => {
    await supabase.from('savings_pots').delete().eq('id', id);
    setPots(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    if (!userId) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    const upd: any = {};
    if (patch.currency !== undefined) upd.currency = patch.currency;
    if (patch.customSymbol !== undefined) upd.custom_symbol = patch.customSymbol;
    if (patch.setupDone !== undefined) upd.setup_done = patch.setupDone;
    if (patch.avatarUrl !== undefined) upd.avatar_url = patch.avatarUrl;
    if (Object.keys(upd).length) {
      await supabase.from('profiles').update(upd).eq('user_id', userId);
    }
  }, [userId, settings]);

  const resetApp = useCallback(async () => {
    if (!userId) return;
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', userId),
      supabase.from('savings_pots').delete().eq('user_id', userId),
      supabase.from('categories').delete().eq('user_id', userId).eq('custom', true),
    ]);
    clearAllData();
    await supabase.auth.signOut();
    window.location.reload();
  }, [userId]);

  const getCurrencySymbol = useCallback((): string => {
    if (settings.currency === 'IQD') return 'د.ع';
    if (settings.currency === 'USD') return '$';
    return settings.customSymbol;
  }, [settings]);

  const isIncomeCategory = (id: string) => {
    const c = categories.find(cat => cat.id === id);
    if (!c) return INCOME_IDS.includes(id);
    return INCOME_IDS.includes(id) || c.color === '#00FF7F';
  };
  const isSavingCategory = (id: string) => SAVING_IDS.includes(id);

  return {
    transactions, currentTransactions, categories, archives, pots, settings,
    totalIncome, totalExpenses, totalSavings, netBalance,
    recommendedSavings, savingsProgress, spendingProgress, currentMonth,
    addTransaction, deleteTransaction, undoDelete,
    updateCategory, addCategory, deleteCategory,
    addPot, deletePot,
    updateSettings, resetApp, getCurrencySymbol,
    getArchivedMonths, isIncomeCategory, isSavingCategory,
    loaded,
  };
};
