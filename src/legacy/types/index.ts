export type TransactionType = "income" | "expense" | "saving";

export interface Transaction {
  id: string;
  name?: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
  month: string;
  pot?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  limit?: number;
  color: string;
  custom?: boolean;
}

export interface SavingPot {
  id: string;
  name: string;
  target?: number;
  color: string;
  icon: string;
  createdAt: string;
}

export interface ArchivedMonth {
  month: string;
  label: string;
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  netBalance: number;
}

export type Currency = "IQD" | "USD" | "custom";

export interface AppSettings {
  currency: Currency;
  customSymbol: string;
  setupDone: boolean;
  rolloverProcessed: string;
  avatarUrl?: string;
}

export type Screen = "splash" | "setup" | "dashboard" | "transactions" | "add" | "categories" | "archive" | "profile" | "stats";
