
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { Button } from "@/components/ui/button";
import { FilterX, ListFilter, Plus, Layers } from "lucide-react";
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
  const [showFilters, setShowFilters] = useState(false);
  const [showEpics, setShowEpics] = useState(false);
  const [openNewContent, setOpenNewContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => { 
    if(channels.length == 0) 
        return;

    if(channelId) {
        const channel = channels.find(c => c.id === channelId);
        if(channel) {
            setSelectedChannelId(channel.id);
            setSelectedChannel(channel);
        } else {
            navigate("/");
            return;
        }
    }
  }, [channels]);

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
      
      // Buscar conteúdos regulares
      const contentsData = await contentService.getContentsByChannel(selectedChannel.name);
      setCards(contentsData);
      
      // Buscar épicos, se necessário
      if (showEpics) {
        const epicsData = await contentService.getEpicsByChannel(selectedChannel.name);
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
    
    // Se a origem e o destino são iguais, não faz nada
    if (source.droppableId === destination.droppableId) return;
    
    // Atualiza a UI imediatamente para feedback instantâneo
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === draggableId ? { ...card, status: destination.droppableId } : card
      )
    );
    
    // Atualiza no banco de dados
    try {
      const cardToUpdate = cards.find(card => card.id === draggableId);
      if (cardToUpdate) {
        await contentService.updateContent(draggableId, {
          status: destination.droppableId
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
      
      // Reverte a alteração na UI em caso de erro
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === draggableId ? { ...card, status: source.droppableId } : card
        )
      );
    }
  };

  const handleChannelChange = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    setSelectedChannelId(channelId);
    setSelectedChannel(channel || null);
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

  const getTranslatedStatus = (status: string) => {
    return t(`kanban.${status}`) || status;
  };

  const renderColumns = () => {
    if (!selectedChannel) return null;
    
    return selectedChannel.statuses.map((status) => (
      <KanbanColumn 
        key={status} 
        id={status} 
        title={getTranslatedStatus(status)} 
        droppableId={status}
      >
        {getColumnCards(status).map((card, index) => (
          <KanbanCard 
            key={card.id} 
            card={card} 
            index={index}
            onUpdate={fetchContents}
          />
        ))}
      </KanbanColumn>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <h1 className="text-2xl font-semibold">{selectedChannel?.name}</h1>
          
          {/* <div className="flex items-center gap-2">
            <Button 
              variant={showFilters ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-1"
            >
              {showFilters ? <FilterX className="h-4 w-4" /> : <ListFilter className="h-4 w-4" />}
              <span>{showFilters ? t("kanban.clearFilters") : t("kanban.filters")}</span>
            </Button>
          </div> */}
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
                <span>{showEpics ? t("content.hideEpics") : t("content.showEpics")}</span>
                <Badge className="ml-1 bg-purple-500/20 text-purple-700 hover:bg-purple-500/30">
                  {epics.length}
                </Badge>
              </Label>
            </div>
          )}
          
          <Button 
            onClick={() => setOpenNewContent(true)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>{t("content.newContent")}</span>
          </Button>
        </div>
      </div>
      
      {/* {showFilters && <KanbanFilters />} */}
      
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
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : `grid-cols-${Math.min(selectedChannel?.statuses.length || 4, 4)} gap-4`}`}>
                  {renderColumns()}
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
