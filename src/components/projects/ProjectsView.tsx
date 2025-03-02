
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  BarChart2, 
  Layers, 
  FileText,
  Edit, 
  Trash2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { ProjectDetails } from "@/components/projects/ProjectDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Sample data
const mockProjects: Project[] = [
  {
    id: "1",
    title: "Criar E-book: Guia de React",
    description: "Um guia completo sobre React para iniciantes",
    progress: 65,
    status: "em_andamento",
    deadline: "2023-07-15",
    tasks: 12,
    completedTasks: 8
  },
  {
    id: "2",
    title: "Curso de TypeScript",
    description: "Curso introdutório sobre TypeScript",
    progress: 30,
    status: "em_andamento",
    deadline: "2023-08-20",
    tasks: 18,
    completedTasks: 5
  },
  {
    id: "3",
    title: "Série de vídeos: CSS Avançado",
    description: "Uma série de vídeos explorando técnicas avançadas de CSS",
    progress: 100,
    status: "concluido",
    deadline: "2023-05-10",
    tasks: 8,
    completedTasks: 8
  },
  {
    id: "4",
    title: "Newsletter semanal",
    description: "Criar uma newsletter com dicas de desenvolvimento",
    progress: 10,
    status: "em_andamento",
    deadline: "2023-09-01",
    tasks: 16,
    completedTasks: 2
  },
  {
    id: "5",
    title: "Workshop de NextJS",
    description: "Preparar e ministrar um workshop online sobre NextJS",
    progress: 45,
    status: "em_andamento",
    deadline: "2023-07-30",
    tasks: 20,
    completedTasks: 9
  },
  {
    id: "6",
    title: "Podcast: Carreira em Tech",
    description: "Série de podcasts sobre carreira em tecnologia",
    progress: 0,
    status: "pausado",
    deadline: "2023-10-15",
    tasks: 15,
    completedTasks: 0
  }
];

export function ProjectsView() {
  const [projects, setProjects] = useState(mockProjects);
  const [openNewProject, setOpenNewProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
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
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projetos</h2>
        <Button onClick={() => setOpenNewProject(true)} className="gap-1">
          <Plus className="h-4 w-4" />
          <span>Novo Projeto</span>
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="in_progress">Em andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Ver Detalhes</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Layers className="h-4 w-4" />
                        <span>{project.completedTasks}/{project.tasks} tarefas</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(project.deadline)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <div className="flex items-center justify-between w-full">
                    {getStatusBadge(project.status)}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in_progress" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter(project => project.status === "em_andamento")
              .map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-all">
                  {/* Same card content as above */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Layers className="h-4 w-4" />
                          <span>{project.completedTasks}/{project.tasks} tarefas</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(project.deadline)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <div className="flex items-center justify-between w-full">
                      {getStatusBadge(project.status)}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter(project => project.status === "concluido")
              .map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-all">
                  {/* Same card content as above */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Layers className="h-4 w-4" />
                          <span>{project.completedTasks}/{project.tasks} tarefas</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(project.deadline)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <div className="flex items-center justify-between w-full">
                      {getStatusBadge(project.status)}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* New Project Dialog */}
      <NewProjectDialog open={openNewProject} onOpenChange={setOpenNewProject} />
      
      {/* Project Details */}
      {selectedProject && (
        <ProjectDetails 
          project={selectedProject} 
          open={!!selectedProject} 
          onOpenChange={(open) => !open && setSelectedProject(null)} 
        />
      )}
    </div>
  );
}
