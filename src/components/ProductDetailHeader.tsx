
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductDetailHeaderProps {
  showBackButton?: boolean;
}

const ProductDetailHeader = ({ showBackButton = true }: ProductDetailHeaderProps) => {
  return (
    <header className="fixed w-full top-0 z-50 bg-[#003595] px-4 py-3 flex items-center justify-between">
      {showBackButton ? (
        <Link to="/products" className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </Link>
      ) : (
        <div className="w-6"></div>
      )}
      
      <div className="flex-1 flex justify-center">
        <Link to="/">
          <img 
            src="/lovable-uploads/fi-logo-white.png" 
            alt="FI Investments" 
            className="h-8" 
          />
        </Link>
      </div>
      
      <div className="w-6"></div>
    </header>
  );
};

export default ProductDetailHeader;
