
import { ReactNode, memo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Droppable } from "react-beautiful-dnd";
import { ChannelStatus } from "@/models/types";

interface KanbanColumnProps {
  status: ChannelStatus;
  title: string;
  children: ReactNode;
  droppableId: string;
  type?: string;
  totalCount?: number;
}

export function KanbanColumn({ 
  status, 
  title, 
  children, 
  droppableId, 
  type = "DEFAULT",
  totalCount
}: KanbanColumnProps) {
  const { t } = useTranslation();

  const getColumnColor = (id: string) => {
    switch (id) {
      case "backlog":
        return "border-t-gray-400";
      case "in_progress":
        return "border-t-blue-400";
      case "pending":
        return "border-t-purple-400";
      case "done":
        return "border-t-green-400";
      default:
        return "border-t-gray-400";
    }
  };

  // Calcula a contagem real dos cards filhos
  const childCount = Array.isArray(children) 
    ? children.filter(child => child !== null && child !== undefined).length 
    : (children ? 1 : 0);

  // Usa o totalCount se fornecido, senão usa a contagem local
  const displayCount = totalCount !== undefined ? totalCount : childCount;

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      <Card
        className={cn(
          "h-full flex flex-col border-t-4",
          getColumnColor(status.type)
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {title}
            </CardTitle>
            <div className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
              {displayCount}
            </div>
          </div>
        </CardHeader>
        <Droppable droppableId={droppableId} type={type}>
          {(provided, snapshot) => (
            <CardContent
              className={cn(
                "flex-1 overflow-auto space-y-2 transition-colors select-none",
                snapshot.isDraggingOver && "bg-accent/50"
              )}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {children}
              {provided.placeholder}
              {childCount === 0 && (
                <div className="text-xs text-center py-4 text-muted-foreground">
                  <p>{t("kanban.dragToMove")}</p>
                </div>
              )}
            </CardContent>
          )}
        </Droppable>
      </Card>
    </div>
  );
}
