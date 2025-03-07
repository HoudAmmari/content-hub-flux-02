
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Edit, 
  Plus, 
  CheckSquare, 
  MoreHorizontal,
  Trash2,
  Save
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Project, Task } from "@/models/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { projectService } from "@/services/projectService";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface ProjectDetailsProps {
  project: Project & { isEditing?: boolean };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated?: (project: Project) => void;
}

export function ProjectDetails({ 
  project, 
  open, 
  onOpenChange,
  onProjectUpdated
}: ProjectDetailsProps) {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isEditing, setIsEditing] = useState(!!project.isEditing);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [editedDescription, setEditedDescription] = useState(project.description);
  const [editedStatus, setEditedStatus] = useState(project.status);
  const [editedDeadline, setEditedDeadline] = useState<Date>(new Date(project.deadline));
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch project tasks when component mounts
  useEffect(() => {
    fetchProjectTasks();
  }, [project.id]);
  
  const fetchProjectTasks = async () => {
    try {
      setIsLoading(true);
      const tasks = await projectService.getProjectTasks(project.id);
      setProjectTasks(tasks);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas do projeto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveProject = async () => {
    try {
      setIsLoading(true);
      
      const updatedProject = await projectService.updateProject(currentProject.id, {
        title: editedTitle,
        description: editedDescription,
        status: editedStatus as "in_progress" | "completed" | "paused" | "canceled",
        deadline: editedDeadline.toISOString()
      });
      
      setCurrentProject(updatedProject);
      setIsEditing(false);
      
      if (onProjectUpdated) {
        onProjectUpdated(updatedProject);
      }
      
      toast({
        title: "Projeto atualizado",
        description: "O projeto foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddTask = async () => {
    if (!newTaskTitle || !newTaskDueDate) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o título e o prazo da tarefa.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const newTask = await projectService.createProjectTask({
        projectId: currentProject.id,
        title: newTaskTitle,
        description: newTaskDescription,
        status: "pending",
        dueDate: newTaskDueDate.toISOString()
      });
      
      // Update the project in the parent component
      const updatedProject = await projectService.getProjectById(currentProject.id);
      if (updatedProject && onProjectUpdated) {
        onProjectUpdated(updatedProject);
        setCurrentProject(updatedProject);
      }
      
      // Update the tasks list
      setProjectTasks(prev => [...prev, newTask]);
      
      // Reset form
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate(undefined);
      setIsAddingTask(false);
      
      toast({
        title: "Tarefa adicionada",
        description: "A tarefa foi adicionada com sucesso.",
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateTaskStatus = async (taskId: string, newStatus: "completed" | "in_progress" | "pending") => {
    try {
      setIsLoading(true);
      
      // Update task status
      const updatedTask = await projectService.updateTask(taskId, { status: newStatus });
      
      // Update tasks list
      setProjectTasks(prev => 
        prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
      );
      
      // Refresh project data to get updated counters
      const updatedProject = await projectService.getProjectById(currentProject.id);
      if (updatedProject && onProjectUpdated) {
        onProjectUpdated(updatedProject);
        setCurrentProject(updatedProject);
      }
      
      toast({
        title: "Tarefa atualizada",
        description: "O status da tarefa foi atualizado.",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      
      // Delete task
      await projectService.deleteTask(taskId);
      
      // Update tasks list
      setProjectTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Refresh project data to get updated counters
      const updatedProject = await projectService.getProjectById(currentProject.id);
      if (updatedProject && onProjectUpdated) {
        onProjectUpdated(updatedProject);
        setCurrentProject(updatedProject);
      }
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500">Em andamento</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500">Pausado</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return null;
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
  
  // Project Content related mock data
  const projectContents = [
    {
      id: "1",
      title: "Capítulo 1: Fundamentos",
      type: "document",
      status: "done",
      lastUpdated: "2023-05-28"
    },
    {
      id: "2",
      title: "Capítulo 2: Conceitos Avançados",
      type: "document",
      status: "writing",
      lastUpdated: "2023-06-02"
    },
    {
      id: "3",
      title: "Vídeo introdutório",
      type: "video",
      status: "idea",
      lastUpdated: "2023-06-05"
    },
    {
      id: "4",
      title: "Exercícios práticos",
      type: "document",
      status: "review",
      lastUpdated: "2023-06-10"
    }
  ];
  
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <Avatar className="h-6 w-6 bg-blue-500"><AvatarFallback className="text-white text-xs">DOC</AvatarFallback></Avatar>;
      case "video":
        return <Avatar className="h-6 w-6 bg-red-500"><AvatarFallback className="text-white text-xs">VID</AvatarFallback></Avatar>;
      default:
        return null;
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="mt-1"
                placeholder="Título do projeto"
              />
            ) : (
              currentProject.title
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                {isEditing ? (
                  <Select 
                    value={editedStatus} 
                    onValueChange={(value) => setEditedStatus(value as any)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">Em andamento</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getStatusBadge(currentProject.status)
                )}
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(editedDeadline, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={editedDeadline}
                        onSelect={(date) => date && setEditedDeadline(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Prazo: {formatDate(currentProject.deadline)}</span>
                  </Badge>
                )}
              </div>
              
              {isEditing ? (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTitle(currentProject.title);
                      setEditedDescription(currentProject.description);
                      setEditedStatus(currentProject.status);
                      setEditedDeadline(new Date(currentProject.deadline));
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={handleSaveProject}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar Projeto</span>
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="mt-2"
                placeholder="Descrição do projeto"
                rows={3}
              />
            ) : (
              <p className="text-muted-foreground">{currentProject.description}</p>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium">Progresso</div>
              <div className="text-sm text-muted-foreground">{currentProject.completedTasks}/{currentProject.tasks} tarefas completadas</div>
            </div>
            <Progress value={currentProject.progress} className="h-2" />
          </div>
          
          <Tabs defaultValue="tasks">
            <TabsList className="w-full">
              <TabsTrigger value="tasks" className="flex-1">Tarefas</TabsTrigger>
              <TabsTrigger value="content" className="flex-1">Conteúdo</TabsTrigger>
              <TabsTrigger value="overview" className="flex-1">Visão Geral</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Tarefas do Projeto</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => setIsAddingTask(!isAddingTask)}
                >
                  {isAddingTask ? (
                    <>
                      <span>Cancelar</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Nova Tarefa</span>
                    </>
                  )}
                </Button>
              </div>
              
              {isAddingTask && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="taskTitle">Título</Label>
                        <Input
                          id="taskTitle"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Título da tarefa"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="taskDescription">Descrição</Label>
                        <Textarea
                          id="taskDescription"
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          placeholder="Descrição da tarefa"
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="taskDueDate">Prazo</Label>
                        <div className="mt-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newTaskDueDate && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {newTaskDueDate 
                                  ? format(newTaskDueDate, "PPP", { locale: ptBR }) 
                                  : "Selecione uma data"
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={newTaskDueDate}
                                onSelect={setNewTaskDueDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAddTask}
                          disabled={isLoading || !newTaskTitle || !newTaskDueDate}
                        >
                          Adicionar Tarefa
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">
                    Este projeto ainda não tem tarefas. Adicione uma tarefa para começar.
                  </p>
                ) : (
                  projectTasks.map((task) => (
                    <Card key={task.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4 flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckSquare
                              className={cn(
                                "h-5 w-5 cursor-pointer", 
                                task.status === "completed" ? "text-green-500" : "text-muted-foreground"
                              )}
                              onClick={() => handleUpdateTaskStatus(
                                task.id, 
                                task.status === "completed" ? "pending" : "completed"
                              )}
                            />
                            <h4 className="font-medium">{task.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="secondary"
                              className={cn("text-xs", getTaskStatusColor(task.status))}
                            >
                              {getTaskStatusText(task.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.dueDate)}
                            </span>
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
                              onClick={() => handleUpdateTaskStatus(task.id, "pending")}
                              disabled={task.status === "pending"}
                            >
                              Marcar como Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateTaskStatus(task.id, "in_progress")}
                              disabled={task.status === "in_progress"}
                            >
                              Marcar em Andamento
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                              disabled={task.status === "completed"}
                            >
                              Marcar como Concluída
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteTask(task.id)}
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
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Conteúdos do Projeto</h3>
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Novo Conteúdo</span>
                </Button>
              </div>
              
              <div className="space-y-2">
                {projectContents.map((content) => (
                  <Card key={content.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getContentTypeIcon(content.type)}
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
                              Atualizado em {formatDate(content.lastUpdated)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="overview" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">
                        {currentProject.status === "in_progress" 
                          ? "Em andamento" 
                          : currentProject.status === "completed" 
                            ? "Concluído" 
                            : currentProject.status === "paused"
                              ? "Pausado"
                              : "Cancelado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prazo:</span>
                      <span className="font-medium">{formatDate(currentProject.deadline)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progresso:</span>
                      <span className="font-medium">{currentProject.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tarefas:</span>
                      <span className="font-medium">{currentProject.completedTasks}/{currentProject.tasks} completadas</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumo de Atividades</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Tarefas Concluídas</span>
                      </div>
                      <span className="font-medium">
                        {projectTasks.filter(t => t.status === "completed").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Tarefas em Andamento</span>
                      </div>
                      <span className="font-medium">
                        {projectTasks.filter(t => t.status === "in_progress").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        <span>Tarefas Pendentes</span>
                      </div>
                      <span className="font-medium">
                        {projectTasks.filter(t => t.status === "pending").length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
