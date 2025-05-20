
import { useState } from "react";
import { 
  useNotificationTriggers, 
  useUpdateNotificationTrigger,
  useCreateNotificationTrigger,
  NotificationTrigger
} from "@/hooks/useNotificationTriggers";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const triggerFormSchema = z.object({
  name: z.string().min(1, "Name wird benötigt"),
  event_key: z.string().min(1, "Event-Key wird benötigt"),
  description: z.string().optional(),
  email_enabled: z.boolean().default(true),
  push_enabled: z.boolean().default(true),
  email_template_id: z.string().optional().nullable(),
  push_template_id: z.string().optional().nullable(),
});

type TriggerFormValues = z.infer<typeof triggerFormSchema>;

const AdminNotificationTriggers = () => {
  const { data: triggers, isLoading: isLoadingTriggers } = useNotificationTriggers();
  const { data: templates, isLoading: isLoadingTemplates } = useNotificationTemplates();
  const updateTrigger = useUpdateNotificationTrigger();
  const createTrigger = useCreateNotificationTrigger();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<NotificationTrigger | null>(null);
  
  // Form setup
  const form = useForm<TriggerFormValues>({
    resolver: zodResolver(triggerFormSchema),
    defaultValues: {
      name: "",
      event_key: "",
      description: "",
      email_enabled: true,
      push_enabled: true,
      email_template_id: null,
      push_template_id: null,
    }
  });
  
  // Open edit dialog and populate form
  const handleEdit = (trigger: NotificationTrigger) => {
    setCurrentTrigger(trigger);
    form.reset({
      name: trigger.name,
      event_key: trigger.event_key,
      description: trigger.description || "",
      email_enabled: trigger.email_enabled,
      push_enabled: trigger.push_enabled,
      email_template_id: trigger.email_template_id || null,
      push_template_id: trigger.push_template_id || null,
    });
    setIsEditDialogOpen(true);
  };
  
  // Open create dialog with fresh form
  const handleCreate = () => {
    form.reset({
      name: "",
      event_key: "",
      description: "",
      email_enabled: true,
      push_enabled: true,
      email_template_id: null,
      push_template_id: null,
    });
    setIsCreateDialogOpen(true);
  };
  
  // Handle form submission for edit
  const onEditSubmit = (values: TriggerFormValues) => {
    if (currentTrigger) {
      updateTrigger.mutate({
        id: currentTrigger.id,
        triggerData: {
          name: values.name,
          description: values.description || null,
          email_enabled: values.email_enabled,
          push_enabled: values.push_enabled,
          email_template_id: values.email_template_id || null,
          push_template_id: values.push_template_id || null,
        }
      });
      setIsEditDialogOpen(false);
    }
  };
  
  // Handle form submission for create
  const onCreateSubmit = (values: TriggerFormValues) => {
    createTrigger.mutate({
      name: values.name,
      event_key: values.event_key,
      description: values.description || null,
      email_enabled: values.email_enabled,
      push_enabled: values.push_enabled,
      email_template_id: values.email_template_id || null,
      push_template_id: values.push_template_id || null,
    });
    setIsCreateDialogOpen(false);
  };
  
  // Helper function to get template name by id
  const getTemplateName = (id: string | null) => {
    if (!id || !templates) return "-";
    const template = templates.find(t => t.id === id);
    return template ? template.name : "-";
  };
  
  // Filter templates by type
  const emailTemplates = templates?.filter(t => t.type === "email") || [];
  const pushTemplates = templates?.filter(t => t.type === "push") || [];
  
  const isLoading = isLoadingTriggers || isLoadingTemplates;
  
  if (isLoading) {
    return <div className="text-center py-4">Lade Trigger...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Trigger ({triggers?.length || 0})</h3>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Trigger
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Event-Key</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Push</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {triggers && triggers.length > 0 ? (
              triggers.map((trigger) => (
                <TableRow key={trigger.id}>
                  <TableCell className="font-medium">{trigger.name}</TableCell>
                  <TableCell>{trigger.event_key}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={trigger.email_enabled ? "default" : "outline"}>
                        {trigger.email_enabled ? "Aktiviert" : "Deaktiviert"}
                      </Badge>
                      {trigger.email_enabled && trigger.email_template_id && (
                        <span className="text-xs text-muted-foreground">
                          {getTemplateName(trigger.email_template_id)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={trigger.push_enabled ? "secondary" : "outline"}>
                        {trigger.push_enabled ? "Aktiviert" : "Deaktiviert"}
                      </Badge>
                      {trigger.push_enabled && trigger.push_template_id && (
                        <span className="text-xs text-muted-foreground">
                          {getTemplateName(trigger.push_template_id)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(trigger)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Keine Trigger gefunden. Erstellen Sie einen neuen Trigger.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Benachrichtigungstrigger bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Einstellungen dieses Benachrichtigungstriggers
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Triggername" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="event_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event-Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. new_investment"
                        {...field}
                        disabled={true}
                      />
                    </FormControl>
                    <FormDescription>
                      Der Event-Key kann nicht geändert werden, da er für die Zuordnung verwendet wird.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschreiben Sie, wann dieser Trigger ausgelöst wird"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>E-Mail aktiviert</FormLabel>
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
                  
                  {form.watch("email_enabled") && (
                    <FormField
                      control={form.control}
                      name="email_template_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail-Vorlage</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen Sie eine Vorlage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Keine Vorlage</SelectItem>
                              {emailTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="push_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Push aktiviert</FormLabel>
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
                  
                  {form.watch("push_enabled") && (
                    <FormField
                      control={form.control}
                      name="push_template_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Push-Vorlage</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen Sie eine Vorlage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Keine Vorlage</SelectItem>
                              {pushTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={updateTrigger.isPending}>
                  {updateTrigger.isPending ? "Wird aktualisiert..." : "Aktualisieren"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Neuen Benachrichtigungstrigger erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Trigger für automatische Benachrichtigungen
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Triggername" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="event_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event-Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. new_investment"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Ein eindeutiger Schlüssel, der zur Identifizierung dieses Triggers verwendet wird.
                      Verwenden Sie Kleinbuchstaben und Unterstriche.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschreiben Sie, wann dieser Trigger ausgelöst wird"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>E-Mail aktiviert</FormLabel>
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
                  
                  {form.watch("email_enabled") && (
                    <FormField
                      control={form.control}
                      name="email_template_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail-Vorlage</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen Sie eine Vorlage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Keine Vorlage</SelectItem>
                              {emailTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="push_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Push aktiviert</FormLabel>
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
                  
                  {form.watch("push_enabled") && (
                    <FormField
                      control={form.control}
                      name="push_template_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Push-Vorlage</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen Sie eine Vorlage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Keine Vorlage</SelectItem>
                              {pushTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={createTrigger.isPending}>
                  {createTrigger.isPending ? "Wird erstellt..." : "Erstellen"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotificationTriggers;
