
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Channel, ChannelStatus } from "@/models/types";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface ChannelDialogProps {
  channel?: Channel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (channel: Omit<Channel, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export function ChannelDialog({ channel, open, onOpenChange, onSave }: ChannelDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [name, setName] = useState(channel?.name || "");
  const [description, setDescription] = useState(channel?.description || "");
  const [statuses, setStatuses] = useState<ChannelStatus[]>([]);
  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(channel?.name || "");
      setDescription(channel?.description || "");
      
      // Initialize with default statuses or the channel's statuses
      if (channel?.statuses && channel.statuses.length > 0) {
        setStatuses(channel.statuses);
      } else {
        setStatuses([
          { index: 0, name: "backlog", type: "backlog" },
          { index: 1, name: "in_progress", type: "in_progress" },
          { index: 2, name: "pending", type: "pending" },
          { index: 3, name: "done", type: "done" }
        ]);
      }
      
      setNewStatus("");
    }
  }, [open, channel]);

  const handleAddStatus = () => {
    if (newStatus.trim()) {
      const statusExists = statuses.some(status => status.name === newStatus.trim());
      
      if (!statusExists) {
        const newStatusObj: ChannelStatus = {
          index: statuses.length,
          name: newStatus.trim(),
          type: "pending" // Default type
        };
        
        setStatuses([...statuses, newStatusObj]);
        setNewStatus("");
      } else {
        toast({
          title: "Status já existe",
          description: "Este status já foi adicionado.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveStatus = (statusName: string) => {
    setStatuses(statuses.filter(status => status.name !== statusName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do canal é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    if (statuses.length === 0) {
      toast({
        title: "Status obrigatórios",
        description: "Adicione pelo menos um status.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        name,
        description,
        statuses
      });
      
      toast({
        title: "Sucesso",
        description: channel ? "Canal atualizado com sucesso." : "Canal criado com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar canal:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o canal.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(statuses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update indexes after reordering
    const updatedItems = items.map((item, index) => ({
      ...item,
      index
    }));
    
    setStatuses(updatedItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {channel ? t("channels.editChannel") : t("channels.newChannel")}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t("channels.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("channels.name")}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">{t("channels.description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("channels.description")}
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div>
            <Label>{t("channels.statuses")}</Label>
            <div className="flex mt-1">
              <Input
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder={t("channels.statusNamePlaceholder")}
                className="rounded-r-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStatus();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddStatus}
                className="rounded-l-none"
              >
                {t("channels.addStatus")}
              </Button>
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">
                {t("channels.dragToReorder")}
              </p>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="statuses">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-wrap gap-2"
                    >
                      {statuses.map((status, index) => (
                        <Draggable key={status.name} draggableId={status.name} index={index}>
                          {(provided) => (
                            <Badge
                              variant="secondary"
                              className="px-2 py-1.5 text-sm cursor-move"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {status.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                                onClick={() => handleRemoveStatus(status.name)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("general.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("general.loading") : t("general.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
