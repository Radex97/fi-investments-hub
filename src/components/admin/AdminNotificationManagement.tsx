
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminNotificationTemplates from "./AdminNotificationTemplates";
import AdminNotificationTriggers from "./AdminNotificationTriggers";
import AdminManualNotification from "./AdminManualNotification";
import AdminNotificationLogs from "./AdminNotificationLogs";
import AdminNotificationSettings from "./AdminNotificationSettings";

const AdminNotificationManagement = () => {
  const [activeTab, setActiveTab] = useState("templates");

  // Update URL hash based on active tab
  useEffect(() => {
    if (window.location.hash !== `#${activeTab}`) {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  // Set initial tab based on URL hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && ["templates", "triggers", "manual", "logs", "settings"].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Benachrichtigungsverwaltung</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Vorlagen, Trigger und senden Sie manuelle Benachrichtigungen an Nutzer
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          <TabsTrigger value="triggers">Trigger</TabsTrigger>
          <TabsTrigger value="manual">Manuell senden</TabsTrigger>
          <TabsTrigger value="logs">Protokoll</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungsvorlagen</CardTitle>
              <CardDescription>
                Verwalten Sie E-Mail- und Push-Benachrichtigungsvorlagen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminNotificationTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungstrigger</CardTitle>
              <CardDescription>
                Konfigurieren Sie, wann automatische Benachrichtigungen gesendet werden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminNotificationTriggers />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manuelle Benachrichtigung</CardTitle>
              <CardDescription>
                Senden Sie benutzerdefinierte Benachrichtigungen an einzelne oder mehrere Benutzer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminManualNotification />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungsprotokolle</CardTitle>
              <CardDescription>
                Sehen Sie alle gesendeten Benachrichtigungen ein
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminNotificationLogs />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungseinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Standardeinstellungen für Benutzerbenachrichtigungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminNotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNotificationManagement;
