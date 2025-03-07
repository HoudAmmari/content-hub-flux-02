
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
import { useTranslation } from "react-i18next";

export function ProjectsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openNewProject, setOpenNewProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);
  
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: t("general.error"),
        description: t("projects.fetchError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewProjectSuccess = async () => {
    await fetchProjects();
    toast({
      title: t("general.success"),
      description: t("projects.createSuccess"),
    });
  };
  
  const handleDeleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      await fetchProjects();
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
      toast({
        title: t("general.success"),
        description: t("projects.deleteSuccess"),
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: t("general.error"),
        description: t("projects.deleteError"),
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500">{t("projects.inProgress")}</Badge>;
      case "completed":
        return <Badge className="bg-green-500">{t("projects.completed")}</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500">{t("projects.paused")}</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">{t("projects.canceled")}</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
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
              <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                <FileText className="mr-2 h-4 w-4" />
                <span>{t("general.viewDetails")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>{t("general.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDeleteProject(project.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>{t("general.delete")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t("projects.progress")}</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>{project.completedTasks}/{project.tasks} {t("projects.tasks")}</span>
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
            {t("general.viewDetails")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("projects.title")}</h2>
        <Button onClick={() => setOpenNewProject(true)} className="gap-1">
          <Plus className="h-4 w-4" />
          <span>{t("projects.newProject")}</span>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">
          {t("general.loading")}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">{t("projects.allProjects")}</TabsTrigger>
            <TabsTrigger value="in_progress">{t("projects.inProgress")}</TabsTrigger>
            <TabsTrigger value="completed">{t("projects.completed")}</TabsTrigger>
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
      )}
      
      {/* New Project Dialog */}
      <NewProjectDialog 
        open={openNewProject} 
        onOpenChange={setOpenNewProject} 
        onSuccess={handleNewProjectSuccess}
      />
      
      {/* Project Details */}
      {selectedProject && (
        <ProjectDetails 
          project={selectedProject} 
          open={!!selectedProject} 
          onOpenChange={(open) => !open && setSelectedProject(null)} 
          onProjectUpdate={fetchProjects}
        />
      )}
    </div>
  );
}
