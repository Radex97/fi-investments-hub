
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { useEffect } from "react";
import { initializeFirebaseMessaging } from "@/integrations/firebase/firebase";
import NotificationPrompt from "@/components/NotificationPrompt";

// Import all page components
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import EmailConfirmation from "@/pages/EmailConfirmation";
import PasswordReset from "@/pages/PasswordReset";
import ProductCatalog from "@/pages/ProductCatalog";
import FAQ from "@/pages/FAQ";
import Legal from "@/pages/Legal";
import Impressum from "@/pages/Impressum";
import Datenschutz from "@/pages/Datenschutz";
import AGB from "@/pages/AGB";
import Dashboard from "@/pages/Dashboard";
import Portfolio from "@/pages/Portfolio";
import Profile from "@/pages/Profile";
import Transactions from "@/pages/Transactions";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import TwoFactorAuth from "@/pages/TwoFactorAuth";
import Zeichnungsschein from "@/pages/Zeichnungsschein";
import InvestmentAmount from "@/pages/InvestmentAmount";
import AuthorizedPerson from "@/pages/AuthorizedPerson";
import Steuerangaben from "@/pages/Steuerangaben";
import ZeichnungSteuerangaben from "@/pages/ZeichnungSteuerangaben";
import PaymentAccount from "@/pages/PaymentAccount";
import StatusOverview from "@/pages/StatusOverview";
import Legitimation from "@/pages/Legitimation";
import MyApplications from "@/pages/MyApplications";
import ProductDetail from "@/pages/ProductDetail";
import ProductDetailInflationsschutz from "@/pages/ProductDetailInflationsschutz";
import AdminDashboard from "@/pages/AdminDashboard";
import Signature from "@/pages/Signature";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.error('ServiceWorker registration failed: ', err);
      });
  });
}

const AppContent = () => {
  useEffect(() => {
    // Initialize Firebase messaging asynchronously
    const initFirebase = async () => {
      await initializeFirebaseMessaging();
    };
    
    initFirebase();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/rechtliches" element={<Legal />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/agb" element={<AGB />} />
        
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/portfolio" element={<AuthGuard><Portfolio /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="/transactions" element={<AuthGuard><Transactions /></AuthGuard>} />
        <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        <Route path="/two-factor-auth" element={<AuthGuard><TwoFactorAuth /></AuthGuard>} />
        <Route path="/zeichnungsschein" element={<AuthGuard><Zeichnungsschein /></AuthGuard>} />
        <Route path="/signature" element={<AuthGuard><Signature /></AuthGuard>} />
        <Route path="/investment-amount" element={<AuthGuard><InvestmentAmount /></AuthGuard>} />
        <Route path="/authorized-person" element={<AuthGuard><AuthorizedPerson /></AuthGuard>} />
        <Route path="/steuerangaben" element={<AuthGuard><Steuerangaben /></AuthGuard>} />
        <Route path="/zeichnung-steuerangaben" element={<AuthGuard><ZeichnungSteuerangaben /></AuthGuard>} />
        <Route path="/payment-account" element={<AuthGuard><PaymentAccount /></AuthGuard>} />
        <Route path="/status-overview" element={<AuthGuard><StatusOverview /></AuthGuard>} />
        <Route path="/legitimation" element={<AuthGuard><Legitimation /></AuthGuard>} />
        <Route path="/my-applications" element={<AuthGuard><MyApplications /></AuthGuard>} />
        <Route path="/product/:id" element={<AuthGuard><ProductDetail /></AuthGuard>} />
        <Route path="/product/inflationsschutz-plus" element={<AuthGuard><ProductDetailInflationsschutz /></AuthGuard>} />
        
        <Route path="/admin" element={<AuthGuard requireAdmin={true}><AdminDashboard /></AuthGuard>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NotificationPrompt />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
