
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { channelService } from "@/services/channelService";
import { Channel } from "@/models/types";
import { ChannelDialog } from "@/components/channels/ChannelDialog";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export default function ChannelManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

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
      throw error;
    }
  };

  const handleUpdateChannel = async (channel: Omit<Channel, "id" | "createdAt" | "updatedAt">) => {
    if (!editingChannel) return;
    
    try {
      await channelService.updateChannel(editingChannel.id, channel);
      fetchChannels();
      toast({
        title: "Sucesso",
        description: "Canal atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar canal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o canal.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      await channelService.deleteChannel(id);
      fetchChannels();
      toast({
        title: "Sucesso",
        description: "Canal excluído com sucesso!",
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

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
  };

  const handleCloseEditDialog = () => {
    setEditingChannel(null);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("channels.manageChannels")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("channels.manageChannelsDescription")}
          </p>
        </div>
        <Button onClick={() => setOpenCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("channels.newChannel")}
        </Button>
      </div>

      <Separator className="my-6" />

      {isLoading ? (
        <div className="flex justify-center p-6">
          <p>{t("general.loading")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <Card key={channel.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{channel.name}</CardTitle>
                <CardDescription>
                  {channel.description || t("channels.noDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="text-sm font-medium mb-2">{t("channels.statuses")}:</h4>
                <div className="flex flex-wrap gap-2">
                  {channel.statuses.map((status) => (
                    <Badge key={status} variant="secondary">
                      {status}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/50 px-6 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditChannel(channel)}
                >
                  {t("general.edit")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(t("channels.confirmDelete"))) {
                      handleDeleteChannel(channel.id);
                    }
                  }}
                >
                  {t("general.delete")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de criação de canal */}
      <ChannelDialog
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
        onSave={handleCreateChannel}
      />

      {/* Diálogo de edição de canal */}
      <ChannelDialog
        channel={editingChannel || undefined}
        open={!!editingChannel}
        onOpenChange={handleCloseEditDialog}
        onSave={handleUpdateChannel}
      />
    </div>
  );
}
