
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard, 
  Kanban, 
  Calendar, 
  FolderKanban, 
  Settings, 
  PlusCircle,
  Users,
  Layers
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Channel } from "@/models/types";
import { channelService } from "@/services/channelService";
import { useToast } from "@/hooks/use-toast";
import { ChannelDialog } from "@/components/channels/ChannelDialog";

interface AppSidebarProps {
  onNavigate: (view: string, params?: any) => void;
  currentView: string;
}

export function AppSidebar({ onNavigate, currentView }: AppSidebarProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const data = await channelService.getAllChannels();
      setChannels(data);
    } catch (error) {
      console.error("Erro ao buscar canais:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os canais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChannel = async (channelData: Omit<Channel, "id" | "createdAt" | "updatedAt">) => {
    try {
      await channelService.createChannel(channelData);
      fetchChannels();
    } catch (error) {
      console.error("Erro ao criar canal:", error);
      throw error;
    }
  };
  
  const navItems = [
    {
      title: t("navigation.dashboard"),
      icon: LayoutDashboard,
      view: "dashboard"
    },
    {
      title: t("navigation.content"),
      icon: Kanban,
      view: "kanban"
    },
    {
      title: t("navigation.calendar"),
      icon: Calendar,
      view: "calendar"
    },
    {
      title: t("navigation.projects"),
      icon: FolderKanban,
      view: "projects"
    },
    {
      title: t("navigation.channels"),
      icon: Layers,
      view: "channels"
    }
  ];

  const bottomItems = [
    {
      title: t("navigation.settings"),
      icon: Settings,
      view: "settings"
    }
  ];

  // Determina se está visualizando um canal específico
  const isViewingChannel = currentView === "kanban" && typeof currentView === "string";

  return (
    <Sidebar className="border-r border-border bg-muted/40 backdrop-blur-xl">
      <SidebarHeader className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <div className="font-semibold text-lg">ContentHub</div>
        </div>
        {isMobile && <SidebarTrigger />}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={cn(
                      currentView === item.view ? "bg-accent text-accent-foreground" : "hover:bg-muted/80"
                    )}
                    onClick={() => onNavigate(item.view)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-2">{t("navigation.channels")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="px-6 py-2 text-xs text-muted-foreground">
                  {t("general.loading")}
                </div>
              ) : (
                channels.map((channel) => (
                  <SidebarMenuItem key={channel.id}>
                    <SidebarMenuButton 
                      className={cn(
                        isViewingChannel && currentView === channel.name.toLowerCase() 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-muted/80"
                      )}
                      onClick={() => onNavigate("kanban", { channel: channel.name })}
                    >
                      <Kanban className="w-4 h-4 mr-3" />
                      <span>{channel.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="text-muted-foreground hover:bg-muted/80"
                  onClick={() => setDialogOpen(true)}
                >
                  <PlusCircle className="w-4 h-4 mr-3" />
                  <span>{t("navigation.newChannel")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t px-6 py-4">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton className="hover:bg-muted/80">
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>

      <ChannelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleCreateChannel}
      />
    </Sidebar>
  );
}
