import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Table as TableIcon, Calendar, FileText, CheckCircle, Clock, DollarSign, Info, Download, XCircle } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileFooter from "@/components/MobileFooter";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useInvestments, Investment } from "@/hooks/useInvestments";
import { TranslationKey } from "@/utils/translations/types";
import { useClientPdfGeneration } from "@/hooks/useClientPdfGeneration";

interface Application {
  id: string;
  date: string;
  documentName: string;
  status: string;
  productName: string;
  amount: number;
  document_url?: string | null;
  product_id?: string;
  payment_received?: boolean;
}

// Define tab keys that are used in the component but might not be in the TranslationKey type
type TabKey = "pending" | "confirmed" | "active" | "rejected" | "date" | "documentName" | "productName" | "status" | "shares" | "amount";

const MyApplications = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { generatePdf, isGenerating } = useClientPdfGeneration();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  
  // Use TabKey type instead of string for currentTab
  const [currentTab, setCurrentTab] = useState<TabKey>("amount");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch investments from Supabase as they contain similar data
        const { data, error } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform investments data to match our Application interface
          const formattedData = data.map((inv: any) => ({
            id: inv.id,
            date: inv.created_at,
            documentName: 'Zeichnungsschein.pdf', // Default document name
            status: inv.status || "pending",
            productName: inv.product_title || '',
            amount: inv.amount,
            document_url: inv.document_url,
            payment_received: inv.payment_received
          }));
          
          setApplications(formattedData);
        } else {
          // If no data found, use sample data for demonstration
          setApplications([
            {
              id: '1',
              date: '2025-05-05',
              documentName: 'Zeichnungsschein_05052025.pdf',
              status: 'pending',
              productName: 'FI Inflationsschutz PLUS 5%',
              amount: 5000
            },
            {
              id: '2',
              date: '2025-04-20',
              documentName: 'Unterschriebener_Zeichnungsschein.pdf',
              status: 'confirmed',
              productName: 'FI Wealth Protection',
              amount: 3000
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({ 
          variant: 'destructive', 
          title: 'Fehler', 
          description: t('errorFetchingApplications') 
        });
        
        // For demo purposes, add some sample data if the API fails
        setApplications([
          {
            id: '1',
            date: '2025-05-05',
            documentName: 'Zeichnungsschein_05052025.pdf',
            status: 'pending',
            productName: 'FI Inflationsschutz PLUS 5%',
            amount: 5000
          },
          {
            id: '2',
            date: '2025-04-20',
            documentName: 'Unterschriebener_Zeichnungsschein.pdf',
            status: 'confirmed',
            productName: 'FI Wealth Protection',
            amount: 3000
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();

    // Set up real-time subscription for investment status changes
    const channel = supabase
      .channel('investment-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'investments',
          filter: user ? `user_id=eq.${user.id}` : undefined
        },
        (payload) => {
          console.log('Investment status changed:', payload);
          // Update the specific application with the new status
          setApplications(currentApps => 
            currentApps.map(app => 
              app.id === payload.new.id 
                ? {
                    ...app,
                    status: payload.new.status,
                    payment_received: payload.new.payment_received
                  }
                : app
            )
          );
          
          // Notify user about the status change
          if (payload.new.status === 'confirmed') {
            toast({ 
              variant: 'default', 
              title: 'Erfolg', 
              description: 'Ihr Zeichnungsschein wurde bestätigt!' 
            });
          } else if (payload.new.status === 'active') {
            toast({ 
              variant: 'default', 
              title: 'Erfolg', 
              description: 'Ihre Zahlung wurde erfolgreich verarbeitet!' 
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, t]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE').format(date);
  };

  // Helper function to determine badge variant based on status
  const getBadgeVariant = (status: string, paymentReceived?: boolean) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'active':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Helper function to determine badge class based on status
  const getBadgeClass = (status: string, paymentReceived?: boolean) => {
    switch (status) {
      case 'confirmed':
        return paymentReceived ? 'bg-green-600' : 'bg-amber-500';
      case 'active':
        return 'bg-green-600';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-amber-500';
    }
  };

  // Helper function to get status display text
  const getStatusDisplayText = (status: string, paymentReceived?: boolean) => {
    switch (status) {
      case 'confirmed':
        return paymentReceived ? t('active') : t('confirmed');
      case 'active':
        return t('active');
      case 'rejected':
        return t('rejected');
      default:
        return t('pending');
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string, paymentReceived?: boolean) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'active':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <Clock className="h-3 w-3 mr-1" />;
    }
  };

  const handleGeneratePdf = async (application: Application) => {
    if (!user) {
      toast({ 
        variant: 'destructive', 
        title: 'Fehler', 
        description: t('loginRequired') 
      });
      return;
    }
    
    // Check if document URL already exists and is a blob URL
    if (application.document_url && application.document_url.startsWith('blob:')) {
      // If document already exists as blob, open it
      window.open(application.document_url, '_blank');
      return;
    }
    
    // Only generate for Wealth Protection product
    if (!application.productName.includes('Wealth Protection')) {
      toast({ 
        variant: 'default', 
        title: 'Info', 
        description: "PDF-Generierung ist nur für das Wealth Protection Produkt verfügbar" 
      });
      return;
    }

    try {
      setGeneratingPdfId(application.id);
      
      // Get the investment data
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', application.id)
        .eq('user_id', user.id)
        .single();
      
      if (investmentError || !investment) {
        console.error('Error fetching investment:', investmentError);
        toast({ 
          variant: 'destructive', 
          title: 'Fehler', 
          description: "Investment-Daten nicht gefunden" 
        });
        return;
      }
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        toast({ 
          variant: 'destructive', 
          title: 'Fehler', 
          description: "Profildaten nicht gefunden" 
        });
        return;
      }
      
      const pdfUrl = await generatePdf({
        investmentId: application.id,
        userId: user.id,
        investment,
        profile
      });
      
      if (pdfUrl) {
        // Update application in state
        setApplications(prevApps => 
          prevApps.map(app => 
            app.id === application.id 
              ? { ...app, document_url: pdfUrl } 
              : app
          )
        );
        
        toast({ 
          variant: 'default', 
          title: 'Erfolg', 
          description: "Zeichnungsschein wurde generiert" 
        });
        
        // Open the generated PDF
        window.open(pdfUrl, '_blank');
      }
    } finally {
      setGeneratingPdfId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {!isMobile && <Header />}
      
      <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-20'} px-4 pb-24`}>
        {isMobile ? (
          <header className="fixed w-full top-0 z-50 bg-fi-blue px-4 py-3 flex items-center justify-between left-0">
            <button onClick={handleBack} className="text-fi-gold">
              <ArrowLeft size={24} />
            </button>
            <span className="text-white font-medium text-lg">{t('myApplications')}</span>
            <div className="w-8"></div>
          </header>
        ) : (
          <section className="flex items-center mb-6">
            <button onClick={handleBack} className="text-fi-gold mr-3">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-medium">{t('myApplications')}</h1>
          </section>
        )}
        
        <section className="bg-white rounded-lg shadow mb-8 mt-4">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>{t('loading')}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center">
              <TableIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">{t('noApplicationsFound')}</p>
              <Button 
                onClick={() => navigate('/zeichnungsschein')}
                className="mt-4 bg-[#B1904B] hover:bg-[#a07f42]"
              >
                {t('createNewApplication')}
              </Button>
            </div>
          ) : isMobile ? (
            <div className="divide-y">
              {applications.map((application) => (
                <Card 
                  key={application.id} 
                  className="border-none shadow-none"
                >
                  <div className="p-4 flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm font-medium">
                          {formatDate(application.date)}
                        </span>
                      </div>
                      <Badge 
                        variant={getBadgeVariant(application.status, application.payment_received)}
                        className={getBadgeClass(application.status, application.payment_received)}
                      >
                        <div className="flex items-center">
                          {getStatusIcon(application.status, application.payment_received)}
                          <span>{getStatusDisplayText(application.status, application.payment_received)}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-start">
                      <Info size={16} className="text-gray-500 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-700 flex-1">
                        {application.productName || "—"}
                      </span>
                    </div>
                    
                    <div className="flex items-start">
                      <DollarSign size={16} className="text-gray-500 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-700 flex-1">
                        €{application.amount?.toLocaleString('de-DE') || '0'}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <FileText size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700 truncate max-w-[150px]">
                          {application.documentName}
                        </span>
                      </div>
                      
                      {application.productName.includes('Wealth Protection') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGeneratePdf(application)}
                          disabled={isGenerating && generatingPdfId === application.id}
                          className="text-fi-blue hover:text-fi-blue/80"
                        >
                          <Download size={16} className="mr-1" />
                          {isGenerating && generatingPdfId === application.id ? 'Generiere...' : 'PDF'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('product')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('documentName')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {formatDate(application.date)}
                      </TableCell>
                      <TableCell>
                        {application.productName || "—"}
                      </TableCell>
                      <TableCell>
                        €{application.amount?.toLocaleString('de-DE') || '0'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {application.documentName}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getBadgeVariant(application.status, application.payment_received)}
                          className={getBadgeClass(application.status, application.payment_received)}
                        >
                          <div className="flex items-center">
                            {getStatusIcon(application.status, application.payment_received)}
                            <span>{getStatusDisplayText(application.status, application.payment_received)}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {application.productName.includes('Wealth Protection') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGeneratePdf(application)}
                            disabled={isGenerating && generatingPdfId === application.id}
                            className="text-fi-blue hover:text-fi-blue/80"
                          >
                            <Download size={16} className="mr-1" />
                            {isGenerating && generatingPdfId === application.id ? 'Generiere...' : 'Zeichnungsschein'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>
      
      {isMobile ? <MobileFooter /> : <Footer />}
    </div>
  );
};

export default MyApplications;
