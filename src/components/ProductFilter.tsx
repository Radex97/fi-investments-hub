
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ProductFilterProps {
  onCategoryChange: (category: string | null) => void;
  onRiskChange: (risk: string | null) => void;
  selectedCategory: string | null;
  selectedRisk: string | null;
}

const ProductFilter = ({
  onCategoryChange,
  onRiskChange,
  selectedCategory,
  selectedRisk
}: ProductFilterProps) => {
  // Updated categories to only include those used by our three products
  const categories = [
    "Kapitalanlage",
    "Inflationsschutz"
  ];

  const riskLevels = [
    { id: "niedrig", label: "Niedrig" },
    { id: "mittel", label: "Mittel" },
    { id: "hoch", label: "Hoch" }
  ];

  const clearFilters = () => {
    onCategoryChange(null);
    onRiskChange(null);
  };

  return (
    <Card className="mb-6 bg-white shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Produktkategorie</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(selectedCategory === category ? null : category)}
                  className={`
                    ${selectedCategory === category ? "bg-fi-blue text-white" : ""}
                  `}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Risikoniveau</h3>
            <RadioGroup
              value={selectedRisk || ""}
              onValueChange={(value) => onRiskChange(value || null)}
              className="flex gap-4"
            >
              {riskLevels.map((level) => (
                <div key={level.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={level.id} id={`risk-${level.id}`} />
                  <Label htmlFor={`risk-${level.id}`}>{level.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="text-neutral-600"
            >
              Filter zurücksetzen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilter;
