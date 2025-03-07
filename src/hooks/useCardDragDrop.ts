
import { DropResult } from "react-beautiful-dnd";
import { useToast } from "@/hooks/use-toast";
import { contentService } from "@/services/contentService";
import { Content } from "@/models/types";

interface UseCardDragDropProps {
  cards: Content[];
  epics: Content[];
  selectedCards: string[];
  onCardsUpdate: () => void;
}

export function useCardDragDrop({ 
  cards, 
  epics, 
  selectedCards, 
  onCardsUpdate 
}: UseCardDragDropProps) {
  const { toast } = useToast();

  // Helper function to convert droppableId back to status name
  const getStatusFromDroppableId = (droppableId: string): string => {
    // If the droppableId follows our format (status-name-with-dashes), extract the original name
    if (droppableId.startsWith('status-')) {
      const statusMatch = droppableId.match(/^status-(.+)$/);
      if (statusMatch && statusMatch[1]) {
        // Find the matching status from available statuses
        const allCards = [...cards, ...epics];
        const possibleStatuses = [...new Set(allCards.map(card => card.status))];
        
        // Find the status that matches this droppableId pattern
        for (const status of possibleStatuses) {
          const normalizedStatus = status.replace(/\s+/g, '-').toLowerCase();
          if (normalizedStatus === statusMatch[1]) {
            return status;
          }
        }
      }
    }
    
    // If we can't determine the original status, return the droppableId as is
    return droppableId;
  };

  // Extract the card ID from draggableId in case it has a prefix
  const getCardIdFromDraggableId = (draggableId: string): string => {
    if (draggableId.startsWith('card-')) {
      return draggableId.substring(5);
    }
    return draggableId;
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // If there's no destination, the card was dropped outside a valid area
    if (!destination) {
      return;
    }

    // Convert IDs to actual status names and card IDs
    const sourceStatus = getStatusFromDroppableId(source.droppableId);
    const destinationStatus = getStatusFromDroppableId(destination.droppableId);
    const cardId = getCardIdFromDraggableId(draggableId);

    // Check if this card is part of a multi-selection
    const isMultiCardMove = selectedCards.includes(cardId) && selectedCards.length > 1;
    
    try {
      if (isMultiCardMove) {
        await moveSelectedCards(sourceStatus, destinationStatus, destination.index);
      } else {
        if (sourceStatus === destinationStatus) {
          await handleSameColumnReorder(sourceStatus, source.index, destination.index, cardId);
        } else {
          await handleColumnChange(cardId, sourceStatus, destinationStatus, destination.index);
        }
      }
    } catch (error) {
      console.error("Erro durante o drag and drop:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao mover o(s) card(s).",
        variant: "destructive"
      });
      // Refresh the board to ensure UI consistency
      onCardsUpdate();
    }
  };

  const handleSameColumnReorder = async (
    columnId: string, 
    sourceIndex: number, 
    destinationIndex: number, 
    cardId: string
  ) => {
    const columnCards = [...cards, ...epics]
      .filter(card => card.status === columnId)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    
    const draggedCard = columnCards.find(card => card.id === cardId);
    if (!draggedCard) return;
    
    const newColumnCards = [...columnCards];
    newColumnCards.splice(sourceIndex, 1);
    newColumnCards.splice(destinationIndex, 0, draggedCard);
    
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

  const handleColumnChange = async (
    cardId: string,
    sourceStatus: string,
    destinationStatus: string,
    destinationIndex: number
  ) => {
    const allCards = [...cards, ...epics];
    const movedCard = allCards.find(card => card.id === cardId);
    
    if (!movedCard) return;
    
    const destinationCards = allCards
      .filter(card => card.status === destinationStatus)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    
    // Create a copy with the new status
    const updatedCard = {
      ...movedCard,
      status: destinationStatus
    };
    
    // Insert the card at the new position
    destinationCards.splice(destinationIndex, 0, updatedCard);
    
    const destinationUpdates = destinationCards.map((card, index) => ({
      id: card.id,
      index
    }));
    
    try {
      // First update the card's status
      await contentService.updateContent(cardId, {
        status: destinationStatus
      });
      
      // Then update all indices
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

  const moveSelectedCards = async (
    sourceStatus: string, 
    destinationStatus: string, 
    destinationStartIndex: number
  ) => {
    try {
      const selectedCardObjects = [...cards, ...epics].filter(card => selectedCards.includes(card.id));
      
      if (selectedCardObjects.length === 0) return;
      
      // Get all cards in the destination column that are not selected
      const destinationCards = [...cards, ...epics]
        .filter(card => card.status === destinationStatus && !selectedCards.includes(card.id))
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      // Insert all selected cards at the destination index
      for (let i = 0; i < selectedCardObjects.length; i++) {
        destinationCards.splice(destinationStartIndex + i, 0, {
          ...selectedCardObjects[i],
          status: destinationStatus
        });
      }
      
      // Prepare index updates for all cards in the destination column
      const destinationUpdates = destinationCards.map((card, index) => ({
        id: card.id,
        index
      }));
      
      // First update the status of all selected cards
      for (const cardId of selectedCards) {
        await contentService.updateContent(cardId, {
          status: destinationStatus
        });
      }
      
      // Then update all indices
      await contentService.updateContentIndices(destinationUpdates);
      
      toast({
        title: "Sucesso",
        description: `${selectedCards.length} cards movidos com sucesso.`
      });
      
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

  return { handleDragEnd };
}
