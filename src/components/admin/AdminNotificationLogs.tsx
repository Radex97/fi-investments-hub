
import { useAdminNotificationLogs } from "@/hooks/useAdminNotifications";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const AdminNotificationLogs = ({ limit = undefined }: { limit?: number }) => {
  const { data: logs, isLoading } = useAdminNotificationLogs();
  
  const displayLogs = limit ? logs?.slice(0, limit) : logs;
  
  if (isLoading) {
    return <div className="text-center py-4">Lade Protokolle...</div>;
  }
  
  return (
    <div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Administrator</TableHead>
              <TableHead>Empfänger</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Vorlage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayLogs && displayLogs.length > 0 ? (
              displayLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                  </TableCell>
                  <TableCell>{log.admin_id.substring(0, 8)}...</TableCell>
                  <TableCell>{log.sent_to_user_id ? log.sent_to_user_id.substring(0, 8) + "..." : "Alle"}</TableCell>
                  <TableCell>
                    <Badge variant={log.custom_content ? "outline" : "default"}>
                      {log.custom_content ? "Benutzerdefiniert" : "Vorlage"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.template_id ? log.template_id.substring(0, 8) + "..." : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Keine Protokolle gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminNotificationLogs;
