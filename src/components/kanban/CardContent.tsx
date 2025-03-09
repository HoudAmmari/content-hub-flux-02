
import { Clock, Layers } from "lucide-react";
import { Content } from "@/models/types";
import { CardBadges } from "./CardBadges";
import { CardMenu } from "./CardMenu";
import { cn } from "@/lib/utils";
import { CardContent as ShadcnCardContent, CardFooter } from "@/components/ui/card";

interface CardContentProps {
  card: Content;
  onEdit: () => void;
  onDelete: () => void;
}

export function CardContentArea({ card, onEdit, onDelete }: CardContentProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      day: '2-digit', 
      month: '2-digit'
    });
  };

  return (
    <>
      <ShadcnCardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className={cn(
            "font-medium text-sm line-clamp-2",
            card.isEpic && "flex items-center gap-1"
          )}>
            {card.isEpic && <Layers className="h-3.5 w-3.5 text-purple-500" />}
            {card.title}
          </h3>
          <CardMenu 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {card.description.replace(/[#*`\\[\]\-_]/g, '')}
        </p>
        
        <CardBadges tags={card.tags} />
      </ShadcnCardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          {formatDate(card.dueDate)}
        </div>
      </CardFooter>
    </>
  );
}
