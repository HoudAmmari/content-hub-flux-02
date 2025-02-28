
import { ReactNode, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  children: ReactNode;
  onDrop: (cardId: string) => void;
}

export function KanbanColumn({ id, title, children, onDrop }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const cardId = e.dataTransfer.getData("cardId");
    if (cardId) {
      onDrop(cardId);
    }
  };
  
  return (
    <div 
      className="flex flex-col h-full min-h-[500px]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Card 
        className={cn(
          "h-full flex flex-col border-t-4",
          isOver && "ring-2 ring-primary/20",
          id === "idea" && "border-t-yellow-400",
          id === "writing" && "border-t-blue-400",
          id === "review" && "border-t-purple-400",
          id === "done" && "border-t-green-400"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {title}
            </CardTitle>
            <div className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
              {Array.isArray(children) ? children.length : (children ? 1 : 0)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-2">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
