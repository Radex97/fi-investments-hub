
import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Products from "@/components/Products";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/MobileFooter";

const Index = () => {
  useEffect(() => {
    // Smooth scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Add page title
    document.title = "FI Investments | Ihre finanzielle Zukunft";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-14 pb-16 md:pb-0">
        <Hero />
        <Features />
        <Products />
      </main>
      <Footer />
      <MobileFooter />
    </div>
  );
};

export default Index;
