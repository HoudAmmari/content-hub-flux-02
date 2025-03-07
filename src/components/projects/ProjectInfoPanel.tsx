
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Edit, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/models/types";
import { projectService } from "@/services/projectService";
import { useToast } from "@/hooks/use-toast";

interface ProjectInfoPanelProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
}

export function ProjectInfoPanel({ project, onProjectUpdated }: ProjectInfoPanelProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState<"in_progress" | "completed" | "paused" | "canceled">(project.status);
  const [deadline, setDeadline] = useState<Date>(new Date(project.deadline));

  const handleSave = async () => {
    if (!title) {
      toast({
        title: "Erro",
        description: "O título do projeto é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedProject = await projectService.updateProject(project.id, {
        title,
        description,
        status,
        deadline: deadline.toISOString(),
      });

      onProjectUpdated(updatedProject);
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Projeto atualizado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(project.title);
    setDescription(project.description);
    setStatus(project.status);
    setDeadline(new Date(project.deadline));
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Informações do Projeto</CardTitle>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          {isEditing ? (
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do projeto"
            />
          ) : (
            <p className="text-lg font-medium">{project.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          {isEditing ? (
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do projeto"
              rows={3}
            />
          ) : (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            {isEditing ? (
              <Select 
                value={status} 
                onValueChange={(value: "in_progress" | "completed" | "paused" | "canceled") => setStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p>
                {status === "in_progress" 
                  ? "Em andamento" 
                  : status === "completed" 
                    ? "Concluído" 
                    : status === "paused" 
                      ? "Pausado" 
                      : "Cancelado"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo</Label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(date) => date && setDeadline(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <p>{format(new Date(project.deadline), "PPP", { locale: ptBR })}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <Label>Criado em</Label>
            <p className="text-muted-foreground">
              {project.createdAt ? format(new Date(project.createdAt), "PPP", { locale: ptBR }) : "N/A"}
            </p>
          </div>
          <div>
            <Label>Última atualização</Label>
            <p className="text-muted-foreground">
              {project.updatedAt ? format(new Date(project.updatedAt), "PPP", { locale: ptBR }) : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
