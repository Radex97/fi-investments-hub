
import { ReactNode } from "react";

interface ProductDetailSectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

const ProductDetailSection = ({ icon, title, children }: ProductDetailSectionProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-[#B1904B]">{icon}</div>
        <h2 className="font-medium">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export default ProductDetailSection;
