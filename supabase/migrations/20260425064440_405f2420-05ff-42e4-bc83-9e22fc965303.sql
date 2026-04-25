
-- ============================================
-- Monthly Archives Table
-- ============================================
CREATE TABLE public.monthly_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month TEXT NOT NULL, -- format: YYYY-MM
  total_income NUMERIC NOT NULL DEFAULT 0,
  total_expenses NUMERIC NOT NULL DEFAULT 0,
  total_savings NUMERIC NOT NULL DEFAULT 0,
  net_balance NUMERIC NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);

CREATE INDEX idx_monthly_archives_user_month ON public.monthly_archives(user_id, month DESC);

ALTER TABLE public.monthly_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own archives"
  ON public.monthly_archives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own archives"
  ON public.monthly_archives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own archives"
  ON public.monthly_archives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own archives"
  ON public.monthly_archives FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_monthly_archives_updated
  BEFORE UPDATE ON public.monthly_archives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Budget Goals Table
-- ============================================
CREATE TABLE public.budget_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month TEXT, -- YYYY-MM, null = recurring monthly goal
  category_id TEXT, -- null = overall monthly budget
  goal_type TEXT NOT NULL DEFAULT 'budget', -- 'budget' | 'savings'
  target_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_goals_user ON public.budget_goals(user_id, month);

ALTER TABLE public.budget_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own goals"
  ON public.budget_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own goals"
  ON public.budget_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own goals"
  ON public.budget_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own goals"
  ON public.budget_goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_budget_goals_updated
  BEFORE UPDATE ON public.budget_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Archive Month Function
-- Computes summary for a given user + month and stores it
-- ============================================
CREATE OR REPLACE FUNCTION public.archive_month(_user_id UUID, _month TEXT)
RETURNS public.monthly_archives
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_income NUMERIC := 0;
  v_expenses NUMERIC := 0;
  v_savings NUMERIC := 0;
  v_count INTEGER := 0;
  v_net NUMERIC := 0;
  v_row public.monthly_archives;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN tx_type = 'income'  THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN tx_type = 'expense' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN tx_type = 'saving'  THEN amount ELSE 0 END), 0),
    COUNT(*)
  INTO v_income, v_expenses, v_savings, v_count
  FROM public.transactions
  WHERE user_id = _user_id AND month = _month;

  v_net := v_income - v_expenses - v_savings;

  INSERT INTO public.monthly_archives
    (user_id, month, total_income, total_expenses, total_savings, net_balance, transaction_count)
  VALUES
    (_user_id, _month, v_income, v_expenses, v_savings, v_net, v_count)
  ON CONFLICT (user_id, month) DO UPDATE
    SET total_income      = EXCLUDED.total_income,
        total_expenses    = EXCLUDED.total_expenses,
        total_savings     = EXCLUDED.total_savings,
        net_balance       = EXCLUDED.net_balance,
        transaction_count = EXCLUDED.transaction_count,
        archived_at       = now(),
        updated_at        = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- ============================================
-- Auto-archive previous month for the calling user
-- Called by the client on first launch in a new month
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_archive_previous_month()
RETURNS public.monthly_archives
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_prev TEXT := to_char((date_trunc('month', now()) - INTERVAL '1 month'), 'YYYY-MM');
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  RETURN public.archive_month(v_uid, v_prev);
END;
$$;
