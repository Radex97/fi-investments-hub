
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AuthorizedPerson = () => {
  const { user } = useAuth();
  const [selectedOwnersType, setSelectedOwnersType] = useState<string>("one");
  const [title, setTitle] = useState<string>("Herr");
  const [academicTitle, setAcademicTitle] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [birthPlace, setBirthPlace] = useState<string>("");  // Neu: Geburtsort
  const [nationality, setNationality] = useState<string>("Deutsch"); // Neu: Staatsangehörigkeit
  const [street, setStreet] = useState<string>("");
  const [houseNumber, setHouseNumber] = useState<string>(""); // Neu: Hausnummer getrennt
  const [postalCode, setPostalCode] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("Deutschland");
  const [isCompanyAccount, setIsCompanyAccount] = useState<boolean>(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const location = useLocation();
  const [productTitle, setProductTitle] = useState("FI Investments Produkt");
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [brokerNumber, setBrokerNumber] = useState<string>("");

  // Fetch profile data when component mounts
  useEffect(() => {
    async function fetchProfileData() {
      if (user) {
        setIsLoading(true);
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            toast.error("Fehler beim Abrufen der Profildaten");
          } else if (profileData) {
            // Populate form fields with profile data
            setIsCompanyAccount(profileData.is_company || false);
            
            if (profileData.salutation) {
              setTitle(profileData.salutation === "herr" ? "Herr" : 
                      profileData.salutation === "frau" ? "Frau" : profileData.salutation);
            }
            
            setFirstName(profileData.first_name || "");
            setLastName(profileData.last_name || "");
            setEmail(profileData.email || user.email || "");
            
            // Trennung von Straße und Hausnummer, falls vorhanden
            if (profileData.street) {
              const streetParts = profileData.street.split(/\s+(?=\d+)/);
              if (streetParts.length > 1) {
                setStreet(streetParts[0]);
                setHouseNumber(streetParts[1]);
              } else {
                setStreet(profileData.street);
              }
            }
            
            setPostalCode(profileData.postal_code || "");
            setCity(profileData.city || "");
            setCountry(profileData.country || "Deutschland");
            
            if (profileData.date_of_birth) {
              setDateOfBirth(new Date(profileData.date_of_birth));
            }
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    if (location.state) {
      if (location.state.productTitle) {
        setProductTitle(location.state.productTitle);
        localStorage.setItem("currentProductTitle", location.state.productTitle);
      }
      
      if (location.state.investmentAmount) {
        setInvestmentAmount(location.state.investmentAmount.toString());
        localStorage.setItem("investmentAmount", location.state.investmentAmount.toString());
      }
      
      if (location.state.brokerNumber) {
        setBrokerNumber(location.state.brokerNumber);
        localStorage.setItem("brokerNumber", location.state.brokerNumber);
      }
      
      if (location.state.isCompanyAccount !== undefined) {
        setIsCompanyAccount(location.state.isCompanyAccount);
        localStorage.setItem("isCompanyAccount", location.state.isCompanyAccount.toString());
      }
    } else {
      const storedTitle = localStorage.getItem("currentProductTitle");
      const storedAmount = localStorage.getItem("investmentAmount");
      const storedBrokerNumber = localStorage.getItem("brokerNumber");
      const storedIsCompanyAccount = localStorage.getItem("isCompanyAccount");
      
      if (storedTitle) setProductTitle(storedTitle);
      if (storedAmount) setInvestmentAmount(storedAmount);
      if (storedBrokerNumber) setBrokerNumber(storedBrokerNumber);
      if (storedIsCompanyAccount) setIsCompanyAccount(storedIsCompanyAccount === "true");
    }
  }, [location]);

  const handleSubmit = () => {
    if (!firstName || !lastName || !email || !street || !postalCode || !city || !dateOfBirth || !birthPlace || !nationality) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    // Kombiniere Straße und Hausnummer für die Adresse
    const fullStreet = houseNumber ? `${street} ${houseNumber}` : street;

    localStorage.setItem("authorizedPersonType", selectedOwnersType);
    localStorage.setItem("authorizedPersonTitle", title);
    localStorage.setItem("authorizedPersonAcademicTitle", academicTitle);
    localStorage.setItem("authorizedPersonFirstName", firstName);
    localStorage.setItem("authorizedPersonLastName", lastName);
    localStorage.setItem("authorizedPersonEmail", email);
    localStorage.setItem("authorizedPersonStreet", fullStreet);
    localStorage.setItem("authorizedPersonPostalCode", postalCode);
    localStorage.setItem("authorizedPersonCity", city);
    localStorage.setItem("authorizedPersonCountry", country);
    localStorage.setItem("authorizedPersonDateOfBirth", dateOfBirth.toISOString());
    localStorage.setItem("authorizedPersonBirthPlace", birthPlace); // Neu: Geburtsort speichern
    localStorage.setItem("authorizedPersonNationality", nationality); // Neu: Staatsangehörigkeit speichern
    
    navigate("/payment-account", { 
      state: { 
        productTitle: productTitle,
        investmentAmount: investmentAmount,
        brokerNumber: brokerNumber,
        authorizedPerson: {
          type: selectedOwnersType,
          title,
          academicTitle,
          firstName,
          lastName,
          email,
          street: fullStreet,  // Kombinierte Straße mit Hausnummer
          postalCode,
          city,
          country,
          dateOfBirth,
          birthPlace,  // Neu: Geburtsort weitergeben
          nationality  // Neu: Staatsangehörigkeit weitergeben
        }
      } 
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-lg text-gray-700">Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-[#003595] px-4 py-3 flex items-center justify-between fixed w-full top-0 z-50">
        <button onClick={handleBack} className="text-[#B1904B]">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 flex justify-center">
          <img 
            src="/lovable-uploads/86b92ddd-40b6-4dd7-b83e-cc64cea5d230.png" 
            alt="FI Investments" 
            className="h-8 object-contain"
          />
        </div>
        <div className="w-6"></div>
      </header>
      
      <main className="flex-1 pt-20 px-4 pb-4">
        <h1 className="text-xl text-[#222733] mb-4">{productTitle}</h1>
        
        {isCompanyAccount && (
          <section className="mb-8">
            <p className="text-neutral-700 mb-4">
              Bitte geben Sie für die digitale Zeichnung die wirtschaftlich Berechtigten des Unternehmens an.
            </p>
            
            <RadioGroup 
              value={selectedOwnersType} 
              onValueChange={setSelectedOwnersType}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="one" id="one" />
                <Label htmlFor="one" className="flex items-center">
                  <span className="text-[#B1904B] mr-2">👤</span>
                  <span>Eine Person</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="two" id="two" />
                <Label htmlFor="two" className="flex items-center">
                  <span className="text-[#B1904B] mr-2">👥</span>
                  <span>Zwei Personen</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="more" id="more" />
                <Label htmlFor="more" className="flex items-center">
                  <span className="text-[#B1904B] mr-2">👥+</span>
                  <span>Drei oder mehr Personen</span>
                </Label>
              </div>
            </RadioGroup>
          </section>
        )}
        
        <section className="space-y-4">
          <h2 className="text-lg font-medium">
            {isCompanyAccount ? "Aktuelle Person und Zeichnungsberechtigter" : "Persönliche Daten"}
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Anrede</Label>
              <Select value={title} onValueChange={setTitle}>
                <SelectTrigger>
                  <SelectValue placeholder="Anrede auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Herr">Herr</SelectItem>
                  <SelectItem value="Frau">Frau</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="academicTitle">Titel (optional)</Label>
              <Select value={academicTitle} onValueChange={setAcademicTitle}>
                <SelectTrigger>
                  <SelectValue placeholder="Titel auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr.">Dr.</SelectItem>
                  <SelectItem value="Prof.">Prof.</SelectItem>
                  <SelectItem value="Prof. Dr.">Prof. Dr.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dateOfBirth"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "dd.MM.yyyy") : <span>Geburtsdatum auswählen</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Neu: Geburtsort */}
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Geburtsort</Label>
              <Input
                id="birthPlace"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
              />
            </div>
            
            {/* Neu: Staatsangehörigkeit */}
            <div className="space-y-2">
              <Label htmlFor="nationality">Staatsangehörigkeit</Label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger>
                  <SelectValue placeholder="Staatsangehörigkeit auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deutsch">Deutsch</SelectItem>
                  <SelectItem value="Österreichisch">Österreichisch</SelectItem>
                  <SelectItem value="Schweizerisch">Schweizerisch</SelectItem>
                  <SelectItem value="Andere">Andere</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Straße und Hausnummer getrennt */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="street">Straße</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="houseNumber">Hausnummer</Label>
                <Input
                  id="houseNumber"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postleitzahl</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Wohnort</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Land auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deutschland">Deutschland</SelectItem>
                  <SelectItem value="Österreich">Österreich</SelectItem>
                  <SelectItem value="Schweiz">Schweiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </main>
      
      <div className="bg-white p-4 shadow-lg border-t">
        <div className="flex gap-4">
          <Button 
            onClick={handleBack}
            className="flex-1 border-[#B1904B] text-[#B1904B] bg-white hover:bg-neutral-100"
            variant="outline"
          >
            Zurück
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 bg-[#B1904B] hover:bg-[#9a7b3f] text-white"
          >
            Weiter
          </Button>
        </div>
      </div>
      
      <footer className="bg-[#003595] text-white text-xs py-2 text-center">
        <div className="flex justify-center space-x-4">
          <Link to="/impressum" className="hover:text-white/100 text-white/80">Impressum</Link>
          <Link to="/datenschutz" className="hover:text-white/100 text-white/80">Datenschutz</Link>
          <Link to="/agb" className="hover:text-white/100 text-white/80">AGB</Link>
        </div>
      </footer>
    </div>
  );
};

export default AuthorizedPerson;
