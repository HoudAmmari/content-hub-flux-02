
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentEditor } from "@/components/content/ContentEditor";
import { Channel } from "@/models/types";

interface NewContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  channel?: Channel | null;
  onSuccess?: () => void;
}

export function NewContentDialog({ open, onOpenChange, initialDate, channel, onSuccess }: NewContentDialogProps) {
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

  const handleSave = () => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Novo Conteúdo</DialogTitle>
        </DialogHeader>
        <ContentEditor 
          initialContent={initialContent} 
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
}
