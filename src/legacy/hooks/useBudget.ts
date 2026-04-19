import { useState, useEffect, useCallback } from "react";
import { Transaction, Category, AppSettings, ArchivedMonth } from "../types";
import {
  loadTransactions, saveTransactions, loadCategories, saveCategories,
  loadSettings, saveSettings, loadArchives, saveArchives,
  getCurrentMonth, getMonthLabel, clearAllData,
} from "../utils/storage";
import { INCOME_IDS, SAVING_IDS } from "../utils/categories";

export const useBudget = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [archives,     setArchives]     = useState<ArchivedMonth[]>([]);
  const [settings,     setSettings]     = useState<AppSettings>({
    currency: "IQD", customSymbol: "", setupDone: false, rolloverProcessed: "",
  });

  useEffect(() => {
    setTransactions(loadTransactions());
    setCategories(loadCategories());
    setArchives(loadArchives());
    setSettings(loadSettings());
  }, []);

  const currentMonth        = getCurrentMonth();
  const currentTransactions = transactions.filter(t => t.month === currentMonth);
  const totalIncome         = currentTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses       = currentTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalSavings        = currentTransactions.filter(t => t.type === "saving").reduce((s, t) => s + t.amount, 0);
  const netBalance          = totalIncome - totalExpenses - totalSavings;
  const recommendedSavings  = totalIncome * 0.2;
  const savingsProgress     = recommendedSavings > 0 ? Math.min((totalSavings / recommendedSavings) * 100, 100) : 0;

  const allMonths = Array.from(new Set(transactions.map(t => t.month))).sort().reverse();

  const getArchivedMonths = useCallback((): ArchivedMonth[] => {
    return allMonths
      .filter(m => m !== currentMonth)
      .map(m => {
        const txns = transactions.filter(t => t.month === m);
        const inc  = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const exp  = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        const sav  = txns.filter(t => t.type === "saving").reduce((s, t) => s + t.amount, 0);
        const saved = archives.find(a => a.month === m);
        return saved ?? { month: m, label: getMonthLabel(m), transactions: txns, totalIncome: inc, totalExpenses: exp, totalSavings: sav, netBalance: inc - exp - sav };
      });
  }, [allMonths, currentMonth, transactions, archives]);

  const addTransaction = useCallback((tx: Omit<Transaction, "id" | "month">) => {
    const n: Transaction = { ...tx, id: crypto.randomUUID(), month: getCurrentMonth() };
    const updated = [n, ...transactions];
    setTransactions(updated); saveTransactions(updated);
  }, [transactions]);

  const deleteTransaction = useCallback((id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated); saveTransactions(updated);
  }, [transactions]);

  const undoDelete = useCallback((tx: Transaction) => {
    const updated = [tx, ...transactions];
    setTransactions(updated); saveTransactions(updated);
  }, [transactions]);

  const updateCategory = useCallback((cat: Category) => {
    const updated = categories.map(c => c.id === cat.id ? cat : c);
    setCategories(updated); saveCategories(updated);
  }, [categories]);

  const addCategory = useCallback((cat: Omit<Category, "id">) => {
    const id = "custom_" + Date.now();
    const newCat: Category = { ...cat, id, custom: true };
    const updated = [...categories, newCat];
    setCategories(updated); saveCategories(updated);
  }, [categories]);

  const deleteCategory = useCallback((id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated); saveCategories(updated);
  }, [categories]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    const updated = { ...settings, ...patch };
    setSettings(updated); saveSettings(updated);
  }, [settings]);

  const resetApp = useCallback(() => { clearAllData(); window.location.reload(); }, []);

  const getCurrencySymbol = useCallback((): string => {
    if (settings.currency === "IQD") return "د.ع";
    if (settings.currency === "USD") return "$";
    return settings.customSymbol;
  }, [settings]);

  const isIncomeCategory  = (id: string) => INCOME_IDS.includes(id) || categories.find(c => c.id === id && c.custom && c.color === "#00FF7F") !== undefined;
  const isSavingCategory  = (id: string) => SAVING_IDS.includes(id);

  return {
    transactions, currentTransactions, categories, archives, settings,
    totalIncome, totalExpenses, totalSavings, netBalance,
    recommendedSavings, savingsProgress, currentMonth,
    addTransaction, deleteTransaction, undoDelete,
    updateCategory, addCategory, deleteCategory,
    updateSettings, resetApp, getCurrencySymbol,
    getArchivedMonths, isIncomeCategory, isSavingCategory,
  };
};
