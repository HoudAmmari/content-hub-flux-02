
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { Content, Channel } from "@/models/types";
import { useToast } from "@/hooks/use-toast";
import { contentService } from "@/services/contentService";

interface KanbanBoardProps {
  selectedChannel: Channel | null;
  cards: Content[];
  epics: Content[];
  showEpics: boolean;
  onCardsUpdate: () => void;
  selectedCards: string[];
  onCardSelect: (cardId: string, event: React.MouseEvent) => void;
}

export function KanbanBoard({ 
  selectedChannel, 
  cards, 
  epics, 
  showEpics, 
  onCardsUpdate,
  selectedCards,
  onCardSelect 
}: KanbanBoardProps) {
  const { toast } = useToast();

  const getColumnCards = (status: string) => {
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
  };

  const isCardSelected = (cardId: string) => {
    return selectedCards.includes(cardId);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) {
      return;
    }

    console.log("Drag ended:", { source, destination, draggableId });
    
    if (source.droppableId === destination.droppableId) {
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
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto max-w-full pb-4">
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
                  <KanbanCard
                    key={card.id}
                    card={card}
                    index={index}
                    onUpdate={onCardsUpdate}
                    isSelected={isCardSelected(card.id)}
                    onSelect={(e) => onCardSelect(card.id, e)}
                  />
                ))}
              </KanbanColumn>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}
