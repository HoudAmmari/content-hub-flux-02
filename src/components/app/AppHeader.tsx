
import { Bell, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NewContentDialog } from "@/components/content/NewContentDialog";
import { useState } from "react";

interface AppHeaderProps {
  currentView: string;
}

export function AppHeader({ currentView }: AppHeaderProps) {
  const [openNewContent, setOpenNewContent] = useState(false);

  // Mapping of views to titles
  const viewTitles: Record<string, string> = {
    dashboard: "Dashboard",
    kanban: "Conteúdos",
    calendar: "Calendário",
    projects: "Projetos"
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{viewTitles[currentView] || "ContentHub"}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9 bg-background"
            />
          </div>
          
          <Button 
            variant="default" 
            size="sm"
            className="gap-1"
            onClick={() => setOpenNewContent(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Novo</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <NewContentDialog open={openNewContent} onOpenChange={setOpenNewContent} />
    </header>
  );
}
