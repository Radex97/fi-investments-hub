
import { useState } from "react";
import { Eye, Search, UserPlus, Filter, Download } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock user data
const usersData = [
  {
    id: 1,
    name: "Max Mustermann",
    email: "max.mustermann@example.com",
    role: "Admin",
    invested: "€ 25.000",
    status: "Aktiv",
    products: ["FI Wealth Protection", "FI Inflationsschutz Plus"]
  },
  {
    id: 2,
    name: "Anna Schmidt",
    email: "anna.schmidt@example.com",
    role: "Benutzer",
    invested: "€ 10.000",
    status: "Aktiv",
    products: ["FI Wealth Protection"]
  },
  {
    id: 3,
    name: "Thomas Weber",
    email: "thomas.weber@example.com",
    role: "Benutzer",
    invested: "€ 50.000",
    status: "Aktiv",
    products: ["FI Wealth Protection Institutional"]
  },
  {
    id: 4,
    name: "Lisa Meyer",
    email: "lisa.meyer@example.com",
    role: "Benutzer",
    invested: "€ 5.000",
    status: "Pending",
    products: ["FI Inflationsschutz Plus"]
  },
  {
    id: 5,
    name: "Michael Fischer",
    email: "michael.fischer@example.com",
    role: "Admin",
    invested: "€ 75.000",
    status: "Aktiv",
    products: ["FI Wealth Protection", "FI Wealth Protection Institutional"]
  }
];

const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(usersData);
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Benutzerverwaltung</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Benutzer hinzufügen
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-between space-y-4 md:flex-row">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Benutzern..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Nach Status filtern</DropdownMenuLabel>
              <DropdownMenuItem>Aktiv</DropdownMenuItem>
              <DropdownMenuItem>Pending</DropdownMenuItem>
              <DropdownMenuItem>Inaktiv</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Nach Rolle filtern</DropdownMenuLabel>
              <DropdownMenuItem>Admin</DropdownMenuItem>
              <DropdownMenuItem>Benutzer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">E-Mail</TableHead>
              <TableHead className="hidden md:table-cell">Rolle</TableHead>
              <TableHead>Investiert</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead>Produkte</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={user.role === "Admin" ? "default" : "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.invested}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={user.status === "Aktiv" ? "success" : "secondary"} 
                    className={user.status === "Aktiv" ? "bg-green-500" : "bg-yellow-500"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.products.length}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center p-4">
          <p className="text-muted-foreground">Keine Benutzer gefunden.</p>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
