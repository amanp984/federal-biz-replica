
CREATE TABLE public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date date NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('CREDIT','DEBIT')),
  payment_mode text NOT NULL CHECK (payment_mode IN ('UPI','IMPS')),
  account_holder_name text NOT NULL,
  utr_number text NOT NULL,
  beneficiary_account_last_digits text,
  amount numeric(14,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.bank_transactions TO anon, authenticated;
GRANT ALL ON public.bank_transactions TO service_role;

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read bank transactions"
  ON public.bank_transactions FOR SELECT
  USING (true);
