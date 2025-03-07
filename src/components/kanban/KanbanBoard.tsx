
import { DragDropContext, DropResult, Draggable } from "react-beautiful-dnd";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { CardDragPreview } from "@/components/kanban/CardDragPreview";
import { Content, Channel } from "@/models/types";
import { useToast } from "@/hooks/use-toast";
import { contentService } from "@/services/contentService";
import { useEffect, useState, useRef, useCallback } from "react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

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
  const { toast } = useToast();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStartPoint, setSelectionStartPoint] = useState({ x: 0, y: 0 });
  const [selectionEndPoint, setSelectionEndPoint] = useState({ x: 0, y: 0 });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDraggingSelected, setIsDraggingSelected] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const cardPositionsRef = useRef<Map<string, DOMRect>>(new Map());

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

  const isCardSelected = useCallback((cardId: string) => {
    return selectedCards.includes(cardId);
  }, [selectedCards]);

  const shouldRenderCard = useCallback((cardId: string) => {
    // Don't render selected cards when dragging selected cards
    if (isDraggingSelected && selectedCards.includes(cardId)) {
      return false;
    }
    return true;
  }, [isDraggingSelected, selectedCards]);

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
  }, [selectedCards]);

  const deleteSelectedCards = async () => {
    if (selectedCards.length === 0) return;
    
    setIsDeleting(true);
    try {
      for (const cardId of selectedCards) {
        await contentService.deleteContent(cardId);
      }
      
      toast({
        title: "Sucesso",
        description: `${selectedCards.length} cards removidos com sucesso.`
      });
      
      onCardsUpdate();
      setSelectedCards([]);
    } catch (error) {
      console.error("Erro ao excluir cards:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir os cards selecionados.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const registerCardPosition = useCallback((cardId: string, element: HTMLElement) => {
    if (element) {
      const rect = element.getBoundingClientRect();
      cardPositionsRef.current.set(cardId, rect);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only deselect if clicking on the board and not on a card or other UI element
    if (!(e.target as HTMLElement).closest('.kanban-card') && 
        !(e.target as HTMLElement).closest('.droppable-area') &&
        !(e.target as HTMLElement).closest('button')) {
      setSelectedCards([]);
      
      setIsSelecting(true);
      
      if (boardRef.current) {
        const boardRect = boardRef.current.getBoundingClientRect();
        const startX = e.clientX - boardRect.left;
        const startY = e.clientY - boardRect.top;
        
        setSelectionStartPoint({ x: startX, y: startY });
        setSelectionEndPoint({ x: startX, y: startY });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !boardRef.current) return;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const currentX = e.clientX - boardRect.left;
    const currentY = e.clientY - boardRect.top;
    
    setSelectionEndPoint({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    
    if (selectionBoxRef.current) {
      const selectionRect = selectionBoxRef.current.getBoundingClientRect();
      
      const newSelectedCards: string[] = [];
      cardPositionsRef.current.forEach((cardRect, cardId) => {
        if (
          cardRect.right >= selectionRect.left &&
          cardRect.left <= selectionRect.right &&
          cardRect.bottom >= selectionRect.top &&
          cardRect.top <= selectionRect.bottom
        ) {
          newSelectedCards.push(cardId);
        }
      });
      
      if (newSelectedCards.length > 0) {
        onCardSelect(newSelectedCards.join(','), { ctrlKey: true } as React.MouseEvent);
      }
    }
  };

  const getSelectionBoxStyle = () => {
    if (!isSelecting) return { display: 'none' };
    
    const left = Math.min(selectionStartPoint.x, selectionEndPoint.x);
    const top = Math.min(selectionStartPoint.y, selectionEndPoint.y);
    const width = Math.abs(selectionEndPoint.x - selectionStartPoint.x);
    const height = Math.abs(selectionEndPoint.y - selectionStartPoint.y);
    
    return {
      display: 'block',
      position: 'absolute' as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      background: 'rgba(59, 130, 246, 0.2)',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      zIndex: 10
    };
  };

  const handleDragStart = (result: any) => {
    const { draggableId } = result;
    setDraggedItem(draggableId);
    
    if (selectedCards.includes(draggableId) && selectedCards.length > 1) {
      setIsDraggingSelected(true);
    }
  };
  
  const handleDragEnd = async (result: DropResult) => {
    setIsDraggingSelected(false);
    setDraggedItem(null);
    
    const { source, destination, draggableId } = result;
    
    if (!destination) {
      return;
    }

    const isMultiCardMove = selectedCards.includes(draggableId) && selectedCards.length > 1;
    
    if (isMultiCardMove) {
      await moveSelectedCards(source.droppableId, destination.droppableId, destination.index);
    } else {
      // Single card move
      if (source.droppableId === destination.droppableId) {
        // Same column reordering
        const columnCards = [...cards, ...epics].filter(
          card => card.status === source.droppableId
        ).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        
        const draggedCard = columnCards.find(card => card.id === draggableId);
        if (!draggedCard) return;
        
        const newColumnCards = [...columnCards];
        newColumnCards.splice(source.index, 1);
        newColumnCards.splice(destination.index, 0, draggedCard);
        
        const updates = newColumnCards.map((card, index) => ({
          id: card.id,
          index
        }));
        
        try {
          await contentService.updateContentIndices(updates);
          toast({
            title: "Sucesso",
            description: "Ordem dos cards atualizada com sucesso."
          });
          onCardsUpdate();
        } catch (error) {
          console.error("Erro ao reordenar cards:", error);
          toast({
            title: "Erro",
            description: "Não foi possível salvar a nova ordem.",
            variant: "destructive"
          });
          onCardsUpdate();
        }
      } 
      else {
        // Moving to different column
        const allCards = [...cards, ...epics];
        const movedCard = allCards.find(card => card.id === draggableId);
        
        if (!movedCard) return;
        
        const destinationCards = allCards
          .filter(card => card.status === destination.droppableId)
          .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        
        destinationCards.splice(destination.index, 0, {
          ...movedCard,
          status: destination.droppableId
        });
        
        const destinationUpdates = destinationCards.map((card, index) => ({
          id: card.id,
          index
        }));
        
        try {
          await contentService.updateContent(draggableId, {
            status: destination.droppableId
          });
          
          await contentService.updateContentIndices(destinationUpdates);
          
          toast({
            title: "Conteúdo atualizado",
            description: "Status e posição atualizados com sucesso."
          });
          onCardsUpdate();
        } catch (error) {
          console.error("Erro ao atualizar status:", error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o status ou a posição.",
            variant: "destructive"
          });
          onCardsUpdate();
        }
      }
    }
  };

  const moveSelectedCards = async (sourceStatus: string, destinationStatus: string, destinationStartIndex: number) => {
    try {
      const selectedCardObjects = [...cards, ...epics].filter(card => selectedCards.includes(card.id));
      
      if (selectedCardObjects.length === 0) return;
      
      // Get current cards in the destination column (excluding selected cards)
      const destinationCards = [...cards, ...epics]
        .filter(card => card.status === destinationStatus && !selectedCards.includes(card.id))
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      // Insert selected cards at the destination index
      for (let i = 0; i < selectedCardObjects.length; i++) {
        destinationCards.splice(destinationStartIndex + i, 0, {
          ...selectedCardObjects[i],
          status: destinationStatus
        });
      }
      
      // Create updates with new indices
      const destinationUpdates = destinationCards.map((card, index) => ({
        id: card.id,
        index
      }));
      
      // Update all selected cards to the new status
      for (const cardId of selectedCards) {
        await contentService.updateContent(cardId, {
          status: destinationStatus
        });
      }
      
      // Update indices in the destination column
      await contentService.updateContentIndices(destinationUpdates);
      
      toast({
        title: "Sucesso",
        description: `${selectedCards.length} cards movidos com sucesso.`
      });
      
      // Clear selection after successful move
      setSelectedCards([]);
      onCardsUpdate();
    } catch (error) {
      console.error("Erro ao mover múltiplos cards:", error);
      toast({
        title: "Erro",
        description: "Não foi possível mover os cards selecionados.",
        variant: "destructive"
      });
      onCardsUpdate();
    }
  };

  const renderDragPreview = () => {
    if (isDraggingSelected && draggedItem && selectedCards.includes(draggedItem)) {
      return (
        <div className="fixed pointer-events-none z-50" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <CardDragPreview count={selectedCards.length} />
        </div>
      );
    }
    return null;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div 
        ref={boardRef}
        className="overflow-x-auto max-w-full pb-4 relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={selectionBoxRef} style={getSelectionBoxStyle()} />
        
        {renderDragPreview()}
        
        <div className="flex flex-row flex-nowrap gap-4 min-h-[70vh]">
          {selectedChannel?.statuses?.map((status) => (
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

        {selectedCards.length > 0 && (
          <div 
            className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 shadow-lg flex items-center gap-2 animate-fade-in"
          >
            <span>{selectedCards.length} cards selecionados</span>
          </div>
        )}
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
