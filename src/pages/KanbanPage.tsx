
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Content, Channel } from "@/models/types";
import { contentService } from "@/services/contentService";
import { channelService } from "@/services/channelService";
import { NewContentDialog } from "@/components/content/NewContentDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { KanbanHeader } from "@/components/kanban/KanbanHeader";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ChannelSelector } from "@/components/kanban/ChannelSelector";
import { useCardSelection } from "@/hooks/useCardSelection";

export function KanbanPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [cards, setCards] = useState<Content[]>([]);
  const [epics, setEpics] = useState<Content[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [showEpics, setShowEpics] = useState(false);
  const [openNewContent, setOpenNewContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { selectedCards, handleCardSelect } = useCardSelection(cards, epics);

  useEffect(() => {
    fetchChannels();
  }, []);

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

  const handleShowEpicsChange = (show: boolean) => {
    setShowEpics(show);
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannelId(channel.id);
    setSelectedChannel(channel);
  };

  return (
    <div className="space-y-4 w-full">
      <ChannelSelector 
        channels={channels} 
        onChannelSelect={handleChannelSelect} 
      />
      
      <KanbanHeader 
        selectedChannel={selectedChannel}
        showEpics={showEpics}
        onShowEpicsChange={handleShowEpicsChange}
        epicCount={epics.length}
        onNewContent={() => setOpenNewContent(true)}
      />

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
              <KanbanBoard
                selectedChannel={selectedChannel}
                cards={cards}
                epics={epics}
                showEpics={showEpics}
                onCardsUpdate={fetchContents}
                selectedCards={selectedCards}
                onCardSelect={handleCardSelect}
              />
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
