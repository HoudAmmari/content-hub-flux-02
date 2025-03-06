
import { Badge } from "@/components/ui/badge";

interface CardBadgesProps {
  tags: string[];
  maxVisible?: number;
}

export function CardBadges({ tags, maxVisible = 2 }: CardBadgesProps) {
  if (!tags.length) return null;
  
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, maxVisible).map((tag) => (
        <Badge 
          key={tag} 
          variant="outline" 
          className="px-1 text-xs rounded-sm"
        >
          {tag}
        </Badge>
      ))}
      {tags.length > maxVisible && (
        <Badge 
          variant="outline" 
          className="px-1 text-xs rounded-sm"
        >
          +{tags.length - maxVisible}
        </Badge>
      )}
    </div>
  );
}
