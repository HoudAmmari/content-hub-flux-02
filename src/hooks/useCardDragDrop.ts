
import { useState, useCallback } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Content } from "@/models/types";
import { contentService } from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";

interface UseCardDragDropProps {
  cards: Content[];
  epics: Content[];
  selectedCards: string[];
  setSelectedCards: (cards: string[]) => void;
  onCardsUpdate: () => void;
}

export function useCardDragDrop({
  cards,
  epics,
  selectedCards,
  setSelectedCards,
  onCardsUpdate
}: UseCardDragDropProps) {
  const { toast } = useToast();
  const [isDraggingSelected, setIsDraggingSelected] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = useCallback((result: any) => {
    const { draggableId } = result;
    setDraggedItem(draggableId);
    
    if (selectedCards.includes(draggableId) && selectedCards.length > 1) {
      setIsDraggingSelected(true);
    }
  }, [selectedCards]);
  
  const handleDragEnd = useCallback(async (result: DropResult) => {
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
        await reorderCardsInSameColumn(source, destination, draggableId);
      } 
      else {
        // Moving to different column
        await moveCardToNewColumn(draggableId, destination);
      }
    }
  }, [selectedCards]);

  const reorderCardsInSameColumn = async (source: any, destination: any, draggableId: string) => {
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
  };

  const moveCardToNewColumn = async (cardId: string, destination: any) => {
    const allCards = [...cards, ...epics];
    const movedCard = allCards.find(card => card.id === cardId);
    
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
      await contentService.updateContent(cardId, {
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

  return {
    isDraggingSelected,
    draggedItem,
    handleDragStart,
    handleDragEnd
  };
}
