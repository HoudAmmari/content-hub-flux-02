
import { DragDropContext } from "react-beautiful-dnd";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { SelectionBox } from "./SelectionBox";
import { SelectionIndicator } from "./SelectionIndicator";
import { DragPreviewWrapper } from "./DragPreviewWrapper";
import { KanbanColumns } from "./KanbanColumns";
import { Content, Channel } from "@/models/types";
import { useCallback } from "react";
import { useSelectionBox } from "@/hooks/useSelectionBox";
import { useCardDragDrop } from "@/hooks/useCardDragDrop";
import { useCardDeletion } from "@/hooks/useCardDeletion";

interface KanbanBoardProps {
  selectedChannel: Channel | null;
  cards: Content[];
  epics: Content[];
  showEpics: boolean;
  onCardsUpdate: () => void;
  selectedCards: string[];
  onCardSelect: (cardId: string, event: React.MouseEvent) => void;
  setSelectedCards: (cards: string[]) => void;
}

export function KanbanBoard({ 
  selectedChannel, 
  cards, 
  epics, 
  showEpics, 
  onCardsUpdate,
  selectedCards,
  onCardSelect,
  setSelectedCards
}: KanbanBoardProps) {
  // Use our custom hooks
  const {
    boardRef,
    selectionBoxRef,
    isSelecting,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getSelectionBoxStyle,
    registerCardPosition,
    getSelectedCardIds
  } = useSelectionBox();

  const {
    isDraggingSelected,
    draggedItem,
    handleDragStart,
    handleDragEnd
  } = useCardDragDrop({
    cards,
    epics,
    selectedCards,
    setSelectedCards,
    onCardsUpdate
  });

  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    deleteSelectedCards
  } = useCardDeletion({
    selectedCards,
    setSelectedCards,
    onCardsUpdate
  });

  // Handle selection box completion
  const handleSelectionComplete = useCallback(() => {
    if (!isSelecting) return;
    
    const newSelectedCards = getSelectedCardIds();
    if (newSelectedCards.length > 0) {
      // Use metaKey (Command key on Mac, Ctrl key on Windows) to add to existing selection
      onCardSelect(newSelectedCards.join(','), { ctrlKey: true } as React.MouseEvent);
    }
    
    handleMouseUp();
  }, [isSelecting, getSelectedCardIds, onCardSelect, handleMouseUp]);

  // Get cards for a column
  const getColumnCards = useCallback((status: string) => {
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
  }, [cards, epics, showEpics]);

  // Check if a card is selected
  const isCardSelected = useCallback((cardId: string) => {
    return selectedCards.includes(cardId);
  }, [selectedCards]);

  // Determine if a card should be rendered
  const shouldRenderCard = useCallback((cardId: string) => {
    // Don't render selected cards when dragging selected cards
    if (isDraggingSelected && selectedCards.includes(cardId)) {
      return false;
    }
    return true;
  }, [isDraggingSelected, selectedCards]);

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div 
        ref={boardRef}
        className="overflow-x-auto max-w-full pb-4 relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleSelectionComplete}
        onMouseLeave={handleSelectionComplete}
      >
        <div ref={selectionBoxRef}>
          <SelectionBox 
            isSelecting={isSelecting} 
            style={getSelectionBoxStyle()} 
          />
        </div>
        
        <DragPreviewWrapper
          isDraggingSelected={isDraggingSelected}
          draggedItem={draggedItem}
          selectedCards={selectedCards}
        >
          <KanbanColumns
            selectedChannel={selectedChannel}
            cards={cards}
            epics={epics}
            getColumnCards={getColumnCards}
            isCardSelected={isCardSelected}
            shouldRenderCard={shouldRenderCard}
            onCardSelect={onCardSelect}
            registerCardPosition={registerCardPosition}
            isDraggingSelected={isDraggingSelected}
            selectedCards={selectedCards}
            onCardsUpdate={onCardsUpdate}
          />
        </DragPreviewWrapper>

        <SelectionIndicator selectedCount={selectedCards.length} />
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={deleteSelectedCards}
        isDeleting={isDeleting}
        count={selectedCards.length}
      />
    </DragDropContext>
  );
}
