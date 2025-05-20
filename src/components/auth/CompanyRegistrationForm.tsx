
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompanyRegistrationFormProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  legalForm: string;
  setLegalForm: (value: string) => void;
  companyEmail: string;
  setCompanyEmail: (value: string) => void;
  companyPassword: string;
  setCompanyPassword: (value: string) => void;
  confirmCompanyPassword: string;
  setConfirmCompanyPassword: (value: string) => void;
}

const CompanyRegistrationForm: React.FC<CompanyRegistrationFormProps> = ({
  companyName,
  setCompanyName,
  legalForm,
  setLegalForm,
  companyEmail,
  setCompanyEmail,
  companyPassword,
  setCompanyPassword,
  confirmCompanyPassword,
  setConfirmCompanyPassword,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Unternehmensname</Label>
        <Input
          id="companyName"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full"
          placeholder="Geben Sie den Unternehmensnamen ein"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="legalForm">Rechtsform</Label>
        <Select value={legalForm} onValueChange={setLegalForm}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Wählen Sie eine Rechtsform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gmbh">GmbH</SelectItem>
            <SelectItem value="ag">AG</SelectItem>
            <SelectItem value="ltd">Limited</SelectItem>
            <SelectItem value="kg">KG</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companyEmail">E-Mail Adresse</Label>
        <Input
          id="companyEmail"
          type="email"
          value={companyEmail}
          onChange={(e) => setCompanyEmail(e.target.value)}
          className="w-full"
          placeholder="firma@beispiel.de"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companyPassword">Passwort</Label>
        <Input
          id="companyPassword"
          type="password"
          value={companyPassword}
          onChange={(e) => setCompanyPassword(e.target.value)}
          className="w-full"
          placeholder="Mindestens 8 Zeichen"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmCompanyPassword">Passwort bestätigen</Label>
        <Input
          id="confirmCompanyPassword"
          type="password"
          value={confirmCompanyPassword}
          onChange={(e) => setConfirmCompanyPassword(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default CompanyRegistrationForm;
