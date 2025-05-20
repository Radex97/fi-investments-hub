
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationTrigger = {
  id: string;
  name: string;
  event_key: string;
  description: string | null;
  email_enabled: boolean;
  push_enabled: boolean;
  email_template_id: string | null;
  push_template_id: string | null;
  created_at: string;
  updated_at: string;
};

export function useNotificationTriggers() {
  return useQuery({
    queryKey: ["notification-triggers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_triggers")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Fehler beim Laden der Benachrichtigungstrigger", {
          description: error.message
        });
        throw error;
      }

      return data as NotificationTrigger[];
    },
  });
}

export function useUpdateNotificationTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      triggerData 
    }: { 
      id: string; 
      triggerData: Partial<Omit<NotificationTrigger, "id" | "event_key" | "created_at" | "updated_at">>; 
    }) => {
      // Check if email_template_id or push_template_id is "none" and convert to null
      if (triggerData.email_template_id === "none") {
        triggerData.email_template_id = null;
      }
      if (triggerData.push_template_id === "none") {
        triggerData.push_template_id = null;
      }

      const { data, error } = await supabase
        .from("notification_triggers")
        .update(triggerData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        toast.error("Fehler beim Aktualisieren des Triggers", {
          description: error.message
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Trigger erfolgreich aktualisiert");
      queryClient.invalidateQueries({ queryKey: ["notification-triggers"] });
    },
  });
}

export function useCreateNotificationTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trigger: Omit<NotificationTrigger, "id" | "created_at" | "updated_at">) => {
      // Check if email_template_id or push_template_id is "none" and convert to null
      if (trigger.email_template_id === "none") {
        trigger.email_template_id = null;
      }
      if (trigger.push_template_id === "none") {
        trigger.push_template_id = null;
      }

      const { data, error } = await supabase
        .from("notification_triggers")
        .insert([trigger])
        .select()
        .single();

      if (error) {
        toast.error("Fehler beim Erstellen des Triggers", {
          description: error.message
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Trigger erfolgreich erstellt");
      queryClient.invalidateQueries({ queryKey: ["notification-triggers"] });
    },
  });
}
