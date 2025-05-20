import { useState } from "react";
import { Database, Layers, Table, Key, RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

// Mock database tables
const databaseTables = [
  {
    name: "users",
    rows: 156,
    lastUpdated: "2025-04-08 13:45:22",
    size: "1.2 MB",
    fields: ["id", "name", "email", "role", "created_at", "last_login"]
  },
  {
    name: "products",
    rows: 8,
    lastUpdated: "2025-04-07 10:12:45",
    size: "0.3 MB",
    fields: ["id", "title", "description", "returns", "risk", "category"]
  },
  {
    name: "investments",
    rows: 320,
    lastUpdated: "2025-04-09 09:30:15",
    size: "2.1 MB",
    fields: ["id", "user_id", "product_id", "amount", "date", "status"]
  },
  {
    name: "documents",
    rows: 45,
    lastUpdated: "2025-04-05 16:22:33",
    size: "8.7 MB",
    fields: ["id", "type", "filename", "path", "product_id", "uploaded_at"]
  },
];

const AdminDatabaseManagement = () => {
  const [expandedTable, setExpandedTable] = useState(null);
  
  const toggleTableExpansion = (tableName) => {
    setExpandedTable(expandedTable === tableName ? null : tableName);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Datenbankverwaltung</h1>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Aktualisieren
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Datenbankgröße
            </CardTitle>
            <Database className="h-4 w-4 text-[#B1904B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.3 MB</div>
            <p className="text-xs text-muted-foreground">
              +4% gegenüber letztem Monat
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tabellen
            </CardTitle>
            <Table className="h-4 w-4 text-[#B1904B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Aktive Datenbanktabellen
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Datensätze
            </CardTitle>
            <Layers className="h-4 w-4 text-[#B1904B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">529</div>
            <p className="text-xs text-muted-foreground">
              Gesamt in allen Tabellen
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Auslastung
            </CardTitle>
            <Key className="h-4 w-4 text-[#B1904B]" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">15%</div>
              <div className="text-xs text-muted-foreground">80 GB verfügbar</div>
            </div>
            <Progress className="mt-2" value={15} />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Datenbanktabellen</CardTitle>
          <CardDescription>
            Übersicht aller Tabellen in der Datenbank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {databaseTables.map((table) => (
              <Collapsible
                key={table.name}
                open={expandedTable === table.name}
                onOpenChange={() => toggleTableExpansion(table.name)}
                className="border rounded-md"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Table className="h-5 w-5 text-[#003595]" />
                    <span className="font-medium">{table.name}</span>
                    <span className="text-sm text-muted-foreground">({table.rows} Einträge)</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="hidden sm:block text-xs text-muted-foreground">
                      Letzte Änderung: {table.lastUpdated}
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${expandedTable === table.name ? "rotate-90" : ""}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <Separator />
                  <div className="px-4 py-3 bg-muted/50">
                    <div className="mb-2">
                      <span className="text-sm font-medium">Felder:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {table.fields.map((field) => (
                          <Badge key={field} variant="outline" className="bg-white">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-sm">
                      <span>Größe: {table.size}</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Exportieren</Button>
                        <Button size="sm">Bearbeiten</Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            4 Tabellen gefunden
          </div>
          <Button>Neue Tabelle</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminDatabaseManagement;
