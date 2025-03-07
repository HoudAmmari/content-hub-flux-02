
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
  const [pageSize, setPageSize] = useState<number>(10);
  
  const { selectedCards, handleCardSelect, clearSelectionOnOutsideClick } = useCardSelection(cards, epics);

  useEffect(() => {
    fetchChannels();
  }, []);

  // Add effect to clear selection when clicking outside the board
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Check if click is outside the board area
      const boardElement = document.querySelector('.kanban-board-background');
      if (boardElement && !boardElement.contains(e.target as Node)) {
        clearSelectionOnOutsideClick();
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [clearSelectionOnOutsideClick]);

  // Carregar tamanho da página do localStorage
  useEffect(() => {
    const savedPageSize = localStorage.getItem('kanbanPageSize');
    if (savedPageSize) {
      setPageSize(parseInt(savedPageSize, 10));
    }
  }, []);

  // Atualizar o estado de loading quando o canal muda
  useEffect(() => {
    if (selectedChannelId) {
      setIsLoading(true);
      // Definir um timeout curto para simular o carregamento inicial
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedChannelId, showEpics]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    localStorage.setItem('kanbanPageSize', size.toString());
  };

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
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
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
                cards={[]} // Agora os cards são buscados diretamente no KanbanColumns
                epics={[]} // Agora os epics são buscados diretamente no KanbanColumns
                showEpics={showEpics}
                onCardsUpdate={() => setIsLoading(true)} // Apenas aciona o estado de loading
                selectedCards={selectedCards}
                onCardSelect={handleCardSelect}
                pageSize={pageSize}
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
        onSuccess={() => setIsLoading(true)}
      />
    </div>
  );
}
