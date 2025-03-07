
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

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) {
      return;
    }

    const isMultiCardMove = selectedCards.includes(draggableId) && selectedCards.length > 1;
    
    if (isMultiCardMove) {
      await moveSelectedCards(source.droppableId, destination.droppableId, destination.index);
    } else {
      if (source.droppableId === destination.droppableId) {
        await handleSameColumnReorder(source.droppableId, source.index, destination.index, draggableId);
      } else {
        await handleColumnChange(draggableId, source.droppableId, destination.droppableId, destination.index);
      }
    }
  };

  const handleSameColumnReorder = async (
    columnId: string, 
    sourceIndex: number, 
    destinationIndex: number, 
    draggableId: string
  ) => {
    const columnCards = [...cards, ...epics].filter(
      card => card.status === columnId
    ).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    
    const draggedCard = columnCards.find(card => card.id === draggableId);
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
    
    destinationCards.splice(destinationIndex, 0, {
      ...movedCard,
      status: destinationStatus
    });
    
    const destinationUpdates = destinationCards.map((card, index) => ({
      id: card.id,
      index
    }));
    
    try {
      await contentService.updateContent(cardId, {
        status: destinationStatus
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

  const moveSelectedCards = async (
    sourceStatus: string, 
    destinationStatus: string, 
    destinationStartIndex: number
  ) => {
    try {
      const selectedCardObjects = [...cards, ...epics].filter(card => selectedCards.includes(card.id));
      
      if (selectedCardObjects.length === 0) return;
      
      const destinationCards = [...cards, ...epics]
        .filter(card => card.status === destinationStatus && !selectedCards.includes(card.id))
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      for (let i = 0; i < selectedCardObjects.length; i++) {
        destinationCards.splice(destinationStartIndex + i, 0, {
          ...selectedCardObjects[i],
          status: destinationStatus
        });
      }
      
      const destinationUpdates = destinationCards.map((card, index) => ({
        id: card.id,
        index
      }));
      
      for (const cardId of selectedCards) {
        await contentService.updateContent(cardId, {
          status: destinationStatus
        });
      }
      
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
