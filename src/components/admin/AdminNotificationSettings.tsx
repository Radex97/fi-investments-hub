
import { useUpdateDefaultNotificationSettings } from "@/hooks/useNotificationSettings";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const settingsFormSchema = z.object({
  default_email_enabled: z.boolean(),
  default_push_enabled: z.boolean(),
  default_product_updates: z.boolean(),
  default_transaction_alerts: z.boolean(),
  default_marketing_notifications: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// Define initial values explicitly to ensure TypeScript knows all fields are present
const initialValues: SettingsFormValues = {
  default_email_enabled: true,
  default_push_enabled: true,
  default_product_updates: true,
  default_transaction_alerts: true,
  default_marketing_notifications: false,
};

const AdminNotificationSettings = () => {
  const updateDefaultSettings = useUpdateDefaultNotificationSettings();
  
  // Form setup with properly typed generic and defaultValues
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: initialValues
  });
  
  // Properly typed submit handler using SubmitHandler to guarantee non-optional values
  const onSubmit: SubmitHandler<SettingsFormValues> = (values) => {
    // Create a guaranteed non-optional payload from the form values
    const payload = {
      default_email_enabled: values.default_email_enabled,
      default_push_enabled: values.default_push_enabled,
      default_product_updates: values.default_product_updates,
      default_transaction_alerts: values.default_transaction_alerts,
      default_marketing_notifications: values.default_marketing_notifications,
    };
    
    // Now we can safely pass this to the mutation
    updateDefaultSettings.mutate(payload);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Standard-Benachrichtigungseinstellungen</h3>
        <p className="text-muted-foreground">
          Legen Sie fest, welche Benachrichtigungen neue Benutzer standardmäßig erhalten sollen.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Benachrichtigungskanäle</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="default_email_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>E-Mail-Benachrichtigungen</FormLabel>
                      <FormDescription>
                        Standardmäßig E-Mail-Benachrichtigungen aktivieren
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="default_push_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Push-Benachrichtigungen</FormLabel>
                      <FormDescription>
                        Standardmäßig Push-Benachrichtigungen aktivieren
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Benachrichtigungstypen</h4>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="default_product_updates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Produkt-Updates</FormLabel>
                      <FormDescription>
                        Benachrichtigungen über neue Produkte und Produktänderungen
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="default_transaction_alerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Transaktions-Benachrichtigungen</FormLabel>
                      <FormDescription>
                        Benachrichtigungen über Zahlungen, Renditen und andere Transaktionen
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="default_marketing_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Marketing-Benachrichtigungen</FormLabel>
                      <FormDescription>
                        Benachrichtigungen über Angebote, Newsletter und andere Marketing-Inhalte
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={updateDefaultSettings.isPending}
          >
            {updateDefaultSettings.isPending ? "Wird gespeichert..." : "Einstellungen speichern"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminNotificationSettings;
