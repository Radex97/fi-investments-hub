
import { useState } from "react";
import { FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductDocumentProps {
  termsDocumentUrl?: string | null;
  infoDocumentUrl?: string | null;
  productTitle: string;
  className?: string;
}

const ProductDocuments = ({ 
  termsDocumentUrl, 
  infoDocumentUrl, 
  productTitle,
  className = ""
}: ProductDocumentProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleOpenDocument = (url: string | null | undefined, documentType: string) => {
    if (!url) {
      toast.error(`Das ${documentType} ist derzeit nicht verfügbar.`);
      return;
    }
    
    setIsLoading(documentType);
    try {
      // Open the document in a new tab
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success(`${documentType} wird geöffnet`);
    } catch (error) {
      console.error("Error opening document:", error);
      toast.error(`Fehler beim Öffnen des Dokuments`);
    } finally {
      setIsLoading(null);
    }
  };

  // If neither document is available, don't render the component
  if (!termsDocumentUrl && !infoDocumentUrl) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {termsDocumentUrl && (
        <Button
          onClick={() => handleOpenDocument(termsDocumentUrl, "Anleihebedingungen")}
          className="w-full bg-[#003595] hover:bg-[#002b7a] text-white py-3 rounded-lg"
          disabled={isLoading === "Anleihebedingungen"}
        >
          <FileText className="w-4 h-4 mr-2" />
          {isLoading === "Anleihebedingungen" ? "Wird geöffnet..." : "Anleihebedingungen"}
        </Button>
      )}
      
      {infoDocumentUrl && (
        <Button
          onClick={() => handleOpenDocument(infoDocumentUrl, "Basisinformationsblatt")}
          className="w-full bg-[#003595] hover:bg-[#002b7a] text-white py-3 rounded-lg"
          disabled={isLoading === "Basisinformationsblatt"}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          {isLoading === "Basisinformationsblatt" ? "Wird geöffnet..." : "Basisinformationsblatt"}
        </Button>
      )}
    </div>
  );
};

export default ProductDocuments;
