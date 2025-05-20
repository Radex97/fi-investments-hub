
// calc_profit edge function
//
// Calculates daily profit share based on stock indices performance:
// - Euro-Stoxx-50 (EU0009658145)
// - MSCI World (XC0009692739)
// - S&P 500 (US78378X1072)
//
// Scheduled to run daily at 18:00 UTC on weekdays

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define the API URL
const TWELVEDATA_API_URL = 'https://api.twelvedata.com';

// Define the ISINs we need to track
const ISINS = [
  'EU0009658145', // Euro-Stoxx-50
  'XC0009692739', // MSCI World
  'US78378X1072', // S&P 500
];

// Define the profit sharing multiplier (60%)
const PROFIT_SHARING_MULTIPLIER = 0.6;

// Define types for API responses
interface SymbolSearchResult {
  data: {
    symbol: string;
    name: string;
    currency: string;
    exchange: string;
    mic_code: string;
    country: string;
    type: string;
    isin: string;
  }[];
}

interface TimeSeries {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange: string;
    type: string;
  };
  values: {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }[];
  status: string;
}

interface TimeSeriesResponse {
  [symbol: string]: TimeSeries;
}

interface IndexPerformance {
  symbol: string;
  name: string;
  isin: string;
  currentValue: number;
  startValue: number;
  performance: number;
}

// CORS headers to allow the function to be called from the frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Handle CORS preflight requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Set today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Step 1: Convert ISINs to symbols
    console.log('Converting ISINs to symbols...');
    const symbols = await Promise.all(
      ISINS.map(async (isin) => {
        const response = await fetch(
          `${TWELVEDATA_API_URL}/symbol_search?isin=${isin}&apikey=${Deno.env.get('TWELVEDATA_API_KEY')}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to get symbol for ISIN ${isin}: ${response.status}`);
        }
        
        const data = await response.json() as SymbolSearchResult;
        
        if (!data.data || data.data.length === 0) {
          throw new Error(`No symbol found for ISIN ${isin}`);
        }
        
        return {
          symbol: data.data[0].symbol,
          name: data.data[0].name,
          isin: isin
        };
      })
    );
    
    console.log('Symbols resolved:', symbols.map(s => `${s.isin} -> ${s.symbol}`).join(', '));
    
    // Step 2: Get historical prices for all symbols
    console.log('Fetching historical prices...');
    const symbolsList = symbols.map(s => s.symbol).join(',');
    const timeSeriesResponse = await fetch(
      `${TWELVEDATA_API_URL}/time_series?symbol=${symbolsList}&interval=1day&outputsize=5000&apikey=${Deno.env.get('TWELVEDATA_API_KEY')}`
    );
    
    if (!timeSeriesResponse.ok) {
      throw new Error(`Failed to get time series: ${timeSeriesResponse.status}`);
    }
    
    const timeSeriesData = await timeSeriesResponse.json() as TimeSeriesResponse;
    
    // Step 3: Calculate performance for each index
    console.log('Calculating index performances...');
    const performances: IndexPerformance[] = [];
    
    for (const symbolInfo of symbols) {
      const timeSeries = timeSeriesData[symbolInfo.symbol];
      
      if (!timeSeries || !timeSeries.values || timeSeries.values.length === 0) {
        throw new Error(`No time series data for ${symbolInfo.symbol}`);
      }
      
      // Get the current value (most recent closing price)
      const currentValue = parseFloat(timeSeries.values[0].close);
      
      // Find the closing price from January 1st of the current year
      const currentYear = new Date().getFullYear();
      const startOfYearDateString = `${currentYear}-01-01`;
      
      // Find the value closest to January 1st (may not be exactly Jan 1 due to weekends/holidays)
      let startValue: number | null = null;
      for (const value of timeSeries.values) {
        if (value.datetime.startsWith(currentYear.toString())) {
          startValue = parseFloat(value.close);
          break;
        }
      }
      
      if (startValue === null) {
        throw new Error(`Could not find start value for ${symbolInfo.symbol}`);
      }
      
      // Calculate performance as (current / start) - 1
      const performance = (currentValue / startValue) - 1;
      
      performances.push({
        symbol: symbolInfo.symbol,
        name: symbolInfo.name,
        isin: symbolInfo.isin,
        currentValue,
        startValue,
        performance
      });
      
      console.log(`Performance for ${symbolInfo.symbol} (${symbolInfo.name}): ${(performance * 100).toFixed(2)}%`);
    }
    
    // Step 4: Calculate the average performance
    const totalPerformance = performances.reduce((sum, index) => sum + index.performance, 0);
    const averagePerformance = totalPerformance / performances.length;
    
    console.log(`Average performance: ${(averagePerformance * 100).toFixed(2)}%`);
    
    // Step 5: Calculate profit rate according to the formula
    // If averagePerformance <= 0, profit = 0, otherwise profit = averagePerformance * 0.60
    const profitRate = averagePerformance <= 0 ? 0 : averagePerformance * PROFIT_SHARING_MULTIPLIER;
    
    // Round to 2 decimal places
    const roundedProfitRate = Math.round(profitRate * 10000) / 100; // Convert to percentage and round
    
    console.log(`Calculated profit rate: ${roundedProfitRate}%`);
    
    // Step 6: Store the result in the database
    console.log(`Saving profit rate for ${today}...`);
    const { data, error } = await supabase
      .from('daily_profit')
      .upsert(
        { 
          id: today, 
          rate_percent: roundedProfitRate 
        },
        { onConflict: 'id' }
      );
    
    if (error) {
      throw new Error(`Failed to store profit rate: ${error.message}`);
    }
    
    console.log(`Successfully saved profit rate for ${today}`);
    
    // Step 7: Update products table with calculated profit share
    // This keeps the calculated_profit_share column updated with the latest value
    console.log('Updating products table with new profit share value...');
    const { data: productUpdateData, error: productUpdateError } = await supabase
      .from('products')
      .update({ calculated_profit_share: roundedProfitRate })
      .neq('profit_share_percentage', 0);
    
    if (productUpdateError) {
      console.error(`Warning: Failed to update products table: ${productUpdateError.message}`);
      // Don't throw an error here, just log a warning as this is not critical
    } else {
      console.log('Products table updated successfully');
    }
    
    // Step 8: Store the raw average performance percentage for admin portal
    console.log('Storing raw average performance for admin portal...');
    const rawPerformancePercent = Math.round(averagePerformance * 10000) / 100; // Convert to percentage with 2 decimals
    
    // Store the raw performance in etf_performance table if it exists
    try {
      const { data: etfData, error: etfError } = await supabase
        .from('etf_performance')
        .upsert(
          {
            date: today,
            average_performance: rawPerformancePercent,
            euro_stoxx_50: performances.find(p => p.isin === 'EU0009658145')?.performance || 0,
            msci_world: performances.find(p => p.isin === 'XC0009692739')?.performance || 0,
            sp_500: performances.find(p => p.isin === 'US78378X1072')?.performance || 0
          },
          { onConflict: 'date' }
        );
      
      if (etfError) {
        console.error(`Warning: Failed to update etf_performance table: ${etfError.message}`);
      } else {
        console.log('ETF performance data stored successfully');
      }
    } catch (error) {
      console.error('Error storing ETF performance:', error);
      // Don't throw error here as the table might not exist yet
    }
    
    // Return response with calculated values and symbols
    const response = {
      date: today,
      symbols: performances.map(p => ({
        symbol: p.symbol,
        name: p.name,
        isin: p.isin,
        performance: (p.performance * 100).toFixed(2)
      })),
      average_performance: (averagePerformance * 100).toFixed(2),
      profit: roundedProfitRate
    };
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error in calc_profit function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'See function logs for more information'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
