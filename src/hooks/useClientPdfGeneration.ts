
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type GeneratePdfParams = {
  investmentId: string;
  userId: string;
  investment: any;
  profile: any;
};

export function useClientPdfGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Format date to DD.MM.YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };
  
  // Function to convert numbers to German words
  const convertNumberToGermanWords = (number: number): string => {
    const units = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
    const teens = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
    const tens = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
    
    if (number === 0) return 'null';
    
    if (number < 10) return units[number];
    
    if (number < 20) return teens[number - 10];
    
    if (number < 100) {
      const unit = number % 10;
      const ten = Math.floor(number / 10);
      return unit > 0 ? `${units[unit]}und${tens[ten]}` : tens[ten];
    }
    
    if (number < 1000) {
      const hundred = Math.floor(number / 100);
      const remainder = number % 100;
      return `${units[hundred]}hundert${remainder > 0 ? convertNumberToGermanWords(remainder) : ''}`;
    }
    
    if (number < 1000000) {
      const thousand = Math.floor(number / 1000);
      const remainder = number % 1000;
      return `${thousand > 1 ? convertNumberToGermanWords(thousand) : ''}tausend${remainder > 0 ? convertNumberToGermanWords(remainder) : ''}`;
    }
    
    return number.toString(); // Fallback to string for very large numbers
  };
  
  const generatePdf = async ({ investmentId, userId, investment, profile }: GeneratePdfParams) => {
    if (!investmentId || !userId) {
      toast.error("Es werden Investment-ID und Benutzer-ID benötigt");
      return null;
    }
    
    try {
      setIsGenerating(true);
      
      // Prioritäre Verwendung des vereinfachten Dateinamens
      const simplifiedFileName = "wealth-protection-zeichnungsschein.pdf";
      
      // Wir versuchen zuerst den vereinfachten Dateinamen
      const simplifiedPath = `/assets/docs/${simplifiedFileName}`;
      console.log("Versuche, PDF von vereinfachtem Pfad zu laden:", simplifiedPath);
      
      try {
        const response = await fetch(simplifiedPath);
        if (response.ok) {
          console.log("PDF erfolgreich von vereinfachtem Pfad geladen!");
          const templateBytes = await response.arrayBuffer();
          
          // Load the PDF
          const pdfDoc = await PDFDocument.load(new Uint8Array(templateBytes));
          const form = pdfDoc.getForm();
          
          // Debug: Log all form field names with detailed debugging
          const fields = form.getFields();
          console.log("Available form fields:", fields.map(field => {
            const name = field.getName();
            return {
              name: name,
              length: name.length,
              hexCodes: Array.from(name).map(c => c.charCodeAt(0).toString(16)).join(' ')
            };
          }));
          
          // Holt Zusatzinformationen aus localStorage für Geburtsort und Staatsangehörigkeit
          const birthPlace = localStorage.getItem("authorizedPersonBirthPlace") || "";
          const nationality = localStorage.getItem("authorizedPersonNationality") || profile.country || "Deutsch";
          
          // Fill form fields based on whether it's a company or individual
          if (profile.is_company) {
            // Fill company fields - with try/catch for each field to prevent errors
            trySetField(form, 'Firma Name und Rechtsform', profile.company_name || '');
            
            // Verbesserte Adressformatierung mit korrekter Straße+Hausnummer
            const fullAddress = formatAddress(profile);
            trySetField(form, 'Sitzadresse Hauptniederlassung', fullAddress);
            
            trySetField(form, 'Namen der gesetzlichen Vertreter', 
              `${profile.first_name || ''} ${profile.last_name || ''}`
            );
            trySetField(form, 'Telefon_2', profile.phone || '');
            trySetField(form, 'EMail_2', profile.email || '');
            trySetField(form, 'Handelsregister Nr / Registergericht', profile.trade_register_number || '');
            
            // Check boxes for company representation - with safety check
            try {
              const checkbox = form.getCheckBox('GFVorstand');
              if (checkbox) checkbox.check();
            } catch (e) {
              console.log("Checkbox 'GFVorstand' nicht gefunden oder kann nicht gesetzt werden");
            }
          } else {
            // Fill individual fields - with try/catch for each field
            trySetField(form, 'Name', profile.last_name || '');
            trySetField(form, 'Vornamen', profile.first_name || '');
            trySetField(form, 'Geburtsdatum', formatDate(profile.date_of_birth || ''));
            trySetField(form, 'Geburtsort', birthPlace);
            trySetField(form, 'Staatsangehörigkeit', nationality);
            
            // Verbesserte Adressformatierung
            const fullAddress = formatAddress(profile);
            trySetField(form, 'Wohnanschrift', fullAddress);
            
            trySetField(form, 'Telefon', profile.phone || '');
            trySetField(form, 'EMail', profile.email || '');
          }

          // Fill payment details - Nur die Zahl in Worten, ohne "Euro" am Ende
          const amountInWords = convertNumberToGermanWords(investment.amount);
          trySetField(form, 'Kaufbetrag in Worten', amountInWords);
          
          // Try multiple possible field names for the amount in numbers
          // Mit detailliertem Debug-Logging für jeden Versuch
          const amountFieldNames = [
            'Euro in Zahlen €', 
            'Euro in Zahlen', 
            'Euro  in Zahlen €', // Mit zusätzlichem Leerzeichen
            'Euro € in Zahlen',
            'Betrag in Euro', 
            'Betrag'
          ];
          
          let amountFieldSet = false;
          for (const fieldName of amountFieldNames) {
            try {
              console.log(`Versuche Betrag in Feld '${fieldName}' einzutragen`);
              const field = form.getTextField(fieldName);
              if (field) {
                field.setText(investment.amount.toString());
                amountFieldSet = true;
                console.log(`Betrag erfolgreich in Feld '${fieldName}' eingetragen`);
                break;
              }
            } catch (e) {
              console.log(`Fehler beim Setzen des Feldes '${fieldName}':`, e);
            }
          }
          
          // Wenn kein Feld für den Betrag gefunden wurde, suchen wir nach ähnlichen Feldnamen
          if (!amountFieldSet) {
            console.warn("Konnte kein Feld für den Betrag in Euro finden");
            
            // Suche nach ähnlichen Feldnamen
            const possibleMatches = fields
              .map(field => field.getName())
              .filter(name => name.toLowerCase().includes('euro') || name.toLowerCase().includes('zahlen'));
            
            if (possibleMatches.length > 0) {
              console.log("Mögliche passende Feldnamen gefunden:", possibleMatches);
              
              for (const fieldName of possibleMatches) {
                try {
                  const field = form.getTextField(fieldName);
                  if (field) {
                    field.setText(investment.amount.toString());
                    console.log(`Betrag in alternativen Feld '${fieldName}' eingetragen`);
                    amountFieldSet = true;
                    break;
                  }
                } catch (e) {
                  console.log(`Fehler beim Setzen des alternativen Feldes '${fieldName}':`, e);
                }
              }
            }
          }
          
          // Fill in the current date
          const currentDate = new Date();
          const formattedDate = `${profile.city || ''}, ${formatDate(currentDate.toISOString())}`;
          trySetField(form, 'Ort, Datum', formattedDate);

          try {
            // Flatten form to make it non-editable
            form.flatten();
          } catch (e) {
            console.warn("Konnte das Formular nicht abflachen:", e);
          }

          // Save the filled PDF
          const filledPdfBytes = await pdfDoc.save();
          
          // Generate a unique filename
          const timestamp = new Date().getTime();
          const filename = `zeichnungsschein_wealth_protection_${userId}_${timestamp}.pdf`;
          
          // Create a Blob from the PDF bytes
          const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
          
          // Create a download link
          const url = URL.createObjectURL(blob);

          // Optional: Store the URL in Supabase for future reference
          const { error: updateError } = await supabase
            .from('investments')
            .update({ document_url: url })
            .eq('id', investmentId);

          if (updateError) {
            console.error('Error updating investment with document URL:', updateError);
          }
          
          return url;
        }
      } catch (error) {
        console.error('Fehler beim Laden oder Verarbeiten des vereinfachten PDF-Pfads:', error);
      }
      
      // Fallback auf alte Methode, falls der vereinfachte Dateiname nicht funktioniert
      console.warn("Vereinfachter PDF-Pfad nicht gefunden oder Fehler beim Verarbeiten. Versuche Fallback-Optionen...");
      
      // Fallback-Pfade
      const possiblePaths = [
        // Original filename with various encodings
        `/assets/docs/E-Zeichnungsschein_2 % FI Wealth Protection Anleihe 2024 -2027_DE.pdf`,
        `/assets/docs/E-Zeichnungsschein_2 FI Wealth Protection Anleihe 2024 -2027_DE.pdf`,
        `/assets/docs/${encodeURIComponent("E-Zeichnungsschein_2 % FI Wealth Protection Anleihe 2024 -2027_DE.pdf")}`,
        `${window.location.origin}/assets/docs/wealth-protection-zeichnungsschein.pdf`,
        `${window.location.origin}/assets/docs/E-Zeichnungsschein_2 % FI Wealth Protection Anleihe 2024 -2027_DE.pdf`,
        `${window.location.origin}/assets/docs/${encodeURIComponent("E-Zeichnungsschein_2 % FI Wealth Protection Anleihe 2024 -2027_DE.pdf")}`
      ];
      
      for (const path of possiblePaths) {
        console.log("Versuche Fallback-Pfad:", path);
        try {
          const response = await fetch(path);
          if (response.ok) {
            console.log("PDF erfolgreich von Fallback-Pfad geladen:", path);
            // Rest des PDFs Verarbeitungslogik bleibt gleich...
            // ... (dasselbe Code wie oben, aber ich verkürze das hier zur Lesbarkeit)
            
            // Template Bytes laden
            const templateBytes = await response.arrayBuffer();
            const pdfDoc = await PDFDocument.load(new Uint8Array(templateBytes));
            
            // Debug: Log all form field names
            const form = pdfDoc.getForm();
            console.log("Available form fields:", form.getFields().map(field => field.getName()));
            
            // Füllen des PDFs mit Daten (identisch zum vorherigen Block, aber mit sicherer Feldprüfung)
            // ... Rest des PDF-Verarbeitungscode identisch zum vorherigen Block
            
            // Fill form fields based on whether it's a company or individual
            if (profile.is_company) {
              // Company fields with safety checks
              trySetField(form, 'Firma Name und Rechtsform', profile.company_name || '');
              trySetField(form, 'Sitzadresse Hauptniederlassung', 
                `${profile.street || ''}, ${profile.postal_code || ''} ${profile.city || ''}, ${profile.country || ''}`
              );
              trySetField(form, 'Namen der gesetzlichen Vertreter', 
                `${profile.first_name || ''} ${profile.last_name || ''}`
              );
              trySetField(form, 'Telefon_2', profile.phone || '');
              trySetField(form, 'EMail_2', profile.email || '');
              trySetField(form, 'Handelsregister Nr / Registergericht', profile.trade_register_number || '');
              
              try {
                const checkbox = form.getCheckBox('GFVorstand');
                if (checkbox) checkbox.check();
              } catch (e) {
                console.log("Checkbox 'GFVorstand' nicht gefunden oder kann nicht gesetzt werden");
              }
            } else {
              // Individual fields with safety checks
              trySetField(form, 'Name', profile.last_name || '');
              trySetField(form, 'Vornamen', profile.first_name || '');
              trySetField(form, 'Geburtsdatum', formatDate(profile.date_of_birth || ''));
              trySetField(form, 'Staatsangehörigkeit', profile.country || '');
              trySetField(form, 'Wohnanschrift', 
                `${profile.street || ''}, ${profile.postal_code || ''} ${profile.city || ''}, ${profile.country || ''}`
              );
              trySetField(form, 'Telefon', profile.phone || '');
              trySetField(form, 'EMail', profile.email || '');
            }
            
            // Fill payment details with multiple possible field names
            const amountInWords = convertNumberToGermanWords(investment.amount) + ' Euro';
            trySetField(form, 'Kaufbetrag in Worten', amountInWords);
            
            // Try multiple possible field names for the amount in numbers
            const amountFieldNames = ['Euro in Zahlen €', 'Euro in Zahlen', 'Betrag in Euro', 'Betrag'];
            let amountFieldSet = false;
            for (const fieldName of amountFieldNames) {
              try {
                const field = form.getTextField(fieldName);
                if (field) {
                  field.setText(investment.amount.toString());
                  amountFieldSet = true;
                  console.log(`Betrag erfolgreich in Feld '${fieldName}' eingetragen`);
                  break;
                }
              } catch (e) {
                // Continue to the next field name
              }
            }
            
            if (!amountFieldSet) {
              console.warn("Konnte kein Feld für den Betrag in Euro finden");
            }
            
            // Fill in the current date
            const currentDate = new Date();
            const formattedDate = `${profile.city || ''}, ${formatDate(currentDate.toISOString())}`;
            trySetField(form, 'Ort, Datum', formattedDate);
            
            try {
              // Flatten form to make it non-editable
              form.flatten();
            } catch (e) {
              console.warn("Konnte das Formular nicht abflachen:", e);
            }
            
            // Save the filled PDF
            const filledPdfBytes = await pdfDoc.save();
            
            // Generate a unique filename
            const timestamp = new Date().getTime();
            const filename = `zeichnungsschein_wealth_protection_${userId}_${timestamp}.pdf`;
            
            // Create a Blob from the PDF bytes
            const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
            
            // Create a download link
            const url = URL.createObjectURL(blob);
            
            // Optional: Store the URL in Supabase for future reference
            const { error: updateError } = await supabase
              .from('investments')
              .update({ document_url: url })
              .eq('id', investmentId);
              
            if (updateError) {
              console.error('Error updating investment with document URL:', updateError);
            }
            
            return url;
          }
        } catch (error) {
          console.error(`Fehler beim Laden des PDF von ${path}:`, error);
        }
      }
      
      // Wenn wir hier ankommen, konnte kein PDF geladen werden
      throw new Error("PDF-Vorlage konnte nicht geladen werden. Bitte überprüfen Sie, ob die Datei existiert.");
    } catch (error) {
      console.error("Exception generating PDF:", error);
      toast.error("Fehler beim Generieren des PDFs");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Hilfsfunktion für die korrekte Formatierung der Adresse
  const formatAddress = (profile: any): string => {
    // Versuche zuerst die getrennte Hausnummer zu finden
    const street = profile.street || '';
    
    // Überprüfe, ob die Straße eine Hausnummer enthält (für alte Daten)
    const streetWithNumber = street.includes(' ') && /\d+/.test(street.split(' ').pop() || '') 
      ? street  // Straße hat bereits eine Hausnummer
      : street; // Straße ohne Hausnummer
      
    return `${streetWithNumber}, ${profile.postal_code || ''} ${profile.city || ''}${profile.country ? ', ' + profile.country : ''}`.trim();
  };
  
  // Helper function to safely set form field values
  const trySetField = (form: any, fieldName: string, value: string) => {
    try {
      const field = form.getTextField(fieldName);
      if (field) {
        field.setText(value);
        console.log(`Feld '${fieldName}' erfolgreich mit Wert '${value}' gesetzt`);
        return true;
      } else {
        console.log(`Feld '${fieldName}' nicht gefunden`);
      }
    } catch (e) {
      console.log(`Fehler beim Setzen des Feldes '${fieldName}':`, e);
    }
    return false;
  };
  
  return {
    generatePdf,
    isGenerating
  };
}
