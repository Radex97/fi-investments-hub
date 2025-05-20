
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChartLine, Shield, TrendingUp, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import ProductFilter from "@/components/ProductFilter";
import ProductCard from "@/components/ProductCard";
import MobileFooter from "@/components/MobileFooter";

// Product type definition
type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
  risk: "niedrig" | "mittel" | "hoch";
  return: string;
  category: string;
};

// Modified product data - removing the FI Wealth Protection Institutional product
const products: Product[] = [
  {
    id: "wealth-protection",
    title: "FI Wealth Protection",
    description: "Kapitalschutz mit der Chance auf eine angemessene Rendite",
    image: "bg-gradient-to-br from-blue-100 to-blue-200",
    risk: "mittel",
    return: "13-14% p.a.",
    category: "Kapitalanlage"
  },
  {
    id: "inflationsschutz-plus",
    title: "FI Inflationsschutz PLUS",
    description: "Inflationsschutz mit der Chance auf eine angemessene Rendite",
    image: "bg-gradient-to-br from-green-100 to-green-200",
    risk: "mittel",
    return: "8-9% p.a.",
    category: "Inflationsschutz"
  }
];

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [displayCount, setDisplayCount] = useState(4);

  useEffect(() => {
    // Set document title
    document.title = "FI Investments | Finanzprodukte";
    
    // Filter Products Based on search and filters
    let result = products;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.title.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    if (selectedRisk) {
      result = result.filter(product => product.risk === selectedRisk);
    }
    
    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, selectedRisk]);

  const loadMore = () => {
    setDisplayCount(prevCount => Math.min(prevCount + 4, filteredProducts.length));
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "niedrig":
        return <Shield className="h-4 w-4 text-fi-gold" />;
      case "mittel":
        return <ChartLine className="h-4 w-4 text-fi-gold" />;
      case "hoch":
        return <AlertCircle className="h-4 w-4 text-fi-gold" />;
      default:
        return <TrendingUp className="h-4 w-4 text-fi-gold" />;
    }
  };

  // Updated function to handle product navigation correctly
  const handleProductClick = (productId: string) => {
    console.log("Product clicked in catalog:", productId);
    
    // Special case for specific products that have their own routes
    if (productId === "inflationsschutz-plus") {
      console.log("Navigating to inflationsschutz plus");
      navigate(`/product/inflationsschutz-plus`);
    } else {
      console.log("Navigating to standard product");
      navigate(`/product/${productId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow pb-24">
        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Finanzprodukte suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10"
          />
          <button 
            className="absolute right-3 top-2 text-fi-gold"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
        
        {showFilters && (
          <ProductFilter 
            onCategoryChange={setSelectedCategory}
            onRiskChange={setSelectedRisk}
            selectedCategory={selectedCategory}
            selectedRisk={selectedRisk}
          />
        )}
        
        <div className="mb-8">
          <h1 className="text-2xl text-neutral-800">Finanzprodukte</h1>
          <p className="text-neutral-600">Entdecken Sie unsere Auswahl an Finanzprodukten</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.slice(0, displayCount).map(product => (
            <ProductCard 
              key={product.id}
              title={product.title}
              description={product.description}
              imagePlaceholder={product.image}
              risk={product.risk}
              riskIcon={getRiskIcon(product.risk)}
              returnValue={product.return}
              onClick={() => {
                console.log(`Product ${product.id} card clicked`);
                handleProductClick(product.id);
              }}
            />
          ))}
        </div>
        
        {displayCount < filteredProducts.length && (
          <div className="mt-8 text-center">
            <Button onClick={loadMore} className="bg-[#222733] hover:bg-[#303950]">
              Mehr laden
            </Button>
          </div>
        )}
      </main>
      <MobileFooter />
    </div>
  );
};

export default ProductCatalog;
