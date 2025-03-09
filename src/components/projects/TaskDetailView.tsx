
import { Task } from "@/models/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface TaskDetailViewProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailView({ task, open, onOpenChange }: TaskDetailViewProps) {
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-700";
      case "in_progress":
        return "bg-blue-500/20 text-blue-700";
      case "pending":
        return "bg-yellow-500/20 text-yellow-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  const getTaskStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "in_progress":
        return "Em andamento";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>Detalhes da tarefa</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge 
              className={cn(getTaskStatusColor(task.status))}
            >
              {getTaskStatusText(task.status)}
            </Badge>
          </div>
          
          {task.description && (
            <div>
              <h4 className="font-medium mb-1">Descrição</h4>
              <div className="text-muted-foreground">
                {task.description}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span>Prazo: {format(new Date(task.dueDate), "PPP", { locale: ptBR })}</span>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
