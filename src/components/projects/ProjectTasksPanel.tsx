import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, CheckSquare, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, Project } from "@/models/types";
import { projectService } from "@/services/projectService";
import { useToast } from "@/hooks/use-toast";
import { TaskDetailView } from "./TaskDetailView";

interface ProjectTasksPanelProps {
  projectId: string;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onProjectUpdated: (project: Project) => void;
}

export function ProjectTasksPanel({ 
  projectId, 
  tasks, 
  setTasks, 
  onProjectUpdated 
}: ProjectTasksPanelProps) {
  const { toast } = useToast();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle || !newTaskDueDate) {
      toast({
        title: "Erro",
        description: "Preencha o título e o prazo da tarefa",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newTask = await projectService.createProjectTask({
        projectId,
        title: newTaskTitle,
        description: newTaskDescription,
        status: "pending",
        dueDate: newTaskDueDate.toISOString(),
      });

      setTasks(prev => [...prev, newTask]);
      
      // Atualizar o projeto
      const updatedProject = await projectService.getProjectById(projectId);
      if (updatedProject) {
        onProjectUpdated(updatedProject);
      }

      // Limpar formulário
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate(undefined);
      setIsAddingTask(false);
      
      toast({
        title: "Sucesso",
        description: "Tarefa adicionada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: "completed" | "in_progress" | "pending") => {
    setIsLoading(true);
    try {
      await projectService.updateTask(taskId, { status: newStatus });
      
      // Atualizar lista de tarefas
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      // Atualizar o projeto
      const updatedProject = await projectService.getProjectById(projectId);
      if (updatedProject) {
        onProjectUpdated(updatedProject);
      }
      
      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado",
      });
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      await projectService.deleteTask(taskId);
      
      // Atualizar lista de tarefas
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Atualizar o projeto
      const updatedProject = await projectService.getProjectById(projectId);
      if (updatedProject) {
        onProjectUpdated(updatedProject);
      }
      
      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tarefas do Projeto</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingTask(!isAddingTask)}
        >
          {isAddingTask ? (
            "Cancelar"
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingTask && (
          <Card className="border border-dashed border-muted-foreground/50">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taskTitle">Título</Label>
                <Input
                  id="taskTitle"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Título da tarefa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taskDescription">Descrição</Label>
                <Textarea
                  id="taskDescription"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Descrição da tarefa"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taskDueDate">Prazo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTaskDueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTaskDueDate 
                        ? format(newTaskDueDate, "PPP", { locale: ptBR }) 
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTaskDueDate}
                      onSelect={setNewTaskDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddTask}
                  disabled={isLoading || !newTaskTitle || !newTaskDueDate}
                >
                  Adicionar Tarefa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Este projeto ainda não tem tarefas. Adicione uma tarefa para começar.
            </div>
          ) : (
            tasks.map((task) => (
              <Card 
                key={task.id} 
                className="hover:bg-accent/50 transition-colors cursor-pointer" 
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckSquare
                        className={cn(
                          "h-5 w-5 cursor-pointer", 
                          task.status === "completed" ? "text-green-500" : "text-muted-foreground"
                        )}
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que o clique no ícone também abra o popup
                          handleUpdateTaskStatus(
                            task.id, 
                            task.status === "completed" ? "pending" : "completed"
                          );
                        }}
                      />
                      <h4 className="font-medium">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="secondary"
                        className={cn("text-xs", getTaskStatusColor(task.status))}
                      >
                        {getTaskStatusText(task.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()} // Evita que o clique no menu também abra o popup
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que o clique no item também abra o popup
                          handleUpdateTaskStatus(task.id, "pending");
                        }}
                        disabled={task.status === "pending"}
                      >
                        Marcar como Pendente
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que o clique no item também abra o popup
                          handleUpdateTaskStatus(task.id, "in_progress");
                        }}
                        disabled={task.status === "in_progress"}
                      >
                        Marcar em Andamento
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que o clique no item também abra o popup
                          handleUpdateTaskStatus(task.id, "completed");
                        }}
                        disabled={task.status === "completed"}
                      >
                        Marcar como Concluída
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que o clique no item também abra o popup
                          handleDeleteTask(task.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
      
      {selectedTask && (
        <TaskDetailView
          task={selectedTask}
          open={isTaskDetailOpen}
          onOpenChange={setIsTaskDetailOpen}
        />
      )}
    </Card>
  );
}
