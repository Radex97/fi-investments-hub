
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: "product_update" | "system" | "transaction";
  read: boolean;
  created_at: string;
  updated_at: string;
  action_url: string | null;
};

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Fehler beim Laden der Benachrichtigungen", {
          description: error.message
        });
        throw error;
      }

      return data as Notification[];
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        toast.error("Fehler beim Aktualisieren der Benachrichtigung", {
          description: error.message
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .is("read", false);

      if (error) {
        toast.error("Fehler beim Aktualisieren der Benachrichtigungen", {
          description: error.message
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
