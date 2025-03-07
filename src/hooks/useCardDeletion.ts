
import { useState, useEffect, useCallback } from "react";
import { contentService } from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";

interface UseCardDeletionProps {
  selectedCards: string[];
  setSelectedCards: (cards: string[]) => void;
  onCardsUpdate: () => void;
}

export function useCardDeletion({
  selectedCards,
  setSelectedCards,
  onCardsUpdate
}: UseCardDeletionProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const deleteSelectedCards = useCallback(async () => {
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
  }, [selectedCards, onCardsUpdate, setSelectedCards, toast]);

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    deleteSelectedCards
  };
}
