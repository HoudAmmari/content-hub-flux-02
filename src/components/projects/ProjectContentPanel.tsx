
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Film, MoreHorizontal, Pen, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Content } from "@/models/types";
import { contentService } from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";
import { ContentEditor } from "@/components/content/ContentEditor";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NewContentDialog } from "@/components/content/NewContentDialog";

interface ProjectContentPanelProps {
  projectId: string;
  contents: Content[];
  setContents: React.Dispatch<React.SetStateAction<Content[]>>;
  onContentUpdate: () => void;
}

export function ProjectContentPanel({ 
  projectId, 
  contents, 
  setContents,
  onContentUpdate
}: ProjectContentPanelProps) {
  const { toast } = useToast();
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
  };

  const handleSaveContent = async (updatedContent: Partial<Content>) => {
    if (!editingContent) return;
    
    setIsLoading(true);
    try {
      const result = await contentService.updateContent(editingContent.id, updatedContent);
      if (result) {
        setContents(prev => prev.map(c => c.id === result.id ? result : c));
        setEditingContent(null);
        
        toast({
          title: "Sucesso",
          description: "Conteúdo atualizado com sucesso",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar conteúdo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o conteúdo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    setIsLoading(true);
    try {
      await contentService.deleteContent(contentId);
      setContents(prev => prev.filter(c => c.id !== contentId));
      
      toast({
        title: "Sucesso",
        description: "Conteúdo excluído com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir conteúdo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o conteúdo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getContentTypeIcon = (content: Content) => {
    // Inferir o tipo pelo conteúdo
    const hasVideo = content.description?.toLowerCase().includes('vídeo') || 
                    content.title?.toLowerCase().includes('vídeo');
    
    if (hasVideo) {
      return <Avatar className="h-8 w-8 bg-red-500">
        <AvatarFallback className="text-white text-xs"><Film className="h-4 w-4" /></AvatarFallback>
      </Avatar>;
    }
    
    return <Avatar className="h-8 w-8 bg-blue-500">
      <AvatarFallback className="text-white text-xs"><FileText className="h-4 w-4" /></AvatarFallback>
    </Avatar>;
  };

  const getContentStatusColor = (status: string) => {
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

  const getContentStatusText = (status: string) => {
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Conteúdos do Projeto</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingContent(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Conteúdo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {contents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Este projeto ainda não tem conteúdos. Adicione um conteúdo para começar.
            </div>
          ) : (
            <div className="space-y-2">
              {contents.map((content) => (
                <Card key={content.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getContentTypeIcon(content)}
                      <div>
                        <h4 className="font-medium">{content.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary"
                            className={cn("text-xs", getContentStatusColor(content.status))}
                          >
                            {getContentStatusText(content.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Data: {format(new Date(content.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          {content.tags.length > 0 && (
                            <div className="flex gap-1">
                              {content.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {content.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{content.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleEditContent(content)}
                        >
                          <Pen className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteContent(content.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para edição de conteúdo */}
      {editingContent && (
        <Dialog open={!!editingContent} onOpenChange={(open) => !open && setEditingContent(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Editar Conteúdo</DialogTitle>
            </DialogHeader>
            <ContentEditor 
              card={editingContent} 
              onSave={handleSaveContent}
              onCancel={() => setEditingContent(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para adicionar conteúdo */}
      {isAddingContent && (
        <NewContentDialog
          open={isAddingContent}
          onOpenChange={setIsAddingContent}
          project={{ id: projectId, title: "", description: "", status: "in_progress", deadline: "", tasks: 0, completedTasks: 0, progress: 0 }}
          onSuccess={onContentUpdate}
        />
      )}
    </>
  );
}
