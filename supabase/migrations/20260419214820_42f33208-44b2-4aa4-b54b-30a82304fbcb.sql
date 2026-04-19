
-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  currency TEXT NOT NULL DEFAULT 'IQD',
  custom_symbol TEXT DEFAULT '',
  setup_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- =========== CATEGORIES ===========
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  legacy_id TEXT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'MoreHorizontal',
  color TEXT NOT NULL DEFAULT '#6B7280',
  cat_type TEXT NOT NULL DEFAULT 'expense',
  category_limit NUMERIC,
  custom BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_user ON public.categories(user_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- =========== SAVINGS POTS ===========
CREATE TABLE public.savings_pots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC,
  color TEXT NOT NULL DEFAULT '#D4A017',
  icon TEXT NOT NULL DEFAULT 'PiggyBank',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pots_user ON public.savings_pots(user_id);

ALTER TABLE public.savings_pots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pots" ON public.savings_pots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own pots" ON public.savings_pots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pots" ON public.savings_pots
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own pots" ON public.savings_pots
  FOR DELETE USING (auth.uid() = user_id);

-- =========== TRANSACTIONS ===========
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  amount NUMERIC NOT NULL,
  tx_type TEXT NOT NULL,
  category TEXT NOT NULL,
  tx_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  month TEXT NOT NULL,
  pot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tx_user_month ON public.transactions(user_id, month);
CREATE INDEX idx_tx_user_date ON public.transactions(user_id, tx_date DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own tx" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tx" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tx" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own tx" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- =========== TIMESTAMPS TRIGGER ===========
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_pots_updated BEFORE UPDATE ON public.savings_pots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =========== AUTO-SETUP NEW USER ===========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Profile
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Default categories (income)
  INSERT INTO public.categories (user_id, legacy_id, name, icon, color, cat_type) VALUES
    (NEW.id, 'salary',        'راتب',    'Wallet',         '#00FF7F', 'income'),
    (NEW.id, 'investment',    'استثمار', 'TrendingUp',     '#22C55E', 'income'),
    (NEW.id, 'freelance',     'عمل حر',  'Briefcase',      '#4ADE80', 'income'),
    (NEW.id, 'food',          'طعام',    'UtensilsCrossed','#F59E0B', 'expense'),
    (NEW.id, 'transport',     'مواصلات', 'Car',            '#3B82F6', 'expense'),
    (NEW.id, 'housing',       'سكن',     'Home',           '#8B5CF6', 'expense'),
    (NEW.id, 'health',        'صحة',     'Heart',          '#EC4899', 'expense'),
    (NEW.id, 'shopping',      'تسوق',    'ShoppingBag',    '#A855F7', 'expense'),
    (NEW.id, 'bills',         'فواتير',  'Zap',            '#EF4444', 'expense'),
    (NEW.id, 'entertainment', 'ترفيه',   'Music',          '#6366F1', 'expense'),
    (NEW.id, 'education',     'تعليم',   'BookOpen',       '#0EA5E9', 'expense'),
    (NEW.id, 'savings_cat',   'مدخرات',  'PiggyBank',      '#D4A017', 'saving'),
    (NEW.id, 'other',         'أخرى',    'MoreHorizontal', '#6B7280', 'expense');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
