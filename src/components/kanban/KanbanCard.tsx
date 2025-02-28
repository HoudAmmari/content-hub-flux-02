
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  FileText,
  Layers
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Draggable } from "react-beautiful-dnd";
import { useToast } from "@/hooks/use-toast";
import { Content } from "@/models/types";
import { contentService } from "@/services/contentService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface KanbanCardProps {
  card: Content;
  index: number;
  onUpdate: () => void;
}

export function KanbanCard({ card, index, onUpdate }: KanbanCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      day: '2-digit', 
      month: '2-digit'
    });
  };
  
  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "videos":
      case "vídeos curtos":
        return <Instagram className="h-3 w-3" />;
      case "youtube":
        return <Youtube className="h-3 w-3" />;
      case "linkedin":
        return <Linkedin className="h-3 w-3" />;
      case "blog":
        return <FileText className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "idea":
      case "backlog":
        return "bg-yellow-500/20 text-yellow-700";
      case "writing":
      case "draft":
      case "in_progress":
      case "script":
        return "bg-blue-500/20 text-blue-700";
      case "review":
      case "recording":
      case "editing":
      case "research":
      case "pending":
        return "bg-purple-500/20 text-purple-700";
      case "done":
        return "bg-green-500/20 text-green-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };
  
  const getChannelName = (channel: string) => {
    // Simplified - you might want to use a more robust approach
    return channel;
  };

  const handleSaveContent = async (content: Partial<Content>) => {
    try {
      await contentService.updateContent(card.id, content);
      onUpdate();
      setIsEditing(false);
      
      toast({
        title: "Sucesso",
        description: "Conteúdo atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar conteúdo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async () => {
    setIsDeleting(true);
    try {
      await contentService.deleteContent(card.id);
      onUpdate();
      setDeleteDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Conteúdo excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir conteúdo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <Card 
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(
              "cursor-pointer hover:shadow-md transition-all",
              snapshot.isDragging && "rotate-2 scale-105 shadow-lg",
              card.isEpic && "border-l-4 border-l-purple-400"
            )}
            onClick={() => setIsDetailOpen(true)}
          >
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className={cn(
                  "font-medium text-sm line-clamp-2",
                  card.isEpic && "flex items-center gap-1"
                )}>
                  {card.isEpic && <Layers className="h-3.5 w-3.5 text-purple-500" />}
                  {card.title}
                </h3>
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
                      <span>{t("general.edit")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span>{t("general.view")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>{t("general.duplicate")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>{t("general.delete")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2">
                {card.description.replace(/[#*`\[\]\-_]/g, '')}
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
        )}
      </Draggable>
      
      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t("content.editContent")}</DialogTitle>
          </DialogHeader>
          <ContentEditor 
            card={card}
            onSave={handleSaveContent}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
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
                {t(`kanban.${card.status}`) || card.status}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getChannelIcon(card.channel)}
                <span>{getChannelName(card.channel)}</span>
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
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                {t("general.close")}
              </Button>
              <Button onClick={() => {
                setIsDetailOpen(false);
                setIsEditing(true);
              }}>
                {t("general.edit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("general.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("content.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("general.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteContent();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? t("general.loading") : t("general.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
