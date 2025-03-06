
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ChannelStatus } from "@/models/types";

interface StatusListProps {
  statuses: ChannelStatus[];
  onRemoveStatus: (statusName: string) => void;
  onReorderStatuses: (reorderedStatuses: ChannelStatus[]) => void;
}

export function StatusList({ statuses, onRemoveStatus, onReorderStatuses }: StatusListProps) {
  const { t } = useTranslation();

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
    
    onReorderStatuses(updatedItems);
  };

  return (
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
                        onClick={() => onRemoveStatus(status.name)}
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
  );
}
