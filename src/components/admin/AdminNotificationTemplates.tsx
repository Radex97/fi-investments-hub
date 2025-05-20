import { useState } from "react";
import { 
  useNotificationTemplates, 
  useCreateNotificationTemplate, 
  useUpdateNotificationTemplate, 
  useDeleteNotificationTemplate,
  NotificationTemplate
} from "@/hooks/useNotificationTemplates";
import { getAvailableTemplateVariables } from "@/services/NotificationService";
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
import { Edit, Trash, Plus, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Helper component to display the variables that can be used in templates
const VariablesList = () => {
  const variables = getAvailableTemplateVariables();
  
  return (
    <div className="mt-4 text-sm">
      <h4 className="font-medium mb-2">Verfügbare Variablen:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {variables.map((variable) => (
          <div key={variable.key} className="flex items-start space-x-2">
            <Badge variant="outline" className="text-xs">
              {`{{${variable.key}}}`}
            </Badge>
            <span className="text-muted-foreground text-xs">{variable.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const templateFormSchema = z.object({
  name: z.string().min(1, "Name wird benötigt"),
  type: z.enum(["email", "push"], { required_error: "Typ wird benötigt" }),
  trigger_event: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  content_html: z.string().optional().nullable(),
  content_text: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

const AdminNotificationTemplates = () => {
  const { data: templates, isLoading } = useNotificationTemplates();
  const createTemplate = useCreateNotificationTemplate();
  const updateTemplate = useUpdateNotificationTemplate();
  const deleteTemplate = useDeleteNotificationTemplate();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<NotificationTemplate | null>(null);
  
  // Form setup
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      type: "email" as const,
      trigger_event: "",
      subject: "",
      content_html: "",
      content_text: "",
      is_active: true,
    }
  });
  
  // Open edit dialog and populate form
  const handleEdit = (template: NotificationTemplate) => {
    setCurrentTemplate(template);
    form.reset({
      name: template.name,
      type: template.type,
      trigger_event: template.trigger_event || "",
      subject: template.subject || "",
      content_html: template.content_html || "",
      content_text: template.content_text || "",
      is_active: template.is_active,
    });
    setIsEditDialogOpen(true);
  };
  
  // Open create dialog with fresh form
  const handleCreate = () => {
    form.reset({
      name: "",
      type: "email" as const,
      trigger_event: "",
      subject: "",
      content_html: "",
      content_text: "",
      is_active: true,
    });
    setIsCreateDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = (template: NotificationTemplate) => {
    setCurrentTemplate(template);
    setIsDeleteDialogOpen(true);
  };
  
  // Execute delete
  const confirmDelete = () => {
    if (currentTemplate) {
      deleteTemplate.mutate(currentTemplate.id);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Open preview dialog
  const handlePreview = (template: NotificationTemplate) => {
    setCurrentTemplate(template);
    setIsPreviewDialogOpen(true);
  };
  
  // Handle form submission for create
  const onCreateSubmit = (values: TemplateFormValues) => {
    createTemplate.mutate({
      name: values.name,
      type: values.type,
      trigger_event: values.trigger_event || null,
      subject: values.subject || null,
      content_html: values.type === "email" ? values.content_html : null,
      content_text: values.type === "push" ? values.content_text : null,
      is_active: values.is_active,
      variables: []
    });
    setIsCreateDialogOpen(false);
  };
  
  // Handle form submission for edit
  const onEditSubmit = (values: TemplateFormValues) => {
    if (currentTemplate) {
      updateTemplate.mutate({
        id: currentTemplate.id,
        template: {
          name: values.name,
          type: values.type,
          trigger_event: values.trigger_event || null,
          subject: values.subject || null,
          content_html: values.type === "email" ? values.content_html : null,
          content_text: values.type === "push" ? values.content_text : null,
          is_active: values.is_active,
        }
      });
      setIsEditDialogOpen(false);
    }
  };
  
  // Helper watch to show/hide fields based on type
  const watchType = form.watch("type");
  
  if (isLoading) {
    return <div className="text-center py-4">Lade Vorlagen...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Vorlagen ({templates?.length || 0})</h3>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Vorlage
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates && templates.length > 0 ? (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant={template.type === "email" ? "default" : "secondary"}>
                      {template.type === "email" ? "E-Mail" : "Push"}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.trigger_event || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "outline" : "destructive"}>
                      {template.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreview(template)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(template)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Keine Vorlagen gefunden. Erstellen Sie eine neue Vorlage.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Neue Benachrichtigungsvorlage erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine neue E-Mail- oder Push-Benachrichtigungsvorlage
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
                      <Input placeholder="Vorlagenname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen Sie den Typ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">E-Mail</SelectItem>
                        <SelectItem value="push">Push-Benachrichtigung</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trigger_event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger-Event (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. new_investment, payment_received"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Der eindeutige Schlüssel, mit dem diese Vorlage mit einem Trigger verknüpft wird
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchType === "email" && (
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Betreff</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E-Mail-Betreff"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {watchType === "email" ? (
                <FormField
                  control={form.control}
                  name="content_html"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML-Inhalt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="<div>Hier kommt der HTML-Inhalt der E-Mail</div>"
                          className="min-h-[200px] font-mono text-sm"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="content_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Push-Nachricht</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Kurze Nachricht für Push-Benachrichtigung"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Aktiv</FormLabel>
                      <FormDescription>
                        Steuert, ob diese Vorlage für automatische Benachrichtigungen verwendet werden kann.
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
              
              <VariablesList />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={createTemplate.isPending}>
                  {createTemplate.isPending ? "Wird erstellt..." : "Erstellen"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Benachrichtigungsvorlage bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Einstellungen dieser Benachrichtigungsvorlage
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
                      <Input placeholder="Vorlagenname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen Sie den Typ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">E-Mail</SelectItem>
                        <SelectItem value="push">Push-Benachrichtigung</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trigger_event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger-Event (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. new_investment, payment_received"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Der eindeutige Schlüssel, mit dem diese Vorlage mit einem Trigger verknüpft wird
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchType === "email" && (
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Betreff</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E-Mail-Betreff"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {watchType === "email" ? (
                <FormField
                  control={form.control}
                  name="content_html"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML-Inhalt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="<div>Hier kommt der HTML-Inhalt der E-Mail</div>"
                          className="min-h-[200px] font-mono text-sm"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="content_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Push-Nachricht</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Kurze Nachricht für Push-Benachrichtigung"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Aktiv</FormLabel>
                      <FormDescription>
                        Steuert, ob diese Vorlage für automatische Benachrichtigungen verwendet werden kann.
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
              
              <VariablesList />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={updateTemplate.isPending}>
                  {updateTemplate.isPending ? "Wird aktualisiert..." : "Aktualisieren"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vorlage löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie die Vorlage "{currentTemplate?.name}" löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending ? "Wird gelöscht..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Vorschau: {currentTemplate?.name}</DialogTitle>
            <DialogDescription>
              {currentTemplate?.type === "email" ? "E-Mail-Vorschau" : "Push-Benachrichtigung Vorschau"}
            </DialogDescription>
          </DialogHeader>
          
          {currentTemplate?.type === "email" ? (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <div className="font-medium">Betreff:</div>
                <div>{currentTemplate.subject}</div>
              </div>
              <div>
                <div className="font-medium mb-2">Inhalt:</div>
                <div className="border p-4 rounded-md bg-white">
                  <div dangerouslySetInnerHTML={{ __html: currentTemplate.content_html || "" }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="border p-4 rounded-md bg-gray-100">
              <div className="text-sm font-medium mb-1">Benachrichtigung</div>
              <div className="font-medium">FI Investments</div>
              <div>{currentTemplate?.content_text}</div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotificationTemplates;
