import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileNavigation from '@/components/admin/AdminMobileNavigation';
import TopBar from '@/components/TopBar';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminProductManagement from '@/components/admin/AdminProductManagement';
import AdminProductConfig from '@/components/admin/AdminProductConfig';
import AdminYieldCalculation from '@/components/admin/AdminYieldCalculation';
import AdminActivityLog from '@/components/admin/AdminActivityLog';
import AdminPendingSubscriptions from '@/components/admin/AdminPendingSubscriptions';
import AdminNotificationManagement from '@/components/admin/AdminNotificationManagement';
import AdminOverview from '@/components/AdminOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import { logActivity } from '@/components/admin/AdminActivityLog';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Handle logout
  const handleLogout = () => {
    // Add logout logic here
    logActivity('system', 'Admin logged out');
    toast.success('Abgemeldet');
    navigate('/login');
  };
  
  // Track section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    logActivity('system', `Admin navigated to ${section} section`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="flex">
        {!isMobile && (
          <AdminSidebar
            activeSection={activeSection}
            setActiveSection={handleSectionChange}
          />
        )}
        
        <div className={`flex-1 ${!isMobile ? "pl-64" : ""}`}>
          <div className={`pt-20 px-4 ${isMobile ? "pb-24" : "p-6"}`}>
            {activeSection === 'dashboard' ? (
              <AdminOverview />
            ) : (
              renderContent(activeSection)
            )}
          </div>
        </div>
      </div>
      
      <AdminMobileNavigation
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        onLogout={handleLogout}
      />
    </div>
  );
};

// Helper function to render content based on active section
const renderContent = (activeSection: string) => {
  switch (activeSection) {
    case 'users':
      return <AdminUserManagement />;
    case 'products':
      return <AdminProductManagement />;
    case 'pending-subscriptions':
      return <AdminPendingSubscriptions />;
    case 'notifications':
      return <AdminNotificationManagement />;
    case 'product-config':
      return <AdminProductConfig />;
    case 'yield-calc':
      return <AdminYieldCalculation />;
    case 'activity-logs':
      return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Aktivitätsprotokolle</h1>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Alle Aktivitäten</TabsTrigger>
              <TabsTrigger value="users">Benutzerverwaltung</TabsTrigger>
              <TabsTrigger value="products">Produktverwaltung</TabsTrigger>
              <TabsTrigger value="config">Konfigurationen</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <AdminActivityLog />
            </TabsContent>
            <TabsContent value="users" className="mt-4">
              <AdminActivityLog category="user_management" />
            </TabsContent>
            <TabsContent value="products" className="mt-4">
              <AdminActivityLog category="product_management" />
            </TabsContent>
            <TabsContent value="config" className="mt-4">
              <AdminActivityLog category="product_config_update" />
            </TabsContent>
          </Tabs>
        </div>
      );
    default:
      return <div>Wählen Sie eine Funktion aus der Seitenleiste</div>;
  }
};

export default AdminDashboard;
