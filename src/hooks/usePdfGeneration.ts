
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type GeneratePdfParams = {
  investmentId: string;
  userId: string;
  productId: string; // This should be the product UUID from the database
  signatureData?: string;
};

export function usePdfGeneration() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Check if needed storage buckets exist and create if missing
  const verifyStorageSetup = async () => {
    try {
      // Check if public bucket exists
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketsError) {
        console.error("Error checking storage buckets:", bucketsError);
        throw new Error("Fehler beim Überprüfen der Storage-Buckets. Administratorzugriff erforderlich.");
      }
      
      const publicBucketExists = buckets.some(bucket => bucket.name === 'public');
      if (!publicBucketExists) {
        console.error("Public storage bucket does not exist!");
        throw new Error("Der 'public' Storage-Bucket existiert nicht. Bitte erstellen Sie ihn in der Supabase-Konsole.");
      }
      
      // Check if product_documents bucket exists
      const productDocumentsBucketExists = buckets.some(bucket => bucket.name === 'product_documents');
      if (!productDocumentsBucketExists) {
        console.error("product_documents storage bucket does not exist!");
        // For information only, not blocking
        console.log("Der 'product_documents' Storage-Bucket existiert nicht, aber wird für die PDF-Generierung nicht benötigt.");
      }
      
      return true;
    } catch (error) {
      console.error("Storage verification error:", error);
      throw error;
    }
  };
  
  // Check if template files exist in the public bucket
  const verifyTemplateFiles = async (productType: string) => {
    try {
      const { data: files, error: filesError } = await supabase
        .storage
        .from('public')
        .list('assets/docs');
      
      if (filesError) {
        console.error("Error checking for template files:", filesError);
        throw new Error("Fehler beim Überprüfen der PDF-Vorlagen");
      }
      
      console.log("Files in assets/docs:", files.map(f => f.name));
      
      // Check for appropriate template based on product type
      let templateFound = false;
      
      if (productType === "wealth-protection") {
        templateFound = files.some(file => 
          file.name === 'wealth-protection-zeichnungsschein.pdf' || 
          file.name.includes('Wealth Protection')
        );
        
        if (!templateFound) {
          throw new Error(`PDF-Vorlage für 'Wealth Protection' nicht gefunden. Bitte laden Sie die Datei hoch.`);
        }
      } else if (productType === "inflationsschutz") {
        templateFound = files.some(file => 
          file.name.includes('Inflationsschutz')
        );
        
        if (!templateFound) {
          throw new Error(`PDF-Vorlage für 'Inflationsschutz' nicht gefunden. Bitte laden Sie die Datei hoch.`);
        }
      } else {
        throw new Error(`Unbekannter Produkttyp: ${productType}`);
      }
      
      return true;
    } catch (error) {
      console.error("Template verification error:", error);
      throw error;
    }
  };
  
  const generatePdf = async ({ investmentId, userId, productId, signatureData }: GeneratePdfParams) => {
    if (!investmentId || !userId || !productId) {
      console.error("Missing required parameters:", { investmentId, userId, productId });
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Fehlende Parameter für die PDF-Generierung"
      });
      return null;
    }
    
    try {
      setIsGenerating(true);
      console.log("Fetching product details for ID:", productId);
      
      // First, check storage setup
      try {
        await verifyStorageSetup();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Storage-Fehler",
          description: error instanceof Error ? error.message : "Unbekannter Storage-Fehler"
        });
        return null;
      }
      
      // Get the product details to determine which function to call
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("title, slug")
        .eq("id", productId)
        .single();
      
      if (productError || !productData) {
        console.error("Error fetching product details:", productError);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Produkt konnte nicht gefunden werden"
        });
        return null;
      }

      console.log("Product data:", productData);
      
      // Determine product type based on the product title or slug
      const productTitle = productData.title || "";
      const productSlug = productData.slug || "";
      
      let productType = "unknown";
      let functionName = "generate-inflationsschutz-pdf"; // Default
      
      if (productTitle.toLowerCase().includes("wealth protection") || 
          productSlug === "wealth-protection") {
        productType = "wealth-protection";
        functionName = "generate-wealth-protection-pdf";
      } else if (productTitle.toLowerCase().includes("inflationsschutz") || 
                productSlug === "inflationsschutz-plus") {
        productType = "inflationsschutz";
        functionName = "generate-inflationsschutz-pdf";
      } else {
        console.warn("Unknown product type, defaulting to Inflationsschutz template");
        productType = "inflationsschutz";
      }
      
      console.log("Selected product type:", productType, "edge function:", functionName);
      
      // Verify template files exist for the selected product type
      try {
        await verifyTemplateFiles(productType);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: error instanceof Error ? error.message : "PDF-Vorlage konnte nicht gefunden werden"
        });
        return null;
      }
      
      // Call the edge function to generate the PDF
      console.log(`Calling edge function ${functionName} with params:`, { investmentId, userId, productId });
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          investmentId, 
          userId, 
          productId, 
          signatureData 
        }
      });
      
      if (error) {
        console.error(`Error generating PDF with ${functionName}:`, error);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: `Fehler beim Generieren des PDFs: ${error.message}`
        });
        return null;
      }
      
      if (!data || !data.success || !data.url) {
        console.error("PDF generation response invalid:", data);
        
        // Show more specific error message if available
        const errorMessage = data?.error || "Keine PDF-URL zurückgegeben";
        const errorDetails = data?.details ? `: ${data.details}` : "";
        
        toast({
          variant: "destructive",
          title: "PDF-Generierung fehlgeschlagen",
          description: `${errorMessage}${errorDetails}`
        });
        return null;
      }
      
      console.log("PDF successfully generated:", data.url);
      
      // Return the URL of the generated PDF
      return data.url;
    } catch (error) {
      console.error("Exception generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Unerwarteter Fehler beim Generieren des PDFs"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    generatePdf,
    isGenerating,
    verifyStorageSetup
  };
}
