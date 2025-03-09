
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { contentService } from "@/services/contentService";

export function useCardDeletion(onDeletionComplete: () => void) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteSelectedCards = async (selectedCards: string[]) => {
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
      
      onDeletionComplete();
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
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    deleteSelectedCards
  };
}
