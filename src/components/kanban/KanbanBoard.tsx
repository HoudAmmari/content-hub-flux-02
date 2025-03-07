
import { useEffect, useRef } from "react";
import { Content, Channel } from "@/models/types";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useCardSelection } from "@/hooks/useCardSelection";
import { SelectionBox } from "./SelectionBox";
import { SelectionIndicator } from "./SelectionIndicator";
import { useSelectionBox } from "@/hooks/useSelectionBox";
import { useCardDeletion } from "@/hooks/useCardDeletion";
import { useCardDragDrop } from "@/hooks/useCardDragDrop";
import { DragPreviewWrapper } from "./DragPreviewWrapper";
import { KanbanColumns } from "./KanbanColumns";

interface KanbanBoardProps {
  selectedChannel: Channel | null;
  cards: Content[];
  epics: Content[];
  showEpics: boolean;
  onCardsUpdate: () => void;
  selectedCards: string[];
  onCardSelect: (cardId: string, event: React.MouseEvent) => void;
}

export function KanbanBoard({ 
  selectedChannel, 
  cards, 
  epics, 
  showEpics, 
  onCardsUpdate,
  selectedCards,
  onCardSelect 
}: KanbanBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  
  const { deleteDialogOpen, setDeleteDialogOpen, isDeleting, deleteSelectedCards } = 
    useCardDeletion(onCardsUpdate);
  
  const { handleDragEnd } = useCardDragDrop({ 
    cards, 
    epics, 
    selectedCards, 
    onCardsUpdate 
  });
  
  const { 
    isSelecting, 
    selectionStartPoint, 
    selectionEndPoint, 
    selectionBoxRef,
    registerCardPosition, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp 
  } = useSelectionBox({
    boardRef,
    onSelectionComplete: (selectedIds) => {
      onCardSelect(selectedIds.join(','), { ctrlKey: true } as React.MouseEvent);
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedCards.length > 0) {
        setDeleteDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCards, setDeleteDialogOpen]);

  const handleDeleteConfirm = () => {
    deleteSelectedCards(selectedCards);
  };

  return (
    <DragPreviewWrapper 
      selectedCards={selectedCards} 
      onDragEnd={handleDragEnd}
    >
      <div 
        ref={boardRef}
        className="overflow-x-auto max-w-full pb-4 relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={selectionBoxRef}>
          <SelectionBox 
            isSelecting={isSelecting}
            startPoint={selectionStartPoint}
            endPoint={selectionEndPoint}
          />
        </div>
        
        <KanbanColumns 
          selectedChannel={selectedChannel}
          cards={cards}
          epics={epics}
          showEpics={showEpics}
          onCardsUpdate={onCardsUpdate}
          selectedCards={selectedCards}
          onCardSelect={onCardSelect}
          registerCardPosition={registerCardPosition}
        />

        <SelectionIndicator selectedCount={selectedCards.length} />
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        count={selectedCards.length}
      />
    </DragPreviewWrapper>
  );
}
