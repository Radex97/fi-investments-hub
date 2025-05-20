
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ETF symbols for Twelve Data API
const ETF_SYMBOLS = {
  "EU0009658145": "ESTX50", // Euro Stoxx 50
  "XC0009692739": "MSCI", // MSCI World 
  "US78378X1072": "SPX" // S&P 500
};

// Supabase client setup
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// TwelveData API key
const twelveDataApiKey = Deno.env.get("TWELVEDATA_API_KEY") || "";

// Fetch ETF data from TwelveData API
async function fetchETFData(symbol: string) {
  try {
    console.log(`Fetching data for symbol: ${symbol} with API key: ${twelveDataApiKey ? "API key present" : "No API key"}`);
    
    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=1&apikey=${twelveDataApiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching data for ${symbol}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`API response for ${symbol}:`, JSON.stringify(data).substring(0, 200) + '...');
    
    if (data.status === "error") {
      throw new Error(`API Error: ${data.message}`);
    }
    
    // Get the closing price from the most recent day
    const closePrice = data.values?.[0]?.close;
    console.log(`Fetched close price for ${symbol}: ${closePrice}`);
    return closePrice ? parseFloat(closePrice) : null;
  } catch (error) {
    console.error(`Error fetching ETF data for ${symbol}:`, error);
    return null;
  }
}

// Update products with new profit share calculations
async function updateProductProfitShares(etfPerformance: number) {
  try {
    console.log(`Updating products with ETF performance: ${etfPerformance}`);
    
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, profit_share_percentage');
      
    if (productsError) throw productsError;
    console.log(`Found ${products?.length || 0} products to update`);
    
    // For each product, calculate the profit share based on ETF performance and profit_share_percentage
    for (const product of products || []) {
      // Calculate the profit share: ETF performance * profit share percentage / 100
      const calculatedProfitShare = (product.profit_share_percentage / 100) * etfPerformance;
      console.log(`Product ${product.id}: profit_share_percentage=${product.profit_share_percentage}, calculatedProfitShare=${calculatedProfitShare}`);
      
      // Update product with calculated profit share
      const { error: updateError } = await supabase
        .from('products')
        .update({ calculated_profit_share: calculatedProfitShare })
        .eq('id', product.id);
        
      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      }
    }
  } catch (error) {
    console.error("Error updating product profit shares:", error);
  }
}

// Main function to update ETF data
async function updateETFData() {
  try {
    console.log("Starting ETF data update...");
    
    // Fetch data for all ETFs
    const etfPrices: Record<string, number | null> = {};
    
    for (const [isin, symbol] of Object.entries(ETF_SYMBOLS)) {
      const price = await fetchETFData(symbol);
      etfPrices[isin] = price;
      console.log(`Fetched ${symbol} (${isin}): ${price}`);
    }
    
    // Calculate average performance (simple average for now)
    const validPrices = Object.values(etfPrices).filter(price => price !== null) as number[];
    if (validPrices.length === 0) {
      throw new Error("Failed to fetch any valid ETF prices");
    }
    
    const averagePrice = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
    console.log(`Calculated average price: ${averagePrice}`);
    
    // Insert ETF performance data
    const { data: insertData, error: insertError } = await supabase
      .from('etf_performance')
      .insert({
        date: new Date().toISOString().split('T')[0],
        euro_stoxx_50: etfPrices["EU0009658145"],
        msci_world: etfPrices["XC0009692739"],
        sp_500: etfPrices["US78378X1072"],
        average_performance: averagePrice
      })
      .select();
      
    if (insertError) throw insertError;
    console.log("ETF performance data inserted:", insertData);
    
    // Update product profit shares based on ETF performance
    await updateProductProfitShares(averagePrice);
    
    console.log("ETF data update completed successfully");
    return { success: true, message: "ETF data updated successfully" };
  } catch (error) {
    console.error("Error in updateETFData:", error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Allow CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    // Check if it's a scheduled invocation or manual trigger
    const url = new URL(req.url);
    const isManualTrigger = url.searchParams.get("manual") === "true";
    
    if (isManualTrigger) {
      console.log("Manual trigger of ETF data update");
    } else {
      console.log("Scheduled ETF data update");
    }
    
    const result = await updateETFData();
    
    return new Response(JSON.stringify(result), {
      headers: { ...headers, "Content-Type": "application/json" },
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Error in edge function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...headers, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
