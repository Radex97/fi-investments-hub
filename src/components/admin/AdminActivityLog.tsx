
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, Filter } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  created_at: string;
  user_name?: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface AdminActivityLogProps {
  category?: string;
  limit?: number;
}

export const logActivity = async (activityType: string, description: string) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    // Make sure the admin_activity_logs table exists
    const { error: rpcError } = await supabase.rpc('check_and_create_activity_logs_table');
    
    if (rpcError) {
      console.error('Error with check_and_create_activity_logs_table RPC:', rpcError);
    }
    
    // Insert the activity log with proper typing
    const { error } = await supabase
      .from('admin_activity_logs')
      .insert([{
        user_id: userData.user.id,
        activity_type: activityType,
        description: description
      }]);
      
    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity function:', error);
  }
};

const AdminActivityLog = ({ category, limit = 50 }: AdminActivityLogProps) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>(category || 'all');
  
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["admin-activity-log", filter, limit],
    queryFn: async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name');
        
        if (profileError) throw profileError;

        let query = supabase
          .from('admin_activity_logs')
          .select('*');
          
        if (filter !== 'all') {
          query = query.eq('activity_type', filter);
        }
        
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching admin activity logs:', error);
          return [];
        }
        
        if (data && data.length > 0) {
          return data.map((log: any) => {
            // Find the profile for this log with proper type checking
            const profile = profileData?.find((p) => p && p.id === log.user_id);
            const userName = profile 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unbekannter Benutzer'
              : 'Unbekannter Benutzer';
            
            return {
              ...log,
              user_name: userName
            };
          });
        }
        
        return [];
      } catch (error) {
        console.error('Error in activity logs fetchFn:', error);
        return [];
      }
    },
    staleTime: 30000, // Data is fresh for 30 seconds
  });

  useEffect(() => {
    // Log that the admin viewed the logs
    if (user && filter) {
      const activityDescription = filter === 'all' 
        ? 'Viewed all activity logs'
        : `Viewed ${filter} activity logs`;
        
      logActivity('system', activityDescription);
    }
  }, [user, filter]);
  
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };
  
  const getActivityTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'product_config_update': 'Produkt-Konfiguration',
      'user_management': 'Benutzer-Verwaltung',
      'system': 'System',
      'login': 'Anmeldung',
      'product_management': 'Produkt-Verwaltung',
    };
    
    return types[type] || type;
  };
  
  const activityTypes = [
    { value: 'all', label: 'Alle Aktivitäten' },
    { value: 'product_config_update', label: 'Produkt-Konfiguration' },
    { value: 'user_management', label: 'Benutzer-Verwaltung' },
    { value: 'system', label: 'System' },
    { value: 'login', label: 'Anmeldung' },
    { value: 'product_management', label: 'Produkt-Verwaltung' },
  ];
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-72 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Aktivitätsprotokoll</CardTitle>
          <CardDescription>
            Protokoll der zuletzt durchgeführten Admin-Aktivitäten
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2">
          {!category && (
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter nach Typ" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zeitstempel</TableHead>
              <TableHead>Benutzer</TableHead>
              <TableHead>Art</TableHead>
              <TableHead>Beschreibung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs && logs.length > 0 ? (
              logs.map((log: ActivityLog) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(log.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>{log.user_name}</TableCell>
                  <TableCell>{getActivityTypeLabel(log.activity_type)}</TableCell>
                  <TableCell>{log.description}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Keine Protokolleinträge gefunden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminActivityLog;
