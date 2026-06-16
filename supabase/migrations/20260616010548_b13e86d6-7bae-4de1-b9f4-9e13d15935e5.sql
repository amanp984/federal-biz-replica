-- Lock down public.bank_transactions: deny all access to anon and authenticated
-- roles. Only the server-side service role (used by edge/server functions
-- behind an authenticated server function) may read or write this table.
REVOKE ALL ON public.bank_transactions FROM anon;
REVOKE ALL ON public.bank_transactions FROM authenticated;
GRANT ALL ON public.bank_transactions TO service_role;

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "no_public_access_select" ON public.bank_transactions;
DROP POLICY IF EXISTS "no_public_access_modify" ON public.bank_transactions;

CREATE POLICY "no_public_access_select"
  ON public.bank_transactions
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "no_public_access_modify"
  ON public.bank_transactions
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);