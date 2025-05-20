
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import MobileFooter from "@/components/MobileFooter";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string: string): string => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const Profile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast({
        title: "Fehler beim Laden des Profils",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Ensure proper capitalization of salutation when loading data
    if (data && data.salutation) {
      data.salutation = capitalizeFirstLetter(data.salutation);
    }

    setUserProfile(data);
    setEditedProfile(data);
  };

  const handleEdit = () => {
    setEditedProfile(userProfile);
    setEditMode(true);
  };

  const handleCancel = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCancel = () => {
    setEditMode(false);
    setShowConfirmation(false);
    setEditedProfile(userProfile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    // Only save the fields that are allowed to be edited
    const { error } = await supabase
      .from('profiles')
      .update({
        street: editedProfile.street,
        postal_code: editedProfile.postal_code,
        city: editedProfile.city,
        country: editedProfile.country,
        email: editedProfile.email,
        phone: editedProfile.phone,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Fehler beim Speichern",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setUserProfile({
      ...userProfile,
      street: editedProfile.street,
      postal_code: editedProfile.postal_code,
      city: editedProfile.city,
      country: editedProfile.country,
      email: editedProfile.email,
      phone: editedProfile.phone,
    });
    
    setEditMode(false);
    toast({
      title: "Erfolgreich gespeichert",
      description: "Ihre Profiländerungen wurden gespeichert.",
    });
  };

  if (!userProfile) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="fixed w-full top-0 z-50 bg-fi-blue px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-fi-gold">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <span className="text-white font-bold text-xl">Profilverwaltung</span>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow pt-20 px-4 pb-24">
        <div className="flex items-center mb-6">
          <Avatar className="h-20 w-20 mr-4">
            <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${userProfile.first_name}${userProfile.last_name}`} alt={`${userProfile.first_name} ${userProfile.last_name}`} />
            <AvatarFallback className="bg-fi-gold text-white text-xl">
              {userProfile.first_name?.charAt(0)}{userProfile.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{userProfile.first_name} {userProfile.last_name}</h3>
            <p className="text-neutral-600">ID: {userProfile.id}</p>
          </div>
        </div>

        <div className="space-y-4">
          {!editMode ? (
            // View mode
            <>
              <ProfileField label="Anrede" value={capitalizeFirstLetter(userProfile.salutation) || '-'} />
              <ProfileField label="Vorname" value={userProfile.first_name || '-'} />
              <ProfileField label="Nachname" value={userProfile.last_name || '-'} />
              <ProfileField label="Straße" value={userProfile.street || '-'} />
              <ProfileField label="Postleitzahl" value={userProfile.postal_code || '-'} />
              <ProfileField label="Stadt" value={userProfile.city || '-'} />
              <ProfileField label="Land" value={userProfile.country || '-'} />
              <ProfileField label="E-Mail" value={userProfile.email || '-'} />
              <ProfileField label="Telefon" value={userProfile.phone || '-'} />
              <ProfileField 
                label="Geburtsdatum" 
                value={userProfile.date_of_birth 
                  ? format(new Date(userProfile.date_of_birth), 'dd.MM.yyyy') 
                  : '-'} 
              />
              <ProfileField label="Geburtsort" value={userProfile.birth_place || '-'} />
              <ProfileField label="Staatsangehörigkeit" value={userProfile.nationality || '-'} />
              <ProfileField label="KYC Status" value={userProfile.kyc_status || '-'} />
              
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-neutral-600">Kontodaten</p>
                  <ProfileSubField label="Kontoinhaber" value={userProfile.account_holder || '-'} />
                  <ProfileSubField label="IBAN" value={userProfile.iban || '-'} />
                  <ProfileSubField label="BIC" value={userProfile.bic || '-'} />
                  <ProfileSubField label="Bank" value={userProfile.bank_name || '-'} />
                </CardContent>
              </Card>
            </>
          ) : (
            // Edit mode - only address, email and phone fields are editable
            <>
              {/* Non-editable fields rendered as read-only */}
              <ReadOnlyField 
                label="Anrede" 
                value={capitalizeFirstLetter(userProfile.salutation) || '-'} 
              />
              <ReadOnlyField 
                label="Vorname" 
                value={userProfile.first_name || '-'} 
              />
              <ReadOnlyField 
                label="Nachname" 
                value={userProfile.last_name || '-'} 
              />
              
              {/* Editable address fields */}
              <EditableField 
                label="Straße" 
                name="street" 
                value={editedProfile.street || ''} 
                onChange={handleChange}
              />
              <EditableField 
                label="Postleitzahl" 
                name="postal_code" 
                value={editedProfile.postal_code || ''} 
                onChange={handleChange}
              />
              <EditableField 
                label="Stadt" 
                name="city" 
                value={editedProfile.city || ''} 
                onChange={handleChange}
              />
              <EditableField 
                label="Land" 
                name="country" 
                value={editedProfile.country || ''} 
                onChange={handleChange}
              />
              
              {/* Editable contact fields */}
              <EditableField 
                label="E-Mail" 
                name="email" 
                type="email"
                value={editedProfile.email || ''} 
                onChange={handleChange}
              />
              <EditableField 
                label="Telefon" 
                name="phone" 
                value={editedProfile.phone || ''} 
                onChange={handleChange}
              />
              
              {/* Non-editable fields continued */}
              <ReadOnlyField 
                label="Geburtsdatum" 
                value={userProfile.date_of_birth 
                  ? format(new Date(userProfile.date_of_birth), 'dd.MM.yyyy') 
                  : '-'} 
              />
              <ReadOnlyField 
                label="Geburtsort" 
                value={userProfile.birth_place || '-'} 
              />
              <ReadOnlyField 
                label="Staatsangehörigkeit" 
                value={userProfile.nationality || '-'} 
              />
              
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-neutral-600">Kontodaten</p>
                  <ProfileSubField label="Kontoinhaber" value={userProfile.account_holder || '-'} />
                  <ProfileSubField label="IBAN" value={userProfile.iban || '-'} />
                  <ProfileSubField label="BIC" value={userProfile.bic || '-'} />
                  <ProfileSubField label="Bank" value={userProfile.bank_name || '-'} />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {!editMode ? (
          <Button 
            className="w-full mt-6 bg-fi-gold hover:bg-fi-gold/90 text-white"
            onClick={handleEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
        ) : (
          <div className="flex gap-4 mt-6">
            <Button 
              className="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              onClick={handleCancel}
            >
              <X className="mr-2 h-4 w-4" />
              Abbrechen
            </Button>
            <Button 
              className="w-1/2 bg-fi-gold hover:bg-fi-gold/90 text-white"
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </div>
        )}
      </main>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Änderungen verwerfen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie die Bearbeitung abbrechen möchten? Alle ungespeicherten Änderungen gehen verloren.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zurück</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Verwerfen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileFooter />
    </div>
  );
};

const ProfileField = ({ label, value }: { label: string, value: string }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-neutral-600 text-sm mb-1">{label}</p>
      <p>{value}</p>
    </CardContent>
  </Card>
);

const ProfileSubField = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-neutral-600 text-sm mb-1">{label}</p>
    <p>{value}</p>
  </div>
);

// New component for read-only fields in edit mode
const ReadOnlyField = ({ label, value }: { label: string, value: string }) => (
  <Card>
    <CardContent className="p-4">
      <label className="text-neutral-600 text-sm mb-1 block">{label}</label>
      <Input
        value={value}
        readOnly
        disabled
        className="mt-1 bg-gray-100 text-gray-600 cursor-not-allowed"
      />
    </CardContent>
  </Card>
);

const EditableField = ({ 
  label, 
  name, 
  value, 
  onChange,
  type = "text"
}: { 
  label: string, 
  name: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  type?: string
}) => (
  <Card>
    <CardContent className="p-4">
      <label htmlFor={name} className="text-neutral-600 text-sm mb-1 block">{label}</label>
      <Input 
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1"
      />
    </CardContent>
  </Card>
);

const EditableSelect = ({ 
  label, 
  name, 
  value, 
  onValueChange,
  options
}: { 
  label: string, 
  name: string, 
  value: string, 
  onValueChange: (value: string) => void,
  options: { value: string, label: string }[]
}) => (
  <Card>
    <CardContent className="p-4">
      <label htmlFor={name} className="text-neutral-600 text-sm mb-1 block">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full mt-1">
          <SelectValue placeholder={`${label} auswählen`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
);

const EditableDateField = ({
  label,
  date,
  onSelect
}: {
  label: string,
  date: Date | undefined,
  onSelect: (date: Date | undefined) => void
}) => (
  <Card>
    <CardContent className="p-4">
      <label className="text-neutral-600 text-sm mb-1 block">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd.MM.yyyy") : <span>Datum auswählen</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </CardContent>
  </Card>
);

export default Profile;
