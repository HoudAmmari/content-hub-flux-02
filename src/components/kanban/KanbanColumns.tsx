
import { Content, Channel } from "@/models/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnsProps {
  selectedChannel: Channel | null;
  cards: Content[];
  epics: Content[];
  getColumnCards: (status: string) => Content[];
  isCardSelected: (cardId: string) => boolean;
  shouldRenderCard: (cardId: string) => boolean;
  onCardSelect: (cardId: string, event: React.MouseEvent) => void;
  registerCardPosition: (cardId: string, element: HTMLElement) => void;
  isDraggingSelected: boolean;
  selectedCards: string[];
  onCardsUpdate: () => void;
}

export function KanbanColumns({
  selectedChannel,
  getColumnCards,
  isCardSelected,
  shouldRenderCard,
  onCardSelect,
  registerCardPosition,
  isDraggingSelected,
  selectedCards,
  onCardsUpdate
}: KanbanColumnsProps) {
  if (!selectedChannel?.statuses?.length) return null;
  
  return (
    <div className="flex flex-row flex-nowrap gap-4 min-h-[70vh]">
      {selectedChannel.statuses.map((status) => (
        <div key={status.name} className="shrink-0 w-64">
          <KanbanColumn
            status={status}
            title={status.name}
            droppableId={status.name}
            type="CARD"
          >
            {getColumnCards(status.name).map((card, index) => (
              shouldRenderCard(card.id) && (
                <KanbanCard
                  key={card.id}
                  card={card}
                  index={index}
                  onUpdate={onCardsUpdate}
                  isSelected={isCardSelected(card.id)}
                  onSelect={(e) => onCardSelect(card.id, e)}
                  registerCardPosition={registerCardPosition}
                  selectedCardsCount={selectedCards.includes(card.id) ? selectedCards.length : 0}
                  isDraggingSelected={isDraggingSelected}
                />
              )
            ))}
          </KanbanColumn>
        </div>
      ))}
    </div>
  );
}
