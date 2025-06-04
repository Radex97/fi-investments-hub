
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { User, TrendingUp, Users, Calendar } from 'lucide-react';
import { logActivity } from '@/components/admin/AdminActivityLog';
import AdminNotificationLogs from '@/components/admin/AdminNotificationLogs';
import AdminActivityLog from '@/components/admin/AdminActivityLog';

const AdminOverview = () => {
  const { data: investmentsData, isLoading: investmentsLoading } = useQuery({
    queryKey: ["admin-total-investments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('amount');
      
      if (error) {
        console.error('Error fetching investments:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id');
      
      if (error) {
        console.error('Error fetching users count:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  useEffect(() => {
    // Log admin viewed dashboard
    const logDashboardView = async () => {
      try {
        await logActivity('system', 'Admin viewed dashboard');
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    };
    
    logDashboardView();
  }, []);

  // Calculate total investment amount
  const totalInvestmentAmount = React.useMemo(() => {
    if (!investmentsData || investmentsData.length === 0) return 0;
    
    return investmentsData.reduce((sum, investment) => {
      // Add proper type checking here
      if (investment && typeof investment === 'object' && 'amount' in investment) {
        const amount = parseFloat(String(investment.amount)) || 0;
        return sum + amount;
      }
      return sum;
    }, 0);
  }, [investmentsData]);

  // Format number as EUR
  const formatEUR = (value: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Übersicht</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="Gesamtinvestition"
          value={investmentsLoading ? "Lädt..." : formatEUR(totalInvestmentAmount)}
          change="+15%"
          trend="up"
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
        />
        
        <DashboardCard 
          title="Anleger"
          value={usersLoading ? "Lädt..." : (usersData?.length || 0)}
          change="+5"
          trend="up"
          icon={<Users className="h-4 w-4 text-blue-500" />}
        />
        
        <DashboardCard 
          title="Durchschn. Rendite"
          value="5,2%"
          change="+0,2%"
          trend="up"
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
        />
        
        <DashboardCard 
          title="Nächster Auszahlungstag"
          value="01.07.2025"
          change="In 45 Tagen"
          trend="neutral"
          icon={<Calendar className="h-4 w-4 text-gray-500" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Letzte Aktivitäten</h2>
          <AdminActivityLog limit={5} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Letzte Benachrichtigungen</h2>
          <AdminNotificationLogs limit={5} />
        </div>
      </div>
    </div>
  );
};

// Helper component for dashboard cards
const DashboardCard = ({ 
  title, 
  value, 
  change, 
  trend,
  icon
}: { 
  title: string; 
  value: string | number; 
  change: string; 
  trend: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}) => {
  return (
    <Card>
      <div className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">{title}</h3>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${
          trend === 'up' ? 'text-green-500' : 
          trend === 'down' ? 'text-red-500' : 
          'text-gray-500'
        }`}>
          {change} seit letztem Monat
        </p>
      </div>
    </Card>
  );
};

export default AdminOverview;
