
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, TrendingUp, Percent, Split, CircleHelp } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface InvestmentMetrics {
  productId: string;
  productName: string;
  fixedInterestRate: number;
  profitShare: number;
  totalReturn: number;
  lastUpdated: string;
}

export const InvestmentOverview = () => {
  const [metrics, setMetrics] = useState<InvestmentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InvestmentMetrics | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvestmentMetrics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get user investments
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);
        
      if (investmentsError) throw investmentsError;
      
      // Get products separately
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
        
      if (productsError) throw productsError;
      
      const currentDate = new Date().toISOString().split('T')[0];
      
      const formattedMetrics = investments?.map(investment => {
        // Find the matching product
        const product = products?.find(p => p.id === investment.product_id);
        
        if (!product) {
          return {
            productId: investment.product_id,
            productName: investment.product_title || 'Unknown Product',
            fixedInterestRate: 0,
            profitShare: 0,
            totalReturn: 0,
            lastUpdated: currentDate
          };
        }
        
        // Use the actual fixed interest rate and profit share from the product table
        // Ensure we're converting string values to numbers
        const fixedInterestRate = typeof product.fixed_interest_rate === 'string' 
          ? parseFloat(product.fixed_interest_rate) 
          : (typeof product.fixed_interest_rate === 'number' ? product.fixed_interest_rate : 0);
        
        const profitShare = typeof product.calculated_profit_share === 'string' 
          ? parseFloat(product.calculated_profit_share) 
          : (typeof product.calculated_profit_share === 'number' ? product.calculated_profit_share : 0);
        
        return {
          productId: product.id,
          productName: product.title || investment.product_title || 'Unknown Product',
          fixedInterestRate: fixedInterestRate,
          profitShare: profitShare,
          totalReturn: fixedInterestRate + profitShare,
          lastUpdated: currentDate
        };
      }) || [];
      
      setMetrics(formattedMetrics);
    } catch (error: any) {
      console.error("Error fetching investment metrics:", error);
      toast({
        title: "Fehler beim Laden der Investitionsdaten",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvestmentMetrics();
    
    // Set up real-time subscription for data updates
    const channel = supabase
      .channel('product-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchInvestmentMetrics();
          toast({
            title: "Daten aktualisiert",
            description: "Die Rendite-Daten wurden aktualisiert.",
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchInvestmentMetrics();
  };

  const handleOpenProductDetails = (product: InvestmentMetrics) => {
    setSelectedProduct(product);
    setInfoDialogOpen(true);
  };

  if (loading && metrics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Investment Performance</h2>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Investment-Performance</h2>
            <button 
              onClick={handleManualRefresh}
              className="flex items-center text-sm text-neutral-500 hover:text-[#003595] transition-colors"
              disabled={refreshing}
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Aktualisieren
            </button>
          </div>

          <div className="mb-2 flex items-center">
            <CircleHelp size={16} className="text-neutral-500 mr-2" />
            <p className="text-xs text-neutral-500">
              Die Gesamtrendite setzt sich aus dem garantierten Fixzins und der variablen Gewinnbeteiligung zusammen.
              <button 
                onClick={() => setInfoDialogOpen(true)}
                className="ml-1 text-[#003595] hover:underline"
              >
                Mehr erfahren
              </button>
            </p>
          </div>

          {metrics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produkt</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Fix-Zins (p.a.)
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="ml-1 text-neutral-400 hover:text-neutral-600">
                            <CircleHelp size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3 text-sm">
                          Der Fix-Zins ist der garantierte Teil Ihrer Rendite, der unabhängig von Marktbedingungen jährlich ausgezahlt wird.
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Gewinnbeteiligung
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="ml-1 text-neutral-400 hover:text-neutral-600">
                            <CircleHelp size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3 text-sm">
                          Die Gewinnbeteiligung ist der variable Teil Ihrer Rendite, der von der Performance des zugrundeliegenden Index abhängt und jährlich berechnet wird.
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableHead>
                  <TableHead>Gesamtrendite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((item, index) => (
                  <TableRow 
                    key={index} 
                    className="cursor-pointer hover:bg-neutral-50"
                    onClick={() => handleOpenProductDetails(item)}
                  >
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Percent size={16} className="mr-1 text-[#003595]" />
                        {item.fixedInterestRate.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Split size={16} className="mr-1 text-[#B1904B]" />
                        {item.profitShare.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-semibold">
                        <TrendingUp size={16} className={`mr-1 ${item.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        {item.totalReturn.toFixed(2)}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-neutral-500">
              Keine Investitionen gefunden
            </div>
          )}
          
          <div className="mt-4 text-xs text-neutral-500 text-right">
            Letzte Aktualisierung: {metrics.length > 0 ? new Date(metrics[0].lastUpdated).toLocaleDateString('de-DE') : '-'}
          </div>
        </CardContent>
      </Card>

      {/* Calculation explainer dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Berechnung der Rendite</DialogTitle>
            <DialogDescription>
              Wie sich Ihre Gesamtrendite zusammensetzt
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Komponenten der Rendite:</h3>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="flex items-center text-[#003595] font-medium mb-2">
                  <Percent size={16} className="mr-2" /> Fixzins
                </h4>
                <p className="text-sm">
                  Der garantierte Zinssatz, der unabhängig von Marktbedingungen jährlich auf Ihr investiertes Kapital ausgezahlt wird.
                </p>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md">
                <h4 className="flex items-center text-[#B1904B] font-medium mb-2">
                  <Split size={16} className="mr-2" /> Gewinnbeteiligung
                </h4>
                <p className="text-sm">
                  Der variable Anteil Ihrer Rendite, der von der Performance des zugrundeliegenden Index abhängt. Dieser wird mit einem Partizipationsfaktor (i.d.R. 60%) an der Wertentwicklung des Index berechnet.
                </p>
              </div>
            </div>
            
            {selectedProduct && (
              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-3">Beispielberechnung für {selectedProduct.productName}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Fixzins:</span>
                    <span className="font-medium text-[#003595]">{selectedProduct.fixedInterestRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gewinnbeteiligung:</span>
                    <span className="font-medium text-[#B1904B]">{selectedProduct.profitShare.toFixed(2)}%</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between font-medium">
                    <span>Gesamtrendite:</span>
                    <span>{selectedProduct.totalReturn.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
