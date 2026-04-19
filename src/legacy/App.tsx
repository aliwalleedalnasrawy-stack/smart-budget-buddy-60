import { useState } from 'react';
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
import { useBudget } from './hooks/useBudget';
import { Screen, Currency } from './types';

const pv = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function App() {
  const [screen, setScreen]    = useState<Screen>('splash');
  const [filterCat, setFilter] = useState<string | undefined>(undefined);
  const budget = useBudget();

  const nav = (s: Screen) => { if (s !== 'transactions') setFilter(undefined); setScreen(s); };

  const onSplashDone = () => setScreen(budget.settings.setupDone ? 'dashboard' : 'setup');

  const onSetup = (currency: Currency, customSymbol: string) => {
    budget.updateSettings({ currency, customSymbol, setupDone: true });
    setScreen('dashboard');
  };

  const onCatFilter = (id: string) => { setFilter(id); setScreen('transactions'); };

  const sym            = budget.getCurrencySymbol();
  const archivedMonths = budget.getArchivedMonths();

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <Dashboard
          totalIncome={budget.totalIncome} totalExpenses={budget.totalExpenses}
          totalSavings={budget.totalSavings} netBalance={budget.netBalance}
          recommendedSavings={budget.recommendedSavings} savingsProgress={budget.savingsProgress}
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
          onAdd={budget.addTransaction} onDone={() => nav('dashboard')} />;

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

  const showNav: Screen[] = ['dashboard','transactions','add','categories','archive','profile'];

  return (
    <div className="min-h-screen" style={{ background: '#020617', fontFamily: "'Cairo', sans-serif" }}>
      <AnimatePresence mode="wait">
        {screen === 'splash' && <SplashScreen key="splash" onDone={onSplashDone} />}
      </AnimatePresence>

      {screen === 'setup' && <CurrencySetup onComplete={onSetup} />}

      {showNav.includes(screen) && (
        <>
          <main style={{ minHeight: '100dvh', paddingBottom: '4rem' }}>
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
