
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentEditor } from "@/components/content/ContentEditor";
import { Channel, Content } from "@/models/types";
import { contentService } from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";

interface NewContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  channel?: Channel | null;
  onSuccess?: () => void;
}

export function NewContentDialog({ open, onOpenChange, initialDate, channel, onSuccess }: NewContentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const initialContent = initialDate
    ? {
        id: "",
        title: "",
        description: "",
        status: "idea",
        channel: channel?.name || "blog",
        tags: [],
        dueDate: initialDate,
      }
    : undefined;

  const handleSave = async (content: Partial<Content>) => {
    setIsLoading(true);
    try {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Novo Conteúdo</DialogTitle>
        </DialogHeader>
        <ContentEditor 
          card={initialContent} 
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
}
