
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Bold, Italic, Link, List, ListOrdered, Quote, Heading2 } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Content, Channel, Project } from "@/models/types";
import { projectService } from "@/services/projectService";
import { channelService } from "@/services/channelService";

interface ContentEditorProps {
  card?: Content;
  onSave: (content: Partial<Content>) => void;
  onCancel?: () => void;
  isContextLocked?: boolean;
  lockedContext?: {
    channel?: Channel | null;
    project?: Project | null;
  };
}

export function ContentEditor({ 
  card, 
  onSave, 
  onCancel,
  isContextLocked = false,
  lockedContext
}: ContentEditorProps) {
  const [title, setTitle] = useState(card?.title || "");
  const [content, setContent] = useState(card?.content || "");
  const [channelId, setChannelId] = useState(card?.channelId || lockedContext?.channel?.id || "");
  const [projectId, setProjectId] = useState(card?.projectId || lockedContext?.project?.id || "");
  const [status, setStatus] = useState(card?.status || "idea");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    card?.dueDate ? new Date(card.dueDate) : undefined
  );
  const [tags, setTags] = useState<string[]>(card?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [mode, setMode] = useState<"channel" | "project" | "none">("none");

  useEffect(() => {
    if (isContextLocked) {
      if (lockedContext?.channel) {
        setMode("channel");
        setChannelId(lockedContext.channel.id);
      } else if (lockedContext?.project) {
        setMode("project");
        setProjectId(lockedContext.project.id);
      }
    } else {
      if (card?.channelId) {
        setMode("channel");
      } else if (card?.projectId) {
        setMode("project");
      }
    }

    const loadProjects = async () => {
      try {
        const allProjects = await projectService.getAllProjects();
        setProjects(allProjects.map(p => ({ id: p.id, title: p.title })));
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
      }
    };

    const loadChannels = async () => {
      try {
        const allChannels = await channelService.getAllChannels();
        setChannels(allChannels.map(c => ({ id: c.id, name: c.name })));
      } catch (error) {
        console.error("Erro ao carregar canais:", error);
      }
    };

    if (!isContextLocked || !lockedContext?.channel) {
      loadChannels();
    }
    
    if (!isContextLocked || !lockedContext?.project) {
      loadProjects();
    }
  }, [card, isContextLocked, lockedContext]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = () => {
    const contentToSave: Partial<Content> = {
      id: card?.id,
      title,
      content: content,
      status,
      tags,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
    };

    if (mode === "channel" && channelId) {
      contentToSave.channelId = channelId;
    }
    
    if (mode === "project" && projectId) {
      contentToSave.projectId = projectId;
    }

    onSave(contentToSave);
  };

  const insertText = (before: string, after = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length + selectedText.length + after.length, start + before.length + selectedText.length + after.length);
    }, 0);
  };

  const renderModeSelector = () => {
    if (isContextLocked) return null;
    
    return (
      <div className="flex space-x-4 mb-4">
        <Button 
          type="button" 
          variant={mode === "channel" ? "default" : "outline"}
          onClick={() => {
            setMode("channel");
            setProjectId("");
          }}
          className="w-1/2"
        >
          Vincular a um Canal
        </Button>
        <Button 
          type="button" 
          variant={mode === "project" ? "default" : "outline"}
          onClick={() => {
            setMode("project");
            setChannelId("");
          }}
          className="w-1/2"
        >
          Vincular a um Projeto
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do conteúdo"
          className="mt-1"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="content">Descrição</Label>
          <Tabs value={editorTab} onValueChange={(value) => setEditorTab(value as "write" | "preview")} className="w-auto">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="write">Escrever</TabsTrigger>
              <TabsTrigger value="preview">Visualizar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {editorTab === "write" && (
          <>
            <div className="flex items-center gap-1 mb-2 bg-muted p-1 rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertText("**", "**")}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertText("*", "*")}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertText("## ")}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertText("[", "](https://)")}
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertText("\n- ")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertText("\n1. ")}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertText("\n> ")}
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Use markdown para formatar o conteúdo..."
              className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            />
          </>
        )}

        {editorTab === "preview" && (
          <div className="border rounded-md p-4 min-h-[200px] bg-white">
            {content ? (
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground">Prévia do conteúdo aparecerá aqui...</p>
            )}
          </div>
        )}
      </div>

      {renderModeSelector()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(mode === "channel" || (isContextLocked && !!lockedContext?.channel)) && (
          <div>
            <Label htmlFor="channel">Canal</Label>
            <Select 
              value={channelId} 
              onValueChange={setChannelId}
              disabled={isContextLocked && !!lockedContext?.channel}
            >
              <SelectTrigger id="channel" className="mt-1">
                <SelectValue placeholder="Selecione um canal" />
              </SelectTrigger>
              <SelectContent>
                {isContextLocked && lockedContext?.channel ? (
                  <SelectItem value={lockedContext.channel.id}>
                    {lockedContext.channel.name}
                  </SelectItem>
                ) : (
                  channels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {(mode === "project" || (isContextLocked && !!lockedContext?.project)) && (
          <div>
            <Label htmlFor="project">Projeto</Label>
            <Select 
              value={projectId} 
              onValueChange={setProjectId}
              disabled={isContextLocked && !!lockedContext?.project}
            >
              <SelectTrigger id="project" className="mt-1">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {isContextLocked && lockedContext?.project ? (
                  <SelectItem value={lockedContext.project.id}>
                    {lockedContext.project.title}
                  </SelectItem>
                ) : (
                  projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="mt-1">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idea">Ideia</SelectItem>
              <SelectItem value="writing">Escrevendo</SelectItem>
              <SelectItem value="review">Revisão</SelectItem>
              <SelectItem value="done">Pronto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="dueDate">Data de Publicação</Label>
        <div className="mt-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="dueDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex mt-1">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Adicione tags relacionadas"
            className="rounded-r-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            className="rounded-l-none"
          >
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-2 py-1 text-xs rounded-full cursor-pointer"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button onClick={handleSave}>Salvar</Button>
      </div>
    </div>
  );
}
