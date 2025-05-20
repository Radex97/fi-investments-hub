
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
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

// Function to check if a URL exists by making a HEAD request
async function urlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    console.error(`Error checking URL ${url}:`, e);
    return false;
  }
}

// Function to load PDF templates with multiple fallback options
async function loadPdfTemplate(): Promise<Uint8Array> {
  try {
    console.log('Versuche PDF-Template für Wealth Protection zu laden...');
    
    // Define all possible URLs where the template might be stored
    const possibleUrls = [
      // Primary URL - simplified name
      "https://vsxbmdghnqyhcyldjdoa.supabase.co/storage/v1/object/public/public/assets/docs/wealth-protection-zeichnungsschein.pdf",
      
      // Alternative URLs with different naming conventions
      "https://vsxbmdghnqyhcyldjdoa.supabase.co/storage/v1/object/public/public/assets/docs/E-Zeichnungsschein_2%20%25%20FI%20Wealth%20Protection%20Anleihe%202024%20-2027_DE.pdf",
      "https://vsxbmdghnqyhcyldjdoa.supabase.co/storage/v1/object/public/public/assets/docs/E-Zeichnungsschein_2 % FI Wealth Protection Anleihe 2024 -2027_DE.pdf",
      "https://vsxbmdghnqyhcyldjdoa.supabase.co/storage/v1/object/public/public/assets/docs/E-Zeichnungsschein_2 FI Wealth Protection Anleihe 2024 -2027_DE.pdf"
    ];
    
    // Try each URL until one works
    for (const url of possibleUrls) {
      console.log('Versuche, PDF-Template zu laden von:', url);
      
      // First check if the URL exists
      const exists = await urlExists(url);
      if (!exists) {
        console.log(`URL existiert nicht: ${url}`);
        continue;
      }
      
      try {
        const response = await fetch(url);
        
        if (response.ok) {
          console.log(`PDF erfolgreich geladen von: ${url}`);
          return new Uint8Array(await response.arrayBuffer());
        } else {
          console.error(`Fehler beim Laden von ${url}: ${response.status} ${response.statusText}`);
        }
      } catch (e) {
        console.error(`Fehler beim Laden von ${url}:`, e);
      }
    }
    
    // If we reach here, none of the URLs worked
    throw new Error('Die PDF-Vorlage konnte von keinem Pfad geladen werden. Bitte überprüfen Sie, ob die Datei im Bucket existiert.');
  } catch (error) {
    console.error('Fehler beim Laden der PDF-Vorlage:', error);
    throw error;
  }
}

// Format date to DD.MM.YYYY
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
}

// Hilfsfunktion für die korrekte Formatierung der Adresse
function formatAddress(profile: any): string {
  // Versuche zuerst die getrennte Hausnummer zu finden
  const street = profile.street || '';
  
  // Überprüfe, ob die Straße eine Hausnummer enthält (für alte Daten)
  const streetWithNumber = street.includes(' ') && /\d+/.test(street.split(' ').pop() || '') 
    ? street  // Straße hat bereits eine Hausnummer
    : street; // Straße ohne Hausnummer
    
  return `${streetWithNumber}, ${profile.postal_code || ''} ${profile.city || ''}${profile.country ? ', ' + profile.country : ''}`.trim();
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Get API keys from environment
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  // Initialize Supabase client with service role for admin access
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // First, check if the public bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return new Response(
        JSON.stringify({ error: 'Error checking storage buckets', details: bucketsError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Check if public bucket exists
    const publicBucketExists = buckets.some(bucket => bucket.name === 'public');
    if (!publicBucketExists) {
      console.error("The 'public' storage bucket does not exist!");
      return new Response(
        JSON.stringify({ 
          error: 'Storage configuration error', 
          details: "Der 'public' Storage-Bucket existiert nicht. Bitte erstellen Sie diesen Bucket in der Supabase-Konsole."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Check if PDF template exists in bucket
    const { data: files, error: filesError } = await supabase
      .storage
      .from('public')
      .list('assets/docs');
    
    if (filesError) {
      console.error("Error listing files in assets/docs directory:", filesError);
      return new Response(
        JSON.stringify({ 
          error: 'Error checking for PDF templates', 
          details: filesError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log available files for debugging
    console.log("Available files in assets/docs:", files.map(f => f.name));
    
    // Check for the template file
    const templateExists = files.some(file => 
      file.name === 'wealth-protection-zeichnungsschein.pdf' || 
      file.name.includes('Wealth Protection')
    );
    
    if (!templateExists) {
      console.error("PDF template for Wealth Protection not found in storage!");
      return new Response(
        JSON.stringify({ 
          error: 'Missing PDF template', 
          details: "Die PDF-Vorlage für 'Wealth Protection' wurde nicht im Storage gefunden. Bitte laden Sie die Datei hoch."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Parse request data
    const { investmentId, userId, productId, signatureData } = await req.json();
    
    console.log("Received request with data:", { 
      investmentId: investmentId ? "provided" : "missing", 
      userId: userId ? "provided" : "missing",
      productId: productId ? "provided" : "missing",
      signatureData: signatureData ? "provided" : "missing"
    });

    if (!investmentId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Investment ID and User ID are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the investment data
    const { data: investment, error: investmentError } = await supabase
      .from('investments')
      .select('*')
      .eq('id', investmentId)
      .eq('user_id', userId)
      .single();

    if (investmentError || !investment) {
      console.error('Error fetching investment:', investmentError);
      return new Response(
        JSON.stringify({ error: 'Investment not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get the product data separately since there's no direct foreign key relationship
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', investment.product_id)
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      // Still proceed even if product is not found
    }

    // Check if this is the Wealth Protection product
    const isWealthProtection = product?.title?.includes('Wealth Protection') || 
                              investment.product_title?.includes('Wealth Protection');
                              
    if (!isWealthProtection) {
      return new Response(
        JSON.stringify({ error: 'PDF generation only supported for Wealth Protection product' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log("Loading PDF template");
    // Load the PDF template using our improved function
    const pdfBytes = await loadPdfTemplate();
    const pdfDoc = await PDFDocument.load(pdfBytes);
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

    // Fill form fields based on whether it's a company or individual
    if (profile.is_company) {
      // Fill company fields - with safe field access
      trySetField(form, 'Firma Name und Rechtsform', profile.company_name || '');
      
      // Verbesserte Adressformatierung
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
      // Fill individual fields - with safe field access
      trySetField(form, 'Name', profile.last_name || '');
      trySetField(form, 'Vornamen', profile.first_name || '');
      trySetField(form, 'Geburtsdatum', formatDate(profile.date_of_birth || ''));
      
      // Die Stadt des Profils als Fallback für den Geburtsort verwenden (wenn nicht explizit bekannt)
      trySetField(form, 'Geburtsort', profile.city || '');
      
      // Land des Profils als Staatsangehörigkeit verwenden
      trySetField(form, 'Staatsangehörigkeit', profile.country || '');
      
      // Verbesserte Adressformatierung
      const fullAddress = formatAddress(profile);
      trySetField(form, 'Wohnanschrift', fullAddress);
      
      trySetField(form, 'Telefon', profile.phone || '');
      trySetField(form, 'EMail', profile.email || '');
    }

    // Fill payment details - use multiple possible field names
    // Nur die Zahl in Worten, ohne "Euro" am Ende
    const amountInWords = convertNumberToGermanWords(investment.amount);
    trySetField(form, 'Kaufbetrag in Worten', amountInWords);
    
    // Try multiple possible field names for the amount in numbers
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

    // Add signature if provided
    let signatureAdded = false;
    if (signatureData) {
      try {
        console.log("Signature data provided, adding to PDF");
        // Extract the base64 data
        const base64Data = signatureData.split(',')[1];
        
        if (base64Data) {
          // Convert base64 to bytes
          const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          // Embed the image in the PDF
          const signatureImage = await pdfDoc.embedPng(signatureBytes);
          
          // Get page where signature should go
          const page = pdfDoc.getPage(0); // Assuming signature goes on first page
          
          // Calculate position for signature (this may need adjustment based on the PDF template)
          const { width, height } = page.getSize();
          
          // Draw signature image
          page.drawImage(signatureImage, {
            x: width / 2 - 100,
            y: 150, // Position from bottom of page
            width: 200,
            height: 100,
          });
          
          signatureAdded = true;
          console.log("Signature successfully added to PDF");
          
          // Also update the investment record with signature information
          await supabase
            .from('investments')
            .update({
              signature_provided: true,
              signature_date: new Date().toISOString()
            })
            .eq('id', investmentId);
        }
      } catch (e) {
        console.error("Error adding signature to PDF:", e);
      }
    }

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
    
    console.log("Uploading PDF to storage");
    // Store the file in Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('public')
      .upload(`assets/docs/${filename}`, filledPdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log("PDF uploaded successfully, generating public URL");
    // Get public URL for the uploaded file
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/public/assets/docs/${filename}`;

    // Update the investment with the document URL and signature info if added
    const updateData: any = { document_url: publicUrl };
    if (signatureAdded) {
      updateData.signature_url = publicUrl;
    }
    
    console.log("Updating investment record with document URL", publicUrl);
    const { error: updateError } = await supabase
      .from('investments')
      .update(updateData)
      .eq('id', investmentId);

    if (updateError) {
      console.error('Error updating investment with document URL:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update investment record', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log("PDF generation completed successfully");
    return new Response(
      JSON.stringify({ success: true, url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in PDF generation:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF document', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to convert numbers to German words - ohne "Euro"
function convertNumberToGermanWords(number: number): string {
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
}

