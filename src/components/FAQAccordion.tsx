
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQAccordion = () => {
  const faqItems = [
    {
      question: "Wie kann ich ein Konto eröffnen?",
      answer: "Sie können ein Konto eröffnen, indem Sie auf unserer Website den Registrierungsprozess durchlaufen. Füllen Sie das Anmeldeformular mit Ihren persönlichen Daten aus und folgen Sie den Anweisungen zur Identitätsverifizierung. Nach erfolgreicher Verifizierung wird Ihr Konto aktiviert."
    },
    {
      question: "Wie ändere ich meine Kontaktdaten?",
      answer: "Sie können Ihre Kontaktdaten in Ihrem Profil unter 'Profilverwaltung' ändern. Dort haben Sie die Möglichkeit, Ihre E-Mail-Adresse, Telefonnummer und Postanschrift zu aktualisieren. Aus Sicherheitsgründen kann eine erneute Identitätsverifizierung erforderlich sein."
    },
    {
      question: "Sicherheit & Datenschutz",
      answer: "Wir setzen höchste Sicherheitsstandards ein, um Ihre persönlichen Daten und Investitionen zu schützen. Alle Verbindungen sind TLS/SSL-verschlüsselt, und wir verwenden eine Zwei-Faktor-Authentifizierung für zusätzlichen Schutz. Ihre Daten werden in Übereinstimmung mit der DSGVO verarbeitet und nicht an Dritte weitergegeben."
    },
    {
      question: "Welche Investitionsprodukte bieten Sie an?",
      answer: "Wir bieten verschiedene Investitionsprodukte an, darunter FI Wealth Protection, FI Wealth Protection Institutional und FI Inflationsschutz PLUS. Jedes Produkt hat unterschiedliche Risiko-Rendite-Profile und ist für verschiedene Anlageziele konzipiert. Details zu jedem Produkt finden Sie in unserem Produktkatalog."
    },
    {
      question: "Wie kann ich Geld auf mein Konto einzahlen?",
      answer: "Sie können Geld über Banküberweisung auf Ihr Konto einzahlen. Gehen Sie in Ihrem Dashboard auf 'Einzahlung' und folgen Sie den Anweisungen. Die Gutschrift erfolgt in der Regel innerhalb von 1-2 Werktagen nach Eingang der Zahlung."
    },
    {
      question: "Wie hoch sind die Gebühren?",
      answer: "Unsere Gebührenstruktur ist transparent und abhängig vom gewählten Produkt. In der Regel fallen keine versteckten Kosten oder Ausgabeaufschläge (Agio) an. Die genauen Gebühren für jedes Produkt finden Sie in den jeweiligen Produktinformationen."
    },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqItems.map((item, index) => (
        <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg mb-3 px-4">
          <AccordionTrigger className="text-left py-3">{item.question}</AccordionTrigger>
          <AccordionContent className="text-neutral-600 pb-3 pt-1">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQAccordion;
