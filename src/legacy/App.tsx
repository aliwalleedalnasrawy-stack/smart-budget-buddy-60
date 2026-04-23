import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';
import { CurrencySetup } from './components/CurrencySetup';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/screens/Dashboard';
import { Transactions } from './components/screens/Transactions';
import { AddTransaction } from './components/screens/AddTransaction';
import { Categories } from './components/screens/Categories';
import { ArchiveScreen } from './components/screens/Archive';
import { Profile } from './components/screens/Profile';
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
  const showNav: Screen[] = ['dashboard','transactions','add','categories','archive','profile'];

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
