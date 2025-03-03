
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
import { X, Plus, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusType, setNewStatusType] = useState<"backlog" | "in_progress" | "pending" | "done">("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingStatus, setIsAddingStatus] = useState(false);

  useEffect(() => {
    if (open) {
      setName(channel?.name || "");
      setDescription(channel?.description || "");
      
      // Initialize with default statuses or the channel's statuses
      if (channel?.statuses && channel.statuses.length > 0) {
        setStatuses([...channel.statuses]);
      } else {
        setStatuses([
          { index: 0, name: "Backlog", type: "backlog" },
          { index: 1, name: "In Progress", type: "in_progress" },
          { index: 2, name: "Pending Review", type: "pending" },
          { index: 3, name: "Done", type: "done" }
        ]);
      }
      
      setNewStatusName("");
      setNewStatusType("pending");
      setIsAddingStatus(false);
    }
  }, [open, channel]);

  const handleAddStatus = () => {
    if (newStatusName.trim()) {
      const statusExists = statuses.some(status => status.name === newStatusName.trim());
      
      if (!statusExists) {
        const newStatusObj: ChannelStatus = {
          index: statuses.length,
          name: newStatusName.trim(),
          type: newStatusType
        };
        
        setStatuses([...statuses, newStatusObj]);
        setNewStatusName("");
        setNewStatusType("pending");
        setIsAddingStatus(false);
      } else {
        toast({
          title: t("channels.statusExists"),
          description: t("channels.statusExistsDescription"),
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
        title: t("channels.nameRequired"),
        description: t("channels.nameRequiredDescription"),
        variant: "destructive",
      });
      return;
    }
    
    if (statuses.length === 0) {
      toast({
        title: t("channels.statusRequired"),
        description: t("channels.statusRequiredDescription"),
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make sure indexes are updated before saving
      const updatedStatuses = statuses.map((status, index) => ({
        ...status,
        index
      }));
      
      await onSave({
        name,
        description,
        statuses: updatedStatuses
      });
      
      toast({
        title: t("general.success"),
        description: channel ? t("channels.channelUpdated") : t("channels.channelCreated"),
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar canal:", error);
      toast({
        title: t("general.error"),
        description: t("channels.saveError"),
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
            <div className="flex justify-between items-center mb-2">
              <Label>{t("channels.statuses")}</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsAddingStatus(true)}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("channels.addStatus")}
              </Button>
            </div>
            
            {isAddingStatus && (
              <div className="flex flex-col gap-2 p-3 border rounded-md mb-3">
                <Label htmlFor="newStatusName">{t("channels.statusName")}</Label>
                <Input
                  id="newStatusName"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder={t("channels.statusNamePlaceholder")}
                  className="mb-2"
                />
                
                <Label htmlFor="newStatusType">{t("channels.statusType")}</Label>
                <Select 
                  value={newStatusType} 
                  onValueChange={(value) => setNewStatusType(value as "backlog" | "in_progress" | "pending" | "done")}
                >
                  <SelectTrigger id="newStatusType">
                    <SelectValue placeholder={t("channels.selectStatusType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2 mt-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingStatus(false)}
                  >
                    {t("general.cancel")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddStatus}
                  >
                    {t("channels.addStatus")}
                  </Button>
                </div>
              </div>
            )}
            
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
                      className="space-y-2"
                    >
                      {statuses.map((status, index) => (
                        <Draggable key={status.name} draggableId={status.name} index={index}>
                          {(provided) => (
                            <div
                              className="flex items-center bg-muted/50 rounded-md p-2"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <div 
                                {...provided.dragHandleProps} 
                                className="cursor-move mr-2 text-muted-foreground hover:text-foreground"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{status.name}</p>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {status.type}
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveStatus(status.name)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              {statuses.length === 0 && (
                <div className="text-center py-4 text-muted-foreground border rounded-md">
                  {t("channels.noStatuses")}
                </div>
              )}
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
