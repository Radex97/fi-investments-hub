import { useEffect, useRef } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const imgRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-scale-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleStartClick = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <section className="bg-neutral-50 px-4 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:gap-12">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div ref={imgRef} className="opacity-0 rounded-2xl shadow-lg h-64 md:h-[400px] overflow-hidden relative">
              <AspectRatio ratio={16/9} className="w-full h-full">
                <img 
                  src="/lovable-uploads/c2de20b6-eac2-4167-8efa-e1d3c3a07a8d.png" 
                  alt="Financial market bull statue with stock chart" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-fi-blue/30 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="glass-panel px-6 py-4 text-center">
                    <span className="text-fi-blue font-medium">FI Investments</span>
                  </div>
                </div>
              </AspectRatio>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="fi-fade-up fi-delay-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl text-neutral-900 font-bold mb-4 leading-tight">
                Ihre finanzielle Zukunft beginnt hier
              </h1>
            </div>
            
            <div className="fi-fade-up fi-delay-2">
              <p className="text-neutral-700 text-lg mb-8">
                Entdecken Sie maßgeschneiderte Finanzlösungen für Ihre individuellen Bedürfnisse
              </p>
            </div>
            
            <div className="fi-fade-up fi-delay-3 flex space-x-4">
              <Button 
                className="fi-button w-full md:w-auto"
                onClick={handleStartClick}
              >
                Jetzt Starten
              </Button>
              <Button 
                variant="outline"
                className="w-full md:w-auto"
                onClick={handleLoginClick}
              >
                Anmelden
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
