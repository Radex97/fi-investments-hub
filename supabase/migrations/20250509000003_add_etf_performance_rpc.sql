
-- Create a stored procedure to get the latest ETF performance data
CREATE OR REPLACE FUNCTION public.get_latest_etf_performance()
RETURNS TABLE (
  id UUID,
  date DATE,
  euro_stoxx_50 DECIMAL,
  msci_world DECIMAL,
  sp_500 DECIMAL,
  average_performance DECIMAL,
  created_at TIMESTAMPTZ
) 
LANGUAGE SQL
AS $$
  SELECT *
  FROM public.etf_performance
  ORDER BY date DESC
  LIMIT 1;
$$;

-- Make the function accessible to authenticated users
GRANT EXECUTE ON FUNCTION public.get_latest_etf_performance() TO authenticated;
