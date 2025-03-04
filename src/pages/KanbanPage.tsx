import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { NewContentDialog } from "@/components/content/NewContentDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Content, Channel } from "@/models/types";
import { contentService } from "@/services/contentService";
import { channelService } from "@/services/channelService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";

export function KanbanPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { channelId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState<Content[]>([]);
  const [epics, setEpics] = useState<Content[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [showEpics, setShowEpics] = useState(false);
  const [openNewContent, setOpenNewContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (channels.length === 0) return;

    if (channelId) {
      const channel = channels.find((c) => c.id === channelId);
      if (channel) {
        setSelectedChannelId(channel.id);
        setSelectedChannel(channel);
      } else {
        navigate("/");
      }
    } else if (channels.length > 0) {
      setSelectedChannelId(channels[0].id);
      setSelectedChannel(channels[0]);
    }
  }, [channels, channelId]);

  useEffect(() => {
    if (selectedChannelId) {
      fetchContents();
    }
  }, [selectedChannelId, showEpics]);

  const fetchChannels = async () => {
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
    }
  };

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      if (!selectedChannel) return;

      const contentsData = await contentService.getContentsByChannel(
        selectedChannel.id
      );
      setCards(contentsData);

      if (showEpics) {
        const epicsData = await contentService.getEpicsByChannel(
          selectedChannel.id
        );
        setEpics(epicsData);
      } else {
        setEpics([]);
      }
    } catch (error) {
      console.error("Erro ao buscar conteúdos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os conteúdos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) return;

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === draggableId ? { ...card, status: destination.droppableId } : card
      )
    );

    try {
      const cardToUpdate = cards.find((card) => card.id === draggableId);
      if (cardToUpdate) {
        await contentService.updateContent(draggableId, {
          status: destination.droppableId,
        });

        toast({
          title: "Conteúdo atualizado",
          description: "Status atualizado com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === draggableId ? { ...card, status: source.droppableId } : card
        )
      );
    }
  };

  const handleShowEpicsChange = (show: boolean) => {
    setShowEpics(show);
  };

  const getColumnCards = (status: string) => {
    const columnCards = cards.filter((card) => card.status === status);
    if (showEpics) {
      const epicCards = epics.filter((epic) => epic.status === status);
      return [...columnCards, ...epicCards];
    }
    return columnCards;
  };

  const renderColumns = () => {
    if (!selectedChannel) return null;
    return selectedChannel.statuses.map((status) => (
      <div key={status.index} className="shrink-0 w-64">
        <KanbanColumn
          status={status}
          title={status.name}
          droppableId={status.name}
        >
          {getColumnCards(status.name).map((card, index) => (
            <KanbanCard
              key={card.id}
              card={card}
              index={index}
              onUpdate={fetchContents}
            />
          ))}
        </KanbanColumn>
      </div>
    ));
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <h1 className="text-2xl font-semibold">{selectedChannel?.name || t("kanban.board")}</h1>
        </div>

        <div className="flex gap-4 items-center">
          {selectedChannel && selectedChannel.name.toLowerCase() === "youtube" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="show-epics"
                checked={showEpics}
                onCheckedChange={handleShowEpicsChange}
              />
              <Label htmlFor="show-epics" className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>
                  {showEpics ? t("content.hideEpics") : t("content.showEpics")}
                </span>
                <Badge className="ml-1 bg-purple-500/20 text-purple-700 hover:bg-purple-500/30">
                  {epics.length}
                </Badge>
              </Label>
            </div>
          )}

          <Button onClick={() => setOpenNewContent(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            <span>{t("content.newContent")}</span>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="kanban">
          <TabsList className="mb-4">
            <TabsTrigger value="kanban">{t("kanban.board")}</TabsTrigger>
            <TabsTrigger value="list">{t("kanban.list")}</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                {t("general.loading")}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="overflow-x-auto max-w-full pb-4">
                  <div className="flex flex-row flex-nowrap gap-4 min-h-[70vh]">
                    {renderColumns()}
                  </div>
                </div>
              </DragDropContext>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <div className="rounded-md border">
              <div className="p-8 text-center text-muted-foreground">
                {t("general.noResults")}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewContentDialog
        open={openNewContent}
        onOpenChange={setOpenNewContent}
        channel={selectedChannel}
        onSuccess={fetchContents}
      />
    </div>
  );
}
