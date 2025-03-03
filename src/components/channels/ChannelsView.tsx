import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Channel } from "@/models/types";
import { channelService } from "@/services/channelService";
import { ChannelDialog } from "@/components/channels/ChannelDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ChannelsView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

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

  const handleUpdateChannel = async (channelData: Omit<Channel, "id" | "createdAt" | "updatedAt">) => {
    if (!selectedChannel) return;
    
    try {
      await channelService.updateChannel(selectedChannel.id, channelData);
      fetchChannels();
    } catch (error) {
      console.error("Erro ao atualizar canal:", error);
      throw error;
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;
    
    try {
      await channelService.deleteChannel(channelToDelete.id);
      fetchChannels();
      setDeleteDialogOpen(false);
      setChannelToDelete(null);
      
      toast({
        title: "Sucesso",
        description: "Canal excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir canal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o canal.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (channel: Channel) => {
    setSelectedChannel(channel);
    setDialogOpen(true);
  };

  const openDeleteDialog = (channel: Channel) => {
    setChannelToDelete(channel);
    setDeleteDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setSelectedChannel(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedChannel(null);
    setDialogOpen(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("navigation.channels")}</h2>
        <Button onClick={handleOpenDialog} className="gap-1">
          <Plus className="h-4 w-4" />
          <span>{t("navigation.newChannel")}</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">
          {t("general.loading")}
        </div>
      ) : channels.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          {t("general.noResults")}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Card key={channel.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{channel.name}</CardTitle>
                    {channel.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {channel.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(channel)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>{t("general.edit")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(channel)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{t("general.delete")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      {t("channels.statuses")}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {channel.statuses.map((status) => (
                        <Badge key={status.name} variant="outline" className="text-xs">
                          {status.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 text-xs text-muted-foreground">
                {t("channels.createdAt")}: {formatDate(channel.createdAt)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ChannelDialog
        channel={selectedChannel || undefined}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSave={selectedChannel ? handleUpdateChannel : handleCreateChannel}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("general.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("channels.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("general.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChannel}>
              {t("general.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
