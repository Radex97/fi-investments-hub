
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { usePdfGeneration } from '@/hooks/usePdfGeneration';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SignaturePad from '@/components/SignaturePad';

const Signature = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { generatePdf, isGenerating } = usePdfGeneration();
  const isMobile = useIsMobile();
  
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [investment, setInvestment] = useState<any | null>(null);
  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfGenerationError, setPdfGenerationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestInvestment = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Step 1: Get the latest investment for the current user
        const { data: investmentData, error: investmentError } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (investmentError) {
          console.error('Error fetching investment:', investmentError);
          toast({
            variant: 'destructive',
            title: 'Fehler',
            description: 'Fehler beim Abrufen Ihrer Investition'
          });
          navigate('/dashboard');
          return;
        }

        setInvestment(investmentData);
        console.log("Investment data loaded:", investmentData);
        
        // Step 2: Fetch the product details separately using the product_id
        if (investmentData && investmentData.product_id) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', investmentData.product_id)
            .single();
            
          if (productError) {
            console.error('Error fetching product:', productError);
            toast({
              variant: 'destructive', 
              title: 'Fehler',
              description: 'Fehler beim Abrufen der Produktdetails'
            });
          } else {
            console.log("Product data loaded:", productData);
            setProduct(productData);
          }
        }
      } catch (error) {
        console.error('Error in fetchLatestInvestment:', error);
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: 'Unerwarteter Fehler aufgetreten'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestInvestment();
  }, [user, navigate, toast]);

  const handleSaveSignature = (data: string) => {
    setSignatureData(data);
    setPdfGenerationError(null); // Reset error when signature changes
    toast({
      variant: 'default',
      title: 'Erfolg',
      description: 'Unterschrift erfasst'
    });
  };

  const checkStorageBucket = async () => {
    // Check if public bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error checking storage buckets:", bucketsError);
      return false;
    }
    
    const publicBucketExists = buckets.some(bucket => bucket.name === 'public');
    if (!publicBucketExists) {
      setPdfGenerationError(
        "Der 'public' Storage-Bucket existiert nicht. Ein Administrator muss diesen in der Supabase-Konsole erstellen."
      );
      return false;
    }
    
    // Check if template files exist
    try {
      const { data: files, error: filesError } = await supabase
        .storage
        .from('public')
        .list('assets/docs');
      
      if (filesError) {
        console.error("Error checking for template files:", filesError);
        setPdfGenerationError("Fehler beim Überprüfen der PDF-Vorlagen");
        return false;
      }
      
      console.log("Available files in assets/docs:", files.map(f => f.name));
      
      // Check for Wealth Protection template
      const templateExists = files.some(file => 
        file.name === 'wealth-protection-zeichnungsschein.pdf' || 
        file.name.includes('Wealth Protection')
      );
      
      if (!templateExists) {
        setPdfGenerationError(
          "Die PDF-Vorlage für Wealth Protection wurde nicht gefunden. Ein Administrator muss diese in den 'public/assets/docs/' Bucket hochladen."
        );
        return false;
      }
      
      return true;
    } catch (e) {
      console.error("Error in checkStorageBucket:", e);
      setPdfGenerationError("Fehler beim Zugriff auf den Storage-Bucket");
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!signatureData || !investment || !user) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte geben Sie zuerst Ihre Unterschrift ab'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify storage is properly configured
      const storageReady = await checkStorageBucket();
      if (!storageReady) {
        // Error message already set by checkStorageBucket
        return;
      }

      // First, update the investment with signature data
      const { error: updateError } = await supabase
        .from('investments')
        .update({
          signature_provided: true,
          signature_date: new Date().toISOString()
        })
        .eq('id', investment.id);

      if (updateError) {
        throw new Error('Fehler beim Speichern der Unterschrift');
      }

      // Make sure we have the product ID
      if (!investment.product_id) {
        console.error("Product ID is missing from investment");
        throw new Error('Produktinformationen fehlen');
      }

      console.log("Generating PDF for investment:", 
        investment.id, 
        "product:", investment.product_id, 
        "product data:", product
      );
      
      // Generate the PDF with signature and product ID
      const pdfUrl = await generatePdf({ 
        investmentId: investment.id, 
        userId: user.id,
        productId: investment.product_id,
        signatureData: signatureData
      });

      if (!pdfUrl) {
        throw new Error('Fehler beim Generieren des PDFs');
      }

      // Success, navigate to legitimation
      toast({
        variant: 'default',
        title: 'Erfolg',
        description: 'Unterschrift gespeichert und Dokument erstellt'
      });
      
      navigate('/legitimation');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setPdfGenerationError(error instanceof Error ? error.message : 'Unerwarteter Fehler aufgetreten');
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Unerwarteter Fehler aufgetreten'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
        <p>Daten werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 px-4 pb-24">
        <section className="mt-6">
          <button 
            onClick={() => navigate('/zeichnungsschein')}
            className="flex items-center text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft size={16} className="mr-1" />
            zurück
          </button>
          
          <h1 className="text-2xl mt-4">Unterschrift erfassen</h1>
          <p className="mt-2 text-neutral-600">Bitte geben Sie Ihre Unterschrift für den Zeichnungsschein ab.</p>
        </section>

        <section className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg mb-6">Unterschrift</h2>
          <div className="flex flex-col items-center w-full">
            <SignaturePad 
              onSave={handleSaveSignature} 
              width={isMobile ? window.innerWidth - 80 : 300} 
              height={isMobile ? 200 : 150} 
            />
            
            {signatureData && (
              <div className="mt-8 p-4 border border-gray-200 rounded-md w-full">
                <h3 className="text-sm font-medium mb-2">Ihre Unterschrift:</h3>
                <img 
                  src={signatureData} 
                  alt="Ihre Unterschrift" 
                  className="max-w-full h-auto"
                />
              </div>
            )}
          </div>
        </section>

        {pdfGenerationError && (
          <section className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-700 font-medium">PDF-Generierung nicht möglich</h3>
            <p className="mt-2 text-red-600">{pdfGenerationError}</p>
            <p className="mt-2 text-sm text-red-600">
              Bitte wenden Sie sich an den Administrator, um sicherzustellen, dass:
            </p>
            <ul className="list-disc pl-5 mt-1 text-sm text-red-600">
              <li>Der "public" Storage-Bucket in Supabase existiert</li>
              <li>Die PDF-Vorlage unter "public/assets/docs/wealth-protection-zeichnungsschein.pdf" hochgeladen wurde</li>
            </ul>
          </section>
        )}

        <section className="mt-8 space-y-4">
          <Button 
            onClick={handleSubmit}
            className="w-full py-6 bg-[#B1904B] hover:bg-[#a07f42] text-white rounded-lg"
            disabled={!signatureData || isSubmitting || isGenerating}
          >
            {isSubmitting || isGenerating 
              ? 'Wird verarbeitet...' 
              : 'Unterschrift bestätigen und fortfahren'}
          </Button>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Signature;
