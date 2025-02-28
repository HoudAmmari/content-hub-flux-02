
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Content {
  id: string;
  title: string;
  description: string;
  status: string;
  channel: string;
  tags: string[];
  dueDate: string;
}

interface ContentEditorProps {
  initialContent?: Content;
  onSave: () => void;
}

export function ContentEditor({ initialContent, onSave }: ContentEditorProps) {
  const [title, setTitle] = useState(initialContent?.title || "");
  const [description, setDescription] = useState(initialContent?.description || "");
  const [channel, setChannel] = useState(initialContent?.channel || "blog");
  const [status, setStatus] = useState(initialContent?.status || "idea");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialContent?.dueDate ? new Date(initialContent.dueDate) : undefined
  );
  const [tags, setTags] = useState<string[]>(initialContent?.tags || []);
  const [tagInput, setTagInput] = useState("");

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
    // Here you would save the content to your database
    console.log("Saving content:", {
      id: initialContent?.id || "new",
      title,
      description,
      channel,
      status,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
      tags,
    });

    onSave();
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
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Digite uma descrição para o conteúdo"
          className="mt-1"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="channel">Canal</Label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger id="channel" className="mt-1">
              <SelectValue placeholder="Selecione um canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="videos">Vídeos Curtos</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
        <Button variant="outline" onClick={onSave}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Salvar</Button>
      </div>
    </div>
  );
}
