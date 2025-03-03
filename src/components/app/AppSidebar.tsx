
import { useState, useEffect } from "react";
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
  Layers,
  PlusCircle
} from "lucide-react";
import { MainNavItem } from "@/types";
import { NavLink } from "@/components/app/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChannelDialog } from "@/components/channels/ChannelDialog";
import { useToast } from "@/hooks/use-toast";
import { channelService } from "@/services/channelService";
import { Channel } from "@/models/types";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import channelMock from "@/services/mock/channel-mock";

interface AppSidebarProps {
  isMobile?: boolean;
  onOpenChange?: (open: boolean) => void;
  onNavigate?: (view: string, params?: { [k: string]: string | number | boolean }) => void;
}

export function AppSidebar ({
  isMobile = false,
  onOpenChange = () => { },
  onNavigate = () => { }
}: AppSidebarProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const { state: sidebarState, openMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const data = await channelService.getAllChannels();
      setChannels(data);
    } catch (error) {
      console.error("Erro ao buscar canais:", error);
      // Fallback para usar os dados do mock
      setChannels(channelMock);
    }
  };

  const navigationItems: MainNavItem[] = [
    {
      title: t("navigation.dashboard"),
      href: "/",
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
      title: t("navigation.newsletter"),
      href: "/newsletter",
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
      fetchChannels();
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
    } else if (item.href.includes("projects")) {
      onNavigate("projects");
    } else if (item.href.includes("calendar")) {
      onNavigate("calendar");
    } else if (item.href.includes("kanban")) {
      onNavigate("kanban");
    }
  };

  const handleChannelClick = (channel: Channel) => {
    onNavigate("kanban", { channelId: channel.id });
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
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-2">{t("navigation.channels")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {channels.map((channel) => (
                    <SidebarMenuItem key={channel.id}>
                      <SidebarMenuButton
                        className="text-muted-foreground hover:bg-muted/80"
                        onClick={() => handleChannelClick(channel)}
                      >
                        <span>{channel.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="text-muted-foreground hover:bg-muted/80"
                      onClick={() => setOpenCreateDialog(true)}
                    >
                      <PlusCircle className="w-4 h-4 mr-3" />
                      <span>{t("navigation.newChannel")}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
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

      <SidebarGroup>
        <SidebarGroupLabel className="px-6 py-2">{t("navigation.channels")}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {channels.map((channel) => (
              <SidebarMenuItem key={channel.id}>
                <NavLink
                  key={channel.id}
                  href={`/channels/${channel.id}`}
                  className="px-4 py-2"
                >
                  <span>{channel.name}</span>
                </NavLink>
              </SidebarMenuItem>

            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-muted-foreground hover:bg-muted/80"
                onClick={() => setOpenCreateDialog(true)}
              >
                <PlusCircle className="w-4 h-4 mr-3" />
                <span>{t("navigation.newChannel")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

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
