
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationTemplate = {
  id: string;
  name: string;
  type: "email" | "push";
  trigger_event: string | null;
  subject: string | null;
  content_html: string | null;
  content_text: string | null;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ["notification-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Fehler beim Laden der Benachrichtigungsvorlagen", {
          description: error.message
        });
        throw error;
      }

      return data as NotificationTemplate[];
    },
  });
}

export function useNotificationTemplate(id: string | null) {
  return useQuery({
    queryKey: ["notification-template", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Fehler beim Laden der Benachrichtigungsvorlage", {
          description: error.message
        });
        throw error;
      }

      return data as NotificationTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<NotificationTemplate, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("notification_templates")
        .insert([template])
        .select()
        .single();

      if (error) {
        toast.error("Fehler beim Erstellen der Vorlage", {
          description: error.message
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Vorlage erfolgreich erstellt");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      template 
    }: { 
      id: string; 
      template: Partial<Omit<NotificationTemplate, "id" | "created_at" | "updated_at">>; 
    }) => {
      const { data, error } = await supabase
        .from("notification_templates")
        .update(template)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        toast.error("Fehler beim Aktualisieren der Vorlage", {
          description: error.message
        });
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Vorlage erfolgreich aktualisiert");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      queryClient.invalidateQueries({ queryKey: ["notification-template", variables.id] });
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notification_templates")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Fehler beim Löschen der Vorlage", {
          description: error.message
        });
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      toast.success("Vorlage erfolgreich gelöscht");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
  });
}
