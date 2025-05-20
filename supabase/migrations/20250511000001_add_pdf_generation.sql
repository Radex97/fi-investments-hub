
-- Function to automatically trigger PDF generation when a Wealth Protection investment is created
CREATE OR REPLACE FUNCTION public.trigger_wealth_protection_pdf_generation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for Wealth Protection product
  IF EXISTS (
    SELECT 1 FROM products 
    WHERE id = NEW.product_id 
    AND title LIKE '%Wealth Protection%'
  ) THEN
    -- Update record to indicate document generation is pending
    UPDATE investments 
    SET document_url = 'pending' 
    WHERE id = NEW.id;
    
    -- In a real implementation, we would trigger a serverless function here
    -- or add the record to a queue to be processed
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new investments
CREATE TRIGGER wealth_protection_pdf_trigger
AFTER INSERT ON public.investments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_wealth_protection_pdf_generation();
