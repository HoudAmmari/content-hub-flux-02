
import { Channel, Content } from "@/models/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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
  // Estado para controlar paginação por coluna
  const [visibleCardsCount, setVisibleCardsCount] = useState<Record<string, number>>({});

  // Inicializar contagem para cada status quando o canal muda
  useEffect(() => {
    if (selectedChannel && selectedChannel.statuses) {
      const initialCounts: Record<string, number> = {};
      selectedChannel.statuses.forEach(status => {
        initialCounts[status.name] = pageSize;
      });
      setVisibleCardsCount(initialCounts);
    }
  }, [selectedChannel, pageSize]);

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

  const handleLoadMore = (status: string) => {
    setVisibleCardsCount(prev => ({
      ...prev,
      [status]: (prev[status] || pageSize) + pageSize
    }));
  };

  return (
    <div className="flex flex-row flex-nowrap gap-4" style={{ minHeight: '70vh', paddingBottom: '100px' }}>
      {selectedChannel?.statuses?.map((status) => {
        const droppableId = `status-${status.name}`;
        const allColumnCards = getColumnCards(status.name);
        const visibleCount = visibleCardsCount[status.name] || pageSize;
        const visibleCards = allColumnCards.slice(0, visibleCount);
        const hasMoreCards = allColumnCards.length > visibleCount;
        
        return (
          <div key={status.name} className="shrink-0 w-64">
            <KanbanColumn
              status={status}
              title={status.name}
              droppableId={droppableId}
              type="CARD"
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
              {hasMoreCards && (
                <div className="py-2 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs flex items-center"
                    onClick={() => handleLoadMore(status.name)}
                  >
                    Mostrar mais <ChevronDown className="ml-1 h-3 w-3" />
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
