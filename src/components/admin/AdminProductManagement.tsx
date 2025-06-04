
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Edit, Trash2, PlusCircle, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/hooks/useProducts";
import ImageUpload from "./ImageUpload";
import ProductDocumentManager from "./ProductDocumentManager";

const AdminProductManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("general");

  // Form state for new/edit product
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    return_value: "",
    risk_level: "",
    minimum_investment: 0,
    image_url: "",
    slug: "",
    terms_document_url: "",
    info_document_url: ""
  });

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Create/Update product mutation
  const mutation = useMutation({
    mutationFn: async (product: { 
      title: string; 
      description: string; 
      risk_level: string; 
      return_value: string; 
      minimum_investment: number;
      image_url?: string;
      slug?: string;
      terms_document_url?: string;
      info_document_url?: string;
    }) => {
      if (currentProduct) {
        const { error } = await supabase
          .from("products")
          .update(product as any)
          .eq("id", currentProduct.id as any);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert(product as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(currentProduct ? "Produkt aktualisiert" : "Produkt erstellt");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Speichern", {
        description: error.message
      });
    }
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Produkt gelöscht");
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen", {
        description: error.message
      });
    }
  });

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      id: product.id,
      title: product.title,
      description: product.description,
      return_value: product.return_value,
      risk_level: product.risk_level,
      minimum_investment: product.minimum_investment,
      image_url: product.image_url || "",
      slug: product.slug || "",
      terms_document_url: product.terms_document_url || "",
      info_document_url: product.info_document_url || ""
    });
    setSelectedTab("general");
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setCurrentProduct(null);
    setFormData({
      id: "",
      title: "",
      description: "",
      return_value: "",
      risk_level: "",
      minimum_investment: 1000,
      image_url: "",
      slug: "",
      terms_document_url: "",
      info_document_url: ""
    });
    setSelectedTab("general");
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "minimum_investment" ? Number(value) : value
    });
  };

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({
      ...prev,
      image_url: url
    }));
  };

  const handleSubmit = () => {
    // Ensure all required fields are provided
    const productData = {
      title: formData.title,
      description: formData.description,
      return_value: formData.return_value,
      risk_level: formData.risk_level,
      minimum_investment: formData.minimum_investment,
      image_url: formData.image_url || null,
      slug: formData.slug || null,
      terms_document_url: formData.terms_document_url || null,
      info_document_url: formData.info_document_url || null
    };
    
    mutation.mutate(productData);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Produktverwaltung</h1>
        <div className="flex space-x-2">
          <Button onClick={handleAddNew} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Neues Produkt
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Titel</TableHead>
              <TableHead className="hidden md:table-cell">Beschreibung</TableHead>
              <TableHead>Rendite</TableHead>
              <TableHead className="hidden md:table-cell">Risiko</TableHead>
              <TableHead>Min. Investment</TableHead>
              <TableHead>Dokumente</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.id.substring(0, 8)}...</TableCell>
                <TableCell>{product.title}</TableCell>
                <TableCell className="hidden md:table-cell max-w-xs truncate">
                  {product.description}
                </TableCell>
                <TableCell>{product.return_value}</TableCell>
                <TableCell className="hidden md:table-cell">{product.risk_level}</TableCell>
                <TableCell>€ {product.minimum_investment.toLocaleString('de-DE')}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {product.terms_document_url && (
                      <a
                        href={product.terms_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                        title="Anleihebedingungen"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    )}
                    {product.info_document_url && (
                      <a
                        href={product.info_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-700"
                        title="Basisinformationsblatt"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4 text-[#B1904B]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Product Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? "Produkt bearbeiten" : "Neues Produkt hinzufügen"}
            </DialogTitle>
            <DialogDescription>
              Füllen Sie die Felder aus, um {currentProduct ? "das Produkt zu bearbeiten" : "ein neues Produkt hinzuzufügen"}.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Allgemein</TabsTrigger>
              <TabsTrigger value="documents" disabled={!currentProduct}>Dokumente</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="image" className="text-right pt-2">
                  Bild
                </Label>
                <div className="col-span-3">
                  <ImageUpload 
                    onImageUploaded={handleImageUploaded}
                    currentImageUrl={formData.image_url}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titel
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="FI Wealth Protection"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Beschreibung
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Produktbeschreibung..."
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="wealth-protection"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="return_value" className="text-right">
                  Rendite
                </Label>
                <Input
                  id="return_value"
                  name="return_value"
                  value={formData.return_value}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="14,21 %"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="risk_level" className="text-right">
                  Risiko
                </Label>
                <Input
                  id="risk_level"
                  name="risk_level"
                  value={formData.risk_level}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="mittel"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minimum_investment" className="text-right">
                  Min. Investment
                </Label>
                <Input
                  id="minimum_investment"
                  name="minimum_investment"
                  type="number"
                  value={formData.minimum_investment}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="1000"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              {currentProduct && (
                <ProductDocumentManager 
                  productId={currentProduct.id} 
                  productTitle={currentProduct.title}
                />
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            {selectedTab === "general" && (
              <Button onClick={handleSubmit}>Speichern</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Produkt löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie das Produkt "{productToDelete?.title}" löschen möchten?
              Dieser Vorgang kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductManagement;
