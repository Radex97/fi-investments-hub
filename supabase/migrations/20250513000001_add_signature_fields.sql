
-- Add signature-related fields to investments table
ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS signature_url TEXT,
ADD COLUMN IF NOT EXISTS signature_provided BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS signature_date TIMESTAMPTZ;
