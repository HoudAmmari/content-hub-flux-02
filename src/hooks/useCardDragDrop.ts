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
      
      // Update the UI optimistically without triggering a full reload
      // Just notify that the operation was successful
      toast({
        title: "Sucesso",
        description: "Cards atualizados com sucesso"
      });
    } catch (error) {
      console.error("Erro durante o drag and drop:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao mover o(s) card(s).",
        variant: "destructive"
      });
      // Only refresh the board if there was an error to ensure UI consistency
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
    
    // Instead of relying on the current cards array which might be outdated,
    // fetch the card directly from the service
    try {
      const draggedCard = await contentService.getContentById(cardId);
      
      if (!draggedCard) {
        console.error(`Card ${cardId} not found`);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o card para reordenar.",
          variant: "destructive"
        });
        return;
      }
      
      // Get all cards in the column to update their indices
      const { contents: columnCards } = await contentService.getContentsByChannel(
        draggedCard.channelId,
        false,
        { status: columnId }
      );
      
      // Add epics if they exist in this column
      if (draggedCard.isEpic) {
        const { epics: columnEpics } = await contentService.getEpicsByChannel(
          draggedCard.channelId,
          { status: columnId }
        );
        columnCards.push(...columnEpics);
      }
      
      // Sort by current index
      columnCards.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      // Remove the dragged card from the array (it might be at a different position)
      const filteredCards = columnCards.filter(card => card.id !== cardId);
      
      // Insert the dragged card at the new position
      filteredCards.splice(destinationIndex, 0, draggedCard);
      
      const updates = filteredCards.map((card, index) => ({
        id: card.id,
        index
      }));
      
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
    
    try {
      // Get the card directly from the service to ensure we have the latest data
      const movedCard = await contentService.getContentById(cardId);
      
      if (!movedCard) {
        console.error(`Card ${cardId} not found`);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o card para mover.",
          variant: "destructive"
        });
        return;
      }
      
      // First update the card's status
      await contentService.updateContent(cardId, {
        status: destinationStatus
      });
      
      // Get all cards in the destination column
      const { contents: destinationCards } = await contentService.getContentsByChannel(
        movedCard.channelId,
        false,
        { status: destinationStatus }
      );
      
      // Add epics if needed
      if (movedCard.isEpic) {
        const { epics: destinationEpics } = await contentService.getEpicsByChannel(
          movedCard.channelId,
          { status: destinationStatus }
        );
        destinationCards.push(...destinationEpics);
      }
      
      // Sort by current index
      destinationCards.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      // Remove the moved card if it's already in the destination array (unlikely but possible)
      const filteredDestinationCards = destinationCards.filter(card => card.id !== cardId);
      
      // Create a copy with the new status
      const updatedCard = {
        ...movedCard,
        status: destinationStatus
      };
      
      // Insert the card at the new position
      filteredDestinationCards.splice(destinationIndex, 0, updatedCard);
      
      const destinationUpdates = filteredDestinationCards.map((card, index) => ({
        id: card.id,
        index
      }));
      
      // Update all indices
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
      // We'll fetch each card directly from the service to ensure we have the latest data
      const selectedCardObjects = [];
      let channelId = "";
      
      for (const cardId of selectedCards) {
        const card = await contentService.getContentById(cardId);
        if (card) {
          selectedCardObjects.push(card);
          if (!channelId) channelId = card.channelId;
        }
      }
      
      if (selectedCardObjects.length === 0) {
        console.error("No selected cards found");
        return;
      }
      
      // Get all cards in the destination column that are not selected
      const { contents: regularCards } = await contentService.getContentsByChannel(
        channelId,
        false,
        { status: destinationStatus }
      );
      
      const { epics: epicCards } = await contentService.getEpicsByChannel(
        channelId,
        { status: destinationStatus }
      );
      
      const destinationCards = [...regularCards, ...epicCards]
        .filter(card => !selectedCards.includes(card.id))
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
