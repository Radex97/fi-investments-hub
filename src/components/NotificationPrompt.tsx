
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { requestNotificationPermission } from "@/integrations/firebase/firebase";

const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if the prompt has been dismissed before
    const dismissed = localStorage.getItem("notification_prompt_dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Check if notifications are already permitted
    if (Notification.permission === "granted") {
      setShowPrompt(false);
      return;
    }

    // Wait a few seconds before showing the prompt
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    const success = await requestNotificationPermission();
    
    if (success) {
      toast.success("Benachrichtigungen aktiviert", {
        description: "Sie erhalten jetzt wichtige Benachrichtigungen."
      });
      setShowPrompt(false);
    } else {
      toast.error("Fehler beim Aktivieren der Benachrichtigungen", {
        description: "Bitte prüfen Sie Ihre Browser-Einstellungen."
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem("notification_prompt_dismissed", "true");
  };

  if (!showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-md">
      <Card className="bg-white shadow-lg border-fi-gold border-l-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Bell className="w-5 h-5 mr-2 text-fi-gold" />
            Benachrichtigungen aktivieren
          </CardTitle>
          <CardDescription>
            Erhalten Sie wichtige Updates zu Ihren Investitionen und Portfolios.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2 text-sm">
          <p>
            Bleiben Sie informiert über Transaktionen, neue Produkte und wichtige Änderungen.
          </p>
        </CardContent>
        <CardFooter className="pt-2 flex justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Später
          </Button>
          <Button className="bg-fi-gold hover:bg-fi-gold/90" size="sm" onClick={handleEnable}>
            Aktivieren
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificationPrompt;
