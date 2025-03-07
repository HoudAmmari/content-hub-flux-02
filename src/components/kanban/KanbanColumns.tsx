
import { Channel, Content } from "@/models/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnsProps {
  selectedChannel: Channel | null;
  cards: Content[];
  epics: Content[];
  showEpics: boolean;
  onCardsUpdate: () => void;
  selectedCards: string[];
  onCardSelect: (cardId: string, event: React.MouseEvent) => void;
  registerCardPosition: (cardId: string, element: HTMLElement) => void;
}

export function KanbanColumns({
  selectedChannel,
  cards,
  epics,
  showEpics,
  onCardsUpdate,
  selectedCards,
  onCardSelect,
  registerCardPosition
}: KanbanColumnsProps) {
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

  // Create a safe droppable ID from the status name
  const createDroppableId = (statusName: string) => {
    return `status-${statusName.replace(/\s+/g, '-').toLowerCase()}`;
  };

  return (
    <div className="flex flex-row flex-nowrap gap-4 min-h-[70vh]">
      {selectedChannel?.statuses?.map((status) => (
        <div key={status.name} className="shrink-0 w-64">
          <KanbanColumn
            status={status}
            title={status.name}
            droppableId={createDroppableId(status.name)}
            type="CARD"
          >
            {getColumnCards(status.name).map((card, index) => (
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
          </KanbanColumn>
        </div>
      ))}
    </div>
  );
}
