
import React, { useState, useEffect } from "react";
import { Clock, CalendarIcon, Instagram, Linkedin, Youtube, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { contentService } from "@/services/contentService";
import { projectService } from "@/services/projectService";
import { TaskDetailView } from "@/components/projects/TaskDetailView";
import { Task } from "@/models/types";
import { format, isToday, isYesterday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

export function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  useEffect(() => {
    async function fetchTasks() {
      try {
        // Buscar tarefas pendentes de todos os projetos
        const projects = await projectService.getAllProjects();
        
        let allTasks: Task[] = [];
        
        for (const project of projects) {
          const projectTasks = await projectService.getProjectTasks(project.id);
          // Filtrar tarefas pendentes e em andamento
          const pendingTasks = projectTasks.filter(
            task => task.status === "pending" || task.status === "in_progress"
          );
          
          allTasks = [...allTasks, ...pendingTasks];
        }
        
        // Ordenar por data de vencimento
        allTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        // Limitar a 4 tarefas
        setTasks(allTasks.slice(0, 4));
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
      }
    }
    
    fetchTasks();
  }, []);
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const getTaskIcon = (task: Task) => {
    // Determinar o ícone com base no tipo de tarefa ou projeto
    if (task.type === "content") {
      return FileText;
    } else if (task.type === "instagram" || task.channelId === "instagram") {
      return Instagram;
    } else if (task.type === "linkedin" || task.channelId === "linkedin") {
      return Linkedin;
    } else if (task.type === "youtube" || task.channelId === "youtube") {
      return Youtube;
    }
    return FileText;
  };

  const getTaskColor = (task: Task) => {
    // Definir cor com base no tipo ou canal
    if (task.type === "instagram" || task.channelId === "instagram") {
      return "bg-pink-500";
    } else if (task.type === "linkedin" || task.channelId === "linkedin") {
      return "bg-blue-700";
    } else if (task.type === "youtube" || task.channelId === "youtube") {
      return "bg-red-500";
    } else if (task.status === "in_progress") {
      return "bg-blue-500";
    }
    return "bg-indigo-500";
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return "Hoje, " + format(date, "HH:mm");
    } else if (isTomorrow(date)) {
      return "Amanhã, " + format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Ontem, " + format(date, "HH:mm");
    } else {
      return format(date, "EEE, HH:mm", { locale: ptBR });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "in_progress":
        return "Em andamento";
      case "completed":
        return "Concluído";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma tarefa pendente encontrada
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-md border p-3 transition-all hover:bg-accent/50 cursor-pointer"
            onClick={() => handleTaskClick(task)}
          >
            <div className="flex items-center gap-3">
              <Avatar className={cn("h-9 w-9", getTaskColor(task))}>
                <AvatarFallback className="text-white">
                  {React.createElement(getTaskIcon(task), { className: "h-4 w-4" })}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{task.title}</p>
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <Clock className="h-3 w-3" /> {formatDueDate(task.dueDate)}
                  <span className="mx-1">•</span>
                  <span>{getStatusText(task.status)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5">
                {task.type || "Tarefa"}
              </span>
            </div>
          </div>
        ))
      )}
      
      {selectedTask && (
        <TaskDetailView
          task={selectedTask}
          open={isTaskDetailOpen}
          onOpenChange={setIsTaskDetailOpen}
        />
      )}
    </div>
  );
}
