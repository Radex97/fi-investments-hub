
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChartLine, Coins, Percent, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProductDetailHeader from "@/components/ProductDetailHeader";
import ProductDetailSection from "@/components/ProductDetailSection";
import MobileFooter from "@/components/MobileFooter";
import ProductDocuments from "@/components/ProductDocuments";
import { useProduct } from "@/hooks/useProduct";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id || "");

  useEffect(() => {
    if (product) {
      document.title = `FI Investments | ${product.title}`;
    }
  }, [product]);

  const handleInvestment = () => {
    if (!product) return;
    
    localStorage.setItem("currentProductTitle", product.title);
    localStorage.setItem("productId", product.id);
    navigate("/investment-amount", { 
      state: { 
        productTitle: product.title,
        productId: product.id 
      } 
    });
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <ProductDetailHeader />
        <main className="pt-16 pb-24 px-4 flex-grow flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-6 w-48 bg-neutral-200 rounded mx-auto mb-3"></div>
            <div className="h-4 w-64 bg-neutral-200 rounded mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }

  // Console log to debug document URLs
  console.log("Product document URLs:", {
    title: product.title,
    terms: product.terms_document_url,
    info: product.info_document_url
  });

  const investmentDetails = [
    { label: "Mindestinvestment", value: `€ ${product.minimum_investment.toLocaleString('de-DE')}` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <ProductDetailHeader />
      <main className="pt-16 pb-64 flex-grow">
        <div className="px-4 py-6">
          <h1 className="text-2xl text-[#222733] mb-3">{product.title}</h1>
          <p className="text-[#222733] mb-6">{product.description}</p>
          
          <div className="space-y-4">
            <ProductDetailSection icon={<ChartLine className="h-5 w-5" />} title="Rendite">
              <div className="flex justify-between">
                <span className="text-neutral-600">Erwartete Rendite</span>
                <span className="font-medium">{product.return_value}</span>
              </div>
            </ProductDetailSection>
            
            <ProductDetailSection icon={<Coins className="h-5 w-5" />} title="Investmentdetails">
              <ul className="space-y-2">
                {investmentDetails.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-neutral-600">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </li>
                ))}
              </ul>
            </ProductDetailSection>
            
            <ProductDetailSection icon={<ChartLine className="h-5 w-5" />} title="Risiko">
              <div className="flex justify-between">
                <span className="text-neutral-600">Risikoklasse</span>
                <span className="font-medium capitalize">{product.risk_level}</span>
              </div>
            </ProductDetailSection>
            
            <ProductDetailSection icon={<CheckCircle className="h-5 w-5" />} title="">
              <h2 className="text-neutral-700 font-medium">KEIN AGIO & KEINE KOSTEN</h2>
            </ProductDetailSection>
          </div>
        </div>
        
        <div className="fixed bottom-16 left-0 right-0 bg-white p-4 space-y-2 shadow-lg z-40">
          <Button 
            onClick={handleInvestment}
            className="w-full bg-[#B1904B] hover:bg-[#9a7b3f] text-white py-6 rounded-lg text-lg"
          >
            Zeichnung starten
          </Button>
          
          <ProductDocuments 
            termsDocumentUrl={product.terms_document_url}
            infoDocumentUrl={product.info_document_url}
            productTitle={product.title}
          />
        </div>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default ProductDetail;
