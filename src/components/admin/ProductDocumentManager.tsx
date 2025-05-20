
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import DocumentUpload from "./DocumentUpload";

interface ProductDocumentManagerProps {
  productId: string;
  productTitle: string;
}

const ProductDocumentManager = ({ productId, productTitle }: ProductDocumentManagerProps) => {
  const queryClient = useQueryClient();
  const [verifyingStorage, setVerifyingStorage] = useState(false);
  
  // Fetch product documents
  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId
  });

  // Update product document URLs
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ type, url }: { type: 'terms' | 'info', url: string }) => {
      const updateData = type === 'terms' 
        ? { terms_document_url: url } 
        : { info_document_url: url };
        
      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId);
        
      if (error) throw error;
      
      return { type, url };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      const docType = data.type === 'terms' ? 'Anleihebedingungen' : 'Basisinformationsblatt';
      toast.success(`${docType} erfolgreich aktualisiert`);
    },
    onError: (error) => {
      toast.error("Fehler beim Speichern des Dokuments", {
        description: error instanceof Error ? error.message : "Unbekannter Fehler"
      });
    }
  });

  // Delete document
  const deleteDocumentMutation = useMutation({
    mutationFn: async (type: 'terms' | 'info') => {
      const updateData = type === 'terms' 
        ? { terms_document_url: null } 
        : { info_document_url: null };
        
      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId);
        
      if (error) throw error;
      
      return type;
    },
    onSuccess: (type) => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      const docType = type === 'terms' ? 'Anleihebedingungen' : 'Basisinformationsblatt';
      toast.success(`${docType} erfolgreich entfernt`);
    },
    onError: (error) => {
      toast.error("Fehler beim Entfernen des Dokuments", {
        description: error instanceof Error ? error.message : "Unbekannter Fehler"
      });
    }
  });

  const handleTermsDocumentUploaded = (url: string) => {
    updateDocumentMutation.mutate({ type: 'terms', url });
  };

  const handleInfoDocumentUploaded = (url: string) => {
    updateDocumentMutation.mutate({ type: 'info', url });
  };
  
  const verifyStorage = async () => {
    setVerifyingStorage(true);
    try {
      // Check if product_documents bucket exists
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketsError) {
        console.error("Error checking storage buckets:", bucketsError);
        toast.error("Fehler beim Überprüfen der Storage-Buckets");
        return;
      }
      
      const productDocumentsBucketExists = buckets.some(bucket => bucket.name === 'product_documents');
      
      if (!productDocumentsBucketExists) {
        toast.error("Storage-Bucket fehlt", {
          description: "Der 'product_documents' Bucket existiert nicht in Supabase Storage. Bitte erstellen Sie ihn."
        });
      } else {
        toast.success("Storage-Konfiguration gültig", {
          description: "Alle benötigten Storage-Buckets sind vorhanden."
        });
      }
    } catch (error) {
      console.error("Error verifying storage:", error);
      toast.error("Fehler beim Überprüfen der Storage-Konfiguration");
    } finally {
      setVerifyingStorage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Produktdokumente für "{productTitle}"</CardTitle>
        <CardDescription>
          Verwalten Sie die Anleihebedingungen und Basisinformationsblätter für dieses Produkt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={verifyStorage} 
            disabled={verifyingStorage}
          >
            {verifyingStorage ? "Überprüfe..." : "Storage überprüfen"}
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Anleihebedingungen Document */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Anleihebedingungen</h3>
            
            <DocumentUpload
              onDocumentUploaded={handleTermsDocumentUploaded}
              currentDocumentUrl={product?.terms_document_url}
              documentType="terms"
              label="Anleihebedingungen"
              productId={productId}
            />
            
            {product?.terms_document_url && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <a 
                    href={product.terms_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Dokument anzeigen
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteDocumentMutation.mutate('terms')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Basisinformationsblatt Document */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Basisinformationsblatt</h3>
            
            <DocumentUpload
              onDocumentUploaded={handleInfoDocumentUploaded}
              currentDocumentUrl={product?.info_document_url}
              documentType="info"
              label="Basisinformationsblatt"
              productId={productId}
            />
            
            {product?.info_document_url && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <a 
                    href={product.info_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Dokument anzeigen
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteDocumentMutation.mutate('info')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Alert className="mt-6">
          <AlertTitle>Hinweis zur Storage-Konfiguration</AlertTitle>
          <AlertDescription>
            Stellen Sie sicher, dass der "product_documents" Bucket in Supabase existiert und über die entsprechenden RLS-Policies verfügt. Wenn Sie Probleme beim Hochladen haben, überprüfen Sie bitte Ihre Administratorrechte.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ProductDocumentManager;
