import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus, 
  Calendar, 
  Layers, 
  FileText,
  Edit, 
  Trash2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { ProjectDetails } from "@/components/projects/ProjectDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/models/types";
import { projectService } from "@/services/projectService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openNewProject, setOpenNewProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    toast({
      title: "Projeto criado",
      description: "O projeto foi criado com sucesso.",
    });
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(prev => 
      prev.map(project => project.id === updatedProject.id ? updatedProject : project)
    );
    
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
    
    toast({
      title: "Projeto atualizado",
      description: "O projeto foi atualizado com sucesso.",
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      
      toast({
        title: "Projeto excluído",
        description: "O projeto foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto.",
        variant: "destructive",
      });
    }
  };

  const navigateToProjectDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const renderProjectCard = (project: Project) => (
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
              <DropdownMenuItem onClick={() => navigateToProjectDetails(project.id)}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Ver Detalhes</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedProject({...project, isEditing: true})}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDeleteProject(project.id)}
              >
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
            onClick={() => navigateToProjectDetails(project.id)}
          >
            Ver Detalhes
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

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
            {projects.map(renderProjectCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="in_progress" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter(project => project.status === "in_progress")
              .map(renderProjectCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter(project => project.status === "completed")
              .map(renderProjectCard)}
          </div>
        </TabsContent>
      </Tabs>
      
      <NewProjectDialog 
        open={openNewProject} 
        onOpenChange={setOpenNewProject} 
        onProjectCreated={handleProjectCreated}
      />
      
      {selectedProject && (
        <ProjectDetails 
          project={selectedProject} 
          open={!!selectedProject} 
          onOpenChange={(open) => !open && setSelectedProject(null)}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </div>
  );
}
