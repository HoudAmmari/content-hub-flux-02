
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Clock, Calendar, Edit, Plus, CheckSquare, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "em_andamento" | "concluido" | "pausado";
  deadline: string;
  tasks: number;
  completedTasks: number;
}

interface ProjectDetailsProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Sample project tasks data
const projectTasks = [
  {
    id: "1",
    title: "Definir estrutura do conteúdo",
    description: "Criar tópicos e capítulos do material",
    status: "completed",
    dueDate: "2023-06-05"
  },
  {
    id: "2",
    title: "Escrever introdução",
    description: "Contextualizar o tema e objetivos",
    status: "completed",
    dueDate: "2023-06-10"
  },
  {
    id: "3",
    title: "Desenvolver exemplos práticos",
    description: "Criar snippets de código e exemplos aplicados",
    status: "in_progress",
    dueDate: "2023-06-20"
  },
  {
    id: "4",
    title: "Revisar conteúdo técnico",
    description: "Validar conceitos e abordagens",
    status: "in_progress",
    dueDate: "2023-06-25"
  },
  {
    id: "5",
    title: "Criar material gráfico",
    description: "Diagramas e ilustrações para o conteúdo",
    status: "pending",
    dueDate: "2023-07-05"
  },
  {
    id: "6",
    title: "Revisão final e formatação",
    description: "Preparar material para publicação",
    status: "pending",
    dueDate: "2023-07-10"
  }
];

// Sample project content items
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

export function ProjectDetails({ project, open, onOpenChange }: ProjectDetailsProps) {
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
      case "em_andamento":
        return <Badge className="bg-blue-500">Em andamento</Badge>;
      case "concluido":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "pausado":
        return <Badge className="bg-yellow-500">Pausado</Badge>;
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
          <DialogTitle className="text-xl">{project.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                {getStatusBadge(project.status)}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Prazo: {formatDate(project.deadline)}</span>
                </Badge>
              </div>
              
              <Button size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                <span>Editar Projeto</span>
              </Button>
            </div>
            
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium">Progresso</div>
              <div className="text-sm text-muted-foreground">{project.completedTasks}/{project.tasks} tarefas completadas</div>
            </div>
            <Progress value={project.progress} className="h-2" />
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
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Nova Tarefa</span>
                </Button>
              </div>
              
              <div className="space-y-2">
                {projectTasks.map((task) => (
                  <Card key={task.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckSquare className={cn(
                            "h-5 w-5", 
                            task.status === "completed" ? "text-green-500" : "text-muted-foreground"
                          )} />
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
                      
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
                      <span className="font-medium">{project.status === "em_andamento" ? "Em andamento" : project.status === "concluido" ? "Concluído" : "Pausado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prazo:</span>
                      <span className="font-medium">{formatDate(project.deadline)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progresso:</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tarefas:</span>
                      <span className="font-medium">{project.completedTasks}/{project.tasks} completadas</span>
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
                      <span className="font-medium">{projectTasks.filter(t => t.status === "completed").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Tarefas em Andamento</span>
                      </div>
                      <span className="font-medium">{projectTasks.filter(t => t.status === "in_progress").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        <span>Tarefas Pendentes</span>
                      </div>
                      <span className="font-medium">{projectTasks.filter(t => t.status === "pending").length}</span>
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
