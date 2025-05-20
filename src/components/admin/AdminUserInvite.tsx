
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Mail, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface InviteUserProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminUserInvite = ({ isOpen, onClose }: InviteUserProps) => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<AppRole>("user");
  
  const inviteMutation = useMutation({
    mutationFn: async (userData: { email: string; firstName: string; lastName: string; role: AppRole }) => {
      // First create the user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
        userData.email, 
        { 
          data: { 
            first_name: userData.firstName,
            last_name: userData.lastName,
          } 
        }
      );
      
      if (authError) throw authError;
      
      // Then update the role in the profiles table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: userData.role, first_name: userData.firstName, last_name: userData.lastName })
          .eq('id', authData.user.id);
        
        if (profileError) throw profileError;
      }
      
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Benutzer erfolgreich eingeladen");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Einladen des Benutzers", {
        description: error.message
      });
    }
  });
  
  const handleInvite = () => {
    if (!email || !firstName || !lastName) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }
    
    inviteMutation.mutate({ 
      email, 
      firstName, 
      lastName, 
      role 
    });
  };
  
  const handleClose = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setRole("user");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Benutzer einladen</DialogTitle>
          <DialogDescription>
            Laden Sie einen neuen Benutzer ein und weisen Sie eine Rolle zu.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              E-Mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="max.mustermann@example.com"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Vorname
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
              placeholder="Max"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Nachname
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
              placeholder="Mustermann"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Rolle
            </Label>
            <RadioGroup 
              value={role} 
              onValueChange={(value) => setRole(value as AppRole)}
              className="col-span-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="user" />
                <Label htmlFor="user">Benutzer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Administrator</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleInvite} 
            disabled={inviteMutation.isPending}
          >
            <Mail className="mr-2 h-4 w-4" />
            Einladung senden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserInvite;
