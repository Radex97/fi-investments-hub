
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
}

const ImageUpload = ({ onImageUploaded, currentImageUrl }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Datei zu groß", {
        description: "Die maximale Dateigröße beträgt 5MB"
      });
      return;
    }

    try {
      setIsUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      toast.success("Bild erfolgreich hochgeladen");
    } catch (error: any) {
      toast.error("Fehler beim Hochladen", {
        description: error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      {currentImageUrl && (
        <img 
          src={currentImageUrl} 
          alt="Aktuelles Produktbild" 
          className="w-32 h-32 object-cover rounded-lg"
        />
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="imageUpload"
        />
        <label htmlFor="imageUpload">
          <Button 
            type="button" 
            variant="outline" 
            disabled={isUploading}
            asChild
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Lädt hoch..." : "Bild hochladen"}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;
