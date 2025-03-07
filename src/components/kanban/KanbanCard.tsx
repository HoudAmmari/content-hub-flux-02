
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentEditor } from "@/components/content/ContentEditor";
import { cn } from "@/lib/utils";
import { Draggable } from "react-beautiful-dnd";
import { useToast } from "@/hooks/use-toast";
import { Content } from "@/models/types";
import { contentService } from "@/services/contentService";
import { CardBadges } from "./CardBadges";
import { CardMenu } from "./CardMenu";
import { CardDetailView } from "./CardDetailView";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface KanbanCardProps {
  card: Content;
  index: number;
  onUpdate: () => void;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  registerCardPosition?: (cardId: string, element: HTMLElement) => void;
  selectedCardsCount?: number;
}

export function KanbanCard({ 
  card, 
  index, 
  onUpdate, 
  isSelected = false, 
  onSelect,
  registerCardPosition,
  selectedCardsCount = 0
}: KanbanCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (cardRef.current && registerCardPosition) {
      registerCardPosition(card.id, cardRef.current);
    }
  }, [card.id, registerCardPosition]);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      day: '2-digit', 
      month: '2-digit'
    });
  };

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
  
  const renderMultipleCardsDragPreview = () => {
    return (
      <Card className="cursor-pointer shadow-md select-none kanban-card">
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">
              {selectedCardsCount} cards selecionados
            </h3>
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          <div className="relative w-full h-4">
            <div className="absolute top-1 left-1 right-1 bg-muted rounded h-3 transform -rotate-1"></div>
            <div className="absolute top-2 left-2 right-2 bg-muted/80 rounded h-3 transform rotate-1"></div>
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <>
      <Draggable draggableId={card.id} index={index}>
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
              "cursor-pointer hover:shadow-md transition-all select-none kanban-card",
              snapshot.isDragging && !isSelected && "rotate-2 scale-105 shadow-lg",
              snapshot.isDragging && isSelected && "opacity-0",
              card.isEpic && "border-l-4 border-l-purple-400",
              isSelected && "ring-2 ring-primary ring-offset-2",
              (snapshot.isDragging && selectedCardsCount > 1) && "invisible"
            )}
            onClick={handleCardClick}
          >
            {(snapshot.isDragging && selectedCardsCount > 1) ? (
              renderMultipleCardsDragPreview()
            ) : (
              <>
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className={cn(
                      "font-medium text-sm line-clamp-2",
                      card.isEpic && "flex items-center gap-1"
                    )}>
                      {card.isEpic && <Layers className="h-3.5 w-3.5 text-purple-500" />}
                      {card.title}
                    </h3>
                    <CardMenu 
                      onEdit={() => setIsEditing(true)}
                      onDelete={() => setDeleteDialogOpen(true)}
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {card.description.replace(/[#*`\\[\]\-_]/g, '')}
                  </p>
                  
                  <CardBadges tags={card.tags} />
                </CardContent>
                
                <CardFooter className="p-3 pt-0 flex justify-between items-center">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDate(card.dueDate)}
                  </div>
                </CardFooter>
              </>
            )}
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
