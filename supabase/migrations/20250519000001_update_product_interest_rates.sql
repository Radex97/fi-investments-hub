
-- Update existing products with fixed interest rates and profit share percentages
UPDATE products
SET 
  fixed_interest_rate = 
    CASE 
      WHEN title LIKE '%Wealth Protection%' THEN 2.00
      WHEN title LIKE '%Inflationsschutz%' THEN 5.00
      ELSE return_value::numeric * 0.6  -- Default: 60% of return as fixed interest
    END,
  profit_share_percentage = 
    CASE 
      WHEN title LIKE '%Wealth Protection%' THEN 60.00
      WHEN title LIKE '%Inflationsschutz%' THEN 40.00
      ELSE 50.00 -- Default profit share percentage
    END
WHERE fixed_interest_rate = 0 OR profit_share_percentage = 0;
