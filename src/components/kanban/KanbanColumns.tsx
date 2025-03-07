
import { Channel, Content } from "@/models/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { contentService } from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface KanbanColumnsProps {
  selectedChannel: Channel | null;
  cards: Content[];
  epics: Content[];
  showEpics: boolean;
  onCardsUpdate: () => void;
  selectedCards: string[];
  onCardSelect: (cardId: string, event: React.MouseEvent) => void;
  registerCardPosition: (cardId: string, element: HTMLElement) => void;
  pageSize: number;
}

interface ColumnState {
  cards: Content[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  totalCount: number;
}

export function KanbanColumns({
  selectedChannel,
  cards,
  epics,
  showEpics,
  onCardsUpdate,
  selectedCards,
  onCardSelect,
  registerCardPosition,
  pageSize
}: KanbanColumnsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Estado para controlar paginação por coluna
  const [columnStates, setColumnStates] = useState<Record<string, ColumnState>>({});

  // Inicializar colunas quando o canal é selecionado ou quando muda o pageSize
  useEffect(() => {
    if (!selectedChannel) return;
    
    const loadInitialData = async () => {
      const newColumnStates: Record<string, ColumnState> = {};
      
      // Buscar dados para cada status separadamente
      for (const status of selectedChannel.statuses) {
        try {
          // Buscar conteúdos regulares
          const { contents, total } = await contentService.getContentsByChannel(
            selectedChannel.id,
            false,
            {
              status: status.name,
              page: 0,
              pageSize
            }
          );
          
          // Buscar épicos se necessário
          let epicResults = { epics: [] as Content[], total: 0 };
          if (showEpics) {
            epicResults = await contentService.getEpicsByChannel(
              selectedChannel.id,
              {
                status: status.name,
                page: 0,
                pageSize
              }
            );
          }
          
          // Combinar resultados
          const allCards = [...contents, ...epicResults.epics];
          const totalItems = total + epicResults.total;
          
          newColumnStates[status.name] = {
            cards: allCards,
            page: 0,
            hasMore: totalItems > allCards.length,
            loading: false,
            totalCount: totalItems
          };
        } catch (error) {
          console.error(`Erro ao carregar dados para o status ${status.name}:`, error);
          newColumnStates[status.name] = {
            cards: [],
            page: 0,
            hasMore: false,
            loading: false,
            totalCount: 0
          };
        }
      }
      
      setColumnStates(newColumnStates);
    };
    
    loadInitialData();
  }, [selectedChannel, showEpics, pageSize]);

  const handleLoadMore = async (status: string) => {
    if (!selectedChannel || !columnStates[status]) return;
    
    const currentState = columnStates[status];
    
    // Atualize o estado para mostrar carregamento
    setColumnStates(prev => ({
      ...prev,
      [status]: {
        ...prev[status],
        loading: true
      }
    }));
    
    try {
      // Buscar mais conteúdos para este status
      const nextPage = currentState.page + 1;
      
      // Buscar conteúdos regulares
      const { contents } = await contentService.getContentsByChannel(
        selectedChannel.id,
        false,
        {
          status,
          page: nextPage,
          pageSize
        }
      );
      
      // Buscar épicos se necessário
      let epicResults = { epics: [] as Content[] };
      if (showEpics) {
        epicResults = await contentService.getEpicsByChannel(
          selectedChannel.id,
          {
            status,
            page: nextPage,
            pageSize
          }
        );
      }
      
      // Combinar os resultados
      const newCards = [...contents, ...epicResults.epics];
      
      // Verificar se há mais itens para carregar
      const hasMore = newCards.length === pageSize;
      
      // Atualizar o estado com os novos cards
      setColumnStates(prev => ({
        ...prev,
        [status]: {
          ...prev[status],
          cards: [...prev[status].cards, ...newCards],
          page: nextPage,
          hasMore,
          loading: false
        }
      }));
    } catch (error) {
      console.error(`Erro ao carregar mais cards para ${status}:`, error);
      toast({
        title: t("general.error"),
        description: t("kanban.loadMoreError"),
        variant: "destructive"
      });
      
      // Resetar estado de carregamento
      setColumnStates(prev => ({
        ...prev,
        [status]: {
          ...prev[status],
          loading: false
        }
      }));
    }
  };

  const isCardSelected = (cardId: string) => {
    return selectedCards.includes(cardId);
  };

  return (
    <div className="flex flex-row flex-nowrap gap-4" style={{ minHeight: '70vh', paddingBottom: '100px' }}>
      {selectedChannel?.statuses?.map((status) => {
        const droppableId = `status-${status.name}`;
        const columnState = columnStates[status.name];
        
        if (!columnState) {
          return null;
        }
        
        const { cards: visibleCards, hasMore, loading, totalCount } = columnState;
        
        return (
          <div key={status.name} className="shrink-0 w-64">
            <KanbanColumn
              status={status}
              title={status.name}
              droppableId={droppableId}
              type="CARD"
              totalCount={totalCount}
            >
              {visibleCards.map((card, index) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  index={index}
                  onUpdate={onCardsUpdate}
                  isSelected={isCardSelected(card.id)}
                  onSelect={(e) => onCardSelect(card.id, e)}
                  registerCardPosition={registerCardPosition}
                />
              ))}
              {hasMore && (
                <div className="py-2 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs flex items-center justify-center gap-1"
                    onClick={() => handleLoadMore(status.name)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>{t("general.loading")}</>
                    ) : (
                      <>{t("kanban.loadMore")} <ChevronDown className="h-3 w-3" /></>
                    )}
                  </Button>
                </div>
              )}
            </KanbanColumn>
          </div>
        );
      })}
    </div>
  );
}
