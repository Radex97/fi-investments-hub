
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, UserPlus, Filter, Download, Ban, Check, X, Mail } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import AdminUserInvite from "./AdminUserInvite";
import AdminUserDetails from "./AdminUserDetails";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  invested?: string;
  status?: string;
  products?: string[];
  first_name?: string;
  last_name?: string;
}

const AdminUserManagement = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAdminCheck();
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Fetch users from the database
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Get profiles with user data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) throw profilesError;
      
      // Get investments to calculate totals per user
      const { data: investments, error: investmentsError } = await supabase
        .from("investments")
        .select("user_id, amount, product_title");
      
      if (investmentsError) throw investmentsError;
      
      // Process and combine data
      const processedUsers = profiles.map((profile) => {
        // Filter investments for this user
        const userInvestments = investments.filter((inv) => inv.user_id === profile.id);
        const totalInvested = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        
        // Get unique product titles
        const uniqueProducts = [...new Set(userInvestments.map((inv) => inv.product_title))];
        
        return {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '-',
          email: profile.email || '-',
          role: profile.role || 'user',
          invested: totalInvested ? `€ ${totalInvested.toLocaleString('de-DE')}` : '€ 0',
          status: profile.kyc_status || 'Pending',
          products: uniqueProducts.filter(Boolean) as string[],
          first_name: profile.first_name,
          last_name: profile.last_name
        };
      });
      
      return processedUsers;
    },
    enabled: isAdmin
  });
  
  // User suspension/deactivation mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      // Update the profile status
      const { error } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: isActive ? 'Aktiv' : 'Inaktiv' 
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      return { userId, isActive };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Benutzerstatus erfolgreich aktualisiert");
      setUserToDeactivate(null);
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren des Benutzerstatus", {
        description: error.message
      });
    }
  });
  
  // User deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete the user from auth
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Benutzer erfolgreich gelöscht");
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen des Benutzers", {
        description: error.message
      });
    }
  });
  
  const filteredUsers = users?.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return user.name?.toLowerCase().includes(searchLower) ||
           user.email?.toLowerCase().includes(searchLower);
  }) || [];
  
  const handleDeactivateUser = (user: User) => {
    setUserToDeactivate(user);
  };
  
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };
  
  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
  };
  
  const confirmDeactivation = () => {
    if (userToDeactivate) {
      const isActivating = userToDeactivate.status === 'Inaktiv';
      updateStatusMutation.mutate({ 
        userId: userToDeactivate.id, 
        isActive: isActivating
      });
    }
  };
  
  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  const handleExportUsers = () => {
    if (!users || users.length === 0) return;
    
    // Create CSV content
    const headers = ["Name", "E-Mail", "Rolle", "Investiert", "Status", "Produkte"];
    const csvRows = [headers.join(',')];
    
    // Add each user as a row
    users.forEach(user => {
      const escapedProducts = user.products?.length ? `"${user.products.join(', ')}"` : '';
      const row = [
        user.name,
        user.email,
        user.role,
        user.invested,
        user.status,
        escapedProducts
      ];
      csvRows.push(row.join(','));
    });
    
    // Create and download the CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `user-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <h1 className="text-2xl font-bold tracking-tight">Benutzerverwaltung</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Benutzer hinzufügen
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-between space-y-4 md:flex-row">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Benutzern..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Nach Status filtern</DropdownMenuLabel>
              <DropdownMenuItem>Aktiv</DropdownMenuItem>
              <DropdownMenuItem>Pending</DropdownMenuItem>
              <DropdownMenuItem>Inaktiv</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Nach Rolle filtern</DropdownMenuLabel>
              <DropdownMenuItem>Admin</DropdownMenuItem>
              <DropdownMenuItem>Benutzer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">E-Mail</TableHead>
              <TableHead className="hidden md:table-cell">Rolle</TableHead>
              <TableHead>Investiert</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead>Produkte</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role === "admin" ? "Admin" : "Benutzer"}
                  </Badge>
                </TableCell>
                <TableCell>{user.invested}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge 
                    variant={
                      user.status === "Aktiv" ? "success" : 
                      user.status === "Inaktiv" ? "destructive" : "secondary"
                    } 
                    className={
                      user.status === "Aktiv" ? "bg-green-500" : 
                      user.status === "Inaktiv" ? "bg-red-500" : "bg-yellow-500"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.products?.length || 0}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(user.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeactivateUser(user)}
                    >
                      {user.status === "Inaktiv" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Ban className="h-4 w-4 text-yellow-500" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteUser(user)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center p-4">
          <p className="text-muted-foreground">Keine Benutzer gefunden.</p>
        </div>
      )}
      
      <AdminUserInvite 
        isOpen={showInviteDialog} 
        onClose={() => setShowInviteDialog(false)} 
      />
      
      <AdminUserDetails
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
      
      <AlertDialog open={!!userToDeactivate} onOpenChange={() => setUserToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToDeactivate?.status === 'Inaktiv' ? 'Benutzer aktivieren?' : 'Benutzer deaktivieren?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToDeactivate?.status === 'Inaktiv' 
                ? `Möchten Sie den Benutzer "${userToDeactivate?.name}" wieder aktivieren?` 
                : `Möchten Sie den Benutzer "${userToDeactivate?.name}" deaktivieren? Der Benutzer wird keinen Zugriff mehr auf das System haben.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivation}>
              {userToDeactivate?.status === 'Inaktiv' ? 'Aktivieren' : 'Deaktivieren'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Benutzer "{userToDelete?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserManagement;
