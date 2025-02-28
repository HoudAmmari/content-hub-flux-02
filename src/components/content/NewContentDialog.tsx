
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentEditor } from "@/components/content/ContentEditor";

interface NewContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
}

export function NewContentDialog({ open, onOpenChange, initialDate }: NewContentDialogProps) {
  const initialContent = initialDate
    ? {
        id: "",
        title: "",
        description: "",
        status: "idea",
        channel: "blog",
        tags: [],
        dueDate: initialDate,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Novo Conteúdo</DialogTitle>
        </DialogHeader>
        <ContentEditor 
          initialContent={initialContent} 
          onSave={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
