
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProduct } from "@/hooks/useProduct";

const Zeichnungsschein = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [isCompanyAccount, setIsCompanyAccount] = useState(false);
  const [personalData, setPersonalData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    address: "",
    birthPlace: "", 
    nationality: "", 
    tradeRegisterNumber: "",
  });
  
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Get the productId from localStorage or location state
  const productId = location.state?.productId || localStorage.getItem("productId") || "";
  
  // Use the useProduct hook to fetch the product details
  const { data: product, isLoading: isLoadingProduct } = useProduct(productId);
  
  // Calculate number of shares based on investment amount and minimum investment
  const sharePrice = product?.minimum_investment || 1000;
  const numberOfShares = Math.floor(investmentAmount / sharePrice);
  const totalAmount = numberOfShares * sharePrice;
  
  useEffect(() => {
    // Load investment amount from localStorage or location state
    const storedAmount = location.state?.investmentAmount || localStorage.getItem("investmentAmount");
    if (storedAmount) {
      setInvestmentAmount(Number(storedAmount));
    }
    
    // Check if we have data from authorized person in location state
    const fetchUserProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        // First check if we have authorized person data from the previous step
        if (location.state?.authorizedPerson) {
          const authorizedPerson = location.state.authorizedPerson;
          
          // Format the address from authorized person data - mit korrekter Straße und Hausnummer
          let address = "";
          if (authorizedPerson.street) {
            address = `${authorizedPerson.street}`;
            if (authorizedPerson.postalCode || authorizedPerson.city) {
              address += `, ${authorizedPerson.postalCode || ""} ${authorizedPerson.city || ""}`;
            }
            if (authorizedPerson.country) {
              address += `, ${authorizedPerson.country}`;
            }
          }
          
          // Set personal data based on authorized person data
          setPersonalData({
            name: `${authorizedPerson.title || ""} ${authorizedPerson.academicTitle || ""} ${authorizedPerson.firstName} ${authorizedPerson.lastName}`.trim(),
            contactPerson: "", // This field is only used for company accounts
            email: authorizedPerson.email,
            address: address,
            birthPlace: authorizedPerson.birthPlace || "", // Neu: Geburtsort
            nationality: authorizedPerson.nationality || "", // Neu: Staatsangehörigkeit
            tradeRegisterNumber: "", // This field is only used for company accounts
          });
          
          setIsCompanyAccount(location.state.isCompanyAccount || false);
          
          if (location.state.investmentAmount) {
            setInvestmentAmount(Number(location.state.investmentAmount));
          }
          
          setIsLoadingProfile(false);
          return;
        }
        
        // If no authorized person data in location.state, try to reconstruct from localStorage
        const street = localStorage.getItem("authorizedPersonStreet");
        const postalCode = localStorage.getItem("authorizedPersonPostalCode");
        const city = localStorage.getItem("authorizedPersonCity");
        const country = localStorage.getItem("authorizedPersonCountry");
        const firstName = localStorage.getItem("authorizedPersonFirstName");
        const lastName = localStorage.getItem("authorizedPersonLastName");
        const email = localStorage.getItem("authorizedPersonEmail");
        const title = localStorage.getItem("authorizedPersonTitle");
        const academicTitle = localStorage.getItem("authorizedPersonAcademicTitle");
        const birthPlace = localStorage.getItem("authorizedPersonBirthPlace");
        const nationality = localStorage.getItem("authorizedPersonNationality");
        
        // If we have address data in localStorage, use it
        if (street && city) {
          let address = street;
          if (postalCode || city) {
            address += `, ${postalCode || ""} ${city || ""}`;
          }
          if (country) {
            address += `, ${country}`;
          }
          
          const name = `${title || ""} ${academicTitle || ""} ${firstName || ""} ${lastName || ""}`.trim();
          
          if (name && address) {
            setPersonalData({
              name,
              contactPerson: "", 
              email: email || "",
              address,
              birthPlace: birthPlace || "",
              nationality: nationality || "",
              tradeRegisterNumber: "",
            });
            
            setIsLoadingProfile(false);
            return;
          }
        }
        
        // If no authorized person data, fallback to profile data
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Fehler beim Abrufen der Profildaten");
        } else if (profileData) {
          // Set isCompanyAccount based on profile data
          setIsCompanyAccount(profileData.is_company || false);
          
          // Set personal data based on profile
          const name = profileData.is_company 
            ? profileData.company_name || ""
            : `${profileData.salutation || ""} ${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();
          
          // Korrekte Adressformatierung
          let address = "";
          if (profileData.street) {
            address = `${profileData.street}`;
            if (profileData.postal_code || profileData.city) {
              address += `, ${profileData.postal_code || ""} ${profileData.city || ""}`;
            }
            if (profileData.country) {
              address += `, ${profileData.country}`;
            }
          }
          
          setPersonalData({
            name,
            contactPerson: profileData.is_company ? `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() : "",
            email: profileData.email || user.email || "",
            address,
            birthPlace: profileData.birth_place || "", // Geburtsort aus Profildaten
            nationality: profileData.nationality || profileData.country || "", // Nationalität oder Land als Fallback
            tradeRegisterNumber: profileData.trade_register_number || "",
          });

          // Still check for localStorage data as backup or for investment amount
          const amount = localStorage.getItem("investmentAmount");
          if (amount) {
            setInvestmentAmount(Number(amount));
          }
          
          // Überprüfe, ob wir Geburtsort und Staatsangehörigkeit im localStorage haben
          const birthPlace = localStorage.getItem("authorizedPersonBirthPlace");
          const nationality = localStorage.getItem("authorizedPersonNationality");
          
          if (birthPlace || nationality) {
            setPersonalData(prev => ({
              ...prev,
              birthPlace: birthPlace || prev.birthPlace,
              nationality: nationality || prev.nationality
            }));
          }
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user, location.state, t]);
  
  const saveInvestmentToDatabase = async () => {
    try {
      if (!user) {
        toast.error(t('loginRequired'));
        navigate("/login");
        return false;
      }

      // Validate that we have actual shares to invest
      if (numberOfShares <= 0) {
        toast.error("Bitte wählen Sie mindestens einen Anteil aus");
        return false;
      }

      if (!product) {
        toast.error("Produktinformationen konnten nicht geladen werden");
        return false;
      }

      // Create the investment in the database
      const { data, error } = await supabase
        .from("investments")
        .insert({
          user_id: user.id,
          product_title: product.title,
          product_id: product.id,
          amount: totalAmount,
          shares: numberOfShares,
          status: "pending",
          performance_percentage: 0
        });

      if (error) {
        console.error("Error saving investment:", error);
        toast.error(t('errorSavingInvestment'));
        return false;
      }

      toast.success(t('investmentCreated'));
      return true;
    } catch (error) {
      console.error("Error in saveInvestmentToDatabase:", error);
      toast.error(t('unexpectedError'));
      return false;
    }
  };
  
  const handleProceed = async () => {
    setIsSubmitting(true);
    try {
      const saved = await saveInvestmentToDatabase();
      if (saved) {
        // Navigate to signature page first
        navigate("/signature");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingProfile || isLoadingProduct) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
        <p>Daten werden geladen...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
        <p>Produkt nicht gefunden. Bitte gehen Sie zurück und wählen Sie erneut.</p>
        <Button
          onClick={() => navigate("/product-catalog")}
          className="mt-4 bg-[#B1904B] hover:bg-[#a07f42]"
        >
          Zurück zum Produktkatalog
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 px-4 pb-24">
        <section className="mt-6">
          <h1 className="text-2xl">{t('subscriptionForm')}</h1>
          <p className="mt-2 text-neutral-600">{t('checkInfoBeforePayment')}</p>
        </section>

        <section className="mt-8 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg mb-4">{t('personalData')}</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">{t('name')}</span>
              <span>{personalData.name}</span>
            </div>
            {isCompanyAccount && (
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('contactPerson')}</span>
                <span>{personalData.contactPerson}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-600">{t('email')}</span>
              <span>{personalData.email}</span>
            </div>
            {personalData.birthPlace && (
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('birthPlace')}</span>
                <span>{personalData.birthPlace}</span>
              </div>
            )}
            {personalData.nationality && (
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('nationality')}</span>
                <span>{personalData.nationality}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-600">{t('address')}</span>
              <span className="text-right">{personalData.address}</span>
            </div>
            {isCompanyAccount && (
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('tradeRegisterNumber')}</span>
                <span>{personalData.tradeRegisterNumber}</span>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg mb-4">{t('productInfo')}</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">{t('product')}</span>
              <span>{product.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">{t('shares')}</span>
              <span>{numberOfShares} Stück</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">{t('pricePerShare')}</span>
              <span>€{sharePrice.toLocaleString('de-DE')},00</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{t('totalAmount')}</span>
              <span>€{totalAmount.toLocaleString('de-DE')},00</span>
            </div>
          </div>
        </section>

        <section className="mt-6 p-4 bg-neutral-100 rounded-lg text-sm text-neutral-600">
          <p>{t('legalDisclaimer')}</p>
        </section>

        <section className="mt-8 space-y-4">
          <Button 
            onClick={handleProceed}
            className="w-full py-6 bg-[#B1904B] hover:bg-[#a07f42] text-white rounded-lg"
            disabled={isSubmitting || numberOfShares <= 0}
          >
            {isSubmitting ? t('processing') : t('weiterZurLegitimation')}
          </Button>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Zeichnungsschein;
