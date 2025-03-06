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
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [lastSelectedCard, setLastSelectedCard] = useState<string | null>(null);

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
      
      const sortedContents = contentsData.sort((a, b) => {
        if (a.status === b.status) {
          return (a.index ?? 0) - (b.index ?? 0);
        }
        return 0;
      });
      
      setCards(sortedContents);

      if (showEpics) {
        const epicsData = await contentService.getEpicsByChannel(
          selectedChannel.id
        );
        
        const sortedEpics = epicsData.sort((a, b) => {
          if (a.status === b.status) {
            return (a.index ?? 0) - (b.index ?? 0);
          }
          return 0;
        });
        
        setEpics(sortedEpics);
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
    const { source, destination, draggableId } = result;
    
    if (!destination) {
      return;
    }

    console.log("Drag ended:", { source, destination, draggableId });
    
    if (source.droppableId === destination.droppableId) {
      const columnCards = [...cards, ...epics].filter(
        card => card.status === source.droppableId
      ).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      const draggedCard = columnCards.find(card => card.id === draggableId);
      if (!draggedCard) return;
      
      const newColumnCards = [...columnCards];
      newColumnCards.splice(source.index, 1);
      newColumnCards.splice(destination.index, 0, draggedCard);
      
      const updates = newColumnCards.map((card, index) => ({
        id: card.id,
        index
      }));
      
      const updatedCards = cards.map(card => {
        const update = updates.find(u => u.id === card.id);
        if (update) {
          return { ...card, index: update.index };
        }
        return card;
      });
      
      const updatedEpics = epics.map(epic => {
        const update = updates.find(u => u.id === epic.id);
        if (update) {
          return { ...epic, index: update.index };
        }
        return epic;
      });
      
      setCards(updatedCards);
      setEpics(updatedEpics);
      
      try {
        await contentService.updateContentIndices(updates);
        toast({
          title: "Sucesso",
          description: "Ordem dos cards atualizada com sucesso."
        });
      } catch (error) {
        console.error("Erro ao reordenar cards:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a nova ordem.",
          variant: "destructive"
        });
        fetchContents();
      }
    } 
    else {
      const allCards = [...cards, ...epics];
      const movedCard = allCards.find(card => card.id === draggableId);
      
      if (!movedCard) return;
      
      const destinationCards = allCards
        .filter(card => card.status === destination.droppableId)
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      destinationCards.splice(destination.index, 0, {
        ...movedCard,
        status: destination.droppableId
      });
      
      const destinationUpdates = destinationCards.map((card, index) => ({
        id: card.id,
        index
      }));
      
      if (movedCard.isEpic) {
        setEpics(prev => prev.map(epic => 
          epic.id === draggableId 
            ? { ...epic, status: destination.droppableId } 
            : epic
        ));
      } else {
        setCards(prev => prev.map(card => 
          card.id === draggableId 
            ? { ...card, status: destination.droppableId } 
            : card
        ));
      }
      
      try {
        await contentService.updateContent(draggableId, {
          status: destination.droppableId
        });
        
        await contentService.updateContentIndices(destinationUpdates);
        
        toast({
          title: "Conteúdo atualizado",
          description: "Status e posição atualizados com sucesso."
        });
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status ou a posição.",
          variant: "destructive"
        });
        fetchContents();
      }
    }
  };

  const handleShowEpicsChange = (show: boolean) => {
    setShowEpics(show);
  };

  const handleCardSelect = (cardId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setSelectedCards(prev => 
        prev.includes(cardId) 
          ? prev.filter(id => id !== cardId) 
          : [...prev, cardId]
      );
      setLastSelectedCard(cardId);
    } else if (event.shiftKey && lastSelectedCard) {
      const allColumnCards = getColumnCardsFromId(cardId);
      const currentIndex = allColumnCards.findIndex(card => card.id === cardId);
      const lastIndex = allColumnCards.findIndex(card => card.id === lastSelectedCard);
      
      if (currentIndex >= 0 && lastIndex >= 0) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        
        const rangeIds = allColumnCards
          .slice(start, end + 1)
          .map(card => card.id);
        
        setSelectedCards(prev => {
          const newSelection = [...new Set([...prev, ...rangeIds])];
          return newSelection;
        });
      }
    } else {
      setSelectedCards(cardId === lastSelectedCard && selectedCards.length === 1 ? [] : [cardId]);
      setLastSelectedCard(cardId);
    }
  };

  const getColumnCardsFromId = (cardId: string) => {
    const card = [...cards, ...epics].find(c => c.id === cardId);
    if (!card) return [];
    
    return getColumnCards(card.status);
  };

  const getColumnCards = (status: string) => {
    const columnCards = cards
      .filter((card) => card.status === status)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
    if (showEpics) {
      const epicCards = epics
        .filter((epic) => epic.status === status)
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        
      return [...columnCards, ...epicCards];
    }
    return columnCards;
  };

  const isCardSelected = (cardId: string) => {
    return selectedCards.includes(cardId);
  };

  const renderColumns = () => {
    if (!selectedChannel) return null;
    
    return selectedChannel.statuses.map((status) => (
      <div key={status.name} className="shrink-0 w-64">
        <KanbanColumn
          status={status}
          title={status.name}
          droppableId={status.name}
          type="CARD"
        >
          {getColumnCards(status.name).map((card, index) => (
            <KanbanCard
              key={card.id}
              card={card}
              index={index}
              onUpdate={fetchContents}
              isSelected={isCardSelected(card.id)}
              onSelect={(e) => handleCardSelect(card.id, e)}
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
