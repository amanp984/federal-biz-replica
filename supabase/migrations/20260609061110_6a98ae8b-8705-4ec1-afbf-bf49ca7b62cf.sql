DROP POLICY IF EXISTS "Public can read bank transactions" ON public.bank_transactions;
REVOKE ALL ON public.bank_transactions FROM anon;
REVOKE ALL ON public.bank_transactions FROM authenticated;
GRANT ALL ON public.bank_transactions TO service_role;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='bank_transactions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.bank_transactions';
  END IF;
END $$;