
import { useState } from "react";
import { 
  useUsersList, 
  useSendManualNotification,
  UserBasicInfo
} from "@/hooks/useAdminNotifications";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";

const notificationFormSchema = z.object({
  userIds: z.array(z.string()).min(1, "Mindestens ein Benutzer muss ausgewählt sein"),
  templateId: z.string().optional(),
  subject: z.string().optional(),
  content: z.string().min(1, "Inhalt ist erforderlich"),
  sendEmail: z.boolean().default(true),
  sendPush: z.boolean().default(false),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const AdminManualNotification = () => {
  const { data: users, isLoading: isLoadingUsers } = useUsersList();
  const { data: templates, isLoading: isLoadingTemplates } = useNotificationTemplates();
  const sendManualNotification = useSendManualNotification();
  
  const [selectedUsers, setSelectedUsers] = useState<UserBasicInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  
  // Form setup
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      userIds: [],
      templateId: "",
      subject: "",
      content: "",
      sendEmail: true,
      sendPush: false,
    }
  });
  
  // Handle form submission
  const onSubmit = (values: NotificationFormValues) => {
    sendManualNotification.mutate({
      userIds: values.userIds,
      subject: values.subject,
      content: values.content,
      templateId: values.templateId || undefined,
      sendEmail: values.sendEmail,
      sendPush: values.sendPush
    }, {
      onSuccess: () => {
        form.reset();
        setSelectedUsers([]);
      }
    });
  };
  
  // Update form value when selected users change
  const handleSelectUser = (user: UserBasicInfo) => {
    const newSelectedUsers = [...selectedUsers];
    const index = newSelectedUsers.findIndex((u) => u.id === user.id);
    
    if (index === -1) {
      // Add user
      newSelectedUsers.push(user);
    } else {
      // Remove user
      newSelectedUsers.splice(index, 1);
    }
    
    setSelectedUsers(newSelectedUsers);
    
    // Update form value
    const userIds = newSelectedUsers.map((u) => u.id);
    form.setValue("userIds", userIds);
  };
  
  // Remove user from selected list
  const handleRemoveUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter((u) => u.id !== userId);
    setSelectedUsers(newSelectedUsers);
    
    // Update form value
    const userIds = newSelectedUsers.map((u) => u.id);
    form.setValue("userIds", userIds);
  };

  // Select all users
  const handleSelectAllUsers = () => {
    if (!users) return;
    
    if (selectedUsers.length === users.length) {
      // If all users are already selected, deselect all
      setSelectedUsers([]);
      form.setValue("userIds", []);
      toast({
        title: "Auswahl zurückgesetzt",
        description: "Alle Benutzer wurden abgewählt",
      });
    } else {
      // Select all users
      setSelectedUsers([...users]);
      const allUserIds = users.map(u => u.id);
      form.setValue("userIds", allUserIds);
      setCommandOpen(false);
      toast({
        title: "Alle Benutzer ausgewählt",
        description: `${users.length} Benutzer wurden ausgewählt`,
      });
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users?.filter((user) => {
    const searchString = searchTerm.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const firstName = (user.first_name || "").toLowerCase();
    const lastName = (user.last_name || "").toLowerCase();
    
    return email.includes(searchString) || 
           firstName.includes(searchString) || 
           lastName.includes(searchString);
  }) || [];
  
  // Get email templates only
  const emailTemplates = templates?.filter(t => t.type === "email") || [];
  
  // Handler for template selection
  const handleTemplateChange = (templateId: string) => {
    form.setValue("templateId", templateId);
    
    if (templateId) {
      // Find the template
      const template = templates?.find(t => t.id === templateId);
      if (template) {
        // Pre-fill subject and content from the template
        form.setValue("subject", template.subject || "");
        form.setValue("content", template.content_html || "");
      }
    }
  };
  
  const isLoading = isLoadingUsers || isLoadingTemplates;
  const isAllSelected = users && selectedUsers.length === users.length && users.length > 0;
  
  if (isLoading) {
    return <div className="text-center py-4">Lade Daten...</div>;
  }
  
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <FormLabel>Empfänger</FormLabel>
                    <Button 
                      type="button" 
                      variant={isAllSelected ? "destructive" : "outline"} 
                      size="sm" 
                      onClick={handleSelectAllUsers}
                      className="mb-1 flex items-center"
                    >
                      <UsersIcon className="mr-2 h-4 w-4" />
                      {isAllSelected ? "Alle abwählen" : "Alle auswählen"}
                    </Button>
                  </div>
                  <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value.length && "text-muted-foreground"
                          )}
                        >
                          {field.value.length
                            ? `${field.value.length} Benutzer ausgewählt`
                            : "Benutzer auswählen..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[400px]" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Benutzer suchen..." 
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                        />
                        <CommandList>
                          <CommandEmpty>Keine Benutzer gefunden.</CommandEmpty>
                          <CommandGroup>
                            {filteredUsers.map((user) => {
                              const isSelected = selectedUsers.some((u) => u.id === user.id);
                              return (
                                <CommandItem
                                  key={user.id}
                                  value={user.id}
                                  onSelect={() => handleSelectUser(user)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>
                                      {user.first_name} {user.last_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {user.email}
                                    </span>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Display selected users */}
                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUsers.map((user) => (
                        <Badge
                          key={user.id}
                          variant="secondary"
                          className="px-2 py-1 flex items-center"
                        >
                          {user.email}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-transparent"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <FormDescription>
                    Wählen Sie einen oder mehrere Empfänger für die Benachrichtigung aus.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vorlage (optional)</FormLabel>
                  <Select
                    onValueChange={handleTemplateChange}
                    value={field.value}
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
                  <FormDescription>
                    Sie können eine bestehende Vorlage verwenden oder eine benutzerdefinierte Nachricht verfassen.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Betreff</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Betreff der Benachrichtigung"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inhalt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Inhalt der Benachrichtigung"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Sie können HTML-Tags für die Formatierung verwenden.
                    Beispiel-Variablen: {'{'}user.first_name{'}'}, {'{'}user.last_name{'}'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sendEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Als E-Mail senden</FormLabel>
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
                name="sendPush"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Als Push-Benachrichtigung senden</FormLabel>
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
            className="w-full" 
            disabled={sendManualNotification.isPending || selectedUsers.length === 0}
          >
            {sendManualNotification.isPending ? "Wird gesendet..." : "Benachrichtigung senden"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminManualNotification;

