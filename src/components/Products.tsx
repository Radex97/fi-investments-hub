
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ChartLine } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProducts } from "@/hooks/useProducts";

const Products = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: products, isLoading } = useProducts();

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const viewAllProducts = () => {
    navigate('/products');
  };
  
  // Updated function to handle product navigation correctly
  const handleProductClick = (productId: string) => {
    console.log("Product clicked in Products component:", productId);
    
    // Special case for specific products that have their own routes
    if (productId === "inflationsschutz-plus") {
      console.log("Navigating to inflationsschutz plus");
      navigate(`/product/inflationsschutz-plus`);
    } else {
      console.log("Navigating to standard product");
      navigate(`/product/${productId}`);
    }
  };

  if (isLoading) {
    return (
      <section className="fi-section bg-neutral-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="fi-section bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Unsere Produkte</h2>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex space-x-2">
              <button 
                onClick={scrollLeft}
                className="p-2 rounded-full bg-white shadow-sm hover:bg-neutral-100 transition-colors duration-200"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={scrollRight}
                className="p-2 rounded-full bg-white shadow-sm hover:bg-neutral-100 transition-colors duration-200"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <Button 
              variant="outline" 
              onClick={viewAllProducts}
              className="text-fi-gold border-fi-gold hover:bg-fi-gold/10"
            >
              Alle anzeigen
            </Button>
          </div>
        </div>
        
        {isMobile ? (
          <div className="flex flex-col gap-6">
            {products?.filter(product => !product.title.includes("Institutional")).map((product) => (
              <ProductCard 
                key={product.id}
                title={product.title} 
                description={product.description}
                imagePlaceholder="bg-gradient-to-br from-blue-100 to-blue-200"
                imageUrl={product.image_url}
                risk={product.risk_level}
                riskIcon={<ChartLine className="h-4 w-4 text-fi-gold" />}
                returnValue={product.return_value}
                onClick={() => {
                  console.log(`Product ${product.id} card clicked in mobile view`);
                  handleProductClick(product.id);
                }}
              />
            ))}
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {products?.filter(product => !product.title.includes("Institutional")).map((product) => (
              <ProductCard 
                key={product.id}
                title={product.title} 
                description={product.description}
                imagePlaceholder="bg-gradient-to-br from-blue-100 to-blue-200"
                imageUrl={product.image_url}
                risk={product.risk_level}
                riskIcon={<ChartLine className="h-4 w-4 text-fi-gold" />}
                returnValue={product.return_value}
                onClick={() => {
                  console.log(`Product ${product.id} card clicked in desktop view`);
                  handleProductClick(product.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
