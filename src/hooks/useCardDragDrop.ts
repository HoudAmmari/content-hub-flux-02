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
    console.log(`Getting status from droppableId: ${droppableId}`);
    
    // If the droppableId follows our format (status-name-with-dashes), extract the original name
    if (droppableId.startsWith('status-')) {
      // Get all possible statuses from cards and epics
      const allCards = [...cards, ...epics];
      const allPossibleStatuses = [...new Set(allCards.map(card => card.status))];
      
      console.log("All possible statuses:", allPossibleStatuses);
      
      // Try to find the matching status by converting each possible status to a droppable ID
      // and comparing with the given droppableId
      for (const status of allPossibleStatuses) {
        const computedDroppableId = `status-${status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        console.log(`Comparing with: ${status} -> ${computedDroppableId}`);
        
        if (computedDroppableId === droppableId) {
          return status;
        }
      }
    }
    
    // If we can't determine the original status, return the droppableId as is
    console.log(`Could not find status for droppableId: ${droppableId}, using fallback method`);
    
    // Fallback method: try to extract status name from droppableId format
    if (droppableId.startsWith('status-')) {
      const statusPart = droppableId.substring(7);  // Remove "status-" prefix
      // Try to find a close match in possible statuses
      const allCards = [...cards, ...epics];
      const allPossibleStatuses = [...new Set(allCards.map(card => card.status))];
      
      for (const status of allPossibleStatuses) {
        if (status.toLowerCase().replace(/[^a-z0-9]/g, '-') === statusPart) {
          return status;
        }
      }
    }
    
    return droppableId;
  };

  // Extract the card ID from draggableId (removing 'card-' prefix and any sanitization)
  const getCardIdFromDraggableId = (draggableId: string): string => {
    console.log(`Getting cardId from draggableId: ${draggableId}`);
    
    if (draggableId.startsWith('card-')) {
      const cardIdPart = draggableId.substring(5);
      
      // Find the actual card ID that matches this sanitized ID
      const allCards = [...cards, ...epics];
      for (const card of allCards) {
        const sanitizedId = card.id.replace(/[^a-zA-Z0-9-]/g, '');
        if (sanitizedId === cardIdPart) {
          console.log(`Found card ${card.id} for draggableId ${draggableId}`);
          return card.id;
        }
      }
      
      // Fallback: try direct match (for cases where IDs weren't sanitized)
      const directMatch = allCards.find(card => card.id === cardIdPart);
      if (directMatch) {
        console.log(`Found direct match card ${directMatch.id}`);
        return directMatch.id;
      }
    }
    
    console.log(`Could not find card for draggableId: ${draggableId}, using as is`);
    return draggableId.startsWith('card-') ? draggableId.substring(5) : draggableId;
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log("Drag end result:", result);
    
    const { source, destination, draggableId } = result;
    
    // If there's no destination, the card was dropped outside a valid area
    if (!destination) {
      console.log("No destination found, ignoring drag");
      return;
    }

    // Convert IDs to actual status names and card IDs
    const sourceStatus = getStatusFromDroppableId(source.droppableId);
    const destinationStatus = getStatusFromDroppableId(destination.droppableId);
    const cardId = getCardIdFromDraggableId(draggableId);
    
    console.log(`Moving card ${cardId} from ${sourceStatus} to ${destinationStatus}`);

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
      
      // Always update the UI after a drag operation
      setTimeout(() => {
        onCardsUpdate();
      }, 100);
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
    console.log(`Reordering in same column ${columnId} from index ${sourceIndex} to ${destinationIndex}`);
    
    const columnCards = [...cards, ...epics]
      .filter(card => card.status === columnId)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    
    const draggedCard = columnCards.find(card => card.id === cardId);
    if (!draggedCard) {
      console.error(`Card ${cardId} not found in column ${columnId}`);
      return;
    }
    
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
    console.log(`Moving card ${cardId} from ${sourceStatus} to ${destinationStatus} at index ${destinationIndex}`);
    
    const allCards = [...cards, ...epics];
    const movedCard = allCards.find(card => card.id === cardId);
    
    if (!movedCard) {
      console.error(`Card ${cardId} not found`);
      return;
    }
    
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
    console.log(`Moving ${selectedCards.length} selected cards from ${sourceStatus} to ${destinationStatus}`);
    
    try {
      const selectedCardObjects = [...cards, ...epics].filter(card => selectedCards.includes(card.id));
      
      if (selectedCardObjects.length === 0) {
        console.error("No selected cards found");
        return;
      }
      
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
