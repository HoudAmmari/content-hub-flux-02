
import { useEffect, useRef, useCallback, useState } from "react";
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
import { DropResult, ResponderProvided } from "react-beautiful-dnd";

interface KanbanBoardProps {
  selectedChannel: Channel | null;
  cards: Content[];
  epics: Content[];
  showEpics: boolean;
  onCardsUpdate: () => void;
  selectedCards: string[];
  onCardSelect: (cardId: string, event: React.MouseEvent) => void;
  pageSize: number;
}

export function KanbanBoard({ 
  selectedChannel, 
  cards, 
  epics, 
  showEpics, 
  onCardsUpdate,
  selectedCards,
  onCardSelect,
  pageSize 
}: KanbanBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  
  const { deleteDialogOpen, setDeleteDialogOpen, isDeleting, deleteSelectedCards } = 
    useCardDeletion(onCardsUpdate);
    
  // Track which columns need to be refreshed after a DnD operation
  const [columnsToRefresh, setColumnsToRefresh] = useState<Set<string>>(new Set());
  
  // Function to refresh specific columns instead of the entire board
  const refreshColumns = useCallback((columnIds: string[]) => {
    setColumnsToRefresh(new Set(columnIds));
  }, []);
  
  // Clear the refresh flag once processed
  const clearColumnsToRefresh = useCallback(() => {
    setColumnsToRefresh(new Set());
  }, []);
  
  // Use a more optimistic approach for drag and drop with a callback to avoid full refresh
  const handleOptimisticUpdate = useCallback((sourceStatus?: string, destinationStatus?: string) => {
    if (sourceStatus && destinationStatus) {
      // If we know which columns changed, just refresh those
      refreshColumns([sourceStatus, destinationStatus]);
    }
    // Only log the update instead of triggering a full refresh
    console.log("Card positions updated optimistically");
  }, [refreshColumns]);
  
  const { handleDragEnd } = useCardDragDrop({ 
    cards, 
    epics, 
    selectedCards, 
    onCardsUpdate: handleOptimisticUpdate 
  });
  
  const { 
    isSelecting, 
    selectionStartPoint, 
    selectionEndPoint, 
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

  // Handle clicking outside of cards to clear selection
  const handleBoardClick = (e: React.MouseEvent) => {
    // Only clear selection if clicking directly on the board (not on a card or in selection mode)
    if (!isSelecting && e.target === boardRef.current || (e.target as HTMLElement).classList.contains('kanban-board-background')) {
      onCardSelect('', {} as React.MouseEvent);
    }
    handleMouseDown(e);
  };

  const handleDeleteConfirm = () => {
    deleteSelectedCards(selectedCards);
  };
  
  // Customize DnD handler to track which columns need refreshing
  const handleBoardDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const { source, destination, draggableId } = result;
    
    // If there's no destination, nothing to do
    if (!destination) {
      return handleDragEnd(result, provided);
    }
    
    // Extract status from droppableIds to know which columns to refresh
    const sourceStatus = source.droppableId.startsWith('status-') ? 
      source.droppableId.substring(7) : source.droppableId;
    
    const destinationStatus = destination.droppableId.startsWith('status-') ? 
      destination.droppableId.substring(7) : destination.droppableId;
    
    // Call the original handler but capture which columns to refresh
    handleDragEnd(result, provided);
    
    // Update only the affected columns
    if (sourceStatus !== destinationStatus) {
      handleOptimisticUpdate(sourceStatus, destinationStatus);
    } else {
      handleOptimisticUpdate(sourceStatus);
    }
  };

  return (
    <DragPreviewWrapper 
      selectedCards={selectedCards} 
      onDragEnd={handleBoardDragEnd}
    >
      <div 
        ref={boardRef}
        className="overflow-x-auto max-w-full pb-4 relative kanban-board-background"
        onMouseDown={handleBoardClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ minHeight: '70vh' }}
      >
        <SelectionBox 
          isSelecting={isSelecting}
          startPoint={selectionStartPoint}
          endPoint={selectionEndPoint}
        />
        
        <KanbanColumns 
          selectedChannel={selectedChannel}
          cards={cards}
          epics={epics}
          showEpics={showEpics}
          onCardsUpdate={handleOptimisticUpdate}
          selectedCards={selectedCards}
          onCardSelect={onCardSelect}
          registerCardPosition={registerCardPosition}
          pageSize={pageSize}
          columnsToRefresh={columnsToRefresh}
          onColumnsRefreshed={clearColumnsToRefresh}
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
