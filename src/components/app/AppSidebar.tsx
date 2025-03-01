
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  LayoutDashboard,
  ListChecks,
  Calendar,
  Newspaper,
  Settings,
  HelpCircle,
  Plus,
  Layers
} from "lucide-react";
import { MainNavItem } from "@/types";
import { NavLink } from "@/components/app/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChannelDialog } from "@/components/channels/ChannelDialog";
import { useToast } from "@/hooks/use-toast";
import { channelService } from "@/services/channelService";
import { Channel } from "@/models/types";
import { useSidebar } from "@/components/ui/sidebar";

interface AppSidebarProps {
  isMobile?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentView?: "dashboard" | "kanban" | "calendar" | "projects";
  onNavigate?: (view: string, params?: any) => void;
}

export function AppSidebar({ 
  isMobile = false, 
  onOpenChange = () => {}, 
  currentView = "dashboard",
  onNavigate = () => {} 
}: AppSidebarProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const { state: sidebarState, openMobile, setOpenMobile } = useSidebar();

  const navigationItems: MainNavItem[] = [
    {
      title: t("navigation.home"),
      href: "/",
      icon: Home
    },
    {
      title: t("navigation.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      title: t("navigation.projects"),
      href: "/projects",
      icon: ListChecks
    },
    {
      title: t("navigation.calendar"),
      href: "/calendar",
      icon: Calendar
    },
    {
      title: t("navigation.news"),
      href: "/news",
      icon: Newspaper
    },
    {
      title: t("navigation.channelManager"),
      href: "/channels/manage",
      icon: Layers
    },
  ];

  const settingsItems: MainNavItem[] = [
    {
      title: t("navigation.settings"),
      href: "/settings",
      icon: Settings
    },
    {
      title: t("navigation.help"),
      href: "/help",
      icon: HelpCircle
    }
  ];

  const handleCreateChannel = async (channel: Omit<Channel, "id" | "createdAt" | "updatedAt">) => {
    try {
      await channelService.createChannel(channel);
      toast({
        title: "Sucesso",
        description: "Canal criado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao criar canal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o canal.",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (item: MainNavItem) => {
    if (item.href === "/") {
      onNavigate("dashboard");
    } else if (item.href.includes("dashboard")) {
      onNavigate("dashboard");
    } else if (item.href.includes("projects")) {
      onNavigate("projects");
    } else if (item.href.includes("calendar")) {
      onNavigate("calendar");
    } else if (item.href.includes("kanban")) {
      onNavigate("kanban");
    }
  };

  // Mobile sidebar appears as a Sheet
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="pr-0">
          <SheetHeader className="space-y-2.5">
            <SheetTitle>Content Hub</SheetTitle>
            <SheetDescription>
              Gerencie seu conteúdo de forma eficiente.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="px-4 py-2"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
          <Separator />
          <div className="py-4">
            {settingsItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="px-4 py-2"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
          <Separator />
          <div className="mt-4 px-4">
            <ThemeToggle />
          </div>
          
          <div className="mt-4 px-4">
            <Button onClick={() => setOpenCreateDialog(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {t("channels.newChannel")}
            </Button>
          </div>
          
          {/* Diálogo de criação de canal */}
          <ChannelDialog
            open={openCreateDialog}
            onOpenChange={setOpenCreateDialog}
            onSave={handleCreateChannel}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <div className="h-screen w-64 border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Content Hub</h2>
      </div>
      <div className="py-4">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            className="px-4 py-2 mx-2 my-1"
            onClick={() => handleNavigation(item)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
      <Separator />
      <div className="py-4">
        {settingsItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            className="px-4 py-2 mx-2 my-1"
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
      <Separator />
      <div className="fixed bottom-4 w-64 p-4 flex items-center justify-between">
        <ThemeToggle />
        <Button onClick={() => setOpenCreateDialog(true)} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("channels.newChannel")}
        </Button>
      </div>
      
      {/* Diálogo de criação de canal */}
      <ChannelDialog
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
        onSave={handleCreateChannel}
      />
    </div>
  );
}
