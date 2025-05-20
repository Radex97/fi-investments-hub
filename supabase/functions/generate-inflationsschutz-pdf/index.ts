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

// Function to load PDF templates with multiple fallback approaches
async function loadPdfTemplate(): Promise<Uint8Array> {
  try {
    console.log('Versuche PDF-Template für Inflationsschutz zu laden...');
    
    // Try direct URL with % character
    const templateUrlWithPercent = "https://vsxbmdghnqyhcyldjdoa.supabase.co/storage/v1/object/public/public/assets/docs/E-Zeichnungsschein_5 % FI Inflationsschutz PLUS Anleihe 2024 -2027_DE.pdf";
    
    try {
      console.log('Versuche, PDF von dieser URL zu laden (mit %):', templateUrlWithPercent);
      const response = await fetch(templateUrlWithPercent);
      
      if (response.ok) {
        console.log('PDF erfolgreich geladen (mit %)');
        return new Uint8Array(await response.arrayBuffer());
      }
    } catch (e) {
      console.error('Fehler beim Laden des PDF-Templates (mit %):', e);
    }
    
    // Try without % character (might be URL encoding issue)
    const templateUrlNoPercent = "https://vsxbmdghnqyhcyldjdoa.supabase.co/storage/v1/object/public/public/assets/docs/E-Zeichnungsschein_5 FI Inflationsschutz PLUS Anleihe 2024 -2027_DE.pdf";
    
    try {
      console.log('Versuche, PDF von dieser URL zu laden (ohne %):', templateUrlNoPercent);
      const response = await fetch(templateUrlNoPercent);
      
      if (response.ok) {
        console.log('PDF erfolgreich geladen (ohne %)');
        return new Uint8Array(await response.arrayBuffer());
      }
    } catch (e) {
      console.error('Fehler beim Laden des PDF-Templates (ohne %):', e);
    }
    
    // Try URL-encoded version
    const encodedPart = encodeURIComponent("E-Zeichnungsschein_5 % FI Inflationsschutz PLUS Anleihe 2024 -2027_DE.pdf");
    const templateUrlEncoded = `https://vsxbmdghnqyhcyldjdoa.supabase.co/storage/v1/object/public/public/assets/docs/${encodedPart}`;
    
    try {
      console.log('Versuche, PDF von URL-encoded Pfad zu laden:', templateUrlEncoded);
      const response = await fetch(templateUrlEncoded);
      
      if (response.ok) {
        console.log('PDF erfolgreich von URL-encoded Pfad geladen');
        return new Uint8Array(await response.arrayBuffer());
      }
    } catch (e) {
      console.error('Fehler beim Laden vom URL-encoded Pfad:', e);
    }
    
    // If all attempts fail, throw an error
    throw new Error('Die PDF-Vorlage konnte nicht geladen werden - bitte stellen Sie sicher, dass sie im Bucket existiert.');
  } catch (error) {
    console.error('Fehler beim Laden der PDF-Vorlage:', error);
    throw new Error('Die PDF-Vorlage konnte nicht geladen werden');
  }
}

// Format date to DD.MM.YYYY
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
}

// Helper function for formatting addresses
function formatAddress(profile: any): string {
  const street = profile.street || '';
  
  // Check if street already contains a house number (for old data)
  const streetWithNumber = street.includes(' ') && /\d+/.test(street.split(' ').pop() || '') 
    ? street  // Street already has a house number
    : street; // Street without house number
    
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
    // Parse request data
    const { investmentId, userId, productId, signatureData } = await req.json();
    
    console.log("Received request for Inflationsschutz PDF with data:", { 
      investmentId: investmentId ? "provided" : "missing", 
      userId: userId ? "provided" : "missing",
      productId: productId ? productId : "missing",
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

    console.log("Investment data retrieved:", {
      id: investment.id,
      productId: investment.product_id,
      productTitle: investment.product_title
    });

    // Get the product data directly
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId || investment.product_id)
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      // Still proceed even if product is not found
    } else {
      console.log("Product data retrieved:", {
        id: product.id,
        title: product.title,
        slug: product.slug
      });
    }

    // Verify this is the Inflationsschutz PLUS product - check multiple fields
    const isInflationsschutzPlus = 
      (product?.title?.toLowerCase() || '').includes('inflationsschutz') ||
      product?.slug === 'inflationsschutz-plus' ||
      (investment.product_title?.toLowerCase() || '').includes('inflationsschutz');
                              
    if (!isInflationsschutzPlus) {
      console.log("Product validation failed:", {
        productTitle: product?.title || investment.product_title,
        slug: product?.slug,
        expected: "Inflationsschutz PLUS"
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'PDF generation only supported for Inflationsschutz PLUS product',
          details: {
            productTitle: product?.title || investment.product_title,
            productId: productId || investment.product_id
          }
        }),
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

    console.log("Loading PDF template for Inflationsschutz PLUS");
    // Load the PDF template
    const pdfBytes = await loadPdfTemplate();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    
    // Debug: Log all form field names
    const fields = form.getFields();
    console.log("Available form fields in Inflationsschutz PDF:", fields.map(field => field.getName()));

    // Fill form fields based on whether it's a company or individual
    if (profile.is_company) {
      // Fill company fields
      trySetField(form, 'Firma Name und Rechtsform', profile.company_name || '');
      
      // Address formatting
      const fullAddress = formatAddress(profile);
      trySetField(form, 'Sitzadresse Hauptniederlassung', fullAddress);
      
      trySetField(form, 'Namen der gesetzlichen Vertreter', 
        `${profile.first_name || ''} ${profile.last_name || ''}`
      );
      trySetField(form, 'Telefon_2', profile.phone || '');
      trySetField(form, 'EMail_2', profile.email || '');
      trySetField(form, 'Handelsregister Nr / Registergericht', profile.trade_register_number || '');
      
      // Check boxes for company representation
      try {
        const checkbox = form.getCheckBox('GFVorstand');
        if (checkbox) checkbox.check();
      } catch (e) {
        console.log("Checkbox 'GFVorstand' nicht gefunden oder kann nicht gesetzt werden");
      }
    } else {
      // Fill individual fields
      trySetField(form, 'Name', profile.last_name || '');
      trySetField(form, 'Vornamen', profile.first_name || '');
      trySetField(form, 'Geburtsdatum', formatDate(profile.date_of_birth || ''));
      trySetField(form, 'Geburtsort', profile.birth_place || profile.city || '');
      trySetField(form, 'Staatsangehörigkeit', profile.nationality || profile.country || '');
      
      // Address formatting
      const fullAddress = formatAddress(profile);
      trySetField(form, 'Wohnanschrift', fullAddress);
      
      trySetField(form, 'Telefon', profile.phone || '');
      trySetField(form, 'EMail', profile.email || '');
    }

    // Fill payment details
    // Convert amount to words, without "Euro" at the end
    const amountInWords = convertNumberToGermanWords(investment.amount);
    trySetField(form, 'Kaufbetrag in Worten', amountInWords);
    
    // Try multiple possible field names for the amount in numbers
    const amountFieldNames = [
      'Euro in Zahlen €', 
      'Euro in Zahlen', 
      'Euro  in Zahlen €',
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
    
    // If no amount field found, search for similar field names
    if (!amountFieldSet) {
      console.warn("Konnte kein Feld für den Betrag in Euro finden");
      
      // Look for possible matching fields
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
          
          // Calculate position for signature
          const { width } = page.getSize();
          
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
    const filename = `zeichnungsschein_inflationsschutz_${userId}_${timestamp}.pdf`;
    
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
