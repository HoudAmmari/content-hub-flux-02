import { DropResult } from "react-beautiful-dnd";
import { useToast } from "@/hooks/use-toast";
import { contentService } from "@/services/contentService";
import { Content } from "@/models/types";
import { useCallback } from "react";

interface UseCardDragDropProps {
  cards: Content[];
  epics: Content[];
  selectedCards: string[];
  onCardsUpdate: (sourceStatus?: string, destinationStatus?: string) => void;
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
      
      // Notify success without triggering a full reload
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
    console.log(`Reordenando na mesma coluna ${columnId} do índice ${sourceIndex} para ${destinationIndex}`);
    
    try {
      const draggedCard = await contentService.getContentById(cardId);
      
      if (!draggedCard) {
        console.error(`Card ${cardId} não encontrado`);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o card para reordenar.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Card arrastado:", draggedCard);
      
      // Buscar todos os cards na coluna para atualizar seus índices
      const { contents: regularCards } = await contentService.getContentsByChannel(
        draggedCard.channelId,
        false,
        { status: columnId }
      );
      
      const allCards = [...regularCards];
      
      // Adicionar épicos se necessário
      if (draggedCard.isEpic) {
        const { epics: epicCards } = await contentService.getEpicsByChannel(
          draggedCard.channelId,
          { status: columnId }
        );
        allCards.push(...epicCards);
      }
      
      // Ordenar pelo índice atual
      allCards.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      // Log da ordem atual para depuração
      console.log("Antes da reordenação:", allCards.map(c => ({ id: c.id, title: c.title, index: c.index })));
      
      // Remover o card arrastado do array
      const filteredCards = allCards.filter(card => card.id !== cardId);
      
      // Inserir o card arrastado na nova posição
      filteredCards.splice(destinationIndex, 0, draggedCard);
      
      // Criar atualizações de índices para todos os cards
      const updates = filteredCards.map((card, index) => ({
        id: card.id,
        index
      }));
      
      console.log("Atualizações de índices após reordenação:", updates);
      
      // Persistir as mudanças de índice no banco de dados
      const result = await contentService.updateContentIndices(updates);
      console.log("Resultado da atualização de índices:", result);
      
      // Notificar o componente pai para atualizar a coluna específica
      onCardsUpdate(columnId);
    } catch (error) {
      console.error("Erro ao reordenar cards:", error);
      throw error; // Deixar o chamador lidar com o erro
    }
  };

  const handleColumnChange = async (
    cardId: string,
    sourceStatus: string,
    destinationStatus: string,
    destinationIndex: number
  ) => {
    console.log(`Movendo card ${cardId} de ${sourceStatus} para ${destinationStatus} na posição ${destinationIndex}`);
    
    try {
      // Get the card directly from the service to ensure we have the latest data
      const movedCard = await contentService.getContentById(cardId);
      
      if (!movedCard) {
        console.error(`Card ${cardId} não encontrado`);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o card para mover.",
          variant: "destructive"
        });
        return;
      }
      
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
      
      // Log current order for debugging
      console.log("Destination before:", destinationCards.map(c => ({ id: c.id, index: c.index })));
      
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
      
      console.log("Destination after:", destinationUpdates);
      
      // First update all indices so the positions are correct
      await contentService.updateContentIndices(destinationUpdates);
      
      // Then update the card's status in the database
      await contentService.updateContent(cardId, {
        status: destinationStatus
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw error; // Let the caller handle the error
    }
  };

  const moveSelectedCards = async (
    sourceStatus: string, 
    destinationStatus: string, 
    destinationStartIndex: number
  ) => {
    console.log(`Movendo ${selectedCards.length} cards selecionados de ${sourceStatus} para ${destinationStatus}`);
    
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
      
      console.log("Multi-card destination updates:", destinationUpdates);
      
      // First update all indices so the positions are correct
      await contentService.updateContentIndices(destinationUpdates);
      
      // Then update the status of all selected cards
      for (const cardId of selectedCards) {
        await contentService.updateContent(cardId, {
          status: destinationStatus
        });
      }
    } catch (error) {
      console.error("Erro ao mover múltiplos cards:", error);
      throw error; // Let the caller handle the error
    }
  };

  return { handleDragEnd };
}
