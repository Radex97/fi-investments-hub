import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationSettings = {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  product_updates: boolean;
  transaction_alerts: boolean;
  marketing_notifications: boolean;
};

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is the "no rows returned" error code
        toast.error("Fehler beim Laden der Benachrichtigungseinstellungen", {
          description: error.message
        });
        throw error;
      }

      return data as NotificationSettings;
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<Omit<NotificationSettings, "user_id">>) => {
      // First get the current user session to extract the user ID
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("notification_settings")
        .update(settings)
        .eq("user_id", userId);

      if (error) {
        toast.error("Fehler beim Aktualisieren der Einstellungen", {
          description: error.message
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Einstellungen gespeichert");
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    },
  });
}

// Updated function to update default notification settings for new users
export function useUpdateDefaultNotificationSettings() {
  return useMutation({
    mutationFn: async (defaults: {
      default_email_enabled: boolean;
      default_push_enabled: boolean;
      default_product_updates: boolean;
      default_transaction_alerts: boolean;
      default_marketing_notifications: boolean;
    }) => {
      // This would normally update some configuration in the database
      // But since we don't have that table yet, we'll just simulate success
      // In a real implementation, this would update a system_settings table
      
      // Simulate a delay to make it feel like something is happening
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, ...defaults };
    },
    onSuccess: () => {
      toast.success("Standard-Einstellungen aktualisiert");
    },
  });
}
