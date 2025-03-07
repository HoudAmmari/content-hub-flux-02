
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/models/types";
import { projectService } from "@/services/projectService";
import { 
  Calendar, 
  Clock, 
  Edit3, 
  Layers, 
  Link2, 
  List, 
  PlusCircle, 
  X 
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

// Dummy task data for display
const dummyTasks = [
  { id: "1", title: "Research target audience", status: "completed", dueDate: "2023-06-10" },
  { id: "2", title: "Create content outline", status: "completed", dueDate: "2023-06-15" },
  { id: "3", title: "Draft introduction chapter", status: "in_progress", dueDate: "2023-06-25" },
  { id: "4", title: "Draft chapter 1", status: "in_progress", dueDate: "2023-07-01" },
  { id: "5", title: "Review with content team", status: "pending", dueDate: "2023-07-05" },
  { id: "6", title: "Add graphics and illustrations", status: "pending", dueDate: "2023-07-10" }
];

// Dummy activity data for display
const dummyActivities = [
  { 
    id: "1", 
    type: "update", 
    description: "Updated project status to In Progress", 
    user: "John Doe", 
    timestamp: "2023-06-29T14:30:00Z" 
  },
  { 
    id: "2", 
    type: "task", 
    description: "Completed 'Research target audience'", 
    user: "Jane Smith", 
    timestamp: "2023-06-28T10:15:00Z" 
  },
  { 
    id: "3", 
    type: "comment", 
    description: "Let's review the outline next Tuesday", 
    user: "Mike Johnson", 
    timestamp: "2023-06-27T16:45:00Z" 
  },
  { 
    id: "4", 
    type: "update", 
    description: "Added 2 new tasks", 
    user: "John Doe", 
    timestamp: "2023-06-26T09:20:00Z" 
  }
];

interface ProjectDetailsProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdate?: () => void;
}

export function ProjectDetails({ 
  project, 
  open, 
  onOpenChange,
  onProjectUpdate
}: ProjectDetailsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  
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
  
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "in_progress":
        return "text-blue-500";
      case "pending":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };
  
  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    setUpdating(true);
    
    // Update task (not implemented yet, this is placeholder)
    try {
      // For demo purposes, update project progress
      const completedCount = isCompleted 
        ? project.completedTasks + 1 
        : project.completedTasks - 1;
        
      await projectService.updateProjectProgress(project.id, completedCount);
      
      if (onProjectUpdate) {
        onProjectUpdate();
      }
      
      toast({
        title: t("general.success"),
        description: isCompleted 
          ? t("projects.taskCompleted") 
          : t("projects.taskUncompleted"),
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: t("general.error"),
        description: t("projects.taskUpdateError"),
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{project.title}</span>
            {getStatusBadge(project.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {t("projects.deadline")}: {format(new Date(project.deadline), "PPP")}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {t("projects.tasks")}: {project.completedTasks} / {project.tasks}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {t("projects.created")}: {format(new Date(project.createdAt || new Date()), "PPP")}
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t("projects.progress")}</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2.5" />
          </div>
          
          <Separator />
          
          <Tabs defaultValue="tasks">
            <TabsList className="mb-4">
              <TabsTrigger value="tasks">{t("projects.tasks")}</TabsTrigger>
              <TabsTrigger value="activity">{t("projects.activity")}</TabsTrigger>
              <TabsTrigger value="notes">{t("projects.notes")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t("projects.taskList")}</h3>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  {t("projects.addTask")}
                </Button>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>{t("projects.taskName")}</TableHead>
                      <TableHead>{t("projects.status")}</TableHead>
                      <TableHead>{t("projects.dueDate")}</TableHead>
                      <TableHead className="w-14"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Checkbox 
                            checked={task.status === "completed"}
                            onCheckedChange={(checked) => {
                              handleToggleTask(task.id, checked as boolean);
                            }}
                            disabled={updating}
                          />
                        </TableCell>
                        <TableCell className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                          {task.title}
                        </TableCell>
                        <TableCell>
                          <span className={getTaskStatusColor(task.status)}>
                            {task.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(task.dueDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("projects.recentActivity")}</h3>
                
                <div className="space-y-4">
                  {dummyActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {activity.type === "update" && <Edit3 className="h-4 w-4" />}
                        {activity.type === "task" && <List className="h-4 w-4" />}
                        {activity.type === "comment" && <Link2 className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{activity.user}</p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.timestamp), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes">
              <div className="flex justify-center items-center p-8 text-center text-muted-foreground">
                <div>
                  <p>{t("projects.noNotes")}</p>
                  <Button className="mt-2" variant="outline">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    {t("projects.addNote")}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-1" />
              {t("general.close")}
            </Button>
            <Button>
              <Edit3 className="h-4 w-4 mr-1" />
              {t("general.edit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
