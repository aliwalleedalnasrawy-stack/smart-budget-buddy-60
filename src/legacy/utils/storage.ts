import { Transaction, Category, AppSettings, ArchivedMonth, SavingPot } from "../types";
import { DEFAULT_CATEGORIES } from "./categories";

const K = {
  TXN:      "ali_txn",
  CATS:     "ali_cats",
  SETTINGS: "ali_settings",
  ARCHIVES: "ali_archives",
  POTS:     "ali_pots",
};

const parse = <T>(key: string, fallback: T): T => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
};

export const loadTransactions  = (): Transaction[]   => parse(K.TXN, []);
export const saveTransactions  = (v: Transaction[])  => localStorage.setItem(K.TXN, JSON.stringify(v));
export const loadCategories    = (): Category[]       => parse(K.CATS, DEFAULT_CATEGORIES);
export const saveCategories    = (v: Category[])      => localStorage.setItem(K.CATS, JSON.stringify(v));
export const loadSettings      = (): AppSettings      => parse(K.SETTINGS, { currency: "IQD", customSymbol: "", setupDone: false, rolloverProcessed: "" });
export const saveSettings      = (v: AppSettings)     => localStorage.setItem(K.SETTINGS, JSON.stringify(v));
export const loadArchives      = (): ArchivedMonth[]  => parse(K.ARCHIVES, []);
export const saveArchives      = (v: ArchivedMonth[]) => localStorage.setItem(K.ARCHIVES, JSON.stringify(v));
export const loadPots          = (): SavingPot[]      => parse(K.POTS, []);
export const savePots          = (v: SavingPot[])     => localStorage.setItem(K.POTS, JSON.stringify(v));
export const clearAllData      = ()                   => Object.values(K).forEach(k => localStorage.removeItem(k));

export const getCurrentMonth = (): string => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
};

export const getMonthLabel = (m: string): string => {
  const parts = m.split("-");
  const names = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return names[parseInt(parts[1]) - 1] + " " + parts[0];
};
