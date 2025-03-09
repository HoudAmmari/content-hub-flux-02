
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentEditor } from "@/components/content/ContentEditor";
import { cn } from "@/lib/utils";
import { Draggable } from "react-beautiful-dnd";
import { useToast } from "@/hooks/use-toast";
import { Content } from "@/models/types";
import { contentService } from "@/services/contentService";
import { CardDetailView } from "./CardDetailView";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { CardContentArea } from "./CardContent";
import { useTranslation } from "react-i18next";

interface KanbanCardProps {
  card: Content;
  index: number;
  onUpdate: () => void;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  registerCardPosition?: (cardId: string, element: HTMLElement) => void;
}

export function KanbanCard({ 
  card, 
  index, 
  onUpdate, 
  isSelected = false, 
  onSelect,
  registerCardPosition
}: KanbanCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Register this card's position whenever it renders
  useEffect(() => {
    if (cardRef.current && registerCardPosition) {
      registerCardPosition(card.id, cardRef.current);
    }
    
    // Also register on scroll events
    const handleScroll = () => {
      if (cardRef.current && registerCardPosition) {
        registerCardPosition(card.id, cardRef.current);
      }
    };
    
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [card.id, registerCardPosition]);

  const handleSaveContent = async (content: Partial<Content>) => {
    try {
      await contentService.updateContent(card.id, content);
      onUpdate();
      setIsEditing(false);
      
      toast({
        title: "Sucesso",
        description: "Conteúdo atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar conteúdo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async () => {
    setIsDeleting(true);
    try {
      await contentService.deleteContent(card.id);
      onUpdate();
      setDeleteDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Conteúdo excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir conteúdo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onSelect) {
      onSelect(e);
    } else {
      setIsDetailOpen(true);
    }
  };
  
  // Generate a safe draggableId
  const draggableId = `card-${card.id}`;
  
  return (
    <>
      <Draggable draggableId={draggableId} index={index}>
        {(provided, snapshot) => (
          <Card 
            ref={(element) => {
              provided.innerRef(element);
              // @ts-ignore - this doesn't cause runtime issues
              cardRef.current = element;
            }}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(
              "cursor-pointer hover:shadow-md transition-all select-none kanban-card mb-2",
              snapshot.isDragging && !isSelected && "rotate-2 scale-105 shadow-lg",
              snapshot.isDragging && isSelected && "opacity-50",
              card.isEpic && "border-l-4 border-l-purple-400",
              card.projectId && "border-r-4 border-r-blue-400", // Indicador visual para conteúdos vinculados a projetos
              isSelected && "ring-2 ring-primary ring-offset-2",
              isSelected && snapshot.isDragging ? "opacity-50" : ""
            )}
            onClick={handleCardClick}
          >
            <CardContentArea 
              card={card}
              onEdit={() => setIsEditing(true)}
              onDelete={() => setDeleteDialogOpen(true)}
            />
          </Card>
        )}
      </Draggable>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t("content.editContent")}</DialogTitle>
          </DialogHeader>
          <ContentEditor 
            card={card}
            onSave={handleSaveContent}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
      
      <CardDetailView 
        card={card}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={() => {
          setIsDetailOpen(false);
          setIsEditing(true);
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteContent}
        isDeleting={isDeleting}
      />
    </>
  );
}
