import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Euro, Eye, FileText, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateAccruedInterest } from '@/utils/calculateAccruedInterest';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useInvestments, Investment } from '@/hooks/useInvestments';
import { useAdminCheck } from '@/hooks/useAdminCheck';

// Update the PendingSubscription type to align with the Investment type
type PendingSubscription = Investment;

type LegitimationPhoto = {
  id: string;
  user_id: string;
  photo_url: string;
  photo_type: string; // 'front', 'back', 'selfie'
  created_at: string;
  updated_at: string;
};

type AccruedInterestData = {
  interest: number;
  totalAmount: number;
};

const AdminPendingSubscriptions = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const [isMarkingPayment, setIsMarkingPayment] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<PendingSubscription | null>(null);
  const [legitimationPhotos, setLegitimationPhotos] = useState<LegitimationPhoto[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("document");
  const [accruedInterest, setAccruedInterest] = useState<Record<string, AccruedInterestData>>({});
  const isMobile = useIsMobile();
  const { isAdmin } = useAdminCheck();
  
  // Fetch pending subscriptions using the updated useInvestments hook with admin option
  const { data: pendingSubscriptions, isLoading, error } = useInvestments({ forAdmin: true });

  // Calculate accrued interest for all subscriptions
  useEffect(() => {
    if (pendingSubscriptions && pendingSubscriptions.length > 0) {
      const interestData: Record<string, AccruedInterestData> = {};
      
      pendingSubscriptions.forEach(subscription => {
        const { interest, totalAmount } = calculateAccruedInterest(
          subscription.amount,
          subscription.product_interest_rate || 0.05,
          subscription.product_last_interest_date || subscription.created_at
        );
        
        interestData[subscription.id] = { interest, totalAmount };
      });
      
      setAccruedInterest(interestData);
    }
  }, [pendingSubscriptions]);

  // Open review dialog with selected subscription
  const handleOpenReview = async (subscription: PendingSubscription) => {
    setSelectedSubscription(subscription);
    setActiveTab("document");
    
    // Fetch legitimation photos for this user if they exist
    try {
      const { data: photos, error } = await supabase
        .from('legitimation_photos')
        .select('*')
        .eq('user_id', subscription.user_id);
      
      if (error) {
        console.error('Error fetching legitimation photos:', error);
        setLegitimationPhotos([]);
        return;
      }
      
      if (photos) {
        setLegitimationPhotos(photos);
      } else {
        setLegitimationPhotos([]);
        console.log('No legitimation photos found for user:', subscription.user_id);
      }
    } catch (error) {
      console.error('Error fetching legitimation photos:', error);
      setLegitimationPhotos([]);
    }
    
    setReviewDialogOpen(true);
  };

  const handleConfirm = async (id: string) => {
    try {
      setIsConfirming(id);
      
      // Get the user_id for the subscription being confirmed
      const subscription = pendingSubscriptions?.find(sub => sub.id === id);
      if (!subscription) throw new Error("Subscription not found");
      
      // Update investment status
      const { error: updateError } = await supabase
        .from('investments')
        .update({ status: 'confirmed' })
        .eq('id', id);
        
      if (updateError) throw updateError;
      
      // Update user's KYC status to 'verified' when their subscription is confirmed
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ kyc_status: 'verified' })
        .eq('id', subscription.user_id);
        
      if (profileUpdateError) {
        console.error('Failed to update KYC status:', profileUpdateError);
        toast.error('Investmentbestätigung erfolgreich, aber KYC-Status konnte nicht aktualisiert werden');
      }
      
      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        description: `Confirmed subscription with ID ${id} and updated user KYC status`,
        activity_type: 'subscription_confirmation'
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pendingSubscriptions'] });
      
      toast.success('Subscription confirmed and KYC status updated successfully');
      setReviewDialogOpen(false);
    } catch (error) {
      console.error('Failed to confirm subscription:', error);
      toast.error('Failed to confirm subscription');
    } finally {
      setIsConfirming(null);
    }
  };

  // New function to mark payment as received and update investment status
  const handleMarkPaymentReceived = async (id: string) => {
    try {
      setIsMarkingPayment(id);
      
      // Update investment payment_received status and set status to 'active' when payment is received
      const { error: updateError } = await supabase
        .from('investments')
        .update({ 
          payment_received: true,
          status: 'active' // Update status to active when payment is received
        })
        .eq('id', id);
        
      if (updateError) throw updateError;
      
      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        description: `Marked payment received and activated subscription with ID ${id}`,
        activity_type: 'payment_received_activation'
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pendingSubscriptions'] });
      
      toast.success('Zahlung erfolgreich als erhalten markiert und Investment aktiviert');
    } catch (error) {
      console.error('Failed to mark payment as received and activate investment:', error);
      toast.error('Fehler beim Markieren der Zahlung als erhalten');
    } finally {
      setIsMarkingPayment(null);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy');
  };

  const renderDocumentPreview = (selectedSubscription: PendingSubscription | null, accruedInterest: Record<string, AccruedInterestData>) => {
    if (!selectedSubscription) return null;

    // Check if there's a document URL
    if (selectedSubscription.document_url) {
      // Fallback to a static PDF path if document_url is 'pending'
      const documentUrl = selectedSubscription.document_url === 'pending' 
        ? `/assets/docs/wealth-protection-zeichnungsschein.pdf` 
        : selectedSubscription.document_url;
        
      return (
        <div className="flex flex-col items-center">
          <div className="border rounded-md p-4 w-full mb-4">
            <iframe 
              src={documentUrl} 
              className="w-full h-[500px]" 
              title="Subscription document"
            />
          </div>
          
          {/* Display accrued interest information */}
          {selectedSubscription.id && accruedInterest[selectedSubscription.id] && (
            <div className="w-full p-4 mb-4 border rounded-md bg-muted/20">
              <h3 className="font-medium mb-2">Accrued Interest Information</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>Investment Amount:</div>
                <div className="font-medium">{formatCurrency(selectedSubscription.amount)}</div>
                
                <div>Accrued Interest:</div>
                <div className="font-medium">{formatCurrency(accruedInterest[selectedSubscription.id].interest)}</div>
                
                <div>Total Amount:</div>
                <div className="font-medium">{formatCurrency(accruedInterest[selectedSubscription.id].totalAmount)}</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-gray-100 rounded-md">
        <FileText size={48} className="text-gray-400 mb-2" />
        <p className="text-gray-500">No document available</p>
      </div>
    );
  };
  
  const renderLegitimationPhotos = (legitimationPhotos: LegitimationPhoto[]) => {
    if (!legitimationPhotos || legitimationPhotos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] bg-gray-100 rounded-md">
          <Eye size={48} className="text-gray-400 mb-2" />
          <p className="text-gray-500">No legitimation photos available</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {legitimationPhotos.map((photo) => (
          <div key={photo.id} className="border rounded-md overflow-hidden">
            <div className="p-2 bg-gray-100 font-medium text-sm">
              {photo.photo_type === 'front' && 'ID Card Front'}
              {photo.photo_type === 'back' && 'ID Card Back'}
              {photo.photo_type === 'selfie' && 'Selfie'}
            </div>
            <img 
              src={photo.photo_url} 
              alt={`${photo.photo_type} photo`} 
              className="w-full h-auto object-contain"
            />
          </div>
        ))}
      </div>
    );
  };

  // Responsive card view for mobile
  const renderMobileSubscriptionCard = (subscription: PendingSubscription) => {
    return (
      <Card key={subscription.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{subscription.userName || 'Unknown'}</h3>
              <p className="text-sm text-gray-500">{formatDate(subscription.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatCurrency(subscription.amount)}</p>
              <p className="text-xs text-gray-500">{subscription.product_title || 'Unknown Product'}</p>
            </div>
          </div>
          
          <div className="text-sm mb-3">
            <div className="flex justify-between mb-1">
              <span>Stückzinsen:</span>
              <span>
                {subscription.id && accruedInterest[subscription.id] ? 
                  formatCurrency(accruedInterest[subscription.id].interest) : 
                  "Calculating..."}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Gesamtbetrag:</span>
              <span>
                {subscription.id && accruedInterest[subscription.id] ? 
                  formatCurrency(accruedInterest[subscription.id].totalAmount) : 
                  "Calculating..."}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => handleOpenReview(subscription)}
              className="w-full"
              size="sm"
            >
              {t('review')}
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleMarkPaymentReceived(subscription.id)}
              disabled={isMarkingPayment === subscription.id || subscription.payment_received}
            >
              {isMarkingPayment === subscription.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B1904B] mr-2" />
              ) : subscription.payment_received ? (
                <Check size={16} className="mr-2 text-green-500" />
              ) : (
                <Euro size={16} className="mr-2" />
              )}
              {subscription.payment_received ? 'Zahlung erhalten' : 'Zahlung erhalten'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingSubscriptions')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B1904B]"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center">
              Error loading subscriptions: {(error as Error).message}
            </div>
          ) : pendingSubscriptions && pendingSubscriptions.length > 0 ? (
            <>
              {/* Desktop view */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('customer')}</TableHead>
                      <TableHead>{t('product')}</TableHead>
                      <TableHead className="text-right">{t('amount')}</TableHead>
                      <TableHead className="text-right">Stückzinsen</TableHead>
                      <TableHead className="text-right">Gesamtbetrag</TableHead>
                      <TableHead className="text-center" colSpan={2}>{t('action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>{formatDate(subscription.created_at)}</TableCell>
                        <TableCell>{subscription.userName || 'Unknown'}</TableCell>
                        <TableCell>{subscription.product_title || 'Unknown Product'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(subscription.amount)}</TableCell>
                        <TableCell className="text-right">
                          {subscription.id && accruedInterest[subscription.id] ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-end">
                                    {formatCurrency(accruedInterest[subscription.id].interest)}
                                    <Info size={16} className="ml-1 text-muted-foreground" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Based on {subscription.product_interest_rate ? (subscription.product_interest_rate * 100) : 5}% interest rate
                                  <br />
                                  From: {formatDate(subscription.product_last_interest_date || subscription.created_at)}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            "Calculating..."
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {subscription.id && accruedInterest[subscription.id] ? (
                            <span className="font-medium">{formatCurrency(accruedInterest[subscription.id].totalAmount)}</span>
                          ) : (
                            "Calculating..."
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReview(subscription)}
                            className="min-w-[80px]"
                          >
                            {t('review')}
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPaymentReceived(subscription.id)}
                            disabled={isMarkingPayment === subscription.id || subscription.payment_received}
                            className="min-w-[150px]"
                          >
                            {isMarkingPayment === subscription.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B1904B] mr-2" />
                            ) : subscription.payment_received ? (
                              <Check size={16} className="mr-2 text-green-500" />
                            ) : (
                              <Euro size={16} className="mr-2" />
                            )}
                            {subscription.payment_received ? 'Zahlung erhalten' : 'Zahlung erhalten'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mobile view */}
              <div className="md:hidden">
                {pendingSubscriptions.map(subscription => renderMobileSubscriptionCard(subscription))}
              </div>
            </>
          ) : (
            <div className="text-center p-6 text-gray-500">
              No pending subscriptions found
            </div>
          )}
        </CardContent>
      </Card>
      
      {isMobile ? (
        // Mobile: Use drawer for subscription review
        <Drawer open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>Review Subscription</DrawerTitle>
              <DrawerDescription>
                Review the subscription form and legitimation documents
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="p-4 overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full grid grid-cols-2">
                  <TabsTrigger value="document">Subscription Form</TabsTrigger>
                  <TabsTrigger value="legitimation">Legitimation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="document">
                  {renderDocumentPreview(selectedSubscription, accruedInterest)}
                </TabsContent>
                
                <TabsContent value="legitimation">
                  {renderLegitimationPhotos(legitimationPhotos)}
                </TabsContent>
              </Tabs>
            </div>
            
            <DrawerFooter className="space-y-4">
              <Button 
                onClick={() => selectedSubscription && handleConfirm(selectedSubscription.id)}
                disabled={isConfirming === (selectedSubscription?.id || null)}
                className="w-full"
              >
                {isConfirming === (selectedSubscription?.id || null) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : null}
                Confirm Subscription
              </Button>
              
              {selectedSubscription && (
                <Button 
                  variant="outline"
                  onClick={() => selectedSubscription && handleMarkPaymentReceived(selectedSubscription.id)}
                  disabled={isMarkingPayment === (selectedSubscription?.id || null) || selectedSubscription.payment_received}
                  className="w-full"
                >
                  {isMarkingPayment === selectedSubscription.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B1904B] mr-2" />
                  ) : selectedSubscription.payment_received ? (
                    <Check size={16} className="mr-2 text-green-500" />
                  ) : (
                    <Euro size={16} className="mr-2" />
                  )}
                  {selectedSubscription.payment_received ? 'Zahlung erhalten' : 'Zahlung erhalten'}
                </Button>
              )}
              
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        // Desktop: Use dialog for subscription review
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Review Subscription</DialogTitle>
              <DialogDescription>
                Review the subscription form and legitimation documents
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="document">Subscription Form</TabsTrigger>
                <TabsTrigger value="legitimation">Legitimation Photos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="document">
                {renderDocumentPreview(selectedSubscription, accruedInterest)}
              </TabsContent>
              
              <TabsContent value="legitimation">
                {renderLegitimationPhotos(legitimationPhotos)}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between sm:justify-end">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)} className="mr-auto">
                Cancel
              </Button>
              
              {selectedSubscription && (
                <Button 
                  variant="outline"
                  onClick={() => selectedSubscription && handleMarkPaymentReceived(selectedSubscription.id)}
                  disabled={isMarkingPayment === (selectedSubscription?.id || null) || selectedSubscription.payment_received}
                  className="mr-2"
                >
                  {isMarkingPayment === selectedSubscription.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B1904B] mr-2" />
                  ) : selectedSubscription.payment_received ? (
                    <Check size={16} className="mr-2 text-green-500" />
                  ) : (
                    <Euro size={16} className="mr-2" />
                  )}
                  {selectedSubscription.payment_received ? 'Zahlung erhalten' : 'Zahlung erhalten'}
                </Button>
              )}
              
              <Button 
                onClick={() => selectedSubscription && handleConfirm(selectedSubscription.id)}
                disabled={isConfirming === (selectedSubscription?.id || null)}
              >
                {isConfirming === (selectedSubscription?.id || null) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : null}
                Confirm Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPendingSubscriptions;
