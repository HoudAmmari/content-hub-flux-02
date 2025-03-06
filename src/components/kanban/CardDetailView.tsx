
import { useTranslation } from "react-i18next";
import { Content } from "@/models/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface CardDetailViewProps {
  card: Content;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function CardDetailView({ card, open, onOpenChange, onEdit }: CardDetailViewProps) {
  const { t } = useTranslation();
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      day: '2-digit', 
      month: '2-digit'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "backlog":
        return "bg-yellow-500/20 text-yellow-700";
      case "in_progress":
        return "bg-blue-500/20 text-blue-700";
      case "pending":
        return "bg-purple-500/20 text-purple-700";
      case "done":
        return "bg-green-500/20 text-green-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {card.isEpic && (
              <Badge className="mr-2 bg-purple-500/20 text-purple-700">
                {t("content.epic")}
              </Badge>
            )}
            {card.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={cn(getStatusColor(card.status))}>
              {card.status}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              <span>{t("content.dueDate")}: {formatDate(card.dueDate)}</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">{t("content.description")}</h4>
            <div className="prose max-w-none text-muted-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {card.description}
              </ReactMarkdown>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">{t("content.tags")}</h4>
            <div className="flex flex-wrap gap-1">
              {card.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("general.close")}
            </Button>
            <Button onClick={() => {
              onOpenChange(false);
              onEdit();
            }}>
              {t("general.edit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
