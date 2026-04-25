import { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';
import { RolloverModal } from './components/RolloverModal';
import { toast } from 'sonner';
import { CurrencySetup } from './components/CurrencySetup';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/screens/Dashboard';
import { Transactions } from './components/screens/Transactions';
import { AddTransaction } from './components/screens/AddTransaction';
import { Categories } from './components/screens/Categories';
import { ArchiveScreen } from './components/screens/Archive';
import { Profile } from './components/screens/Profile';
import { Statistics } from './components/screens/Statistics';
import { AuthScreen } from './components/AuthScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useBudget } from './hooks/useBudget';
import { useBackNavigation } from './hooks/useBackNavigation';
import { useOnlineStatus } from './hooks/useOfflineSync';
import { Screen, Currency } from './types';
import { Toaster } from '@/components/ui/sonner';

const pv = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const ROOT_SCREEN: Screen = 'dashboard';

function AppInner() {
  const { user, loading: authLoading } = useAuth();
  const [stack, setStack]      = useState<Screen[]>(['splash']);
  const [filterCat, setFilter] = useState<string | undefined>(undefined);
  const budget = useBudget();
  useOnlineStatus();

  // ---- Monthly rollover detection ----
  const rolloverKey = user ? `ali_rollover_done_${user.id}` : '';
  const previousMonthData = useMemo(() => {
    if (!budget.loaded) return null;
    const archives = budget.getArchivedMonths();
    if (archives.length === 0) return null;
    // Most recent archived month (sorted desc already)
    return archives[0];
  }, [budget]);

  const [rolloverOpen, setRolloverOpen] = useState(false);
  const [rolloverData, setRolloverData] = useState<{ month: string; leftover: number } | null>(null);

  useEffect(() => {
    if (!user || !budget.loaded || !previousMonthData) return;
    const done = localStorage.getItem(rolloverKey);
    // Only prompt once per (user × previous month)
    if (done === previousMonthData.month) return;
    if (previousMonthData.netBalance === 0) {
      localStorage.setItem(rolloverKey, previousMonthData.month);
      return;
    }
    setRolloverData({ month: previousMonthData.month, leftover: previousMonthData.netBalance });
    setRolloverOpen(true);
  }, [user, budget.loaded, previousMonthData, rolloverKey]);

  const handleRolloverChoice = useCallback(async (choice: 'saving' | 'income' | 'ignore') => {
    if (!rolloverData) return;
    const { month, leftover } = rolloverData;
    setRolloverOpen(false);

    if (choice !== 'ignore' && leftover > 0) {
      const today = new Date().toISOString().slice(0, 10);
      try {
        if (choice === 'saving') {
          await budget.addTransaction({
            name: `ترحيل من ${month}`, amount: leftover, type: 'saving',
            category: 'savings_cat', date: today,
            note: 'رصيد متبقي من الشهر السابق',
          });
          toast.success('تمت إضافة الرصيد كادخار');
        } else {
          await budget.addTransaction({
            name: `ترحيل من ${month}`, amount: leftover, type: 'income',
            category: 'salary', date: today,
            note: 'رصيد متبقي من الشهر السابق',
          });
          toast.success('تمت إضافة الرصيد كدخل جديد');
        }
      } catch {
        toast.error('تعذر ترحيل الرصيد');
      }
    }
    localStorage.setItem(rolloverKey, month);
    setRolloverData(null);
  }, [rolloverData, budget, rolloverKey]);

  const screen = stack[stack.length - 1];

  const nav = useCallback((s: Screen) => {
    if (s !== 'transactions') setFilter(undefined);
    setStack(prev => {
      // Replace transient screens (splash/setup) when navigating away
      if (prev[prev.length - 1] === 'splash' || prev[prev.length - 1] === 'setup') {
        return [s];
      }
      // Don't push duplicates
      if (prev[prev.length - 1] === s) return prev;
      return [...prev, s];
    });
  }, []);

  const goBack = useCallback(() => {
    let handled = false;
    setStack(prev => {
      if (prev.length <= 1) return prev;
      handled = true;
      return prev.slice(0, -1);
    });
    return handled;
  }, []);

  useBackNavigation(screen, goBack, ROOT_SCREEN);

  const onSplashDone = () => nav(budget.settings.setupDone ? 'dashboard' : 'setup');
  const onSetup = (currency: Currency, customSymbol: string) => {
    budget.updateSettings({ currency, customSymbol, setupDone: true });
    setStack(['dashboard']);
  };
  const onCatFilter = (id: string) => { setFilter(id); nav('transactions'); };

  // 1. Splash always first
  if (screen === 'splash') {
    return (
      <div className="min-h-screen overflow-x-hidden" style={{ background: '#000000', fontFamily: "'Cairo', sans-serif" }}>
        <Toaster position="top-center" />
        <AnimatePresence mode="wait">
          <SplashScreen key="splash" onDone={onSplashDone} />
        </AnimatePresence>
      </div>
    );
  }

  // 2. Auth gate after splash
  if (authLoading) {
    return <div className="min-h-screen overflow-x-hidden" style={{ background: '#000000' }} />;
  }
  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <AuthScreen />
      </>
    );
  }

  // 3. Wait for budget data load
  if (!budget.loaded) {
    return <div className="min-h-screen overflow-x-hidden" style={{ background: '#000000' }} />;
  }

  const sym            = budget.getCurrencySymbol();
  const archivedMonths = budget.getArchivedMonths();
  const showNav: Screen[] = ['dashboard','transactions','add','categories','profile','stats'];

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <Dashboard
          totalIncome={budget.totalIncome} totalExpenses={budget.totalExpenses}
          totalSavings={budget.totalSavings} netBalance={budget.netBalance}
          recommendedSavings={budget.recommendedSavings} savingsProgress={budget.savingsProgress}
          spendingProgress={budget.spendingProgress}
          currentTransactions={budget.currentTransactions} categories={budget.categories}
          settings={budget.settings} currencySymbol={sym} onNavigate={nav} currentMonth={budget.currentMonth} />;
      case 'transactions':
        return <Transactions
          transactions={budget.currentTransactions} categories={budget.categories}
          currencySymbol={sym} filterCategory={filterCat}
          archivedMonths={archivedMonths}
          onDelete={budget.deleteTransaction} onUndo={budget.undoDelete} />;
      case 'add':
        return <AddTransaction
          categories={budget.categories} currencySymbol={sym}
          pots={budget.pots} onAdd={budget.addTransaction}
          onAddPot={budget.addPot} onDeletePot={budget.deletePot}
          onDone={() => nav('dashboard')} />;
      case 'categories':
        return <Categories
          categories={budget.categories} transactions={budget.currentTransactions}
          currencySymbol={sym} onUpdate={budget.updateCategory}
          onAdd={budget.addCategory} onDelete={budget.deleteCategory}
          onFilterTransactions={onCatFilter} />;
      case 'archive':
        return <ArchiveScreen
          archivedMonths={archivedMonths} categories={budget.categories}
          currencySymbol={sym} />;
      case 'profile':
        return <Profile
          settings={budget.settings} transactions={budget.currentTransactions}
          categories={budget.categories} archivedMonths={archivedMonths}
          totalIncome={budget.totalIncome} totalExpenses={budget.totalExpenses}
          totalSavings={budget.totalSavings} netBalance={budget.netBalance}
          onUpdateSettings={budget.updateSettings} onReset={budget.resetApp}
          onNavigate={nav} />;
      case 'stats':
        return <Statistics
          transactions={budget.currentTransactions}
          categories={budget.categories}
          currencySymbol={sym}
          totalExpenses={budget.totalExpenses} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#020617', fontFamily: "'Cairo', sans-serif" }}>
      <Toaster position="top-center" />
      {screen === 'setup' && <CurrencySetup onComplete={onSetup} />}

      {showNav.includes(screen) && (
        <>
          <main className="w-full max-w-full overflow-x-hidden" style={{ minHeight: '100dvh', paddingBottom: '4rem' }}>
            <AnimatePresence mode="wait">
              <motion.div key={screen} variants={pv} initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.22 }}>
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </main>
          <Navigation current={screen} onNavigate={nav} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
