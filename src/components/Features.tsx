
import { useEffect, useRef } from "react";

const FeatureItem = ({ icon, title, description, delay }: { 
  icon: string; 
  title: string; 
  description: string;
  delay: string;
}) => {
  const featureRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (featureRef.current) {
      observer.observe(featureRef.current);
    }
    
    return () => {
      if (featureRef.current) {
        observer.unobserve(featureRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={featureRef} 
      className={`opacity-0 ${delay} flex items-start gap-4 mb-8 md:mb-0 transition-all duration-300 hover:transform hover:translate-y-[-5px]`}
    >
      <div className="bg-neutral-50 p-3 rounded-xl">
        <svg 
          className="fi-icon w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-neutral-600">{description}</p>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <section className="fi-section bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Warum uns vertrauen?</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Wir kombinieren jahrelange Erfahrung mit modernster Technologie für optimale Ergebnisse</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureItem 
            icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
            title="Sicher & Zuverlässig" 
            description="Ihr Vermögen in sicheren Händen mit modernster Technologie" 
            delay="fi-delay-1"
          />
          
          <FeatureItem 
            icon="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" 
            title="Expertenwissen" 
            description="Profitieren Sie von unserer jahrelangen Erfahrung" 
            delay="fi-delay-2"
          />
          
          <FeatureItem 
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            title="Maßgeschneiderte Lösungen" 
            description="Individuell angepasste Finanzstrategien für Ihre Ziele" 
            delay="fi-delay-3"
          />
          
          <FeatureItem 
            icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
            title="Performance" 
            description="Optimierte Anlagestrategien für Ihre Rendite" 
            delay="fi-delay-4"
          />
          
          <FeatureItem 
            icon="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" 
            title="Persönliche Beratung" 
            description="Individuelle Unterstützung durch unsere Experten" 
            delay="fi-delay-5"
          />
          
          <FeatureItem 
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            title="Transparent & Fair" 
            description="Klare Kosten und nachvollziehbare Prozesse" 
            delay="fi-delay-6"
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
