
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, Upload, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const StatusOverview = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [legitimationStatus, setLegitimationStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [legitimationPhotos, setLegitimationPhotos] = useState<{
    front: boolean;
    back: boolean;
    selfie: boolean;
  }>({
    front: false,
    back: false,
    selfie: false
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  // Check legitimation status on component mount
  useEffect(() => {
    if (user) {
      checkLegitimationStatus();
    }
  }, [user]);

  const checkLegitimationStatus = async () => {
    if (!user) return;
    
    try {
      // Check if the user has uploaded legitimation photos
      const { data: photos, error } = await supabase
        .from('legitimation_photos')
        .select('photo_type')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching legitimation photos:", error);
        return;
      }
      
      if (photos && photos.length > 0) {
        const hasTypes = {
          front: photos.some(photo => photo.photo_type === 'front'),
          back: photos.some(photo => photo.photo_type === 'back'),
          selfie: photos.some(photo => photo.photo_type === 'selfie')
        };
        
        setLegitimationPhotos(hasTypes);
        
        if (hasTypes.front && hasTypes.back && hasTypes.selfie) {
          // Check profile KYC status to see if it's been verified
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('kyc_status')
            .eq('id', user.id)
            .single();
          
          if (!profileError && profile) {
            if (profile.kyc_status === 'verified') {
              setLegitimationStatus("completed");
            } else if (profile.kyc_status === 'documents_uploaded') {
              // Documents uploaded but not yet verified
              setLegitimationStatus("pending");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking legitimation status:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadProgress(0);
    }
  };
  
  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmitDocument = async () => {
    if (!selectedFile) {
      toast.error(t('pleaseSelectFile'));
      return;
    }
    
    if (!user) {
      toast.error(t('loginRequired'));
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create form data to send file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user.id);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      // Send the file to the API
      // In a real app, this would be an actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API delay
      
      clearInterval(progressInterval);
      
      // Complete the progress bar
      setUploadProgress(100);
      
      setTimeout(() => {
        setSubscriptionStatus("completed");
        toast.success(t('documentUploadedSuccessfully'));
      }, 500);
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(t('errorUploadingDocument'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartLegitimation = () => {
    navigate("/legitimation");
  };

  const handleCheckLegitimation = async () => {
    // Refresh legitimation status
    await checkLegitimationStatus();
    
    if (legitimationPhotos.front && legitimationPhotos.back && legitimationPhotos.selfie) {
      toast.success("Legitimationsunterlagen wurden hochgeladen", {
        description: "Ihre Unterlagen werden derzeit geprüft."
      });
    } else {
      toast.error("Legitimation unvollständig", {
        description: "Bitte laden Sie alle erforderlichen Dokumente hoch."
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <main className="flex-1 pt-20 px-4 pb-24">
        <section className="text-center mb-8">
          <h1 className="text-2xl mb-3">{t('statusOverview')}</h1>
          <p className="text-lg">{t('thanksForTrust')}</p>
        </section>
        
        <section className="mb-8">
          <p className="text-neutral-600 text-sm leading-relaxed">
            {t('submissionInfo')}
          </p>
        </section>
        
        <section className="space-y-6 mb-8">
          {/* Zeichnung Status */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              {subscriptionStatus === "completed" ? (
                <CheckCircle className="text-[#B1904B] h-6 w-6 mr-3" />
              ) : subscriptionStatus === "failed" ? (
                <XCircle className="text-red-500 h-6 w-6 mr-3" />
              ) : (
                <AlertCircle className="text-[#B1904B] h-6 w-6 mr-3" />
              )}
              <span>{t('signing')}</span>
            </div>
            
            {subscriptionStatus !== "completed" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {t('pleaseUploadSignedDocument')}
                </p>
                
                <Button
                  onClick={handleFileUploadClick}
                  variant="outline"
                  className="w-full py-6 border border-[#B1904B] text-[#B1904B] hover:bg-[#B1904B]/10 rounded-lg flex items-center justify-center gap-2"
                  disabled={isUploading}
                >
                  <Upload size={20} />
                  {t('uploadDocument')}
                </Button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf,image/*"
                  className="hidden"
                />
                
                {selectedFile && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <File size={16} className="text-gray-500" />
                      <span className="text-gray-700 truncate max-w-[250px]">
                        {selectedFile.name}
                      </span>
                    </div>
                    
                    {uploadProgress > 0 && (
                      <div className="space-y-1">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-gray-500 text-right">
                          {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={handleSubmitDocument}
                  className="w-full py-6 bg-[#B1904B] hover:bg-[#a07f42] text-white rounded-lg"
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? t('uploading') : t('submitDocument')}
                </Button>
              </div>
            )}
          </div>
          
          {/* Legitimation Status */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              {legitimationStatus === "completed" ? (
                <CheckCircle className="text-[#B1904B] h-6 w-6 mr-3" />
              ) : legitimationStatus === "failed" ? (
                <XCircle className="text-red-500 h-6 w-6 mr-3" />
              ) : (
                <AlertCircle className="text-[#B1904B] h-6 w-6 mr-3" />
              )}
              <span>{t('legitimation')}</span>
            </div>
            
            {legitimationStatus !== "completed" && (
              <div>
                {legitimationPhotos.front || legitimationPhotos.back || legitimationPhotos.selfie ? (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium">Dokumente hochgeladen:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {legitimationPhotos.front ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <XCircle className="h-4 w-4 text-red-500" />
                        }
                        <span className="text-sm">Ausweis Vorderseite</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {legitimationPhotos.back ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <XCircle className="h-4 w-4 text-red-500" />
                        }
                        <span className="text-sm">Ausweis Rückseite</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {legitimationPhotos.selfie ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <XCircle className="h-4 w-4 text-red-500" />
                        }
                        <span className="text-sm">Selfie</span>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleStartLegitimation}
                    className="w-full py-6 bg-[#B1904B] hover:bg-[#a07f42] text-white rounded-lg"
                  >
                    {legitimationPhotos.front || legitimationPhotos.back || legitimationPhotos.selfie ? 
                      t('continueLegitimation') : 
                      t('startLegitimation')
                    }
                  </Button>
                  
                  {(legitimationPhotos.front || legitimationPhotos.back || legitimationPhotos.selfie) && (
                    <Button 
                      onClick={handleCheckLegitimation}
                      variant="outline"
                      className="w-full py-6 border border-[#B1904B] text-[#B1904B] hover:bg-[#B1904B]/10 rounded-lg"
                    >
                      {t('checkLegitimation')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Annahme Status */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              {subscriptionStatus === "completed" && legitimationStatus === "completed" ? (
                <CheckCircle className="text-[#B1904B] h-6 w-6 mr-3" />
              ) : (
                <XCircle className="text-[#B1904B] h-6 w-6 mr-3" />
              )}
              <span>{t('acceptance')}</span>
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <Button 
            onClick={handleDashboardClick}
            className="w-full py-6 bg-[#B1904B] hover:bg-[#a07f42] text-white rounded-lg"
          >
            {t('backToDashboard')}
          </Button>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default StatusOverview;
