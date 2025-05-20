
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import FAQAccordion from "@/components/FAQAccordion";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t('messageSent'),
      description: t('thankYouForInquiry'),
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="fixed w-full top-0 z-50 bg-fi-blue px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-fi-gold">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <span className="text-white font-bold text-xl">{t('customerService')}</span>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow pt-20 px-4 pb-8">
        <section className="mt-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('frequentlyAskedQuestions')}</h2>
          <FAQAccordion />
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('contactForm')}</h2>
          <Card className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('name')}</Label>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('yourName')}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('yourEmail')}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="message">{t('message')}</Label>
                <Textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('yourMessage')}
                  className="mt-1 min-h-[120px]"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-fi-gold hover:bg-fi-gold/90">
                <Send className="h-4 w-4 mr-2" />
                {t('send')}
              </Button>
            </form>
          </Card>
        </section>
      </main>

      <footer className="mt-auto bg-fi-blue text-white text-sm py-4 px-4">
        <div className="flex justify-between mb-4">
          <Link to="/impressum" className="hover:text-fi-gold transition-colors">{t('impressum')}</Link>
          <Link to="/datenschutz" className="hover:text-fi-gold transition-colors">{t('privacy')}</Link>
          <Link to="/agb" className="hover:text-fi-gold transition-colors">{t('termsAndConditions')}</Link>
        </div>
        <p className="text-center text-xs opacity-75">{t('copyright')}</p>
      </footer>
    </div>
  );
};

export default FAQ;
