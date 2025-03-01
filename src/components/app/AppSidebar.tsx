import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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

interface AppSidebarProps {
  isMobile: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppSidebar({ isMobile, onOpenChange }: AppSidebarProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);

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

  return (
    <Sheet open={isMobile} onOpenChange={onOpenChange}>
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
