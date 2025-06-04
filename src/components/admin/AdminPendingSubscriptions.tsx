
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface Investment {
  id: string;
  user_id: string;
  product_title: string;
  amount: number;
  status: string;
  created_at: string;
  signature_provided: boolean;
  document_url?: string;
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    kyc_status: string;
  };
}

interface LegitimationPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  photo_type: string;
  created_at: string;
  updated_at: string;
}

const AdminPendingSubscriptions = () => {
  const queryClient = useQueryClient();
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [legitimationPhotos, setLegitimationPhotos] = useState<LegitimationPhoto[]>([]);

  const { data: pendingInvestments, isLoading } = useQuery({
    queryKey: ["pending-investments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investments")
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            kyc_status
          )
        `)
        .eq("status", "pending" as any)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (investmentId: string) => {
      const { error } = await supabase
        .from("investments")
        .update({ status: "approved" } as any)
        .eq("id", investmentId as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-investments"] });
      toast.success("Zeichnung genehmigt");
    },
    onError: (error) => {
      toast.error("Fehler beim Genehmigen", {
        description: error.message
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (investmentId: string) => {
      const { error } = await supabase
        .from("investments")
        .update({ status: "rejected" } as any)
        .eq("id", investmentId as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-investments"] });
      toast.success("Zeichnung abgelehnt");
    },
    onError: (error) => {
      toast.error("Fehler beim Ablehnen", {
        description: error.message
      });
    }
  });

  const kycApproveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ kyc_status: "approved" } as any)
        .eq("id", userId as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-investments"] });
      toast.success("KYC genehmigt");
    },
    onError: (error) => {
      toast.error("Fehler beim KYC-Genehmigen", {
        description: error.message
      });
    }
  });

  const handleViewDetails = async (investment: any) => {
    setSelectedInvestment(investment);
    
    // Fetch legitimation photos for this user
    try {
      const { data, error } = await supabase
        .from("legitimation_photos")
        .select("*")
        .eq("user_id", investment.user_id as any);
      
      if (error) {
        console.error("Error fetching legitimation photos:", error);
      } else {
        setLegitimationPhotos((data as any) || []);
      }
    } catch (error) {
      console.error("Error in handleViewDetails:", error);
      setLegitimationPhotos([]);
    }
    
    setIsViewDialogOpen(true);
  };

  const handleApprove = (investmentId: string) => {
    approveMutation.mutate(investmentId);
  };

  const handleReject = (investmentId: string) => {
    rejectMutation.mutate(investmentId);
  };

  const handleKycApprove = (userId: string) => {
    kycApproveMutation.mutate(userId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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
        <h1 className="text-2xl font-bold tracking-tight">Offene Zeichnungen</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kunde</TableHead>
              <TableHead>Produkt</TableHead>
              <TableHead>Betrag</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Signatur</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingInvestments?.map((investment: any) => (
              <TableRow key={investment.id}>
                <TableCell>
                  {(investment.profiles as any)?.first_name} {(investment.profiles as any)?.last_name}
                  <br />
                  <span className="text-sm text-gray-500">{(investment.profiles as any)?.email}</span>
                </TableCell>
                <TableCell>{investment.product_title}</TableCell>
                <TableCell>{formatCurrency(investment.amount)}</TableCell>
                <TableCell>{formatDate(investment.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={(investment.profiles as any)?.kyc_status === "approved" ? "default" : "secondary"}>
                    {(investment.profiles as any)?.kyc_status === "approved" ? "Genehmigt" : "Ausstehend"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={investment.signature_provided ? "default" : "secondary"}>
                    {investment.signature_provided ? "Vorhanden" : "Ausstehend"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(investment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {investment.document_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(investment.document_url, '_blank')}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleApprove(investment.id)}
                      disabled={(investment.profiles as any)?.kyc_status !== "approved" || !investment.signature_provided}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReject(investment.id)}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Zeichnungsdetails</DialogTitle>
            <DialogDescription>
              Vollständige Details der Zeichnung und Legitimationsdokumente
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvestment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Kunde</h3>
                  <p>{(selectedInvestment.profiles as any)?.first_name} {(selectedInvestment.profiles as any)?.last_name}</p>
                  <p className="text-sm text-gray-500">{(selectedInvestment.profiles as any)?.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Produkt</h3>
                  <p>{selectedInvestment.product_title}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Betrag</h3>
                  <p>{formatCurrency(selectedInvestment.amount)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Datum</h3>
                  <p>{formatDate(selectedInvestment.created_at)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Legitimationsdokumente</h3>
                {legitimationPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {legitimationPhotos.map((photo) => (
                      <div key={photo.id} className="space-y-2">
                        <p className="text-sm font-medium">{photo.photo_type}</p>
                        <img 
                          src={photo.photo_url} 
                          alt={photo.photo_type}
                          className="w-full h-48 object-cover rounded-md border"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Keine Legitimationsdokumente hochgeladen</p>
                )}
              </div>
              
              {(selectedInvestment.profiles as any)?.kyc_status !== "approved" && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      handleKycApprove(selectedInvestment.user_id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    KYC genehmigen
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPendingSubscriptions;
