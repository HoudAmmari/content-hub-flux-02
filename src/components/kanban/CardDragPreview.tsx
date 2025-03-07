
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardDragPreviewProps {
  count: number;
  className?: string;
}

export function CardDragPreview({ count, className }: CardDragPreviewProps) {
  return (
    <Card className={cn("cursor-grabbing shadow-md select-none bg-primary-foreground border-primary min-w-[220px]", className)}>
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm text-primary">
            {count} cards selecionados
          </h3>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <div className="relative w-full h-8">
          <div className="absolute top-1 left-1 right-1 bg-muted rounded h-5 transform -rotate-1"></div>
          <div className="absolute top-2 left-2 right-2 bg-muted/80 rounded h-5 transform rotate-1"></div>
        </div>
      </CardFooter>
    </Card>
  );
}
