
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

  // Helper function to get status from droppableId
  const getStatusFromDroppableId = (droppableId: string): string => {
    if (droppableId.startsWith('status-')) {
      return droppableId.substring(7); // Remove 'status-' prefix
    }
    return droppableId;
  };

  // Helper function to get card ID from draggableId
  const getCardIdFromDraggableId = (draggableId: string): string => {
    if (draggableId.startsWith('card-')) {
      return draggableId.substring(5); // Remove 'card-' prefix
    }
    return draggableId;
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log("Drag end result:", result);
    
    const { source, destination, draggableId } = result;
    
    // If there's no destination, the card was dropped outside a valid area
    if (!destination) {
      console.log("No destination found, ignoring drag");
      return;
    }

    // Get the status names and card ID
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
      onCardsUpdate();
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
    } catch (error) {
      console.error("Erro ao reordenar cards:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a nova ordem.",
        variant: "destructive"
      });
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
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status ou a posição.",
        variant: "destructive"
      });
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
    } catch (error) {
      console.error("Erro ao mover múltiplos cards:", error);
      toast({
        title: "Erro",
        description: "Não foi possível mover os cards selecionados.",
        variant: "destructive"
      });
    }
  };

  return { handleDragEnd };
}
