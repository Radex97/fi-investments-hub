
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface DocumentUploadProps {
  onDocumentUploaded: (url: string) => void;
  currentDocumentUrl?: string | null;
  documentType: 'terms' | 'info';
  label: string;
  productId?: string; // Optional product ID to associate document with specific product
}

const DocumentUpload = ({ 
  onDocumentUploaded, 
  currentDocumentUrl, 
  documentType, 
  label,
  productId 
}: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { isAdmin } = useAdminCheck();
  
  // Bucket name for product documents
  const BUCKET_NAME = 'product_documents';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("Datei zu groß", {
        description: "Die maximale Dateigröße beträgt 10MB"
      });
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error("Falsches Dateiformat", {
        description: "Bitte laden Sie nur PDF-Dateien hoch"
      });
      return;
    }

    try {
      setIsUploading(true);

      // First, verify the bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error checking buckets:", bucketsError);
        toast.error("Fehler beim Überprüfen der Speicher-Buckets", {
          description: "Bitte stellen Sie sicher, dass Sie Administratorrechte haben."
        });
        return;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
      
      if (!bucketExists) {
        console.error(`Bucket "${BUCKET_NAME}" existiert nicht`);
        toast.error(`Speicher-Bucket "${BUCKET_NAME}" fehlt`, {
          description: "Ein Administrator muss den Bucket in der Supabase-Konsole erstellen"
        });
        return;
      }

      // Create a unique filename with product identifier if available
      const fileExt = file.name.split('.').pop();
      const productPrefix = productId ? `${productId}_` : '';
      const fileName = `${productPrefix}${documentType}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        
        // Handle common errors with user-friendly messages
        if (uploadError.message.includes("Permission denied")) {
          toast.error("Zugriff verweigert", {
            description: "Sie haben keine Berechtigung, Dateien hochzuladen. Bitte kontaktieren Sie den Administrator."
          });
        } else if (uploadError.message.includes("Bucket not found")) {
          toast.error("Bucket nicht gefunden", {
            description: `Der Bucket "${BUCKET_NAME}" existiert nicht oder ist nicht richtig konfiguriert.`
          });
        } else {
          toast.error("Fehler beim Hochladen", {
            description: uploadError.message
          });
        }
        return;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log("Document uploaded successfully:", publicUrl);
      
      // Call the callback with the URL
      onDocumentUploaded(publicUrl);
      
      toast.success(`${label} erfolgreich hochgeladen`);
    } catch (error: any) {
      console.error("Error in document upload:", error);
      toast.error("Fehler beim Hochladen", {
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const documentId = `document-upload-${documentType}`;

  return (
    <div className="flex flex-col items-start gap-4">
      {currentDocumentUrl && (
        <a 
          href={currentDocumentUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-blue-600 hover:underline overflow-hidden text-ellipsis max-w-full"
        >
          Aktuelles Dokument anzeigen
        </a>
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id={documentId}
        />
        <label htmlFor={documentId}>
          <Button 
            type="button" 
            variant="outline" 
            disabled={isUploading || !isAdmin}
            asChild
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Lädt hoch..." : `${label} hochladen`}
            </span>
          </Button>
        </label>
      </div>
      {!isAdmin && (
        <p className="text-xs text-red-500 mt-1">
          Nur Administratoren können Dokumente hochladen
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;
