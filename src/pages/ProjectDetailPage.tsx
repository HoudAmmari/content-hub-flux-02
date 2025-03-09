
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Project, Content, Task } from "@/models/types";
import { projectService } from "@/services/projectService";
import { contentService } from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NewContentDialog } from "@/components/content/NewContentDialog";
import { ProjectInfoPanel } from "@/components/projects/ProjectInfoPanel";
import { ProjectTasksPanel } from "@/components/projects/ProjectTasksPanel";
import { ProjectContentPanel } from "@/components/projects/ProjectContentPanel";
import { ArrowLeft, Plus } from "lucide-react";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingContent, setIsAddingContent] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [projectId]);
  
  const loadProjectData = async (id: string) => {
    setIsLoading(true);
    try {
      // Carregar dados do projeto
      const projectData = await projectService.getProjectById(id);
      if (!projectData) {
        toast({
          title: "Erro",
          description: "Projeto não encontrado",
          variant: "destructive",
        });
        navigate("/projects");
        return;
      }
      
      setProject(projectData);
      
      // Carregar tarefas do projeto
      const projectTasks = await projectService.getProjectTasks(id);
      setTasks(projectTasks);
      
      // Carregar conteúdos do projeto
      const { contents: projectContents } = await contentService.getContentsByProject(id);
      setContents(projectContents);
    } catch (error) {
      console.error("Erro ao carregar dados do projeto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do projeto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };
  
  const handleContentSuccess = () => {
    if (projectId) {
      loadProjectData(projectId);
    }
  };
  
  if (isLoading && !project) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando dados do projeto...</p>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Projeto não encontrado</h2>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Projetos
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{project.status === "in_progress" ? "Em andamento" : 
                project.status === "completed" ? "Concluído" : 
                project.status === "paused" ? "Pausado" : "Cancelado"}</Badge>
              <span className="text-sm text-muted-foreground">
                Prazo: {new Date(project.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <Button onClick={() => setIsAddingContent(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Conteúdo
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium">Progresso do Projeto</div>
              <div className="text-sm text-muted-foreground">
                {project.completedTasks}/{project.tasks} tarefas completadas
              </div>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <ProjectInfoPanel 
            project={project} 
            onProjectUpdated={handleProjectUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <ProjectTasksPanel 
            projectId={project.id} 
            tasks={tasks} 
            setTasks={setTasks}
            onProjectUpdated={handleProjectUpdate}
          />
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <ProjectContentPanel 
            projectId={project.id} 
            contents={contents} 
            setContents={setContents}
            onContentUpdate={handleContentSuccess}
          />
        </TabsContent>
      </Tabs>
      
      {isAddingContent && (
        <NewContentDialog
          open={isAddingContent}
          onOpenChange={setIsAddingContent}
          project={project}
          onSuccess={handleContentSuccess}
        />
      )}
    </div>
  );
}
