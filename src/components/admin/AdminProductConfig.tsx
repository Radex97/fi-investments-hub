
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminActivityLog, { logActivity } from './AdminActivityLog';

// Define the product configuration type
interface ProductConfig {
  id: string;
  product_id: string;
  fixed_interest_rate: number;
  profit_share_rate: number;
  payment_frequency: 'quarterly' | 'annual';
  payment_dates: string[];
  product_name?: string;
  index_current_average: number;
  index_participation_rate: number;
  next_payment_date: string;
}

const AdminProductConfig = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("interest");
  
  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
  
  // Setup for product configurations
  const [formData, setFormData] = useState<ProductConfig[]>([]);
  
  // Initialize form data based on products
  useEffect(() => {
    if (products) {
      // Initialize form with default configs for each product
      const initialData = products.map(product => {
        // Generate default configuration for products
        const isInflation = product.title.includes("Inflationsschutz");
        const nextQuarter = getNextQuarterDate();
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        nextYear.setMonth(5); // June
        nextYear.setDate(30);
        
        return {
          id: product.id, // Use product ID as the config ID
          product_id: product.id,
          fixed_interest_rate: isInflation ? 5 : 2,
          profit_share_rate: 0,
          payment_frequency: isInflation ? 'quarterly' as const : 'annual' as const,
          payment_dates: isInflation ? 
            ['03-31', '06-30', '09-30', '12-31'] : ['06-30'],
          product_name: product.title,
          index_current_average: 14.21,
          index_participation_rate: isInflation ? 60 : 20,
          next_payment_date: isInflation ? 
            formatDateString(nextQuarter) : 
            formatDateString(nextYear)
        };
      });
      
      setFormData(initialData);
    }
  }, [products]);
  
  // Mutation for saving configurations to local storage for now
  const updateMutation = useMutation({
    mutationFn: async (data: ProductConfig[]) => {
      // Store the configurations in local storage for now
      localStorage.setItem('product_configurations', JSON.stringify(data));
      
      // Log the activity
      await logActivity('product_config_update', `Updated configurations for ${data.length} products`);
      
      return data;
    },
    onSuccess: () => {
      toast.success("Produktkonfigurationen wurden erfolgreich gespeichert");
      queryClient.invalidateQueries({ queryKey: ["admin-activity-log"] });
    },
    onError: (error) => {
      toast.error("Fehler beim Speichern der Konfigurationen", {
        description: error.message
      });
    }
  });
  
  const handleInputChange = (productId: string, field: string, value: any) => {
    setFormData(prev => prev.map(item => {
      if (item.product_id === productId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleFrequencyChange = (productId: string, value: 'quarterly' | 'annual') => {
    setFormData(prev => prev.map(item => {
      if (item.product_id === productId) {
        // Default dates based on frequency
        const newDates = value === 'quarterly' 
          ? ['03-31', '06-30', '09-30', '12-31'] 
          : ['06-30'];
          
        return { 
          ...item, 
          payment_frequency: value,
          payment_dates: newDates
        };
      }
      return item;
    }));
  };
  
  const handlePaymentDateChange = (productId: string, index: number, value: string) => {
    setFormData(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newDates = [...item.payment_dates];
        newDates[index] = value;
        return { ...item, payment_dates: newDates };
      }
      return item;
    }));
  };
  
  const handleSaveConfigurations = () => {
    // Validate all inputs first
    for (const config of formData) {
      if (isNaN(config.fixed_interest_rate) || config.fixed_interest_rate < 0) {
        toast.error(`Ungültiger Fixzinssatz für ${config.product_name}`, {
          description: "Zinssatz muss eine positive Zahl sein."
        });
        return;
      }
      
      if (isNaN(config.profit_share_rate) || config.profit_share_rate < 0) {
        toast.error(`Ungültige Gewinnbeteiligung für ${config.product_name}`, {
          description: "Gewinnbeteiligung muss eine positive Zahl sein."
        });
        return;
      }
      
      if (isNaN(config.index_current_average) || config.index_current_average < 0) {
        toast.error(`Ungültiger Index-Durchschnitt für ${config.product_name}`, {
          description: "Index-Durchschnitt muss eine positive Zahl sein."
        });
        return;
      }
      
      if (isNaN(config.index_participation_rate) || config.index_participation_rate < 0 || config.index_participation_rate > 100) {
        toast.error(`Ungültiger Index-Beteiligungssatz für ${config.product_name}`, {
          description: "Index-Beteiligungssatz muss zwischen 0 und 100 liegen."
        });
        return;
      }
      
      // Validate dates
      for (const date of config.payment_dates) {
        const datePattern = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
        if (!datePattern.test(date)) {
          toast.error(`Ungültiges Datumsformat für ${config.product_name}`, {
            description: "Datum muss im Format MM-DD sein, z.B. 06-30."
          });
          return;
        }
      }
    }
    
    updateMutation.mutate(formData);
  };
  
  // Function to calculate expected return based on configuration
  const calculateExpectedReturn = (config: ProductConfig) => {
    // Fixed interest component
    const fixedComponent = config.fixed_interest_rate;
    
    // Profit share component based on index
    const profitComponent = (config.index_current_average * config.index_participation_rate) / 100;
    
    // Total expected return
    return fixedComponent + profitComponent;
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
  
  const isLoading = productsLoading;
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Produkt-Konfigurationen</h1>
        <Button 
          onClick={handleSaveConfigurations} 
          disabled={updateMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Konfigurationen speichern
        </Button>
      </div>
      
      <Tabs defaultValue="interest" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="interest" onClick={() => setActiveTab("interest")}>Zinsen & Termine</TabsTrigger>
          <TabsTrigger value="index" onClick={() => setActiveTab("index")}>Index-Parameter</TabsTrigger>
          <TabsTrigger value="calculation" onClick={() => setActiveTab("calculation")}>Berechnungs-Parameter</TabsTrigger>
          <TabsTrigger value="logs" onClick={() => setActiveTab("logs")}>Änderungsprotokoll</TabsTrigger>
        </TabsList>
        
        <TabsContent value="interest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zinssätze & Zahlungstermine</CardTitle>
              <CardDescription>
                Konfigurieren Sie hier die Zinssätze und Zahlungstermine für jedes Finanzprodukt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead>Fix-Zins (%)</TableHead>
                    <TableHead>Gewinnbeteiligung (%)</TableHead>
                    <TableHead>Zahlungsfrequenz</TableHead>
                    <TableHead>Zahlungstermine</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.map((config) => (
                    <TableRow key={config.product_id}>
                      <TableCell className="font-medium">{config.product_name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={config.fixed_interest_rate}
                          onChange={(e) => handleInputChange(
                            config.product_id, 
                            'fixed_interest_rate', 
                            parseFloat(e.target.value)
                          )}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={config.profit_share_rate}
                          onChange={(e) => handleInputChange(
                            config.product_id, 
                            'profit_share_rate', 
                            parseFloat(e.target.value)
                          )}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={config.payment_frequency}
                          onValueChange={(value) => handleFrequencyChange(
                            config.product_id, 
                            value as 'quarterly' | 'annual'
                          )}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Zahlungsfrequenz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annual">Jährlich</SelectItem>
                            <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {config.payment_dates.map((date, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <Input
                                type="text"
                                value={date}
                                onChange={(e) => handlePaymentDateChange(
                                  config.product_id, 
                                  idx, 
                                  e.target.value
                                )}
                                className="w-24"
                                placeholder="MM-DD"
                              />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Format für Zahlungstermine: MM-DD (z.B. 06-30 für 30. Juni)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="index" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Index-Parameter</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Index-Werte und Beteiligungssätze für die Gewinnberechnung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead>Index-Durchschnitt (%)</TableHead>
                    <TableHead>Index-Beteiligungssatz (%)</TableHead>
                    <TableHead>Nächster Zahlungstermin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.map((config) => (
                    <TableRow key={config.product_id}>
                      <TableCell className="font-medium">{config.product_name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={config.index_current_average}
                          onChange={(e) => handleInputChange(
                            config.product_id, 
                            'index_current_average', 
                            parseFloat(e.target.value)
                          )}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={config.index_participation_rate}
                          onChange={(e) => handleInputChange(
                            config.product_id, 
                            'index_participation_rate', 
                            parseFloat(e.target.value)
                          )}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={config.next_payment_date}
                          onChange={(e) => handleInputChange(
                            config.product_id, 
                            'next_payment_date', 
                            e.target.value
                          )}
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
        
        <TabsContent value="calculation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Berechnungs-Parameter</CardTitle>
              <CardDescription>
                Parameter für die Berechnung von Erträgen und Gewinnbeteiligungen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead>Fix-Zins (%)</TableHead>
                    <TableHead>Index-Anteil (%)</TableHead>
                    <TableHead>Erwartete Gesamtrendite (%)</TableHead>
                    <TableHead>Visualisierung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.map((config) => {
                    const expectedReturn = calculateExpectedReturn(config);
                    const indexComponent = (config.index_current_average * config.index_participation_rate) / 100;
                    
                    return (
                      <TableRow key={config.product_id}>
                        <TableCell className="font-medium">{config.product_name}</TableCell>
                        <TableCell>{config.fixed_interest_rate.toFixed(2)}%</TableCell>
                        <TableCell>{indexComponent.toFixed(2)}%</TableCell>
                        <TableCell className="font-medium">{expectedReturn.toFixed(2)}%</TableCell>
                        <TableCell>
                          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#B1904B]" 
                              style={{ width: `${expectedReturn * 2}%`, maxWidth: '100%' }} 
                            ></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-[#B1904B]" />
                  Berechnungsmethodik
                </h3>
                <p className="text-sm mt-2">
                  Die Gesamtrendite setzt sich zusammen aus:
                </p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>
                    <strong>Fix-Zins:</strong> Garantierter jährlicher Zinssatz
                  </li>
                  <li>
                    <strong>Index-Anteil:</strong> (Index-Durchschnitt × Index-Beteiligungssatz ÷ 100)
                  </li>
                </ul>
                <p className="text-sm mt-2">
                  Die Berechnung erfolgt quartalsweise oder jährlich, je nach konfigurierter Zahlungsfrequenz.
                  Die Auszahlungstermine basieren auf den konfigurierten Zahlungsterminen.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <AdminActivityLog category="product_config" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProductConfig;
