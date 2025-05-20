
-- Create table for ETF performance data
CREATE TABLE IF NOT EXISTS public.etf_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  euro_stoxx_50 DECIMAL(10, 2),
  msci_world DECIMAL(10, 2),
  sp_500 DECIMAL(10, 2),
  average_performance DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT etf_performance_date_unique UNIQUE (date)
);

-- Add profit_share_percentage to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS fixed_interest_rate DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit_share_percentage DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS calculated_profit_share DECIMAL(10, 4) DEFAULT 0;

-- Ensure the table is exposed to the Edge Function
ALTER TABLE public.etf_performance ENABLE ROW LEVEL SECURITY;

-- Row level security policies for etf_performance
CREATE POLICY "Enable read access for authenticated users" 
ON public.etf_performance FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for service role only" 
ON public.etf_performance FOR INSERT 
TO service_role
USING (true);

-- Add RLS for products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
ON public.products FOR SELECT 
TO authenticated
USING (true);

-- Set up realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.etf_performance;
ALTER TABLE public.etf_performance REPLICA IDENTITY FULL;
