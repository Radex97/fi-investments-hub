
import { useState, useEffect } from "react";
import { Calculator, BarChart3, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { logActivity } from './AdminActivityLog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductYieldConfig {
  id: string;
  productName: string;
  fixedRate: number;
  indexParticipationRate: number;
  currentIndexValue: number;
  paymentFrequency: 'quarterly' | 'annual';
  nextPaymentDate: string;
}

// Define the type for ETF performance data
interface ETFPerformanceData {
  id: string;
  date: string;
  euro_stoxx_50: number;
  msci_world: number;
  sp_500: number;
  average_performance: number;
  created_at: string;
}

const AdminYieldCalculation = () => {
  // Load configurations from local storage or use default values
  const [products, setProducts] = useState<ProductYieldConfig[]>([]);
  const [calculationResults, setCalculationResults] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [publishingResults, setPublishingResults] = useState(false);
  
  // Fetch the latest ETF performance data
  const { data: etfPerformanceData, isLoading: isLoadingETF } = useQuery({
    queryKey: ['etf-current-performance'],
    queryFn: async () => {
      // Try to get from the RPC function first (if it exists)
      try {
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_latest_etf_performance');
        
        if (!rpcError && rpcData) {
          // Since rpcData could be an array, handle it appropriately
          return Array.isArray(rpcData) && rpcData.length > 0 ? rpcData[0] : rpcData;
        }
      } catch (err) {
        console.info('No RPC function found, falling back to direct query');
      }
      
      // Direct query as fallback
      const { data, error } = await supabase
        .from('etf_performance')
        .select('*')
        .order('date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    },
    retry: 1
  });
  
  // Get the latest ETF performance value
  const currentETFValue = etfPerformanceData && 'average_performance' in etfPerformanceData
    ? parseFloat(etfPerformanceData.average_performance.toString()) 
    : 14.21; // Fallback to default value
  
  useEffect(() => {
    // Try to load product configs from localStorage
    const storedConfigs = localStorage.getItem('product_configurations');
    
    if (storedConfigs) {
      try {
        const parsedConfigs = JSON.parse(storedConfigs);
        const formattedProducts = parsedConfigs.map((config: any) => ({
          id: config.product_id,
          productName: config.product_name,
          fixedRate: config.fixed_interest_rate,
          indexParticipationRate: config.index_participation_rate,
          currentIndexValue: currentETFValue,  // Use the fetched value
          paymentFrequency: config.payment_frequency,
          nextPaymentDate: config.next_payment_date
        }));
        
        setProducts(formattedProducts);
      } catch (e) {
        console.error("Error loading product configs:", e);
        setProducts(getSampleProducts(currentETFValue));
      }
    } else {
      // Use sample data if no configs found
      setProducts(getSampleProducts(currentETFValue));
    }
  }, [currentETFValue]);  // Update when ETF value changes
  
  const getSampleProducts = (indexValue: number): ProductYieldConfig[] => {
    // Default sample products if no configuration exists
    const nextQuarter = getNextQuarterDate();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    nextYear.setMonth(5); // June
    nextYear.setDate(30);
    
    return [
      {
        id: "1",
        productName: "FI Inflationsschutz PLUS",
        fixedRate: 5,
        indexParticipationRate: 60,
        currentIndexValue: indexValue,
        paymentFrequency: 'quarterly',
        nextPaymentDate: formatDateString(nextQuarter)
      },
      {
        id: "2",
        productName: "FI Wealth Protection",
        fixedRate: 2,
        indexParticipationRate: 20,
        currentIndexValue: indexValue,
        paymentFrequency: 'annual',
        nextPaymentDate: formatDateString(nextYear)
      }
    ];
  };
  
  const handleCalculate = async () => {
    setIsCalculating(true);
    
    try {
      // Simulated calculation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = products.map(product => {
        // Calculate expected returns
        const fixedComponent = product.fixedRate;
        const indexComponent = (product.currentIndexValue * product.indexParticipationRate) / 100;
        const totalReturn = fixedComponent + indexComponent;
        
        // Calculate annualized values based on payment frequency
        const annualFactor = product.paymentFrequency === 'quarterly' ? 4 : 1;
        const returnPerPayment = totalReturn / annualFactor;
        
        // Calculate days until next payment
        const daysUntilNextPayment = getDaysUntilDate(product.nextPaymentDate);
        
        return {
          id: product.id,
          productName: product.productName,
          fixedReturn: fixedComponent.toFixed(2),
          indexReturn: indexComponent.toFixed(2),
          totalAnnualReturn: totalReturn.toFixed(2),
          returnPerPayment: returnPerPayment.toFixed(2),
          nextPaymentDate: product.nextPaymentDate,
          daysUntilNextPayment,
          frequency: product.paymentFrequency
        };
      });
      
      setCalculationResults(results);
      
      // Log the activity
      await logActivity('yield_calculation', `Calculated returns for ${results.length} products`);
      
      toast.success("Renditevorhersage erfolgreich berechnet");
    } catch (error) {
      toast.error("Fehler bei der Berechnung", {
        description: error instanceof Error ? error.message : "Unbekannter Fehler"
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  const handlePublishResults = async () => {
    setPublishingResults(true);
    
    try {
      // Simulated publish delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the activity
      await logActivity('yield_publish', `Published yield forecasts for ${products.length} products`);
      
      toast.success("Renditevorhersagen erfolgreich veröffentlicht", {
        description: "Die aktualisierten Werte sind nun für Benutzer sichtbar."
      });
    } catch (error) {
      toast.error("Fehler beim Veröffentlichen", {
        description: error instanceof Error ? error.message : "Unbekannter Fehler"
      });
    } finally {
      setPublishingResults(false);
    }
  };

  // Helper to manually update the current index value in all products
  const updateAllCurrentIndexValues = (value: number) => {
    setProducts(prev => prev.map(product => ({
      ...product,
      currentIndexValue: value
    })));
  };

  // Helper function to trigger ETF data update via the edge function
  const handleRefreshETFData = async () => {
    try {
      toast.info("Aktualisiere Indexdaten...");
      
      // Fix: Use the environment URL directly instead of accessing protected property
      const { data: { session } } = await supabase.auth.getSession();
      
      // Use the SUPABASE_URL from the client.ts file
      // This references the constant defined in src/integrations/supabase/client.ts
      const projectRef = "vsxbmdghnqyhcyldjdoa";
      const functionUrl = `https://${projectRef}.supabase.co/functions/v1/calc_profit`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast.success(`Indexdaten erfolgreich aktualisiert. Durchschnitt: ${result.average_performance}%`);
      
      // Refresh the query data
      await supabase.rpc('get_latest_etf_performance').then(() => {
        // After successful refresh, update the product values
        updateAllCurrentIndexValues(parseFloat(result.average_performance));
      });
      
    } catch (error) {
      console.error('Error refreshing ETF data:', error);
      toast.error('Fehler beim Aktualisieren der Indexdaten', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  };
  
  // Helper to get days until a specific date
  const getDaysUntilDate = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Reset hours to compare just the dates
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const differenceMs = targetDate.getTime() - today.getTime();
    return Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
  };
  
  // Helper to get the next quarter date
  function getNextQuarterDate() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const nextQuarter = (currentQuarter + 1) % 4;
    
    const result = new Date();
    result.setMonth(nextQuarter * 3 + 2); // Last month of the quarter
    
    // Set to end of month
    if (nextQuarter === 0) { // March
      result.setDate(31);
    } else if (nextQuarter === 1) { // June
      result.setDate(30);
    } else if (nextQuarter === 2) { // September
      result.setDate(30);
    } else { // December
      result.setDate(31);
    }
    
    // If we've already passed this date this year, move to next year
    if (result < now) {
      result.setFullYear(result.getFullYear() + 1);
    }
    
    return result;
  }
  
  // Format date for display
  function formatDateString(date: Date) {
    return date.toISOString().split('T')[0];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Rendite-Berechnung</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshETFData}
            disabled={isLoadingETF}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Indexdaten aktualisieren
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleCalculate} 
            disabled={isCalculating}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Berechnen
          </Button>
          
          <Button 
            onClick={handlePublishResults} 
            disabled={publishingResults || calculationResults.length === 0}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Ergebnisse veröffentlichen
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="input" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="input">Parameter & Eingaben</TabsTrigger>
          <TabsTrigger value="results">Berechnungsergebnisse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input" className="space-y-4">
          <Alert className="bg-[#FCF8E9] border-[#B1904B]/30">
            <AlertCircle className="h-4 w-4 text-[#B1904B]" />
            <AlertTitle>Hinweis zur Berechnung</AlertTitle>
            <AlertDescription>
              Die Berechnungen basieren auf den aktuellen Konfigurationen und Index-Werten.
              Sie können die Parameter in den Produkt-Konfigurationen anpassen.
              {isLoadingETF ? (
                <div className="mt-2">Index-Wert wird geladen...</div>
              ) : (
                <div className="mt-2">
                  Aktueller Index-Wert: <span className="font-semibold">{currentETFValue}%</span> 
                  &nbsp;(letztes Update: {etfPerformanceData && 'date' in etfPerformanceData ? etfPerformanceData.date : 'unbekannt'})
                </div>
              )}
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Berechnungsparameter</CardTitle>
              <CardDescription>
                Überprüfen Sie die Parameter, die für die Renditeberechnung verwendet werden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead>Fix-Zins (%)</TableHead>
                    <TableHead>Index-Beteiligung (%)</TableHead>
                    <TableHead>Aktueller Index (%)</TableHead>
                    <TableHead>Zahlungsfrequenz</TableHead>
                    <TableHead>Nächste Zahlung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={product.fixedRate}
                          onChange={(e) => {
                            const newProducts = [...products];
                            const index = newProducts.findIndex(p => p.id === product.id);
                            if (index !== -1) {
                              newProducts[index].fixedRate = parseFloat(e.target.value);
                              setProducts(newProducts);
                            }
                          }}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={product.indexParticipationRate}
                          onChange={(e) => {
                            const newProducts = [...products];
                            const index = newProducts.findIndex(p => p.id === product.id);
                            if (index !== -1) {
                              newProducts[index].indexParticipationRate = parseFloat(e.target.value);
                              setProducts(newProducts);
                            }
                          }}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={product.currentIndexValue}
                          onChange={(e) => {
                            const newProducts = [...products];
                            const index = newProducts.findIndex(p => p.id === product.id);
                            if (index !== -1) {
                              newProducts[index].currentIndexValue = parseFloat(e.target.value);
                              setProducts(newProducts);
                            }
                          }}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={product.paymentFrequency}
                          onValueChange={(value) => {
                            const newProducts = [...products];
                            const index = newProducts.findIndex(p => p.id === product.id);
                            if (index !== -1) {
                              newProducts[index].paymentFrequency = value as 'quarterly' | 'annual';
                              setProducts(newProducts);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Frequenz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                            <SelectItem value="annual">Jährlich</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={product.nextPaymentDate}
                          onChange={(e) => {
                            const newProducts = [...products];
                            const index = newProducts.findIndex(p => p.id === product.id);
                            if (index !== -1) {
                              newProducts[index].nextPaymentDate = e.target.value;
                              setProducts(newProducts);
                            }
                          }}
                          className="w-40"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          {calculationResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Keine Berechnungsergebnisse</h3>
              <p className="text-muted-foreground mt-2">
                Klicken Sie auf "Berechnen", um die Renditen zu berechnen
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Berechnete Renditen</CardTitle>
                <CardDescription>
                  Ergebnisse der Rendite-Berechnung basierend auf den aktuellen Parametern
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produkt</TableHead>
                      <TableHead>Fix-Zins (%)</TableHead>
                      <TableHead>Index-Anteil (%)</TableHead>
                      <TableHead>Gesamt p.a. (%)</TableHead>
                      <TableHead>Nächste Zahlung</TableHead>
                      <TableHead>Tage bis Zahlung</TableHead>
                      <TableHead>Auszahlung je Termin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculationResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.productName}</TableCell>
                        <TableCell>{result.fixedReturn}%</TableCell>
                        <TableCell>{result.indexReturn}%</TableCell>
                        <TableCell className="font-bold text-[#B1904B]">
                          {result.totalAnnualReturn}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            {new Date(result.nextPaymentDate).toLocaleDateString('de-DE')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-100">
                            {result.daysUntilNextPayment} Tage
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.returnPerPayment}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 p-4 bg-[#FCF8E9] rounded-lg border border-[#B1904B]/30">
                  <h3 className="font-semibold">Hinweis zur Veröffentlichung</h3>
                  <p className="text-sm mt-2">
                    Wenn Sie auf "Ergebnisse veröffentlichen" klicken, werden diese Werte für Benutzer im Frontend sichtbar.
                    Die Rendite-Prognosen werden regelmäßig aktualisiert und basieren auf den aktuellen Marktdaten.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminYieldCalculation;
