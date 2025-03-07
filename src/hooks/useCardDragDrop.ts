
import { Content } from "@/models/types";
import { contentService } from "@/services/contentService";
import { DropResult } from "react-beautiful-dnd";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  // Manipula o resultado do drag and drop
  const handleDragEnd = async (result: DropResult) => {
    console.log("[handleDragEnd] Drag ended with result:", result);
    
    // Ignora se não houver destination
    if (!result.destination) {
      console.log("[handleDragEnd] No destination, skipping...");
      return;
    }
    
    // Extrai o ID do card
    const draggedCardId = result.draggableId.startsWith('card-') 
      ? result.draggableId.substring(5) 
      : result.draggableId;
    
    console.log(`[handleDragEnd] Dragged card ID: ${draggedCardId}`);
    
    // Verifica se o card está selecionado
    const isSelected = selectedCards.includes(draggedCardId);
    
    // Determina quais cards serão movidos
    const cardsToMove = isSelected 
      ? selectedCards 
      : [draggedCardId];
    
    console.log(`[handleDragEnd] Cards to move: ${cardsToMove.join(', ')}`);
    
    // Extrai os status (origem e destino)
    const sourceStatus = result.source.droppableId.startsWith('status-') 
      ? result.source.droppableId.substring(7) 
      : result.source.droppableId;
      
    const destinationStatus = result.destination.droppableId.startsWith('status-') 
      ? result.destination.droppableId.substring(7) 
      : result.destination.droppableId;
    
    console.log(`[handleDragEnd] From ${sourceStatus} to ${destinationStatus}. Source index: ${result.source.index}, Dest index: ${result.destination.index}`);
    
    try {
      if (sourceStatus === destinationStatus) {
        // Reordenação dentro da mesma coluna
        await handleSameColumnReorder(
          draggedCardId,
          cardsToMove,
          sourceStatus,
          result.source.index,
          result.destination.index
        );
      } else {
        // Movimentação entre colunas
        await handleColumnChange(
          draggedCardId,
          cardsToMove,
          sourceStatus,
          destinationStatus,
          result.destination.index
        );
      }
      
      // Notifica o componente pai para atualizar
      console.log(`[handleDragEnd] Updating columns: ${sourceStatus}, ${destinationStatus}`);
      onCardsUpdate(sourceStatus, destinationStatus);
      
    } catch (error) {
      console.error("Error handling drag end:", error);
      toast({
        title: t("general.error"),
        description: t("kanban.dragError"),
        variant: "destructive",
      });
    }
  };
  
  // Manipula reordenação na mesma coluna
  const handleSameColumnReorder = async (
    draggedCardId: string,
    cardsToMove: string[],
    status: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    console.log(`[handleSameColumnReorder] Reordering in ${status} from ${sourceIndex} to ${destinationIndex}`);
    console.log(`[handleSameColumnReorder] Cards to reorder: ${cardsToMove.join(', ')}`);
    
    // Obtém todos os cards da coluna
    const columnCards = [...cards, ...epics].filter(card => card.status === status);
    console.log(`[handleSameColumnReorder] Cards in column before reordering:`, 
      columnCards.map(c => ({ id: c.id, title: c.title, index: c.index })));
    
    // Ordena os cards pelo índice atual
    columnCards.sort((a, b) => {
      const indexA = a.index ?? 0;
      const indexB = b.index ?? 0;
      return indexA - indexB;
    });
    
    // Obtém os cards que não serão movidos
    const nonMovingCards = columnCards.filter(card => !cardsToMove.includes(card.id));
    
    // Cria um novo array para definir a nova ordem
    let newOrder: Content[] = [];
    
    // Primeiro, adicione todos os cards na ordem original
    newOrder = [...columnCards];
    
    // Remove os cards que serão movidos
    newOrder = newOrder.filter(card => !cardsToMove.includes(card.id));
    
    // Obtém os cards que serão movidos, na ordem original
    const movingCards = columnCards.filter(card => cardsToMove.includes(card.id));
    
    // Insere os cards movidos na posição de destino
    newOrder.splice(destinationIndex, 0, ...movingCards);
    
    console.log("[handleSameColumnReorder] New order:", 
      newOrder.map(c => ({ id: c.id, title: c.title })));
    
    // Prepara as atualizações de índice
    const updates = newOrder.map((card, index) => ({
      id: card.id,
      index
    }));
    
    console.log("[handleSameColumnReorder] Index updates:", updates);
    
    // Atualiza os índices no servidor
    await contentService.updateContentIndices(updates);
  };
  
  // Manipula mudança de coluna
  const handleColumnChange = async (
    draggedCardId: string,
    cardsToMove: string[],
    sourceStatus: string,
    destinationStatus: string,
    destinationIndex: number
  ) => {
    console.log(`[handleColumnChange] Moving from ${sourceStatus} to ${destinationStatus} at index ${destinationIndex}`);
    
    // Obtém cards da coluna de destino
    const destinationCards = [...cards, ...epics].filter(
      card => card.status === destinationStatus
    );
    
    // Ordena os cards pelo índice atual
    destinationCards.sort((a, b) => {
      const indexA = a.index ?? 0;
      const indexB = b.index ?? 0;
      return indexA - indexB;
    });
    
    // Para cada card movido, atualize seu status
    for (const cardId of cardsToMove) {
      await contentService.updateContent(cardId, { 
        status: destinationStatus
      });
    }
    
    // Calcula novos índices para todos os cards da coluna de destino
    const cardUpdates = [];
    
    // 1. Primeiro, recalcule os índices dos cards existentes
    // Insira um espaço para os cards movidos na posição de destino
    let currentIndex = 0;
    for (let i = 0; i < destinationCards.length + cardsToMove.length; i++) {
      if (i === destinationIndex) {
        // Reserva posições para os cards movidos
        for (const cardId of cardsToMove) {
          cardUpdates.push({
            id: cardId,
            index: currentIndex
          });
          currentIndex++;
        }
      }
      
      if (i < destinationCards.length) {
        // Atualiza os índices dos cards existentes
        cardUpdates.push({
          id: destinationCards[i].id,
          index: currentIndex
        });
        currentIndex++;
      }
    }
    
    // Se o ponto de inserção for no final
    if (destinationIndex >= destinationCards.length) {
      for (const cardId of cardsToMove) {
        cardUpdates.push({
          id: cardId,
          index: currentIndex++
        });
      }
    }
    
    console.log("[handleColumnChange] Index updates:", cardUpdates);
    
    // Atualiza os índices no servidor
    await contentService.updateContentIndices(cardUpdates);
    
    // Recalcule os índices da coluna original também, para fechar "buracos"
    const sourceCards = [...cards, ...epics]
      .filter(card => card.status === sourceStatus && !cardsToMove.includes(card.id))
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    
    const sourceUpdates = sourceCards.map((card, index) => ({
      id: card.id,
      index
    }));
    
    if (sourceUpdates.length > 0) {
      console.log("[handleColumnChange] Source column updates:", sourceUpdates);
      await contentService.updateContentIndices(sourceUpdates);
    }
  };

  return {
    handleDragEnd
  };
}
