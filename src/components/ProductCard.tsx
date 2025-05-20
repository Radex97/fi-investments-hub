
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProductCardProps {
  title: string;
  description: string;
  imagePlaceholder?: string;
  imageUrl?: string;
  risk: string;
  riskIcon: ReactNode;
  returnValue: string;
  delay?: string;
  onClick?: () => void;
}

const ProductCard = ({ 
  title, 
  description, 
  imagePlaceholder, 
  imageUrl,
  risk, 
  riskIcon,
  returnValue,
  delay = "",
  onClick 
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleClick = () => {
    if (onClick) {
      console.log("ProductCard clicked, executing onClick handler");
      onClick();
    }
  };

  const handleImageError = () => {
    console.log("Image failed to load:", imageUrl);
    setImageError(true);
  };
  
  return (
    <div
      ref={cardRef}
      className={`bg-white shadow rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-lg ${isHovered ? 'scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <AspectRatio ratio={16/9}>
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={`${title}`}
              className="w-full h-full object-cover" 
              onError={handleImageError}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${imagePlaceholder || 'bg-gradient-to-br from-blue-100 to-blue-200'}`}>
              <span className="font-medium text-neutral-600">{title}</span>
            </div>
          )}
        </AspectRatio>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-neutral-600 mb-4 min-h-[60px]">{description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="flex items-center gap-1 text-sm">
            {riskIcon}
            <span className="capitalize">{risk}es Risiko</span>
          </span>
          <span className="text-sm font-medium">{returnValue}</span>
        </div>
        
        <Button 
          onClick={handleClick}
          className="w-full bg-[#003595] hover:bg-[#002b7a] text-white"
        >
          Details anzeigen
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
