import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Image, QrCode, Apple, PlaySquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { isNativePlatform } from "@/utils/capacitorIntegration";

// Define types for the photo files and validation
type PhotoType = 'front' | 'back' | 'selfie';

interface PhotoValidation {
  isValid: boolean;
  message?: string;
}

const Legitimation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [frontPhotoFile, setFrontPhotoFile] = useState<File | null>(null);
  const [backPhotoFile, setBackPhotoFile] = useState<File | null>(null);
  const [selfiePhotoFile, setSelfiePhotoFile] = useState<File | null>(null);
  
  // Add new states for error handling and UI improvements
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionType, setPermissionType] = useState<'camera' | 'gallery'>('camera');
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  const [currentPhotoPreview, setCurrentPhotoPreview] = useState<string | null>(null);
  const [currentPhotoType, setCurrentPhotoType] = useState<PhotoType>('front');
  const [uploadProgress, setUploadProgress] = useState<{[key in PhotoType]: number}>({
    front: 0,
    back: 0,
    selfie: 0
  });

  // Refs for the file inputs
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const selfieFileInputRef = useRef<HTMLInputElement>(null);
  const frontCameraInputRef = useRef<HTMLInputElement>(null);
  const backCameraInputRef = useRef<HTMLInputElement>(null);
  const selfieCameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate session ID for QR code
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    
    // Create upload URL - in production this would be a real domain
    const baseUrl = window.location.origin;
    const newUploadUrl = `${baseUrl}/legitimation?session=${newSessionId}`;
    setUploadUrl(newUploadUrl);
    
    // Check if the storage bucket exists and create it if it doesn't
    checkAndCreateStorageBucket();
  }, []);

  // Function to check if the storage bucket exists and create it if it doesn't
  const checkAndCreateStorageBucket = async () => {
    try {
      // Try to get the bucket info
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('legitimation-photos');
      
      if (bucketError && bucketError.message.includes('not found')) {
        console.log('Storage bucket for legitimation photos does not exist. This would be created via migrations in production.');
        // In a real app, we would create the bucket here, but for demo we'll just log
      }
    } catch (error) {
      console.error('Error checking storage bucket:', error);
    }
  };

  const handleBack = () => {
    // If there are uploaded photos, show a confirmation dialog
    if (frontPhotoFile || backPhotoFile || selfiePhotoFile) {
      if (confirm("Möchten Sie den Legitimationsprozess wirklich verlassen? Ihre hochgeladenen Fotos gehen verloren.")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const validateImage = (file: File): PhotoValidation => {
    // Check file size - max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        message: "Die Datei ist zu groß. Maximale Größe: 10MB."
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        message: "Ungültiges Dateiformat. Erlaubte Formate: JPG, PNG, HEIC, HEIF."
      };
    }

    return { isValid: true };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: PhotoType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the image
    const validation = validateImage(file);
    if (!validation.isValid) {
      toast.error("Fehler beim Hochladen", { 
        description: validation.message,
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'front') {
        setFrontPreview(result);
        setFrontPhotoFile(file);
      } else if (type === 'back') {
        setBackPreview(result);
        setBackPhotoFile(file);
      } else if (type === 'selfie') {
        setSelfiePreview(result);
        setSelfiePhotoFile(file);
      }
      
      // Show preview in modal
      setCurrentPhotoPreview(result);
      setCurrentPhotoType(type);
      setShowPhotoPreviewModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Function to handle retaking a photo
  const handleRetakePhoto = (type: PhotoType) => {
    if (type === 'front') {
      setFrontPreview(null);
      setFrontPhotoFile(null);
    } else if (type === 'back') {
      setBackPreview(null);
      setBackPhotoFile(null);
    } else if (type === 'selfie') {
      setSelfiePreview(null);
      setSelfiePhotoFile(null);
    }
    setShowPhotoPreviewModal(false);
  };

  // Function to handle camera errors and permissions
  const handleCameraError = (error: any, type: 'camera' | 'gallery') => {
    console.error(`Error accessing ${type}:`, error);
    setPermissionType(type);
    setShowPermissionDialog(true);
  };

  const uploadPhotosToStorage = async () => {
    if (!user) {
      toast.error("Sie müssen angemeldet sein, um Fotos hochzuladen.");
      return false;
    }
    
    setIsUploading(true);
    try {
      // Create the storage bucket if it doesn't exist
      // In a real implementation, this would be done via migrations
      const bucketName = 'legitimation-photos';
      
      const frontUrl = frontPhotoFile ? await uploadPhoto(frontPhotoFile, 'front', bucketName) : null;
      const backUrl = backPhotoFile ? await uploadPhoto(backPhotoFile, 'back', bucketName) : null;
      const selfieUrl = selfiePhotoFile ? await uploadPhoto(selfiePhotoFile, 'selfie', bucketName) : null;

      if (!frontUrl || !backUrl || !selfieUrl) {
        toast.error("Fehler beim Hochladen", {
          description: "Bitte stellen Sie sicher, dass alle Fotos hochgeladen werden können."
        });
        return false;
      }

      // Record each photo in the database
      const insertPromises = [];
      
      if (frontUrl) {
        insertPromises.push(
          supabase.from('legitimation_photos').insert({
            user_id: user.id,
            photo_url: frontUrl,
            photo_type: 'front'
          })
        );
      }
      
      if (backUrl) {
        insertPromises.push(
          supabase.from('legitimation_photos').insert({
            user_id: user.id,
            photo_url: backUrl,
            photo_type: 'back'
          })
        );
      }
      
      if (selfieUrl) {
        insertPromises.push(
          supabase.from('legitimation_photos').insert({
            user_id: user.id,
            photo_url: selfieUrl,
            photo_type: 'selfie'
          })
        );
      }
      
      // Wait for all insertions to complete
      const results = await Promise.all(insertPromises);
      const hasError = results.some(result => result.error);
      
      if (hasError) {
        console.error("Some photos failed to be recorded in the database");
        const errorResult = results.find(result => result.error);
        toast.error("Fehler beim Speichern", {
          description: errorResult?.error?.message || "Ein Fehler ist aufgetreten beim Speichern der Fotos."
        });
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error uploading legitimation photos:", error);
      toast.error("Fehler beim Hochladen", {
        description: error.message || "Es ist ein Fehler beim Hochladen der Fotos aufgetreten."
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadPhoto = async (file: File, type: string, bucketName: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [type]: Math.min(prev[type as PhotoType] + 10, 90)
        }));
      }, 200);
      
      // Process file and get extension - handle more formats
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/${type}_${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage with error handling
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(filePath, file, { 
          cacheControl: '3600',
          contentType: file.type 
        });
      
      clearInterval(progressInterval);
      
      if (error) {
        setUploadProgress(prev => ({
          ...prev,
          [type]: 0
        }));
        throw error;
      }
      
      // Set progress to 100%
      setUploadProgress(prev => ({
        ...prev,
        [type]: 100
      }));
      
      // Get the public URL
      const { data: publicUrlData } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validate that all required photos are provided
    if (!frontPhotoFile || !backPhotoFile || !selfiePhotoFile) {
      toast.error("Fehlende Dokumente", {
        description: "Bitte laden Sie alle erforderlichen Fotos hoch: Vorder- und Rückseite des Ausweises sowie ein Selfie."
      });
      return;
    }

    const uploaded = await uploadPhotosToStorage();
    if (uploaded) {
      await markDocumentsUploaded();
      setShowConfirmation(true);
    } else {
      toast.error("Fehler bei der Legitimation", {
        description: "Bitte versuchen Sie es später erneut oder kontaktieren Sie unseren Support."
      });
    }
  };

  const markDocumentsUploaded = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ kyc_status: 'documents_uploaded' })
        .eq('id', user.id);
    } catch (error) {
      console.error("Error updating KYC status:", error);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate("/status-overview");
  };

  // Function to handle store button clicks
  const handleStoreButtonClick = (store: 'google' | 'apple') => {
    // Placeholder links - would be replaced with actual app store links
    const storeLinks = {
      google: "https://play.google.com/store",
      apple: "https://apps.apple.com/"
    };
    window.open(storeLinks[store], '_blank');
  };

  // Function to handle opening camera for specific photo type
  const handleOpenCamera = (type: PhotoType) => {
    switch(type) {
      case 'front':
        if (frontCameraInputRef.current) frontCameraInputRef.current.click();
        break;
      case 'back':
        if (backCameraInputRef.current) backCameraInputRef.current.click();
        break;
      case 'selfie':
        if (selfieCameraInputRef.current) selfieCameraInputRef.current.click();
        break;
    }
  };

  // Function to handle opening gallery for specific photo type
  const handleOpenGallery = (type: PhotoType) => {
    switch(type) {
      case 'front':
        if (frontFileInputRef.current) frontFileInputRef.current.click();
        break;
      case 'back':
        if (backFileInputRef.current) backFileInputRef.current.click();
        break;
      case 'selfie':
        // Selfie doesn't have a gallery option, but keeping for consistency
        if (selfieFileInputRef.current) selfieFileInputRef.current.click();
        break;
    }
  };

  const renderMobileUploadInterface = (
    title: string, 
    setPreview: React.Dispatch<React.SetStateAction<string | null>>, 
    preview: string | null, 
    photoType: PhotoType,
    progress: number,
    showGalleryButton: boolean = true
  ) => (
    <Card className="border border-neutral-200 p-4">
      <h2 className="text-lg mb-3">{title}</h2>
      <div className="flex gap-4 mb-4">
        {showGalleryButton && (
          <>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, photoType)}
              ref={photoType === 'front' ? frontFileInputRef : photoType === 'back' ? backFileInputRef : selfieFileInputRef}
            />
            <Button 
              variant="outline" 
              className="w-full flex-1 py-6 border-[#B1904B] text-[#B1904B] hover:bg-[#B1904B]/10"
              type="button"
              onClick={() => handleOpenGallery(photoType)}
              disabled={isUploading}
            >
              <Image className="h-6 w-6 mr-2" />
              Galerie
            </Button>
          </>
        )}
        
        <input
          type="file"
          accept="image/*"
          capture={photoType === 'selfie' ? 'user' : 'environment'}
          className="hidden"
          onChange={(e) => handleFileChange(e, photoType)}
          ref={photoType === 'front' ? frontCameraInputRef : photoType === 'back' ? backCameraInputRef : selfieCameraInputRef}
          onError={() => handleCameraError(new Error('Camera access failed'), 'camera')}
        />
        <Button 
          variant="outline" 
          className="w-full flex-1 py-6 border-[#B1904B] text-[#B1904B] hover:bg-[#B1904B]/10"
          type="button"
          onClick={() => handleOpenCamera(photoType)}
          disabled={isUploading}
        >
          <Camera className="h-6 w-6 mr-2" />
          Kamera
        </Button>
      </div>
      
      <div 
        className={`rounded-lg flex items-center justify-center h-40 ${preview ? '' : 'bg-neutral-200'} cursor-pointer relative`}
        onClick={() => {
          if (preview) {
            setCurrentPhotoPreview(preview);
            setCurrentPhotoType(photoType);
            setShowPhotoPreviewModal(true);
          }
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt={`${title} Vorschau`} className="h-full rounded-lg object-contain" />
            {progress > 0 && progress < 100 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white text-lg font-bold">{progress}%</div>
              </div>
            )}
          </>
        ) : (
          <span className="text-neutral-500">Vorschau</span>
        )}
      </div>
      
      {preview && (
        <div className="mt-2 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-[#B1904B]"
            onClick={() => handleRetakePhoto(photoType)}
            disabled={isUploading}
          >
            Neu aufnehmen
          </Button>
        </div>
      )}
    </Card>
  );

  const renderDesktopDownloadInterface = () => (
    <Card className="border border-neutral-200 p-4">
      <h2 className="text-lg mb-3">ID-Verifizierung</h2>
      <div className="flex flex-col items-center justify-center p-4">
        <div className="mb-4 text-center">
          <img 
            src="/lovable-uploads/fi-logo-white.png" 
            alt="FI Investments Logo" 
            className="w-32 mx-auto mb-4 bg-[#003595] p-2 rounded"
          />
        </div>
        <p className="mb-6 text-center font-medium text-lg">
          Für die Legitimation verwenden Sie bitte die FI Investments App
        </p>
        <p className="mb-6 text-center text-neutral-600">
          Laden Sie unsere mobile App herunter, um den Legitimationsprozess schnell und sicher abzuschließen. Die Verifizierung ist nur über die mobile App möglich.
        </p>
        <div className="flex gap-4 mb-4 w-full max-w-md">
          <Button 
            onClick={() => handleStoreButtonClick('google')}
            className="flex-1 py-6 bg-[#003595] hover:bg-[#00275a] text-white"
          >
            <PlaySquare className="h-6 w-6 mr-2" />
            Google Play
          </Button>
          <Button 
            onClick={() => handleStoreButtonClick('apple')}
            className="flex-1 py-6 bg-black hover:bg-neutral-800 text-white"
          >
            <Apple className="h-6 w-6 mr-2" />
            App Store
          </Button>
        </div>
        <p className="mt-4 text-sm text-neutral-500 text-center">
          Alternativ können Sie den Legitimationsprozess auch direkt auf Ihrem Mobilgerät unter fi-investments.de durchführen.
        </p>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="fixed top-0 w-full bg-white px-4 py-3 z-50 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBack} 
            className="text-[#B1904B]"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="w-32 h-8 bg-white flex items-center justify-center rounded">
            <span className="text-[#003595] font-medium">FI Investments</span>
          </div>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="flex-1 pt-16 pb-36">
        <section className="mb-8 px-4">
          <h1 className="text-2xl mb-3">Legitimation</h1>
          <p className="text-neutral-600">
            {isMobile
              ? "Bitte laden Sie Fotos Ihres Ausweises (Vorder- und Rückseite) und ein Selfie hoch, um Ihre Identität zu bestätigen."
              : "Um Ihre Identität zu bestätigen, laden Sie bitte unsere mobile App herunter und folgen Sie den Anweisungen zur Legitimation."}
          </p>
        </section>

        <section className="space-y-6 px-4">
          {isMobile ? (
            <>
              {renderMobileUploadInterface(
                "Vorderseite des Ausweises", 
                setFrontPreview, 
                frontPreview, 
                'front',
                uploadProgress.front
              )}
              {renderMobileUploadInterface(
                "Rückseite des Ausweises", 
                setBackPreview, 
                backPreview, 
                'back',
                uploadProgress.back
              )}
              {renderMobileUploadInterface(
                "Selfie", 
                setSelfiePreview, 
                selfiePreview, 
                'selfie',
                uploadProgress.selfie,
                false
              )}
            </>
          ) : (
            <div className="space-y-6">
              {renderDesktopDownloadInterface()}
            </div>
          )}
        </section>

        {isMobile && (
          <section className="mt-8 bg-[#f7f3ea] p-4 rounded-lg mx-4 border border-[#B1904B]/20">
            <h3 className="mb-2 font-medium flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-[#B1904B]" />
              Tipps für gute Aufnahmen
            </h3>
            <ul className="text-sm text-neutral-600 space-y-2">
              <li>• Stellen Sie sicher, dass alle Details auf Ihrem Ausweis deutlich sichtbar sind</li>
              <li>• Vermeiden Sie Blendung oder Reflexionen</li>
              <li>• Achten Sie auf eine gute Beleuchtung</li>
              <li>• Zentrieren Sie Ihr Gesicht im Selfie bei guter Beleuchtung</li>
            </ul>
          </section>
        )}
      </main>

      {isMobile && (
        <section className="fixed bottom-0 w-full bg-white p-4 border-t border-neutral-200 z-40">
          <div className="flex gap-4">
            <Button 
              onClick={handleBack}
              variant="outline"
              className="flex-1 py-6 border-[#B1904B] text-[#B1904B] hover:bg-[#B1904B]/10"
              disabled={isUploading}
            >
              Zurück
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 py-6 bg-[#B1904B] hover:bg-[#a07f42] text-white"
              disabled={isUploading || (!frontPhotoFile && !backPhotoFile && !selfiePhotoFile)}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Wird hochgeladen...
                </>
              ) : (
                "Weiter"
              )}
            </Button>
          </div>
        </section>
      )}

      <footer className="bg-[#003595] py-2 text-white">
        <div className="flex justify-center space-x-4 text-xs">
          <span className="hover:underline cursor-pointer">Datenschutz</span>
          <span className="hover:underline cursor-pointer">Impressum</span>
          <span className="hover:underline cursor-pointer">Cookies</span>
        </div>
      </footer>

      {/* Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Berechtigung erforderlich</DialogTitle>
            <DialogDescription>
              {permissionType === 'camera' 
                ? "Um Ihre Identität zu verifizieren, benötigen wir Zugriff auf Ihre Kamera. Bitte erlauben Sie den Zugriff in den Browsereinstellungen."
                : "Um Fotos hochzuladen, benötigen wir Zugriff auf Ihre Galerie. Bitte erlauben Sie den Zugriff in den Browsereinstellungen."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowPermissionDialog(false)}
              className="bg-[#B1904B] hover:bg-[#9a7b3f] text-white"
            >
              Verstanden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Preview Modal */}
      <Dialog open={showPhotoPreviewModal} onOpenChange={setShowPhotoPreviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentPhotoType === 'front' ? 'Vorderseite des Ausweises' : 
               currentPhotoType === 'back' ? 'Rückseite des Ausweises' : 'Selfie'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {currentPhotoPreview && (
              <img 
                src={currentPhotoPreview} 
                alt="Bildvorschau" 
                className="max-h-[60vh] object-contain rounded-md" 
              />
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleRetakePhoto(currentPhotoType)}
              className="flex-1 border-[#B1904B] text-[#B1904B]"
              disabled={isUploading}
            >
              Neu aufnehmen
            </Button>
            <Button
              onClick={() => setShowPhotoPreviewModal(false)}
              className="flex-1 bg-[#B1904B] hover:bg-[#9a7b3f] text-white"
            >
              Bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg text-center mb-2">
              Legitimation eingereicht
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-neutral-600">
              Vielen Dank für die Einreichung Ihrer Legitimationsunterlagen. Diese werden nun intern geprüft. 
              Sie erhalten eine Benachrichtigung, sobald die Prüfung abgeschlossen ist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction 
              onClick={handleConfirmationClose}
              className="w-full bg-[#B1904B] hover:bg-[#a07f42] text-white"
            >
              Verstanden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Legitimation;
