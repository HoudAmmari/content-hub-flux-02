
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ContentEditor } from "@/components/content/ContentEditor";
import { Channel, Content, Project } from "@/models/types";
import { contentService } from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface NewContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  channel?: Channel | null;
  project?: Project | null;
  onSuccess?: () => void;
}

export function NewContentDialog({ 
  open, 
  onOpenChange, 
  initialDate, 
  channel, 
  project, 
  onSuccess 
}: NewContentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const initialContent: Content = {
    id: "",
    title: "",
    description: "",
    status: "",
    channelId: channel?.id || "",
    projectId: project?.id || "",
    tags: [],
    dueDate: initialDate || "",
    isEpic: false,
  };

  const handleSave = async (content: Partial<Content>) => {
    setIsLoading(true);
    try {
      // Ensure the content is associated with the current context
      if (channel) {
        content.channelId = channel.id;
      }
      if (project) {
        content.projectId = project.id;
      }
      
      // Salvar o conteúdo no banco de dados usando o contentService
      await contentService.createContent(content as Omit<Content, 'id'>);
      
      toast({
        title: "Sucesso",
        description: "Conteúdo criado com sucesso!",
      });
      
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar conteúdo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine title based on context
  const getDialogTitle = () => {
    if (project) {
      return `Novo Conteúdo para ${project.title}`;
    } else if (channel) {
      return `Novo Conteúdo para ${channel.name}`;
    }
    return "Novo Conteúdo";
  };

  const getDialogDescription = () => {
    if (project) {
      return `Criando conteúdo associado ao projeto "${project.title}"`;
    } else if (channel) {
      return `Criando conteúdo para o canal "${channel.name}"`;
    }
    return "Crie um novo conteúdo";
  };

  // Use Sheet on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-full overflow-y-auto h-full pt-10 pb-20">
          <SheetHeader className="text-left">
            <SheetTitle>{getDialogTitle()}</SheetTitle>
            <SheetDescription>{getDialogDescription()}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ContentEditor 
              card={initialContent} 
              onSave={handleSave}
              isContextLocked={!!(channel || project)}
              lockedContext={{ channel, project }}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <ContentEditor 
          card={initialContent} 
          onSave={handleSave}
          isContextLocked={!!(channel || project)}
          lockedContext={{ channel, project }}
        />
      </DialogContent>
    </Dialog>
  );
}
