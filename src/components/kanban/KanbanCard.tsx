
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MoreHorizontal, 
  ExternalLink, 
  Edit, 
  Copy, 
  Trash2, 
  Instagram, 
  Youtube, 
  Linkedin, 
  FileText 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentEditor } from "@/components/content/ContentEditor";
import { cn } from "@/lib/utils";

interface Card {
  id: string;
  title: string;
  description: string;
  status: string;
  channel: string;
  tags: string[];
  dueDate: string;
}

interface KanbanCardProps {
  card: Card;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("cardId", cardId);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit'
    });
  };
  
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "videos":
        return <Instagram className="h-3 w-3" />;
      case "youtube":
        return <Youtube className="h-3 w-3" />;
      case "linkedin":
        return <Linkedin className="h-3 w-3" />;
      case "blog":
        return <FileText className="h-3 w-3" />;
      default:
        return null;
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
  
  const getChannelName = (channel: string) => {
    switch (channel) {
      case "videos":
        return "Vídeos Curtos";
      case "youtube":
        return "YouTube";
      case "linkedin":
        return "LinkedIn";
      case "blog":
        return "Blog";
      default:
        return channel;
    }
  };
  
  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-md transition-all"
        draggable
        onDragStart={(e) => handleDragStart(e, card.id)}
        onClick={() => setIsDetailOpen(true)}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm line-clamp-2">{card.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Abrir</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Duplicar</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Excluir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {card.description}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {card.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="px-1 text-xs rounded-sm"
              >
                {tag}
              </Badge>
            ))}
            {card.tags.length > 2 && (
              <Badge 
                variant="outline" 
                className="px-1 text-xs rounded-sm"
              >
                +{card.tags.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {formatDate(card.dueDate)}
          </div>
          
          <div className="flex items-center gap-1">
            <Badge 
              variant="secondary" 
              className={cn("flex items-center gap-1 px-1.5 py-0 h-5 text-xs", getStatusColor(card.status))}
            >
              {getChannelIcon(card.channel)}
              <span>{getChannelName(card.channel)}</span>
            </Badge>
          </div>
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Editar Conteúdo</DialogTitle>
          </DialogHeader>
          <ContentEditor 
            initialContent={card} 
            onSave={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{card.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={cn(getStatusColor(card.status))}>
                {card.status === "idea" ? "Ideia" : 
                 card.status === "writing" ? "Escrevendo" : 
                 card.status === "review" ? "Revisão" : "Pronto"}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getChannelIcon(card.channel)}
                <span>{getChannelName(card.channel)}</span>
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                <span>Prazo: {formatDate(card.dueDate)}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Descrição</h4>
              <p className="text-muted-foreground">{card.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {card.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setIsDetailOpen(false);
                setIsEditing(true);
              }}>
                Editar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
