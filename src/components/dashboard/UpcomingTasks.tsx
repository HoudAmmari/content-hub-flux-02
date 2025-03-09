
import React, { useState, useEffect } from "react";
import { Check, Clock, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Task } from "@/models/types";
import { taskService } from "@/services/taskService";
import { contentService } from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";

interface UpcomingTasksProps {
  onTaskStatusChange?: () => void;
}

export function UpcomingTasks({ onTaskStatusChange }: UpcomingTasksProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Buscar tarefas pendentes
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Vamos primeiro tentar buscar tarefas com taskService
        const tasksData = await taskService.getPendingTasks();
        
        if (tasksData.length === 0) {
          // Se não há tarefas no taskService, buscamos conteúdos pendentes
          const contentsData = await contentService.getAllContents();
          
          // Filtrar apenas conteúdos em progresso com data de vencimento
          const pendingContents = contentsData
            .filter(content => 
              content.status === "in-progress" && content.dueDate
            )
            .slice(0, 4);
          
          setTasks(pendingContents as Task[]);
        } else {
          setTasks(tasksData);
        }
      } catch (error) {
        console.error("Erro ao buscar tarefas pendentes:", error);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Gerar dados visuais para cada tipo de tarefa/conteúdo
  const getTaskVisuals = (task: Task) => {
    // Definir ícone e cor com base no tipo
    let icon = "📄";
    let bgColor = "bg-gray-500";
    
    if (task.type) {
      if (task.type === "video" || 
          task.channelId === "youtube" || 
          task.channelId === "instagram") {
        icon = "🎬";
        bgColor = "bg-red-500";
      } else if (task.type === "blog" || 
                task.channelId === "blog") {
        icon = "📝";
        bgColor = "bg-blue-500";
      } else if (task.type === "social" || 
                task.channelId === "linkedin") {
        icon = "📱";
        bgColor = "bg-purple-500";
      }
    }
    
    return { icon, bgColor };
  };
  
  // Formatação da data de vencimento
  const formatDueDate = (dueDate: string) => {
    try {
      const date = new Date(dueDate);
      return format(date, "d 'de' MMM", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };
  
  // Marcar tarefa como concluída
  const handleCompleteTask = async (task: Task) => {
    setIsUpdating(true);
    try {
      // Se a tarefa tiver ID, é um conteúdo
      if (task.id) {
        await contentService.updateContent(task.id, {
          status: "completed",
          updatedAt: new Date().toISOString()
        });
        
        // Atualizar UI removendo a tarefa
        setTasks(prev => prev.filter(t => t.id !== task.id));
        
        toast({
          title: "Tarefa concluída",
          description: `"${task.title}" foi marcada como concluída.`
        });
        
        // Notificar o componente pai para atualizar o dashboard
        if (onTaskStatusChange) {
          onTaskStatusChange();
        }
      }
    } catch (error) {
      console.error("Erro ao completar tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a tarefa.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma tarefa pendente no momento
        </div>
      ) : (
        tasks.map((task) => {
          const { icon, bgColor } = getTaskVisuals(task);
          return (
            <Card key={task.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Avatar className={cn("h-9 w-9", bgColor)}>
                    <AvatarFallback className="text-white">
                      {icon}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{task.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{task.dueDate ? formatDueDate(task.dueDate) : "Sem data"}</span>
                    </div>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleCompleteTask(task)}
                        disabled={isUpdating}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Marcar como concluído</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
