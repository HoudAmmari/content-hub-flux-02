
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Instagram, Linkedin, Youtube } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Content {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  date: string;
}

interface ContentDialogProps {
  content: Content;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export function ContentDialog({ content, open, onOpenChange, onEdit }: ContentDialogProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "idea":
        return "Ideia";
      case "writing":
        return "Escrevendo";
      case "review":
        return "Revisão";
      case "done":
        return "Pronto";
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "idea":
        return "bg-yellow-500/20 text-yellow-700";
      case "writing":
        return "bg-blue-500/20 text-blue-700";
      case "review":
        return "bg-purple-500/20 text-purple-700";
      case "done":
        return "bg-green-500/20 text-green-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "blog":
        return <FileText className="h-4 w-4 mr-1" />;
      case "videos":
        return <Instagram className="h-4 w-4 mr-1" />;
      case "youtube":
        return <Youtube className="h-4 w-4 mr-1" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4 mr-1" />;
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };
  
  const getTypeText = (type: string) => {
    switch (type) {
      case "blog":
        return "Blog";
      case "videos":
        return "Vídeos Curtos";
      case "youtube":
        return "YouTube";
      case "linkedin":
        return "LinkedIn";
      default:
        return type;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={cn(getStatusColor(content.status))}>
              {getStatusText(content.status)}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              {getTypeIcon(content.type)}
              <span>{getTypeText(content.type)}</span>
            </Badge>
          </div>
          
          <div>
            <h4 className="font-medium">Descrição</h4>
            <p className="text-muted-foreground">{content.description}</p>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Data de Publicação: {formatDate(content.date)}</span>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            {onEdit && (
              <Button onClick={onEdit}>
                Editar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
